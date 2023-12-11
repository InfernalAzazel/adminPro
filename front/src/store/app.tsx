import {ProSettings} from "@ant-design/pro-components";
import { create } from 'zustand';
import {persist} from "zustand/middleware";

const defaultSettings: Partial<ProSettings> = {
    fixSiderbar: true,
    fixedHeader: true,
    layout: 'mix',
    splitMenus: false,
    navTheme: 'light',
    contentWidth: 'Fluid',
    colorPrimary: '#1677FF',
    siderMenuType: 'sub',
};

interface AppState {
    access_token: string
    locale: string
    theme: Partial<ProSettings> | undefined
}

export const storePersist = persist((set) => ({
    access_token: '',
    locale:'zh_cn',
    theme: defaultSettings,
    setAccessToken:(new_access_token: string) =>  set((state: AppState) => ({...state, access_token: new_access_token})),
    setLocale:(newLocale: string) =>  set((state: AppState) => ({...state, locale: newLocale})),
    setTheme: (newTheme: Partial<ProSettings> | undefined) => set((state: AppState) => ({...state, theme: newTheme})),
}), {name: 'adminPro'})

export const useAppStore = create(storePersist);

