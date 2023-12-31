export interface PagesData<T> extends ResponseMessages<T>{
    total: number
}

export interface ResCode {
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

    type User = {
        uid: string
        username: string
        disabled: boolean
        role_name: string[]
        name: string
        mail: string
        company: string
        department: string
        create_at: string
        update_at: string
    }

    type CreateUser = {
        username: string
        disabled: boolean
        password: string
        role_name: string
    }

    type Role = {
        uid: string
        name: string
        describe: string
        menu_permission: string[]
        interface_permission: string[]
        create_at: string
        update_at: string
    }

    type Menu = {
        uid: string
        name: string
        path: string
        order: number
        key: number
        father:number
        icon: string
        locale: string
        create_at: string
        update_at: string
    };
    type Interface = {
        uid: string
        name: string
        path: string
        group: string
        method: string
        create_at: string
        update_at: string
    }

    type Router = {
        path: string
        name?: string
        title?: string
        icon?: string // NOTE: icon 需要通过全局注册
        roles?: string[]
        children?: Router[]
    }

}