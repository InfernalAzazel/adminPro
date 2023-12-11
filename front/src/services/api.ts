import axiosInstance from "./request";
import { API,  ResData, PagesData, ResCode} from './typings'
import { useRequest } from 'ahooks';
import {Options} from "ahooks/lib/useRequest/src/types";
import  qs from "qs";
export function useLoginRequest(options?:  Options<any, any>) {
    return useRequest(async (from: API.LoginForm) => {
        const sp = new URLSearchParams(from)
        const data: API.ResLogin  = await axiosInstance.post(
            '/api/v1/auth/login',
            sp
        )
        return data
    },options)
}

export function useGetUsersRoutesRequest(options?:  Options<any, any>){
    return useRequest(async () => {
        return await axiosInstance.get('/api/v1/system/users/routes') as ResData<API.Router>
    },options)
}

// --- 菜单 ---
export function useGetMenuAllRequest(options?:  Options<any, any>){
    return useRequest(async (uids?: string[], is_query?: boolean) => {
        const params = qs.stringify(uids?{uids: uids}:{}, { indices: false })
        return await axiosInstance.get(`/api/v1/system/menu/all?${params}`,{params:{is_query: is_query}}) as ResData<API.Menu[]>
    },options)
}
export function useGetMenuListRequest(options?:  Options<any, any>){
    return useRequest(async (params: any) => {
        return await axiosInstance.get('/api/v1/system/menu/list', {params: params}) as PagesData<API.Menu[]>
    },options)
}
export function useAddMenuRequest(options?:  Options<any, any>){
    return useRequest(async (data: API.Menu) => {
        return await axiosInstance.post('/api/v1/system/menu/add', data) as ResCode
    },options)
}
export function useEditMenuRequest(options?:  Options<any, any>){
    return useRequest(async (uid: string, data: API.Menu) => {
        return await axiosInstance.put('/api/v1/system/menu/edit', data, {params: {uid: uid}}) as ResCode
    },options)
}
export function useDeleteMenuRequest(options?:  Options<any, any>){
    return useRequest(async (uid: string) => {
        return await axiosInstance.delete('/api/v1/system/menu/delete', {params: {uid: uid}}) as ResCode
    },options)
}
// 接口 Interface
export function useGetInterfaceAllRequest(options?:  Options<any, any>){
    return useRequest(async () => {
        return await axiosInstance.get('/api/v1/system/interface/all', ) as PagesData<API.Interface[]>
    },options)
}
export function useGetInterfaceListRequest(options?:  Options<any, any>){
    return useRequest(async (params: any) => {
        return await axiosInstance.get('/api/v1/system/interface/list', {params: params}) as PagesData<API.Interface[]>
    },options)
}
export function useAddInterfaceRequest(options?:  Options<any, any>){
    return useRequest(async (data: API.Interface) => {
        return await axiosInstance.post('/api/v1/system/interface/add', data) as ResCode
    },options)
}
export function useEditInterfaceRequest(options?:  Options<any, any>){
    return useRequest(async (uid: string, data: API.Interface) => {
        return await axiosInstance.put('/api/v1/system/interface/edit',data, {params:{uid: uid}}) as ResCode
    },options)
}
export function useDeleteInterfaceRequest(options?:  Options<any, any>){
    return useRequest(async (uid: string) => {
        return await axiosInstance.delete('/api/v1/system/interface/delete', {params: {uid: uid}}) as ResCode
    },options)
}

// 角色 Role
export function useGetRoleAllRequest(options?:  Options<any, any>){
    return useRequest(async () => {
        return await axiosInstance.get('/api/v1/system/role/all', ) as PagesData<API.Role[]>
    },options)
}
export function useGetRoleListRequest(options?:  Options<any, any>){
    return useRequest(async (params: any) => {
        return await axiosInstance.get('/api/v1/system/role/list', {params: params}) as PagesData<API.Role[]>
    },options)
}
export function useAddRoleRequest(options?:  Options<any, any>){
    return useRequest(async (data: API.Role) => {
        return await axiosInstance.post('/api/v1/system/role/add', data) as ResCode
    },options)
}
export function useEditRoleRequest(options?:  Options<any, any>){
    return useRequest(async (uid: string, data: API.Role) => {
        return await axiosInstance.put('/api/v1/system/role/edit', data, {params: {uid: uid}}) as ResCode
    },options)
}
export function useDeleteRoleRequest(options?:  Options<any, any>){
    return useRequest(async (name: string) => {
        return await axiosInstance.delete('/api/v1/system/role/delete', {params: {name: name}}) as ResCode
    },options)
}

// 用户
export function useGetUsersListRequest(options?:  Options<any, any>){
    return useRequest(async (params: any) => {
        return await axiosInstance.get('/api/v1/system/users/list', {params: params}) as PagesData<API.User[]>
    },options)
}
export function useAddUsersRequest(options?:  Options<any, any>){
    return useRequest(async (data: API.CreateUser) => {
        return await axiosInstance.post('/api/v1/system/users/add', data) as ResCode
    },options)
}
export function useEditUsersRequest(options?:  Options<any, any>){
    return useRequest(async (uid: string, data: API.User) => {
        return await axiosInstance.put('/api/v1/system/users/edit', data, {params: {uid: uid}}) as ResCode
    },options)
}
export function useDeleteUsersRequest(options?:  Options<any, any>){
    return useRequest(async (uid: string) => {
        return await axiosInstance.delete('/api/v1/system/users/delete', {params: {uid: uid}}) as ResCode
    },options)
}

