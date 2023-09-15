import { Navigate } from "react-router-dom"
import type { ReactNode } from 'react';
import {useAppState} from "@/hooks";


function Auth ({ children }: {children: ReactNode}) {
    const [appValue] = useAppState();
    const isToken = appValue.access_token
    // 判断有没有token
    if (isToken) {
        //token存在正常渲染
        return <>{children}</>
    } else {
    // token不存在，重定向到登录路由
        return <Navigate to='/login' replace></Navigate>
    }
 
 
}
 
export default Auth