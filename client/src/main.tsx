import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import router from '@/router';
import './globals.css';
import 'virtual:uno.css'
import {App, ConfigProvider, theme} from "antd";
import {useAppStore} from "@/store";
import EscapeAntd from "@/components/EscapeAntd";



export const AppWith  = () => {
    const appTheme = useAppStore((state: any) => state.theme);


    return (
        <React.StrictMode>
            <ConfigProvider  theme={{
                algorithm: appTheme.navTheme === 'light' ? theme.defaultAlgorithm : theme.darkAlgorithm,
                token: {
                    colorPrimary: appTheme.colorPrimary
                }
            }}>
                <App>
                    <EscapeAntd />
                    <RouterProvider router={router} />
                </App>
            </ConfigProvider>
        </React.StrictMode>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<AppWith/>)
