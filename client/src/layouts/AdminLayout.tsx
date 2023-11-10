import type {MenuDataItem, ProLayoutProps, ProSettings} from '@ant-design/pro-components';
import {PageContainer, ProCard, ProConfigProvider, ProLayout, SettingDrawer} from '@ant-design/pro-components';
import type {AvatarProps, MenuProps} from 'antd';
import {ConfigProvider, Dropdown} from 'antd';
import type {ReactNode} from 'react';
import React, {useEffect, useRef, useState} from 'react';
// import {menuData as menuDatas} from './defaultProps';
import {Link, Outlet, useLocation} from 'react-router-dom';
import {Icon} from '@iconify/react';
import {useUsersRoutes} from '@/services';
import {useAppStore} from "@/store";
import {getTreeDataAndHalfCheckedKeys} from "@/utils";

const AdminLayout: React.FC = () => {
    const location = useLocation();

    const [pathname, setPathname] = useState('/admin/welcome');
    const [menuData, setMenuData] = useState<MenuDataItem[]>([]);
    const setAccessToken = useAppStore((state: any) => state.setAccessToken);
    const theme = useAppStore((state: any) => state.theme);
    const setTheme = useAppStore((state: any) => state.setTheme);
    const actionRef = useRef<{ reload: () => void;}>();

    const { data: usersRoutes } = useUsersRoutes()

    useEffect(() => {
        const {treeData} = getTreeDataAndHalfCheckedKeys(usersRoutes?.data || [])
        setMenuData(treeData)
    }, [usersRoutes]);

    useEffect(() => {
        actionRef.current?.reload();
    }, [menuData]);
    const handleSettingsChange = (newSettings: Partial<ProSettings>) => {
        setTheme(newSettings)
    };


    const menuItemRender = (item: MenuDataItem, dom: ReactNode) => {
        if (item.disabled || item.path === undefined) {
            return dom;
        }
        return <Link to={item.path} onClick={() => {
            setPathname(item.path as string);
        }}>{dom}</Link>;
    };

    const loopMenuItem = (menus: any[]): MenuDataItem[] =>
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        menus.map(({uid, key, father, order, depth, create_at, update_at, icon, children, ...item}) => ({
            ...item,
            icon: icon && <Icon icon={icon} width={16} height={16}/>,
            children: children && loopMenuItem(children),
        }));


    const avatarRender = {
        render: (_: AvatarProps, dom: ReactNode) => {
            const onClick: MenuProps['onClick'] = ({key}) => {
                if (key === 'logout') {
                   setAccessToken('')
                }
            };

            const items: MenuProps['items'] = [
                {
                    key: 'logout',
                    icon: <Icon icon='ant-design:logout-outlined' width={16} height={16}/>,
                    label: '退出登录',
                },
            ];
            return (
                <Dropdown
                    menu={{items, onClick}}
                >
                    {dom}
                </Dropdown>
            )
        }
    }

    function actionsRender() {
        return [
            <Icon icon={'ant-design:skin-outlined'} width={32} height={32} />
        ]
    }

    const props: ProLayoutProps = {
        actionRef: actionRef,
        title: 'adminPro',
        menuItemRender,
        location,
        menu: {
            request: async () => loopMenuItem(menuData)
        },
        actionsRender: actionsRender,
        avatarProps: {
            src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
            size: 'small',
            title: '七妮妮',
            ...avatarRender
        }
    };




    return (
        <div
            id="pro-layout"
            style={{
                height: '100vh',
            }}
        >
            <ProConfigProvider hashed={false}>
                <ConfigProvider
                    getTargetContainer={() => {
                        return document.getElementById('pro-layout') || document.body;
                    }}
                >
                    <div >
                        <ProLayout

                            {...props}
                            {...theme}
                        >
                            <PageContainer>
                                <ProCard>
                                    <Outlet/>
                                </ProCard>
                            </PageContainer>
                            <SettingDrawer
                                pathname={pathname}
                                enableDarkTheme
                                getContainer={(e: any) => {
                                    if (typeof window === 'undefined') return e;
                                    return document.getElementById('test-pro-layout');
                                }}
                                settings={theme}
                                onSettingChange={handleSettingsChange}
                                disableUrlParams
                                hideHintAlert
                                hideCopyButton
                            />
                        </ProLayout>

                    </div>
                </ConfigProvider>
            </ProConfigProvider>
        </div>
    );
};


export default AdminLayout;