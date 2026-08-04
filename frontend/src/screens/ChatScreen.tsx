import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Keyboard, useWindowDimensions, Animated, PermissionsAndroid } from 'react-native';
import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import { sendMessage } from '../services/api';
import { useAppStore } from '../store/appStore';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Array<{ id: number; text: string; role: 'user' | 'assistant' }>>([]);
  const [draft, setDraft] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isStartingVoice, setIsStartingVoice] = useState(false);
  const [voiceHint, setVoiceHint] = useState('Tap the mic to speak');
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const draftRef = useRef('');
  const dictationPrefixRef = useRef('');
  const hasFinalTranscriptRef = useRef(false);
  const { assistantName } = useAppStore();
  const { height } = useWindowDimensions();
  const dot1 = useRef(new Animated.Value(0.6)).current;
  const dot2 = useRef(new Animated.Value(0.6)).current;
  const dot3 = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    Voice.onSpeechStart = () => {
      hasFinalTranscriptRef.current = false;
      setIsListening(true);
      setIsStartingVoice(false);
      setVoiceHint('Listening… speak now');
    };
    Voice.onSpeechEnd = () => {
      setIsListening(false);
      setIsStartingVoice(false);
      if (!hasFinalTranscriptRef.current) {
        setVoiceHint('Processing your speech…');
      }
    };
    Voice.onSpeechPartialResults = (event) => {
      const partialTranscript = event.value?.[0] ?? '';
      if (partialTranscript) {
        updateDraftFromTranscript(partialTranscript);
        setVoiceHint('Listening…');
      }
    };
    Voice.onSpeechResults = (event) => {
      const transcript = event.value?.[0] ?? '';
      if (transcript) {
        hasFinalTranscriptRef.current = true;
        updateDraftFromTranscript(transcript);
        setVoiceHint('Transcript ready — review and send');
      } else {
        setVoiceHint('I did not catch that. Tap the mic and try again.');
      }
    };
    Voice.onSpeechError = (event: any) => {
      setIsListening(false);
      setIsStartingVoice(false);
      const message = event?.error?.message ?? 'Voice input unavailable';
      setVoiceHint(message);
    };

    return () => {
      Voice.removeAllListeners();
      Voice.destroy().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, [messages, isThinking]);

  useEffect(() => {
    if (!isThinking) return;

    const createPulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0.45, duration: 220, useNativeDriver: true }),
        ]),
      );

    const animations = [
      createPulse(dot1, 0),
      createPulse(dot2, 140),
      createPulse(dot3, 280),
    ];

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [dot1, dot2, dot3, isThinking]);

  const handleSend = async () => {
    if (!draft.trim()) return;
    const userMessage = { id: Date.now(), text: draft.trim(), role: 'user' as const };
    setMessages((prev) => [...prev, userMessage]);
    draftRef.current = '';
    setDraft('');
    setIsThinking(true);

    try {
      const response = await sendMessage(userMessage.text);
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: response.reply, role: 'assistant' }]);
      Speech.speak(response.reply, {
        language: 'en-US',
        pitch: 1.05,
        rate: 0.95,
        voice: 'com.apple.ttsbundle.Samantha-compact',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setMessages((prev) => [...prev, { id: Date.now() + 2, text: `Unable to reach MAX right now. ${message}`, role: 'assistant' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const updateDraftFromTranscript = (transcript: string) => {
    const normalizedTranscript = transcript.trim();
    if (!normalizedTranscript) return;

    const prefix = dictationPrefixRef.current;
    const nextDraft = prefix ? `${prefix}${prefix.endsWith(' ') ? '' : ' '}${normalizedTranscript}` : normalizedTranscript;
    draftRef.current = nextDraft;
    setDraft(nextDraft);
  };

  const requestMicPermission = async () => {
    if (isListening || isStartingVoice) return;

    try {
      setIsStartingVoice(true);
      setVoiceHint('Requesting microphone access…');

      if (Platform.OS === 'android') {
        const androidPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        if (androidPermission !== 'granted') {
          setVoiceHint('Microphone access was denied');
          setIsStartingVoice(false);
          return;
        }
      }

      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        setVoiceHint('Speech recognition is not available on this device');
        setIsStartingVoice(false);
        return;
      }

      dictationPrefixRef.current = draftRef.current.trimEnd();
      inputRef.current?.focus();
      setVoiceHint('Listening… speak now');
      await Voice.start('en-US');
    } catch (error) {
      setIsListening(false);
      setIsStartingVoice(false);
      const message = error instanceof Error ? error.message : 'Voice input is unavailable right now';
      const normalizedMessage = message.toLowerCase();
      if (normalizedMessage.includes('ispeechavailable') || normalizedMessage.includes('null') || normalizedMessage.includes('native module')) {
        setVoiceHint('Voice recognition needs a development build on this phone. Rebuild the app and try again.');
      } else {
        setVoiceHint(message);
      }
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
    setIsStartingVoice(false);
    setVoiceHint('Tap the mic to speak');
  };

  const handleMicPress = () => {
    if (isListening) {
      void stopListening();
    } else if (!isStartingVoice) {
      void requestMicPermission();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <View style={[styles.header, { paddingTop: height < 800 ? 10 : 25, paddingBottom: height < 800 ? 8 : 10 }]}>
          <View>
            <Text style={styles.title}>MAX</Text>
            <Text style={styles.subtitle}>Memory Augmented eXplorer</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messagesArea}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          contentInset={{ bottom: 24 }}
        >
          {messages.length === 0 && (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyTitle}>Hello, I’m {assistantName}</Text>
              <Text style={styles.emptyText}>I can help you plan, remember, and reason across your day.</Text>
            </View>
          )}

          {messages.map((message) => (
            <View key={message.id} style={message.role === 'user' ? styles.userBubble : styles.assistantBubble}>
              <Text style={styles.bubbleText}>{message.text}</Text>
            </View>
          ))}

          {isThinking && (
            <View style={styles.assistantBubble}>
              <View style={styles.thinkingRow}>
                <Animated.View style={[styles.dot, { opacity: dot1 }]} />
                <Animated.View style={[styles.dot, { opacity: dot2 }]} />
                <Animated.View style={[styles.dot, { opacity: dot3 }]} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputRow, keyboardVisible && styles.inputRowActive]}>
          <View style={styles.inputColumn}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={draft}
              onChangeText={(value) => {
                draftRef.current = value;
                setDraft(value);
              }}
              placeholder={isListening ? 'Listening… speak now' : 'Ask MAX anything'}
              placeholderTextColor={isListening ? '#7dd3fc' : '#8aa0b8'}
              multiline
              maxLength={500}
              returnKeyType="done"
            />
            <Text style={[styles.voiceHint, isListening && styles.voiceHintActive]}>{voiceHint}</Text>
          </View>
          <TouchableOpacity
            accessibilityLabel={isListening ? 'Stop voice input' : 'Start voice input'}
            accessibilityRole="button"
            style={[styles.micButton, (isListening || isStartingVoice) && styles.micButtonActive]}
            onPress={handleMicPress}
          >
            <Text style={[styles.micButtonText, (isListening || isStartingVoice) && styles.micButtonTextActive]}>{isListening || isStartingVoice ? '●' : '🎤'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111f' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#15253d',
    backgroundColor: '#081120',
  },
  title: { color: '#f3f7ff', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#78a3ff', fontSize: 13, marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f243f', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80', marginRight: 6 },
  statusText: { color: '#dfe9ff', fontSize: 12, fontWeight: '600' },
  messagesArea: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#07111f' },
  messagesContent: { paddingBottom: 24 },
  emptyStateCard: { backgroundColor: '#0f1d33', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#1b3353', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  emptyTitle: { color: '#f3f7ff', fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: '#8aa0b8', fontSize: 14, lineHeight: 20 },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2c6cff',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: '84%',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#13233b',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: '84%',
    borderWidth: 1,
    borderColor: '#22395b',
  },
  bubbleText: { color: '#f3f7ff', fontSize: 15, lineHeight: 21 },
  thinkingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#78a3ff' },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    borderTopWidth: 1,
    borderTopColor: '#15253d',
    alignItems: 'flex-end',
    backgroundColor: '#081120',
    marginBottom: 0,
  },
  inputColumn: { flex: 1, marginRight: 8 },
  inputRowActive: {
    borderTopColor: '#274368',
    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#0f1a2b',
    color: '#f3f7ff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    minHeight: 46,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#22395b',
  },
  micButton: { backgroundColor: '#0f243f', paddingHorizontal: 12, paddingVertical: 11, borderRadius: 16, justifyContent: 'center', marginRight: 8 },
  micButtonActive: { backgroundColor: '#1d4ed8' },
  micButtonText: { color: '#78a3ff', fontSize: 18 },
  micButtonTextActive: { color: '#fff' },
  voiceHint: { color: '#8aa0b8', fontSize: 12, marginTop: 6, marginLeft: 4 },
  voiceHintActive: { color: '#7dd3fc' },
  sendButton: { backgroundColor: '#2c6cff', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 16, justifyContent: 'center' },
  sendButtonText: { color: '#fff', fontWeight: '700' },
});
