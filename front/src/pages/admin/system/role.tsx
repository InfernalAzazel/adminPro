import {API} from '@/services/typings';
import {PlusOutlined} from '@ant-design/icons';
import type {
    ActionType,
    ProColumns,
    ProDescriptionsItemProps,
    ProFormColumnsType,
    ProFormInstance
} from '@ant-design/pro-components';
import {BetaSchemaForm, ProCard, ProDescriptions, ProTable} from '@ant-design/pro-components';
import type {PaginationProps} from 'antd';
import type {BasicDataNode, DataNode, EventDataNode} from 'antd/lib/tree';
import {Button, Modal, Popconfirm, Tree, Space, Tag} from 'antd';
import React, {useEffect, useRef, useState} from "react";
import {
    useAddRoleRequest,
    useDeleteRoleRequest,
    useEditRoleRequest,
    useGetInterfaceAllRequest,
    useGetMenuAllRequest,
    useGetRoleListRequest,
} from '@/services';
import {dateFormatter, getTreeDataAndHalfCheckedKeys} from "@/utils";
import {useTranslation} from "react-i18next";

interface CheckInfo<TreeDataType extends BasicDataNode = DataNode> {
    event: 'check';
    node: EventDataNode<TreeDataType>;
    checked: boolean;
    nativeEvent: MouseEvent;
    checkedNodes: TreeDataType[];
    checkedNodesPositions?: {
        node: TreeDataType;
        pos: string;
    }[];
    halfCheckedKeys?: React.Key[];
}

