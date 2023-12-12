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
import {
    useAddUsersRequest,
    useDeleteUsersRequest,
    useEditUsersRequest,
    useGetRoleAllRequest,
    useGetUsersListRequest,
} from '@/services';
import {dateFormatter} from "@/utils";
import { useTranslation } from 'react-i18next';

export default function UsersPage() {

    const { t } = useTranslation();
    const actionRef = useRef<ActionType>();
    const fromRef = useRef<ProFormInstance>()
    const [usersDataList, setUsersDataList] = useState<API.User[]>();
    const [currentRow, setCurrentRow] = useState<API.User>();
    const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
    const [isCreateForm, setIsCreateForm] = useState<boolean>(false);
    const [descriptionsModalOpen, setDescriptionsModalOpen] = useState<boolean>(false);
    const [pagination, setPagination] = useState<Partial<PaginationProps>>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [roleDataAll, setRoleDataAll] = useState<API.Role[]>([]);


    const {data, loading, runAsync: getUsersListRequest, refresh: refreshUsersListRequest} = useGetUsersListRequest()
    const {runAsync: addUsersRequest} = useAddUsersRequest({manual:true})
    const {runAsync: editUsersRequest} = useEditUsersRequest({manual:true})
    const {runAsync: deleteUsersRequest} = useDeleteUsersRequest({manual:true})
    const {data: dataRoleAll, runAsync: getRoleAllRequest} = useGetRoleAllRequest({manual: true})


    useEffect(() => {
        setUsersDataList(data?.data);
        setPagination({
            ...pagination,
            total: data?.total,
            showSizeChanger: true,
            showQuickJumper: true,
        });
    }, [data]);

    useEffect(() => {
        setRoleDataAll(dataRoleAll?.data);
    }, [dataRoleAll]);

    useEffect(() => {
        // BetaSchemaForm 渲染后执行的代码
        if (isCreateForm) {
            fromRef.current?.resetFields()
        } else {
            fromRef.current?.setFieldsValue(currentRow)
        }
    }, [isFormModalOpen]);

    const columns: ProColumns<API.User>[] = [
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
            title: t(`pages.system.users.username`),
            dataIndex: 'username',
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
            title: t(`pages.system.users.disabled`),
            dataIndex: 'disabled',
            copyable: true,
            ellipsis: true,
            valueType: 'switch',
            initialValue: false,
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
            title: t(`pages.system.users.role_name`),
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
                        message: t(`multipurpose.rules.required`),
                    },
                ],
            }
        },
        {
            title: t(`pages.system.users.name`),
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
            title: t(`pages.system.users.mail`),
            dataIndex: 'mail',
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
            title: t(`pages.system.users.company`),
            dataIndex: 'company',
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
            title: t(`pages.system.users.department`),
            dataIndex: 'department',
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
                    startCreateTime: dateFormatter(value[0],'YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
                    endCreateTime: dateFormatter(value[1],'YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
                }),
            },
            render: (_, record) => dateFormatter(record.create_at) ,
        },
        {
            title: t(`multipurpose.update_at`),
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
         await getRoleAllRequest()
        setIsFormModalOpen(true);
    }

    async function onSubmitCreateOREditFrom(value: API.CreateUser | API.User) {
        if(isCreateForm){
            await addUsersRequest(value as API.CreateUser)
        }else {
            const v = value as API.User
            await editUsersRequest(v.uid, v)
        }
        setIsFormModalOpen(false);
        actionRef.current?.reload()
    }

    function openDescriptions(row: API.User) {
        setCurrentRow(row)
        setDescriptionsModalOpen(true);
    }
    async function onDelete(row: API.User) {
        await deleteUsersRequest(row.uid)
        refreshUsersListRequest()
        actionRef.current?.reload()
    }

    function onDescriptionsOk() {
        setDescriptionsModalOpen(false);
        setCurrentRow(undefined)
    }

    function onDescriptionsCancel(){
        setDescriptionsModalOpen(false);
        setCurrentRow(undefined)
    }

    return (
        <>
            <ProTable<API.User>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                loading={loading}
                request={ async (params) => {
                    await getUsersListRequest(params)
                    return Promise.resolve({
                        data: [],
                        success: true,
                    });
                }}
                dataSource={usersDataList}
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
                        {t(`multipurpose.new`)}
                    </Button>,
                ]}
            />
            <BetaSchemaForm<any>
                title={isCreateForm ?  t(`multipurpose.new`) :  t(`multipurpose.edit`)}
                formRef={fromRef}
                open={isFormModalOpen}
                onOpenChange={setIsFormModalOpen}
                layoutType={'ModalForm'}
                columns={schemaColumnsToUse}
                onFinish={onSubmitCreateOREditFrom}
            />
            <Modal title={t(`multipurpose.view`)} open={descriptionsModalOpen} onOk={onDescriptionsOk} onCancel={onDescriptionsCancel}>
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