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
    useInterfaceAll,
    useMenuAll,
    useRoleAdd,
    useRoleDelete,
    useRoleEdit,
    useRoleList
} from '@/services';
import {dateFormatter, getTreeDataAndHalfCheckedKeys} from "@/utils";

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
    const actionRef = useRef<ActionType>();
    const fromRef = useRef<ProFormInstance>()
    const [roleList, setRoleList] = useState<API.Role[]>();
    const [currentRow, setCurrentRow] = useState<API.Role>();
    const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
    const [permissionsModalOpen, setPermissionsModalOpen] = useState<boolean>(false);
    const [isCreateForm, setIsCreateForm] = useState<boolean>(false);
    const [descriptionsModalOpen, setDescriptionsModalOpen] = useState<boolean>(false);
    const [pagination, setPagination] = useState<Partial<PaginationProps>>({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [menuDataAllKeys, setMenuDataAllKeys] = useState<React.Key[]>([]);
    const [menuTreeData, setMenuTreeData] = useState<API.Menu[]>([]);
    const [menuCheckedKeys, setMenuCheckedKeys] = useState<React.Key[]>([]);
    const [interfaceDataAll, setInterfaceDataAll] =  useState<API.Interface[]>([]);
    const [interfaceDataAllKeys, setInterfaceDataAllKeys] =  useState<React.Key[]>([]);
    const [interfaceCheckedKeys, setInterfaceCheckedKeys] =  useState<React.Key[]>([]);

    const {data, loading, run} = useRoleList()
    const {run: runReqRoleAdd} = useRoleAdd({manual: true})
    const {run: runReqRoleEdit} = useRoleEdit({manual: true})
    const {run: runReqRoleDelete} = useRoleDelete({manual: true})
    const {data: dataReqMenuAll, run: runReqMenuAll} = useMenuAll({manual: true})
    const {data: dataReqMenuPermissionsAll, run: runReqMenuPermissionsAll} = useMenuAll({manual: true})
    const {data: dataReqInterfaceAll, run: runReqInterfaceAll} = useInterfaceAll({manual: true})

    useEffect(() => {
        setRoleList(data?.data);
        setPagination({
            ...pagination,
            total: data?.total,
            showSizeChanger: true,
            showQuickJumper: true,
        });
    }, [data]);

    useEffect(() => {
        const menuData: API.Menu[] = dataReqMenuAll?.data || []
        const {treeData} = getTreeDataAndHalfCheckedKeys(menuData)
        const menuKeys = menuData?.map(item => item.uid)
        setMenuDataAllKeys(menuKeys)
        setMenuTreeData(treeData)
    }, [dataReqMenuAll]);

    useEffect(() => {
        const menuPermissionsData: API.Menu[]  = dataReqMenuPermissionsAll?.data || []
        const { halfCheckedKeys} = getTreeDataAndHalfCheckedKeys(menuPermissionsData)
        // 排除半选中的键
        const menuNoHalfCheckedKeys = menuPermissionsData?.map(item => item.uid).filter(uid => !halfCheckedKeys.includes(uid));
        setMenuCheckedKeys(menuNoHalfCheckedKeys)
    }, [dataReqMenuPermissionsAll]);

    useEffect(() => {
        const interfaceData: API.Interface[] = dataReqInterfaceAll?.data || []
        const interfaceKeys = interfaceData?.map(item => item.uid)
        setInterfaceDataAllKeys(interfaceKeys)
        setInterfaceDataAll(interfaceData)
    }, [dataReqInterfaceAll]);

    useEffect(() => {
        // BetaSchemaForm 渲染后执行的代码
        if (isCreateForm) {
            fromRef.current?.resetFields()
        } else {
            fromRef.current?.setFieldsValue(currentRow)
        }
    }, [formModalOpen]);

    const columns: ProColumns<API.Role>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'uid',
            dataIndex: 'uid',
            copyable: true,
            ellipsis: true,
        },
        {
            title: 'name',
            dataIndex: 'name',
            copyable: true,
            ellipsis: true,
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            }
        },
        {
            title: 'describe',
            dataIndex: 'describe',
            copyable: true,
            ellipsis: true,
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            }
        },
        {
            title: '创建时间',
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
            title: '更新时间',
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
            title: '操作',
            valueType: 'option',
            key: 'option',
            fixed: 'right',
            hideInDescriptions: true,
            render: (_dom, record) => [
                <a onClick={() => openCreateOREditModal(record, false)}>编辑</a>,
                <a className={'text-blueGray'} onClick={() => onView(record)}>查看</a>,
                <Popconfirm
                    title="提示"
                    description="是否确定要删除？"
                    onConfirm={() => onDelete(record)}
                    okText="Yes"
                    cancelText="No"
                >
                    <a className={'text-red'}>删除</a>
                </Popconfirm>,
                <a className={'text-emerald'} onClick={() => openPermissionsModal(record)}>权限</a>,
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
        setFormModalOpen(true);
    }

    async function onSubmitCreateOREditFrom(value: API.Role) {
        if (isCreateForm) {
            runReqRoleAdd(value)
        } else {
            runReqRoleEdit(value)
        }
        setFormModalOpen(false);
        actionRef.current?.reload()
    }

    function onView(row: API.Role) {
        setCurrentRow(row)
        setDescriptionsModalOpen(true);
    }

    function onDelete(row: API.Role) {
        runReqRoleDelete(row.name)
        actionRef.current?.reload()
    }



    function onDescriptionsOk (){
        setDescriptionsModalOpen(false);
        setCurrentRow(undefined)
    }

    function onDescriptionsCancel() {
        setDescriptionsModalOpen(false);
        setCurrentRow(undefined)
    }

    function openPermissionsModal(row: API.Role) {
        runReqMenuAll()
        runReqMenuPermissionsAll(row.menu_permission)
        runReqInterfaceAll()

        setInterfaceCheckedKeys(row.interface_permission)
        setCurrentRow(row)
        setPermissionsModalOpen(true);
        actionRef.current?.reload();
    }

    function onPermissionsOk () {
        setPermissionsModalOpen(false);
        if(currentRow){
            runReqRoleEdit(currentRow)
        }
        actionRef.current?.reload();
    }

    function onPermissionsCancel () {
        setPermissionsModalOpen(false);
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
                   <span> {nodeData.title as any} </span>
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
                request={(params) => {
                    run(params)
                    return Promise.resolve({
                        data: [],
                        success: true,
                    });
                }}
                dataSource={roleList}
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
                        新建
                    </Button>,
                ]}
            />
            <BetaSchemaForm<API.Role>
                title={isCreateForm ? '创建' : '编辑'}
                formRef={fromRef}
                open={formModalOpen}
                onOpenChange={setFormModalOpen}
                layoutType={'ModalForm'}
                columns={schemaColumns as ProFormColumnsType<API.Role>[]}
                onFinish={onSubmitCreateOREditFrom}
            />
            <Modal title="详细" open={descriptionsModalOpen} onOk={onDescriptionsOk} onCancel={onDescriptionsCancel}>
                <ProDescriptions
                    dataSource={currentRow}
                    bordered={true}
                    column={1}
                    columns={columns as ProDescriptionsItemProps<API.Role>[]}
                />
            </Modal>
            <Modal width={800} title="权限" open={permissionsModalOpen} onOk={onPermissionsOk} onCancel={onPermissionsCancel}>
                    <ProCard split="vertical">
                        <ProCard title="菜单" headerBordered>
                            <div style={{height: 360}}>
                                <Tree
                                    checkable
                                    fieldNames={{key: 'uid'}}
                                    checkedKeys={menuCheckedKeys}
                                    onCheck={onMenuCheck}
                                    treeData={menuTreeData}
                                    height={360}
                                />
                            </div>
                        </ProCard>
                        <ProCard title="接口" colSpan="60%" headerBordered>
                            <Tree
                                checkable
                                fieldNames={{key: 'uid', title: 'title'}}
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