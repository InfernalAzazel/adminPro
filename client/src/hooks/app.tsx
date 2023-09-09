import { appValueState, appParamsState } from '@/store';
import { AppType } from '@/types';
import { useRecoilState} from 'recoil';


export function useAppState () {
   return useRecoilState<AppType>(appValueState)
}

export function useParamsState () {
   return useRecoilState(appParamsState)
}