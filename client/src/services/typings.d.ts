export interface PagesData<T> extends ResponseMessages<T>{
    total: number
}

export interface ResCode<T> {
    code: number
    msg_type: number
}
export interface ResData<T> extends ResCode<T>{
    data: T
}


export interface ResponseMessages <T>{
    status_code: number
    success: boolean
    detail : string,
    data: T[] | any
}

declare namespace API {

   
    type LoginForm = {
        username: string
        password: string
    };
    type ResLogin = {
        access_token: string
        token_type: string
    };

    type Menu = {
        uid: string
        title: string
        path: string
        order: number
        key: number
        father:number
        component: string
        icon: string
        create_at: string
        update_at: string
    };

    type Router = {
        path: string
        name?: string
        title?: string
        icon?: string // NOTE: icon 需要通过全局注册
        roles?: string[]
        children?: Router[]
    }

}