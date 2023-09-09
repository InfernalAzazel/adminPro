import type { MenuDataItem } from '@ant-design/pro-components';


export const menuData: MenuDataItem[] = [
  {
    path: '/admin/welcome',
    name: '欢迎',
    icon: 'ant-design:home-filled'
  },
  {
    path: '/admin/system',
    name: '管理',
    icon: 'ant-design:crown-filled',
    children: [
      {
        path: '/admin/system/users',
        name: '用户',
        icon: 'ant-design:user-outlined',
      },
      {
        path: '/admin/system/role',
        name: '角色',
        icon: 'ant-design:idcard-filled',
      },
      {
        path: '/admin/system/menu',
        name: '菜单',
        icon: 'ant-design:menu-outlined',
      },
      {
        path: '/admin/system/interface',
        name: '接口',
        icon: 'ant-design:usb-filled',
      },
    ],
  },
];