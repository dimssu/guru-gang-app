import axios from 'axios';

export const API_URL = "https://gurugang-server.dimssu.com";

const instance = axios.create({
  baseURL: API_URL, 
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
