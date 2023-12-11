import { Navigate } from "react-router-dom"
import type { ReactNode } from 'react';
import {useAppStore} from "@/store";




function Auth ({ children }: {children: ReactNode}) {
    const access_token = useAppStore((state: any) => state.access_token);
    // 判断有没有token
    if (access_token) {
        //token存在正常渲染
        return <>{children}</>
    } else {
    // token不存在，重定向到登录路由
        return <Navigate to='/login' replace></Navigate>
    }
 
 
}
 
export default Auth