export default function RolePage() {
    const { t } = useTranslation();
    const actionRef = useRef<ActionType>();
    const fromRef = useRef<ProFormInstance>()
    const [roleDataList, setRoleDataList] = useState<API.Role[]>();
    const [currentRow, setCurrentRow] = useState<API.Role>();
    const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState<boolean>(false);
    const [isCreateForm, setIsCreateForm] = useState<boolean>(false);
    const [isDescriptionsModalOpen, setIsDescriptionsModalOpen] = useState<boolean>(false);
    const [pagination, setPagination] = useState<Partial<PaginationProps>>({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [menuDataAllKeys, setMenuDataAllKeys] = useState<React.Key[]>([]);
    const [menuDataTree, setMenuDataTree] = useState<API.Menu[]>([]);
    const [menuCheckedKeys, setMenuCheckedKeys] = useState<React.Key[]>([]);
    const [interfaceDataAll, setInterfaceDataAll] =  useState<API.Interface[]>([]);
    const [interfaceDataAllKeys, setInterfaceDataAllKeys] =  useState<React.Key[]>([]);
    const [interfaceCheckedKeys, setInterfaceCheckedKeys] =  useState<React.Key[]>([]);

    const {data, loading, runAsync: getRoleListRequest} = useGetRoleListRequest()
    const {runAsync: addRoleRequest} = useAddRoleRequest({manual: true})
    const {runAsync: editRoleRequest} = useEditRoleRequest({manual: true})
    const {runAsync: deleteRoleRequest} = useDeleteRoleRequest({manual: true})
    const {data: dataMenuAll, runAsync: getMenuAllRequest} = useGetMenuAllRequest({manual: true})
    const {data: dataMenuPermissionsAll, runAsync: getMenuPermissionsAllRequest} = useGetMenuAllRequest({manual: true})
    const {data: dataInterfaceAll, runAsync: getInterfaceAllRequest} = useGetInterfaceAllRequest({manual: true})

    useEffect(() => {
        setRoleDataList(data?.data);
        setPagination({
            ...pagination,
            total: data?.total,
            showSizeChanger: true,
            showQuickJumper: true,
        });
    }, [data]);

    useEffect(() => {
        // menu 树形框 tree 数据设置
        const menuData: API.Menu[] = dataMenuAll?.data || []
        const {treeData} = getTreeDataAndHalfCheckedKeys(menuData)
        const menuKeys = menuData?.map(item => item.uid)
        setMenuDataAllKeys(menuKeys)
        setMenuDataTree(treeData)
    }, [dataMenuAll]);

    useEffect(() => {
        // menu 树形框选中数据设置
        const menuPermissionsData: API.Menu[]  = dataMenuPermissionsAll?.data || []
        const { halfCheckedKeys} = getTreeDataAndHalfCheckedKeys(menuPermissionsData)
        // 排除半选中的键
        const menuNoHalfCheckedKeys = menuPermissionsData.map(item => item.uid).filter(uid => !halfCheckedKeys.includes(uid));
        setMenuCheckedKeys(menuNoHalfCheckedKeys)
        actionRef.current?.reload()
    }, [dataMenuPermissionsAll]);

    useEffect(() => {
        const interfaceData: API.Interface[] = dataInterfaceAll?.data || []
        const interfaceKeys = interfaceData?.map(item => item.uid)
        setInterfaceDataAllKeys(interfaceKeys)
        setInterfaceDataAll(interfaceData)
    }, [dataInterfaceAll]);

    useEffect(() => {
        // BetaSchemaForm 渲染后执行的代码
        if (isCreateForm) {
            fromRef.current?.resetFields()
        } else {
            fromRef.current?.setFieldsValue(currentRow)
        }
    }, [isFormModalOpen]);

    const columns: ProColumns<API.Role>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: t(`multipurpose.uid`),
            dataIndex: 'uid',
            copyable: true,
            ellipsis: true,
        },
        {
            title: t(`pages.system.role.name`),
            dataIndex: 'name',
            copyable: true,
            ellipsis: true,
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: t(`multipurpose.rules.required`),
                    },
                ],
            }
        },
        {
            title: t(`pages.system.role.describe`),
            dataIndex: 'describe',
            copyable: true,
            ellipsis: true,
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: t(`multipurpose.rules.required`),
                    },
                ],
            }
        },
        {
            title: t(`multipurpose.create_at`),
            key: 'create_at',
            dataIndex: 'create_at',
            valueType: 'dateRange',
            search: {
                transform: (value: any) => ({
                    startCreateTime: dateFormatter(value[0], 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
                    endCreateTime: dateFormatter(value[1], 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
                }),
            },
            render: (_, record) => dateFormatter(record.create_at),
        },
        {
            title: t(`multipurpose.update_at`),
            dataIndex: 'update_at',
            valueType: 'dateRange',
            search: {
                transform: (value: any) => ({
                    startUpdateTime: dateFormatter(value[0], 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
                    endUpdateTime: dateFormatter(value[1], 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
                }),
            },
            render: (_, record) => dateFormatter(record.update_at),
        },
        {
            title: t(`multipurpose.operate`),
            valueType: 'option',
            key: 'option',
            fixed: 'right',
            hideInDescriptions: true,
            render: (_dom, record) => [
                <a onClick={() => openCreateOREditModal(record, false)}>{t(`multipurpose.edit`)}</a>,
                <a className={'text-blueGray'} onClick={() => openDescriptions(record)}>{t(`multipurpose.view`)}</a>,
                <Popconfirm
                    title={t(`multipurpose.prompt`)}
                    description={t(`multipurpose.isDel`)}
                    onConfirm={()=> onDelete(record)}
                    okText={t(`multipurpose.yes`)}
                    cancelText={t(`multipurpose.no`)}
                >
                    <a className={'text-red'}>{t(`multipurpose.del`)}</a>
                </Popconfirm>,
                <a className={'text-emerald'} onClick={() => openPermissionsModal(record)}>{t(`pages.system.role.operate.permissions`)}</a>,
            ],
        },
    ];
    const schemaColumns: ProColumns<API.Role>[] = columns.map((column) => {
        const modifyColumn = (key: string, modifications: Record<string, any>) =>
            column.dataIndex === key ? {...column, ...modifications} : column;
        return {
            ...modifyColumn('uid', {readonly: true, hideInForm: isCreateForm}),
            ...modifyColumn('create_at', {hideInForm: true}),
            ...modifyColumn('update_at', {hideInForm: true}),
        };
    });


    function openCreateOREditModal(row?: API.Role, isCreate: boolean = true) {
        actionRef.current?.reload();
        if (isCreate) {
            setIsCreateForm(true)
            setCurrentRow(undefined)
        } else {
            setIsCreateForm(false);
            setCurrentRow(row)
        }
        setIsFormModalOpen(true);
    }

    async function onSubmitCreateOREditFrom (value: API.Role) {
        if (isCreateForm) {
            await addRoleRequest(value)
        } else {
            await editRoleRequest(value.uid, value)
        }
        setIsFormModalOpen(false);
        actionRef.current?.reload()
    }

    function openDescriptions(row: API.Role) {
        setCurrentRow(row)
        setIsDescriptionsModalOpen(true);
    }

    async function onDelete(row: API.Role) {
        await deleteRoleRequest(row.name)
        actionRef.current?.reload()
    }



    function onDescriptionsOk (){
        setIsDescriptionsModalOpen(false);
        setCurrentRow(undefined)
    }

    function onDescriptionsCancel() {
        setIsDescriptionsModalOpen(false);
        setCurrentRow(undefined)
    }

    async function openPermissionsModal(row: API.Role) {
        await getMenuAllRequest()
        await getMenuPermissionsAllRequest(row.menu_permission, true)
        await getInterfaceAllRequest()

        setInterfaceCheckedKeys(row.interface_permission)
        setCurrentRow(row)
        setIsPermissionsModalOpen(true);
        actionRef.current?.reload();
    }

    async function onPermissionsOk () {
        setIsPermissionsModalOpen(false);
        if(currentRow){
            await editRoleRequest(currentRow.uid, currentRow)
        }
        actionRef.current?.reload();
    }

    function onPermissionsCancel () {
        setIsPermissionsModalOpen(false);
    }
    // 你的函数
    function onMenuCheck(
        checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[]; },
        info: CheckInfo<API.Menu>
    ): void {
        // 检查 checked 参数的类型，如果是对象形式则使用 checked.checked
        const keys = Array.isArray(checked) ? checked : checked.checked;
        const arr = keys.concat(info.halfCheckedKeys || []);
        const add = menuDataAllKeys?.filter(uid => !currentRow?.menu_permission.includes(uid as string) && arr.includes(uid));
        const remove = currentRow?.menu_permission?.filter(uid => !arr?.includes(uid));

        // 创建一个新的 Role 对象并更新其中的 menu_permission 属性
        const updatedRole = {
            ...(currentRow || {}),
            menu_permission: [
                // 复制当前的 menu_permission "并过滤掉要删除的元素" 或者 "创建一个空数组"
                ...(currentRow?.menu_permission.filter(menuUID => !remove?.some(uid => uid === menuUID)) || []),
                ...add || [] // 添加新的元素
            ]
        };

        setMenuCheckedKeys(keys)
        setCurrentRow(updatedRole as API.Role)
        // console.log("需要添加的元素:", add);
        // console.log("需要删除的元素:", remove);
        // console.log("更新角色", updatedRole);
    }
    function onInterfaceCheck(
        checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[]; }
    ): void {
        // 检查 checked 参数的类型，如果是对象形式则使用 checked.checked
        const keys = Array.isArray(checked) ? checked : checked.checked;
        const add = interfaceDataAllKeys?.filter(uid => !currentRow?.interface_permission?.includes(uid as string) && keys.includes(uid));
        const remove = currentRow?.interface_permission?.filter(uid => !keys?.includes(uid));

        // 创建一个新的 Role 对象并更新其中的 interface_permission 属性
        const updatedRole = {
            ...(currentRow || {}),
            interface_permission: [
                // 复制当前的 interface_permission "并过滤掉要删除的元素" 或者 "创建一个空数组"
                ...(currentRow?.interface_permission.filter(interfaceUID => !remove?.some(uid => uid === interfaceUID)) || []),
                ...add || [] // 添加新的元素
            ]
        };

        setInterfaceCheckedKeys(keys)
        setCurrentRow(updatedRole as API.Role)
        // console.log("需要添加的元素:", add);
        // console.log("需要删除的元素:", remove);
        // console.log("更新角色", updatedRole);
    }

    function titleRenderInterface(nodeData: DataNode) {
        const interfaceData: API.Interface = nodeData as any
        const methodToTagColor: Record<string, string> = {
            GET: 'blue',
            POST: 'green',
            PUT: 'volcano',
            DELETE: 'red',
            // 如果有其他请求方法，可以继续添加映射
        };
        const tagColor = methodToTagColor[interfaceData.method] || 'default';
        return(
           <>
               <Space>
                   <span> {interfaceData.name} </span>
                   <Tag color="default">{interfaceData.group}</Tag>
                   <Tag color={tagColor}>{interfaceData.method}</Tag>
               </Space>

           </>
        )
    }


    return (
        <>
            <ProTable<API.Role>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                loading={loading}
                request={async (params) => {
                    await getRoleListRequest(params)
                    return Promise.resolve({
                        data: [],
                        success: true,
                    });
                }}
                dataSource={roleDataList}
                options={{
                    setting: {
                        listsHeight: 400,
                    },
                }}
                pagination={pagination}
                onChange={(pagination) => setPagination(pagination)}
                columnsState={{
                    persistenceKey: 'roleColumnsState',
                    persistenceType: 'localStorage',
                }}
                rowKey="uid"
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined/>}
                        onClick={() => openCreateOREditModal()}
                        type="primary"
                    >
                        {t(`multipurpose.new`)}
                    </Button>,
                ]}
            />
            <BetaSchemaForm<API.Role>
                title={isCreateForm ?  t(`multipurpose.new`) :  t(`multipurpose.edit`)}
                formRef={fromRef}
                open={isFormModalOpen}
                onOpenChange={setIsFormModalOpen}
                layoutType={'ModalForm'}
                columns={schemaColumns as ProFormColumnsType<API.Role>[]}
                onFinish={onSubmitCreateOREditFrom}
            />
            <Modal title={t(`multipurpose.view`)}  open={isDescriptionsModalOpen} onOk={onDescriptionsOk} onCancel={onDescriptionsCancel}>
                <ProDescriptions
                    dataSource={currentRow}
                    bordered={true}
                    column={1}
                    columns={columns as ProDescriptionsItemProps<API.Role>[]}
                />
            </Modal>
            <Modal width={800} title={t(`pages.system.role.setPermissions`)} open={isPermissionsModalOpen} onOk={onPermissionsOk} onCancel={onPermissionsCancel}>
                    <ProCard split="vertical">
                        <ProCard title={t(`pages.system.role.menuLabel`)} headerBordered>
                            <div style={{height: 360}}>
                                <Tree
                                    checkable
                                    fieldNames={{key: 'uid', title: 'name'}}
                                    checkedKeys={menuCheckedKeys}
                                    onCheck={onMenuCheck}
                                    treeData={menuDataTree}
                                    height={360}
                                />
                            </div>
                        </ProCard>
                        <ProCard title={t(`pages.system.role.interfaceLabel`)} colSpan="60%" headerBordered>
                            <Tree
                                checkable
                                fieldNames={{key: 'uid', title: 'name'}}
                                checkedKeys={interfaceCheckedKeys}
                                onCheck={onInterfaceCheck}
                                treeData={interfaceDataAll as any}
                                height={360}
                                titleRender={titleRenderInterface}
                            />
                        </ProCard>
                    </ProCard>
            </Modal>
        </>
    );
}