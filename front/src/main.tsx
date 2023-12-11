import React, {useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import {RouterProvider} from 'react-router-dom';
import router from '@/router';
import './globals.css';
import 'virtual:uno.css'
import {App, ConfigProvider, theme} from "antd";
import {useAppStore} from "@/store";
import EscapeAntd from "@/components/EscapeAntd";
import {I18nextProvider} from 'react-i18next';
import i18n, {getLocale} from "@/locales";



export const AppWith = () => {
    const appTheme = useAppStore((state: any) => state.theme);
    const locale = useAppStore((state: any) => state.locale);

    useEffect(() => {
        i18n.changeLanguage(locale).catch((error) => console.error('Failed to change language:', error));
    }, [i18n]);
    return (
        <React.StrictMode>
            <I18nextProvider i18n={i18n}>
                <ConfigProvider
                    theme={{
                        algorithm: appTheme.navTheme === 'light' ? theme.defaultAlgorithm : theme.darkAlgorithm,
                        token: {
                            colorPrimary: appTheme.colorPrimary
                        }
                    }}
                    locale={getLocale(locale)}
                >
                    <App>
                        <EscapeAntd/>
                        <RouterProvider router={router}/>
                    </App>
                </ConfigProvider>
            </I18nextProvider>
        </React.StrictMode>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<AppWith/>)
