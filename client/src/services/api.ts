import axiosInstance from "./request";
import { API,  ResData, PagesData } from './typings'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRequest } from 'ahooks';
export function useLogin() {
    return useMutation(['login'], async (options: API.LoginForm) => {
        let sp = new URLSearchParams(options)
        const data: API.ResLogin  = await axiosInstance.post(
            '/api/v1/auth/login',
            sp
        )
        return data
    })
}

export function useUsersRoutes(){
    return useQuery(['UsersRoutes'], async () => {
        return await axiosInstance.get('/api/v1/users/routes') as ResData<API.Router>
    })
}

export function useMenuList(){
    return useRequest(async (params: any) => {
        return await axiosInstance.get('/api/v1/system/menu/list', {params: params}) as PagesData<API.Menu[]>
    }
    )
}