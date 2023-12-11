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
import {Button, Modal, Popconfirm} from 'antd';
import type {PaginationProps} from 'antd';
import {useEffect, useRef, useState} from "react";
import {
    useAddInterfaceRequest,
    useDeleteInterfaceRequest,
    useEditInterfaceRequest,
    useGetInterfaceListRequest
} from '@/services';
import {dateFormatter} from "@/utils";
import {useTranslation} from "react-i18next";

export default function InterfacePage() {
    const { t } = useTranslation();
    const actionRef = useRef<ActionType>();
    const fromRef = useRef<ProFormInstance>()
    const [interfaceDataList, setInterfaceDataList] = useState<API.Interface[]>();
    const [currentRow, setCurrentRow] = useState<API.Interface>();
    const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
    const [isCreateForm, setIsCreateForm] = useState<boolean>(false);
    const [isDescriptionsModalOpen, setIsDescriptionsModalOpen] = useState<boolean>(false);
    const [pagination, setPagination] = useState<Partial<PaginationProps>>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const {data, loading, runAsync: getInterfaceListRequest, refresh: refreshInterfaceListRequest} = useGetInterfaceListRequest()
    const {runAsync: addInterfaceRequest} = useAddInterfaceRequest({manual:true})
    const {runAsync: editInterfaceRequest} = useEditInterfaceRequest({manual:true})
    const {runAsync: deleteInterfaceRequest} = useDeleteInterfaceRequest({manual:true})

    useEffect(() => {
        setInterfaceDataList(data?.data);
        setPagination({
            ...pagination,
            total: data?.total,
            showSizeChanger: true,
            showQuickJumper: true,
        });
    }, [data]);

    useEffect(() => {
        // BetaSchemaForm 渲染后执行的代码
        if (isCreateForm) {
            fromRef.current?.resetFields()
        } else {
            fromRef.current?.setFieldsValue(currentRow)
        }
    }, [isFormModalOpen]);

    const columns: ProColumns<API.Interface>[] = [
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
            title: t(`pages.system.interface.name`),
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
            title: t(`pages.system.interface.group`),
            dataIndex: 'group',
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
            title: t(`pages.system.interface.path`),
            dataIndex: 'path',
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
            title: t(`pages.system.interface.method`),
            dataIndex: 'method',
            copyable: true,
            ellipsis: true,
            valueEnum: {
                GET: { text: 'GET', status: 'Processing' },
                POST: { text: 'POST', status: 'Success' },
                PUT: { text: 'PUT', status: 'Warning' },
                DELETE: { text: 'DELETE', status: 'Error' },
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
                <a className={'text-blueGray'} onClick={() => onView(record)}>{t(`multipurpose.view`)}</a>,
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
    const schemaColumns: ProColumns<API.Interface>[] = columns.map((column) => {
        const modifyColumn = (key: string, modifications: Record<string, any>) =>
            column.dataIndex === key ? {...column, ...modifications} : column;
        return {
            ...modifyColumn('uid', {readonly: true, hideInForm: isCreateForm}),
            ...modifyColumn('create_at', {hideInForm: true}),
            ...modifyColumn('update_at', {hideInForm: true}),
        };
    });


    function openCreateOREditModal(row?: API.Interface, isCreate: boolean = true) {
        actionRef.current?.reload();
        if(isCreate){
            setIsCreateForm(true)
            setCurrentRow(undefined)
        }else {
            setIsCreateForm(false);
            setCurrentRow(row)
        }
        setIsFormModalOpen(true);
    }

    async function onSubmitCreateOREditFrom(value: API.Interface) {
        if(isCreateForm){
            await addInterfaceRequest(value)
        }else {
            await editInterfaceRequest(value.uid, value)
        }
        setIsFormModalOpen(false);
        refreshInterfaceListRequest()
        actionRef.current?.reload()
    }
    function onView(row: API.Interface) {
        setCurrentRow(row)
        setIsDescriptionsModalOpen(true);
    }
    async function onDelete(row: API.Interface) {
        await deleteInterfaceRequest(row.uid)
        refreshInterfaceListRequest()
        actionRef.current?.reload()
    }

    function onDescriptionsOk() {
        setIsDescriptionsModalOpen(false);
        setCurrentRow(undefined)
    }

    function onDescriptionsCancel() {
        setIsDescriptionsModalOpen(false);
        setCurrentRow(undefined)
    }

    return (
        <>
            <ProTable<API.Interface>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                loading={loading}
                request={async (params) => {
                    await getInterfaceListRequest(params)
                    return Promise.resolve({
                        data: [],
                        success: true,
                    });
                }}
                dataSource={interfaceDataList}
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
                    persistenceKey: 'interfaceColumnsState',
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
            <BetaSchemaForm<API.Interface>
                title={isCreateForm ?  t(`multipurpose.new`) :  t(`multipurpose.edit`)}
                formRef={fromRef}
                open={isFormModalOpen}
                onOpenChange={setIsFormModalOpen}
                layoutType={'ModalForm'}
                columns={schemaColumns as ProFormColumnsType<API.Interface>[]}
                onFinish={onSubmitCreateOREditFrom}
            />
            <Modal title={t(`multipurpose.view`)}  open={isDescriptionsModalOpen} onOk={onDescriptionsOk} onCancel={onDescriptionsCancel}>
                <ProDescriptions
                    dataSource={currentRow}
                    bordered={true}
                    column={1}
                    columns={columns as ProDescriptionsItemProps<API.Interface>[]}
                />
            </Modal>
        </>
    );
}