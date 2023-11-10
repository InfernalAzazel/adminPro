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
import {useInterfaceAdd, useInterfaceList, useInterfaceEdit, useInterfaceDelete} from '@/services';
import {dateFormatter} from "@/utils";

export default function InterfacePage() {
    const actionRef = useRef<ActionType>();
    const fromRef = useRef<ProFormInstance>()
    const [interfaceList, setInterfaceList] = useState<API.Interface[]>();
    const [currentRow, setCurrentRow] = useState<API.Interface>();
    const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
    const [isCreateForm, setIsCreateForm] = useState<boolean>(false);
    const [descriptionsModalOpen, setDescriptionsModalOpen] = useState<boolean>(false);
    const [pagination, setPagination] = useState<Partial<PaginationProps>>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const {data, loading, runAsync, refresh} = useInterfaceList()
    const { runAsync: runReqInterfaceAdd} = useInterfaceAdd({manual:true})
    const {runAsync: runReqInterfaceEdit} = useInterfaceEdit({manual:true})
    const {runAsync: runReqInterfaceDelete} = useInterfaceDelete({manual:true})

    useEffect(() => {
        setInterfaceList(data?.data);
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
    }, [formModalOpen]);

    const columns: ProColumns<API.Interface>[] = [
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
            title: 'title',
            dataIndex: 'title',
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
            title: 'group',
            dataIndex: 'group',
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
            title: 'path',
            dataIndex: 'path',
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
            title: 'method',
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
        setFormModalOpen(true);
    }

    async function onSubmitCreateOREditFrom(value: API.Interface) {
        if(isCreateForm){
            await runReqInterfaceAdd(value)
        }else {
            await runReqInterfaceEdit(value)
        }
        setFormModalOpen(false);
        refresh()
        actionRef.current?.reload()
    }
    function onView(row: API.Interface) {
        setCurrentRow(row)
        setDescriptionsModalOpen(true);
    }
    async function onDelete(row: API.Interface) {
        await runReqInterfaceDelete(row.uid)
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
            <ProTable<API.Interface>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                loading={loading}
                request={async (params) => {
                    await runAsync(params)
                    return Promise.resolve({
                        data: [],
                        success: true,
                    });
                }}
                dataSource={interfaceList}
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
                        新建
                    </Button>,
                ]}
            />
            <BetaSchemaForm<API.Interface>
                title={isCreateForm ? '创建' : '编辑'}
                formRef={fromRef}
                open={formModalOpen}
                onOpenChange={setFormModalOpen}
                layoutType={'ModalForm'}
                columns={schemaColumns as ProFormColumnsType<API.Interface>[]}
                onFinish={onSubmitCreateOREditFrom}
            />
            <Modal title="详细" open={descriptionsModalOpen} onOk={handleOk} onCancel={handleCancel}>
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