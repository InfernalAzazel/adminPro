import type { MenuDataItem, ProLayoutProps, ProSettings } from '@ant-design/pro-components';
import type { AvatarProps, MenuProps } from 'antd';
import type { ReactNode } from 'react';
import { PageContainer, ProCard, ProLayout, SettingDrawer } from '@ant-design/pro-components';
import { Button, Dropdown } from 'antd';
import { useState } from 'react';
import { menuData } from './defaultProps';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAppState } from '@/hooks'
import React from 'react';
import { Icon } from '@iconify/react';
import { useUsersRoutes } from '@/services';


const AdminLayout: React.FC = () => {
    const location = useLocation();
    const [, setValue] = useAppState()
    const [pathname, setPathname] = useState('/admin/welcome');
    const {data} = useUsersRoutes()
    console.log('useUsersRoutes', data)
    const [settings, setSetting] = useState<Partial<ProSettings> | undefined>({
        fixSiderbar: true,
        fixedHeader: true,
        layout: 'mix',
        splitMenus: false,
        navTheme: 'light',
        contentWidth: 'Fluid',
        colorPrimary: '#1677FF',
        siderMenuType: 'sub',
    });

    const menuItemRender = (item: MenuDataItem, dom: ReactNode) => {
        if (item.disabled || item.path === undefined) {
            return dom;
        }
        return <Link to={item.path} onClick={() => {
            setPathname(item.path as string);
          }}>{dom}</Link>;
    };

    const loopMenuItem = (menus: any[]): MenuDataItem[] =>
        menus.map(({ icon, children, ...item }) => ({
            ...item,
            icon:  icon && <Icon icon={icon} width={16}  height={16} />,
            children: children && loopMenuItem(children),
        }));



    const avatarRender = {
        render: (_: AvatarProps, dom: ReactNode) => {
            const onClick: MenuProps['onClick'] = ({ key }) => {
                if (key === 'logout') {
                    setValue({ access_token: '' })
                }
            };

            const items: MenuProps['items'] = [
                {
                    key: 'logout',
                    icon: <Icon icon='ant-design:logout-outlined' width={16} height={16} />,
                    label: '退出登录',
                },
            ];
            return (
                <Dropdown
                    menu={{ items, onClick }}
                >
                    {dom}
                </Dropdown>
            )
        }
    }

    const props: ProLayoutProps = {
        title: 'adminPro',
        menuItemRender,
        location,
        menu: {
            request: async () => loopMenuItem(menuData),
        },
        avatarProps: {
            src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
            size: 'small',
            title: '七妮妮',
            ...avatarRender
        }
    };


    return (
        <div
            id="test-pro-layout"
            style={{
                height: '100vh',
            }}
        >
            <ProLayout
                {...props}
                {...settings}
            >
                <PageContainer
                    extra={[
                        <Button key="3">操作</Button>,
                        <Button key="2">操作</Button>,
                        <Button key="1" type="primary">
                            主操作
                        </Button>,
                    ]}
                >
                    <ProCard>
                        <Outlet />
                    </ProCard>
                </PageContainer>
            </ProLayout>
            <SettingDrawer
                pathname={pathname}
                enableDarkTheme
                getContainer={() => document.getElementById('test-pro-layout')}
                settings={settings}
                onSettingChange={(changeSetting) => {
                    setSetting(changeSetting);
                }}
                disableUrlParams={false}
            />
        </div >
    );
};


export default AdminLayout;