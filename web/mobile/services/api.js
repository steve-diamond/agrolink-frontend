// Axios instance for backend calls (mobile)
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export default api;
