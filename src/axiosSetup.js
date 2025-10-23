import axios from 'axios';

axios.interceptors.response.use(null, error => {
  alert('Network error. Please check your connection.');
  return Promise.reject(error);
});
