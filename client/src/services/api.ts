import axiosInstance from "./request";
import { API,  ResData, PagesData, ResCode} from './typings'
import { useRequest } from 'ahooks';
import {Options} from "ahooks/lib/useRequest/src/types";
import  qs from "qs";
export function useLogin(options?:  Options<any, any>) {
    return useRequest(async (from: API.LoginForm) => {
        const sp = new URLSearchParams(from)
        const data: API.ResLogin  = await axiosInstance.post(
            '/api/v1/auth/login',
            sp
        )
        return data
    },options)
}

export function useUsersRoutes(options?:  Options<any, any>){
    return useRequest(async () => {
        return await axiosInstance.get('/api/v1/system/users/routes') as ResData<API.Router>
    },options)
}
// --- 菜单 ---
export function useMenuAll(options?:  Options<any, any>){
    return useRequest(async (uids?: string[]) => {
        const params = qs.stringify(uids?{uids: uids}:{}, { indices: false })
        return await axiosInstance.get(`/api/v1/system/menu/all?${params}`) as ResData<API.Menu[]>
    },options)
}
export function useMenuList(options?:  Options<any, any>){
    return useRequest(async (params: any) => {
        return await axiosInstance.get('/api/v1/system/menu/list', {params: params}) as PagesData<API.Menu[]>
    },options)
}
export function useMenuAdd(options?:  Options<any, any>){
    return useRequest(async (data: API.Menu) => {
        return await axiosInstance.post('/api/v1/system/menu/add', data) as ResCode
    },options)
}
export function useMenuEdit(options?:  Options<any, any>){
    return useRequest(async (data: API.Menu) => {
        return await axiosInstance.put('/api/v1/system/menu/edit', data) as ResCode
    },options)
}
export function useMenuDelete(options?:  Options<any, any>){
    return useRequest(async (uid: string) => {
        return await axiosInstance.delete('/api/v1/system/menu/delete', {params: {uid: uid}}) as ResCode
    },options)
}
// 接口 Interface
export function useInterfaceAll(options?:  Options<any, any>){
    return useRequest(async () => {
        return await axiosInstance.get('/api/v1/system/interface/all', ) as PagesData<API.Interface[]>
    },options)
}
export function useInterfaceList(options?:  Options<any, any>){
    return useRequest(async (params: any) => {
        return await axiosInstance.get('/api/v1/system/interface/list', {params: params}) as PagesData<API.Interface[]>
    },options)
}
export function useInterfaceAdd(options?:  Options<any, any>){
    return useRequest(async (data: API.Interface) => {
        return await axiosInstance.post('/api/v1/system/interface/add', data) as ResCode
    },options)
}
export function useInterfaceEdit(options?:  Options<any, any>){
    return useRequest(async (data: API.Interface) => {
        return await axiosInstance.put('/api/v1/system/interface/edit', data) as ResCode
    },options)
}
export function useInterfaceDelete(options?:  Options<any, any>){
    return useRequest(async (uid: string) => {
        return await axiosInstance.delete('/api/v1/system/interface/delete', {params: {uid: uid}}) as ResCode
    },options)
}

// 角色 Role
export function useRoleAll(options?:  Options<any, any>){
    return useRequest(async () => {
        return await axiosInstance.get('/api/v1/system/role/all', ) as PagesData<API.Role[]>
    },options)
}
export function useRoleList(options?:  Options<any, any>){
    return useRequest(async (params: any) => {
        return await axiosInstance.get('/api/v1/system/role/list', {params: params}) as PagesData<API.Role[]>
    },options)
}
export function useRoleAdd(options?:  Options<any, any>){
    return useRequest(async (data: API.Role) => {
        return await axiosInstance.post('/api/v1/system/role/add', data) as ResCode
    },options)
}
export function useRoleEdit(options?:  Options<any, any>){
    return useRequest(async (data: API.Role) => {
        return await axiosInstance.put('/api/v1/system/role/edit', data) as ResCode
    },options)
}
export function useRoleDelete(options?:  Options<any, any>){
    return useRequest(async (name: string) => {
        return await axiosInstance.delete('/api/v1/system/role/delete', {params: {name: name}}) as ResCode
    },options)
}

// 用户
export function useUsersList(options?:  Options<any, any>){
    return useRequest(async (params: any) => {
        return await axiosInstance.get('/api/v1/system/users/list', {params: params}) as PagesData<API.User[]>
    },options)
}
export function useUsersAdd(options?:  Options<any, any>){
    return useRequest(async (data: API.CreateUser) => {
        return await axiosInstance.post('/api/v1/system/users/add', data) as ResCode
    },options)
}
export function useUsersEdit(options?:  Options<any, any>){
    return useRequest(async (data: API.User) => {
        return await axiosInstance.put('/api/v1/system/users/edit', data) as ResCode
    },options)
}
export function useUsersDelete(options?:  Options<any, any>){
    return useRequest(async (uid: string) => {
        return await axiosInstance.delete('/api/v1/system/users/delete', {params: {uid: uid}}) as ResCode
    },options)
}

