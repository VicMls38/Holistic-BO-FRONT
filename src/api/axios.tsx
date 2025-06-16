import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ethan-server.com:8443/api',
  // baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
