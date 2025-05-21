import axios from 'axios'
import { API_URL } from './axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is important for handling authentication cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export const fetchLevels = async () => {
  try {
    const response = await api.get('/api/concept-battle/levels');
    return response.data;
  } catch (error) {
    console.error('Error fetching levels:', error);
    throw error;
  }
};

export const fetchQuestions = async (levelId) => {
  try {
    const response = await api.get(`/api/concept-battle/questions/${levelId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const submitResult = async (levelId, score, timeBonus) => {
  try {
    const response = await api.post('/api/concept-battle/submit-result', {
      levelId,
      score,
      timeBonus
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting result:', error);
    throw error;
  }
};
