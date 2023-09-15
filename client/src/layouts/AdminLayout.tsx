import type {MenuDataItem, ProLayoutProps, ProSettings} from '@ant-design/pro-components';
import {PageContainer, ProCard, ProLayout} from '@ant-design/pro-components';
import type {AvatarProps, MenuProps} from 'antd';
import {ConfigProvider, Dropdown, Modal} from 'antd';
import type {ReactNode} from 'react';
import React, {useState} from 'react';
import {menuData} from './defaultProps';
import {Link, Outlet, useLocation} from 'react-router-dom';
import {useAppState} from '@/hooks'
import {Icon} from '@iconify/react';
import {useUsersRoutes} from '@/services';


const AdminLayout: React.FC = () => {
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
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
        menus.map(({icon, children, ...item}) => ({
            ...item,
            icon: icon && <Icon icon={icon} width={16} height={16}/>,
            children: children && loopMenuItem(children),
        }));


    const avatarRender = {
        render: (_: AvatarProps, dom: ReactNode) => {
            const onClick: MenuProps['onClick'] = ({key}) => {
                if (key === 'logout') {
                    setValue({access_token: ''})
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
            <Icon icon={'ant-design:skin-outlined'} width={32} height={32} onClick={showModal}/>
        ]
    }

    // const token = {
    //     colorBgAppListIconHover: 'rgba(0,0,0,0.06)',
    //     colorTextAppListIconHover: 'rgba(255,255,255,0.95)',
    //     colorTextAppListIcon: 'rgba(255,255,255,0.85)',
    //     sider: {
    //         colorBgCollapsedButton: '#fff',
    //         colorTextCollapsedButtonHover: 'rgba(0,0,0,0.65)',
    //         colorTextCollapsedButton: 'rgba(0,0,0,0.45)',
    //         colorMenuBackground: '#004FD9',
    //         colorBgMenuItemCollapsedElevated: 'rgba(0,0,0,0.85)',
    //         colorMenuItemDivider: 'rgba(255,255,255,0.15)',
    //         colorBgMenuItemHover: 'rgba(0,0,0,0.06)',
    //         colorBgMenuItemSelected: 'rgba(0,0,0,0.15)',
    //         colorTextMenuSelected: '#fff',
    //         colorTextMenuItemHover: 'rgba(255,255,255,0.75)',
    //         colorTextMenu: 'rgba(255,255,255,0.75)',
    //         colorTextMenuSecondary: 'rgba(255,255,255,0.65)',
    //         colorTextMenuTitle: 'rgba(255,255,255,0.95)',
    //         colorTextMenuActive: 'rgba(255,255,255,0.95)',
    //         colorTextSubMenuSelected: '#fff',
    //     },
    //     header: {
    //         colorBgHeader: '#004FD9',
    //         colorBgRightActionsItemHover: 'rgba(0,0,0,0.06)',
    //         colorTextRightActionsItem: 'rgba(255,255,255,0.65)',
    //         colorHeaderTitle: '#fff',
    //         colorBgMenuItemHover: 'rgba(0,0,0,0.06)',
    //         colorBgMenuItemSelected: 'rgba(0,0,0,0.15)',
    //         colorTextMenuSelected: '#fff',
    //         colorTextMenu: 'rgba(255,255,255,0.75)',
    //         colorTextMenuSecondary: 'rgba(255,255,255,0.65)',
    //         colorTextMenuActive: 'rgba(255,255,255,0.95)',
    //     },
    //     pageContainer: {
    //         colorBgPageContainer: '#004FD9'
    //     }
    // }

    const props: ProLayoutProps = {
        title: 'adminPro',
        menuItemRender,
        token: {},
        location,
        menu: {
            request: async () => loopMenuItem(menuData),
        },
        actionsRender: actionsRender,
        avatarProps: {
            src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
            size: 'small',
            title: '七妮妮',
            ...avatarRender
        }
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <div
            id="test-pro-layout"
            style={{
                height: '100vh',
            }}
        >
            <ConfigProvider
                theme={{
                    // 1. 单独使用暗色算法
                    // algorithm: theme.darkAlgorithm,

                    // 2. 组合使用暗色算法与紧凑算法
                    token: {
                        colorPrimary: '#00b96b',
                        // colorPrimaryHover: '#b9009a',
                        // colorPrimaryActive: "#b9009a",
                        // colorPrimaryBg: "#b9009a",
                        // colorPrimaryBgHover: "",
                        // colorPrimaryBorder: "",
                        // colorPrimaryBorderHover: "",
                        // colorPrimaryText: "",
                        // colorPrimaryTextActive: "",
                        // colorPrimaryTextHover: "",
                        borderRadius: 2,
                        // 派生变量，影响范围小
                        colorBgContainer: '#F4801A',
                        colorBgLayout: '#F4801A',
                        colorBorderBg: '#0ee56b',

                    },
                    algorithm: [],
                }}
            >
                <ProLayout
                    {...props}
                    {...settings}
                >
                    <PageContainer>
                        <ProCard>
                            <Outlet/>
                        </ProCard>
                    </PageContainer>
                </ProLayout>
                {/*<SettingDrawer*/}
                {/*    pathname={pathname}*/}
                {/*    enableDarkTheme*/}
                {/*    getContainer={() => document.getElementById('test-pro-layout')}*/}
                {/*    settings={settings}*/}
                {/*    onSettingChange={(changeSetting) => {*/}
                {/*        setSetting(changeSetting);*/}
                {/*    }}*/}
                {/*    disableUrlParams={false}*/}
                {/*/>*/}
                <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                </Modal>
            </ConfigProvider>
        </div>
    );
};


export default AdminLayout;