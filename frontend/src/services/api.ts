import axios from 'axios';

const fallbackBaseUrls = [
  process.env.EXPO_PUBLIC_API_URL,
  'http://192.168.1.7:8000',
  'http://192.168.56.1:8000',
  'http://127.0.0.1:8000',
  'http://10.0.2.2:8000',
].filter(Boolean) as string[];

let cachedBaseUrl: string | null = null;

const isHealthyBaseUrl = async (baseUrl: string) => {
  try {
    const response = await axios.get(`${baseUrl}/health`, { timeout: 3000 });
    return response?.data?.status === 'ok';
  } catch {
    return false;
  }
};

const resolveBaseUrl = async () => {
  if (cachedBaseUrl) {
    return cachedBaseUrl;
  }

  for (const baseUrl of fallbackBaseUrls) {
    if (await isHealthyBaseUrl(baseUrl)) {
      cachedBaseUrl = baseUrl;
      return baseUrl;
    }
  }

  return fallbackBaseUrls[0] || 'http://192.168.1.7:8000';
};

export const sendMessage = async (message: string, conversationId?: string) => {
  const baseUrl = await resolveBaseUrl();
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await axios.post(`${baseUrl}/api/chat`, { message, conversation_id: conversationId }, { timeout: 45000 });

      if (!response.data?.reply) {
        throw new Error('The backend responded without a reply.');
      }

      return response.data;
    } catch (error) {
      lastError = error;
      if (attempt < 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unable to reach the backend.');
};

export const getSettings = async () => {
  const baseUrl = await resolveBaseUrl();
  const response = await axios.get(`${baseUrl}/api/settings`, { timeout: 15000 });
  return response.data;
};
