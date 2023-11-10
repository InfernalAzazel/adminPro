import {API} from '@/services/typings';
import {PlusOutlined} from '@ant-design/icons';
import type {
    ActionType,
    ProColumns,
    ProDescriptionsItemProps,
    ProFormColumnsType,
    ProFormInstance
} from '@ant-design/pro-components';
import {BetaSchemaForm, ProDescriptions, ProTable} from '@ant-design/pro-components';
import type {PaginationProps} from 'antd';
import {Button, Modal, Popconfirm} from 'antd';
import {useEffect, useMemo, useRef, useState} from "react";
import {useRoleAll, useUsersAdd, useUsersDelete, useUsersEdit, useUsersList} from '@/services';
import {dateFormatter} from "@/utils";

export default function UsersPage() {

    const actionRef = useRef<ActionType>();
    const fromRef = useRef<ProFormInstance>()
    const [UsersList, setUsersList] = useState<API.User[]>();
    const [currentRow, setCurrentRow] = useState<API.User>();
    const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
    const [isCreateForm, setIsCreateForm] = useState<boolean>(false);
    const [descriptionsModalOpen, setDescriptionsModalOpen] = useState<boolean>(false);
    const [pagination, setPagination] = useState<Partial<PaginationProps>>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [roleDataAll, setRoleDataAll] = useState<API.Role[]>([]);


    const {data, loading, runAsync, refresh} = useUsersList()
    const {runAsync: runReqUsersAdd} = useUsersAdd({manual:true})
    const {runAsync: runReqUsersEdit} = useUsersEdit({manual:true})
    const {runAsync: runReqUsersDelete} = useUsersDelete({manual:true})

    const {data: dataReqRoleAll, runAsync: runReqRoleAll} = useRoleAll({manual: true})


    useEffect(() => {
        setUsersList(data?.data);
        setPagination({
            ...pagination,
            total: data?.total,
            showSizeChanger: true,
            showQuickJumper: true,
        });
    }, [data]);

    useEffect(() => {
        setRoleDataAll(dataReqRoleAll?.data);
        console.log(dataReqRoleAll?.data)
    }, [dataReqRoleAll]);

    useEffect(() => {
        // BetaSchemaForm 渲染后执行的代码
        if (isCreateForm) {
            fromRef.current?.resetFields()
        } else {
            fromRef.current?.setFieldsValue(currentRow)
        }
    }, [formModalOpen]);

    const columns: ProColumns<API.User>[] = [
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
            title: 'username',
            dataIndex: 'username',
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
            title: 'disabled',
            dataIndex: 'disabled',
            copyable: true,
            ellipsis: true,
            valueType: 'switch',
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
            title: 'role_name',
            dataIndex: 'role_name',
            copyable: true,
            ellipsis: true,
            valueType: 'select',
            valueEnum: () => {
                const roleData = roleDataAll || [];
                return roleData?.reduce((enumObj: Record<string, any>, item: Record<string, any>) => {
                    enumObj[item.name] = { text: item.name };
                    return enumObj;
                }, {});
            },
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
            title: 'mail',
            dataIndex: 'mail',
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
            title: 'company',
            dataIndex: 'company',
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
            title: 'department',
            dataIndex: 'department',
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
                    startCreateTime: dateFormatter(value[0],'YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
                    endCreateTime: dateFormatter(value[1],'YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
                }),
            },
            render: (_, record) => dateFormatter(record.create_at) ,
        },
        {
            title: '更新时间',
            dataIndex: 'update_at',
            valueType: 'dateRange',
            search: {
                transform: (value: any) => ({
                    startUpdateTime: dateFormatter(value[0],'YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
                    endUpdateTime: dateFormatter(value[1],'YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
                }),
            },
            render: (_, record) => dateFormatter(record.update_at) ,
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
                    onConfirm={()=> onDelete(record)}
                    okText="Yes"
                    cancelText="No"
                >
                    <a className={'text-red'}>删除</a>
                </Popconfirm>
            ],
        },
    ];
    const schemaColumns: ProColumns<API.User>[] = columns.map((column) => {
        const modifyColumn = (key: string, modifications: Record<string, any>) =>
            column.dataIndex === key ? {...column, ...modifications} : column;
        return {
            ...modifyColumn('uid', {readonly: true, hideInForm: isCreateForm}),
            ...modifyColumn('create_at', {hideInForm: true}),
            ...modifyColumn('update_at', {hideInForm: true}),
        };
    });
    const createSchemaColumns: ProColumns<API.CreateUser>[] = [
        ...columns.filter(({ dataIndex }) =>
            ['username', 'disabled', 'role_name'].includes(dataIndex as string)
        ) as any[],
        {
            title: 'password',
            dataIndex: 'password',
            valueType: 'password',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            }
        },
    ]
    const schemaColumnsToUse = useMemo(() => {
        return isCreateForm
            ? createSchemaColumns as ProFormColumnsType<API.CreateUser>[]
            : schemaColumns as ProFormColumnsType<API.CreateUser>[];
    }, [isCreateForm, createSchemaColumns, schemaColumns]);


    async function openCreateOREditModal(row?: API.User, isCreate: boolean = true) {
        actionRef.current?.reload();
        if(isCreate){
            setIsCreateForm(true)
            setCurrentRow(undefined)
        }else {
            setIsCreateForm(false);
            setCurrentRow(row)
        }
         await runReqRoleAll()
        setFormModalOpen(true);
    }

    async function onSubmitCreateOREditFrom(value: API.CreateUser | API.User) {
        if(isCreateForm){
            await runReqUsersAdd(value as API.CreateUser)
        }else {
            await runReqUsersEdit(value as API.User)
        }
        setFormModalOpen(false);
        actionRef.current?.reload()
    }

    function onView(row: API.User) {
        setCurrentRow(row)
        setDescriptionsModalOpen(true);
    }
    async function onDelete(row: API.User) {
        await runReqUsersDelete(row.uid)
        refresh()
        actionRef.current?.reload()
    }

    const handleOk = () => {
        setDescriptionsModalOpen(false);
        setCurrentRow(undefined)
    };

    const handleCancel = () => {
        setDescriptionsModalOpen(false);
        setCurrentRow(undefined)
    };

    return (
        <>
            <ProTable<API.User>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                loading={loading}
                request={ async (params) => {
                    await runAsync(params)
                    return Promise.resolve({
                        data: [],
                        success: true,
                    });
                }}
                dataSource={UsersList}
                options={{
                    setting: {
                        listsHeight: 400,
                    },
                }}
                pagination={pagination}
                onChange={(pagination) =>{
                    setPagination(pagination)
                }}
                columnsState={{
                    persistenceKey: 'usersColumnsState',
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
            <BetaSchemaForm<any>
                title={isCreateForm ? '创建' : '编辑'}
                formRef={fromRef}
                open={formModalOpen}
                onOpenChange={setFormModalOpen}
                layoutType={'ModalForm'}
                columns={schemaColumnsToUse}
                onFinish={onSubmitCreateOREditFrom}
            />
            <Modal title="详细" open={descriptionsModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <ProDescriptions
                    dataSource={currentRow}
                    bordered={true}
                    column={1}
                    columns={columns as ProDescriptionsItemProps<API.User>[]}
                />
            </Modal>
        </>
    );
}