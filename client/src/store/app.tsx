import { AppType } from '@/types';
import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist'

const key = 'adminPro'

const { persistAtom } = recoilPersist({key: key})

export const getAppStorage = () => {
  const app = localStorage.getItem(key)
  if(!app){
    return null
  }
  return JSON.parse(app)[key] as AppType
}

export const appValueState = atom({
    key: key,
    default: {
      access_token:''
    },
    effects_UNSTABLE: [persistAtom]
});


export const appParamsState = atom({
  key: 'key',
  default: {} as any
});