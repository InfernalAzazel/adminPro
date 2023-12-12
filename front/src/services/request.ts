import {useAppStore} from '@/store';
import axios from 'axios';
import {PagesData} from "@/services/typings";
import {notification } from '@/components/EscapeAntd'
import i18n from 'i18next';


const axiosInstance = axios.create({});


axiosInstance.interceptors.request.use((config) => {
    const state = useAppStore.getState() as any
    config.headers = Object.assign(config.headers || {}, {
        // 如果 access_token 存在，则设置 Authorization 头部
        ...(state.access_token ? { 'Authorization': `Bearer ${state.access_token}` } : {}),
        // 如果locale存在，则设置 Customize-Language 头部
        ...(state.locale ? { 'Customize-Language': state.locale} : {}),
    })
    return config;
});


// 添加响应拦截器来处理数据和错误
axiosInstance.interceptors.response.use(
    (response) => {
        // 处理成功响应
        const data: PagesData<any> = response.data
        const state = useAppStore.getState() as any
        if(data.success){
            if(data.status_code !== 200){
                notification.info({
                    message:  i18n.t('multipurpose.info'),
                    description: data.detail,
                    duration: 3,
                })
            }
        }else {
            // 定义一个数组，包含导致访问令牌失效的HTTP状态码
            const resetTokenStatusCodes = [419, 423, 480];
            // JWT过期 用户被禁用
            // 检查返回的状态码是否需要重置访问令牌
            if (resetTokenStatusCodes.includes(data.status_code)) {
                state.setAccessToken('');
            }
            notification.error({
                message: i18n.t('multipurpose.error'),
                description: data.detail,
                duration: 3,
            });
        }

        return response.data;
    },
    (error) => {
        // 处理错误
        return Promise.reject(error);
    }
);

export default axiosInstance;
