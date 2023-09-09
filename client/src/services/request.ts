import { getAppStorage } from '@/store';
import axios from 'axios';


const axiosInstance = axios.create({});

// 在每个请求中
axiosInstance.interceptors.request.use((config) => {
    const adminPro = getAppStorage()
  if (adminPro?.access_token) {
    config.headers = Object.assign(config.headers || {}, {
        ['Authorization']: `Bearer ${adminPro.access_token}`,
    })
  }
  return config;
});


// 添加响应拦截器来处理数据和错误
axiosInstance.interceptors.response.use(
    (response) => {
      // 处理成功响应
      return response.data;
    },
    (error) => {
      // 处理错误
      return Promise.reject(error);
    }
  );

export default axiosInstance;
