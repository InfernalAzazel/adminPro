import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import type { Locale } from 'antd/es/locale';
import zh_cn from './zh-CN'
import en_us from './en-US'

i18n
    .use(initReactI18next) // 将 i18n 传递给 react-i18下一个
    .init({
        resources: {
            zh_cn: {
                translation: zh_cn
            },
            en_us: {
                translation: en_us
            }
        },
        lng: "zh_cn", // 默认语言，如果无法检测到任何语言，则使用的语言
        fallbackLng: "zh_cn", // 无法加载设置的语言时要使用的语言

        interpolation: {
            escapeValue: false // React 已经对 XSS 安全了
        }
    }).catch((error) => console.error('Error initializing i18next: ', error));

export function getLocale(locale: string): Locale{
    const language:Record<string, Locale>={
        zh_cn: zhCN,
        en_us: enUS,
    }
    return language[locale]
}
export default i18n;