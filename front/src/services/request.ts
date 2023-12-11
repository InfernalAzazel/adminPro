import {useAppStore} from '@/store';
import axios from 'axios';
import {PagesData} from "@/services/typings";
import {notification } from '@/components/EscapeAntd'
import i18n from 'i18next';


const axiosInstance = axios.create({});


axiosInstance.interceptors.request.use((config) => {

    const state = useAppStore.getState() as any

    if (state.access_token) {
        config.headers = Object.assign(config.headers || {}, {
            ['Authorization']: `Bearer ${state.access_token}`,
        })
    }
    if (state.locale) {
        config.headers = Object.assign(config.headers || {}, {
            ['Customize-Language']: `${state.locale}`,
        })
    }
    return config;
});


// 添加响应拦截器来处理数据和错误
axiosInstance.interceptors.response.use(
    (response) => {
        // 处理成功响应
        const data: PagesData<any> = response.data
        if(data.success){
            if(data.status_code !== 200){
                notification.info({
                    message:  i18n.t('multipurpose.info'),
                    description: data.detail,
                    duration: 3,
                })
            }
        }else {
            if(data.status_code === 419){
                const state = useAppStore.getState() as any
                state.setAccessToken('')
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
