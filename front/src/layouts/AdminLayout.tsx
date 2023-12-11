import type {MenuDataItem, ProLayoutProps, ProSettings} from '@ant-design/pro-components';
import {
    PageContainer,
    ProCard,
    ProLayout,
    SettingDrawer
} from '@ant-design/pro-components';
import type {AvatarProps, MenuProps} from 'antd';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Dropdown} from 'antd';
import type {ReactNode} from 'react';
import React, { useEffect, useRef, useState} from 'react';
// import {menuData} from './defaultProps';
import {Link, Outlet, useLocation} from 'react-router-dom';
import {Icon} from '@iconify/react';
import {useGetUsersRoutesRequest} from '@/services';
import {useAppStore} from "@/store";
import {getTreeDataAndHalfCheckedKeys} from "@/utils";
import {useTranslation} from 'react-i18next';
import i18n from "@/locales";

const AdminLayout: React.FC = () => {

    const {t} = useTranslation();
    const location = useLocation();
    const [pathname, setPathname] = useState('/admin/welcome');
    const [menuData, setMenuData] = useState<MenuDataItem[]>([]);
    const setAccessToken = useAppStore((state: any) => state.setAccessToken);
    const theme = useAppStore((state: any) => state.theme);
    const setLocale = useAppStore((state: any) => state.setLocale);
    const setTheme = useAppStore((state: any) => state.setTheme);
    const actionRef = useRef<{ reload: () => void; }>();

    const {data: dataUsersRoutes} = useGetUsersRoutesRequest()

    useEffect(() => {
        const {treeData} = getTreeDataAndHalfCheckedKeys(dataUsersRoutes?.data || [])
        setMenuData(treeData)
    }, [dataUsersRoutes]);

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
        menus.map(({uid, name, key, father, order, depth, locale, create_at, update_at, icon, children, ...item}) => ({
            ...item,
            name: t(locale),
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
                    label: t(`layouts.admin.lang.logout`),
                },
            ];
            return (
                <Dropdown
                    menu={{items, onClick}}
                    placement="bottom"
                >
                    {dom}
                </Dropdown>
            )
        }
    }

    function actionsRender() {
        const onClick: MenuProps['onClick'] = async ({key}) => {
            setLocale(key)
            await i18n.changeLanguage(key)
            window.location.reload();
        };
        const items: MenuProps['items'] = [
            {
                key: 'zh_cn',
                icon: <Icon icon='mdi:language-swift' width={16} height={16}/>,
                label: t(`layouts.admin.lang.zh_cn`),
            },
            {
                key: 'en_us',
                icon: <Icon icon='mdi:language-swift' width={16} height={16}/>,
                label: t(`layouts.admin.lang.en_us`),
            },
        ];
        return [
            <Dropdown
                menu={{items, onClick}}
                placement="bottom"
            >
                <Icon icon={'grommet-icons:language'} width={32} height={32}/>
            </Dropdown>

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
            title: 'panda',
            ...avatarRender
        }
    };


    return (
        <div>
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
                    settings={theme}
                    onSettingChange={handleSettingsChange}
                    disableUrlParams
                    hideHintAlert
                    hideCopyButton
                />
            </ProLayout>

        </div>
    );
};


export default AdminLayout;