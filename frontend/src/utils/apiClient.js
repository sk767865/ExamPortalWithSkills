import axios from 'axios';

const apiClient = (token) => {
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
  });


  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default apiClient;
