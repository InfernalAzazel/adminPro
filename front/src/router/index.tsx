import type {FC, LazyExoticComponent} from 'react';
import {lazy, Suspense} from 'react';
import type {RouteObject} from 'react-router-dom';
import {createHashRouter, Navigate} from 'react-router-dom';


import Auth from './auth';
import Loading from '@/components/Loading';
import AdminLayout from '@/layouts/AdminLayout';


const login = lazy(() => import('@/pages/login'));
// admin system pages
const welcome = lazy(() => import('@/pages/admin/welcome'));
const users = lazy(() => import('@/pages/admin/system/users'));
const role = lazy(() => import('@/pages/admin/system/role'));
const menu = lazy(() => import('@/pages/admin/system/menu'));
const interfaces = lazy(() => import('@/pages/admin/system/interface'));

function lazyLoad(Component: LazyExoticComponent<FC>) {
    return (
        <Suspense fallback={<Loading/>}>
            <Component/>
        </Suspense>
    );
}

const routes: RouteObject[] = [
    {
        path: '/login',
        element: lazyLoad(login),
    },
    {
        path: '/',
        element: <Navigate to="/admin/welcome"/>,
    },
    {
        path: '/',
        element: <Auth>{<AdminLayout/>}</Auth>,
        children: [
            {
                path: '/admin/welcome',
                element: lazyLoad(welcome),
            },
            {
                path: '/admin/system/users',
                element: lazyLoad(users),
            },
            {
                path: '/admin/system/role',
                element: lazyLoad(role),
            },
            {
                path: '/admin/system/menu',
                element: lazyLoad(menu),
            },
            {
                path: '/admin/system/interface',
                element: lazyLoad(interfaces),
            }
        ]
    },
]

const router = createHashRouter(routes);


export default router;