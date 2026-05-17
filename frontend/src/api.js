import axios from 'axios';

const api = axios.create({
  baseURL: 'https://candidate-backend1.onrender.com/api'
});

export default api;
