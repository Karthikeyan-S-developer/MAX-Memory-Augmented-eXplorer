import { create } from 'zustand';

interface SettingsState {
  assistantName: string;
  voice: string;
  wakeWord: string;
  theme: 'dark' | 'light';
  setSettings: (settings: Partial<SettingsState>) => void;
}

export const useAppStore = create<SettingsState>((set) => ({
  assistantName: 'MAX',
  voice: 'default',
  wakeWord: 'MAX',
  theme: 'dark',
  setSettings: (settings) => set((state) => ({ ...state, ...settings })),
}));
