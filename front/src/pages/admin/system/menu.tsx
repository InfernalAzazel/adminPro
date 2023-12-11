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
import {useAddMenuRequest, useDeleteMenuRequest, useEditMenuRequest, useGetMenuListRequest} from '@/services';
import {getTreeDataAndHalfCheckedKeys} from "@/utils";
import {useTranslation} from "react-i18next";

export default function MenuPage() {
    const { t } = useTranslation();
    const actionRef = useRef<ActionType>();
    const fromRef = useRef<ProFormInstance>()
    const [menuDataList, setMenuDataList] = useState<API.Menu[]>();
    const [currentRow, setCurrentRow] = useState<API.Menu>();
    const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
    const [isCreateForm, setIsCreateForm] = useState<boolean>(false);
    const [isDescriptionsModalOpen, setIsDescriptionsModalOpen] = useState<boolean>(false);
    const [pagination, setPagination] = useState<Partial<PaginationProps>>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const {data, loading, runAsync: getMenuListRequest} = useGetMenuListRequest()
    const {runAsync: addMenuRequest} = useAddMenuRequest({manual:true})
    const {runAsync: editMenuRequest} = useEditMenuRequest({manual:true})
    const {runAsync: deleteMenuRequest} = useDeleteMenuRequest({manual:true})

    useEffect(() => {
        const {treeData} = getTreeDataAndHalfCheckedKeys(data?.data || [])
        setMenuDataList(treeData)
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


    const columns: ProColumns<API.Menu>[] = [
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
            title: t(`pages.system.menu.name`),
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
            title: t(`pages.system.menu.path`),
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
            title: t(`pages.system.menu.icon`),
            dataIndex: 'icon',
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
            title: t(`pages.system.menu.key`),
            dataIndex: 'key',
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
            title: t(`pages.system.menu.father`),
            dataIndex: 'father',
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
            title: t(`pages.system.menu.order`),
            dataIndex: 'order',
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
            dataIndex: 'create_at',
            valueType: 'date',
            sorter: true,
        },
        {
            title: t(`multipurpose.update_at`),
            dataIndex: 'update_at',
            valueType: 'date',
            sorter: true,
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
    const schemaColumns: ProColumns<API.Menu>[] = columns.map((column) => {
        const modifyColumn = (key: string, modifications: Record<string, any>) =>
            column.dataIndex === key ? {...column, ...modifications} : column;
        return {
            ...modifyColumn('uid', {readonly: true, hideInForm: isCreateForm}),
            ...modifyColumn('create_at', {hideInForm: true}),
            ...modifyColumn('update_at', {hideInForm: true}),
        };
    });


    function openCreateOREditModal(row?: API.Menu, isCreate: boolean = true) {
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

    async function onSubmitCreateOREditFrom(value: API.Menu) {
        if(isCreateForm){
            await addMenuRequest(value)
        }else {
            await editMenuRequest(value.uid, value)
        }
        setIsFormModalOpen(false);
        actionRef.current?.reload()
    }
    function openDescriptions(row: API.Menu) {
        setCurrentRow(row)
        setIsDescriptionsModalOpen(true);
    }
    async function onDelete(row: API.Menu) {
        await deleteMenuRequest(row.uid)
        actionRef.current?.reload()
    }

    function onDescriptionsOk (){
        setIsDescriptionsModalOpen(false);
        setCurrentRow(undefined)
    }

    function onDescriptionsCancel(){
        setIsDescriptionsModalOpen(false);
        setCurrentRow(undefined)
    }

    return (
        <>
            <ProTable<API.Menu>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                loading={loading}
                request={async (params) => {
                    await getMenuListRequest(params)
                    return Promise.resolve({
                        data: [],
                        success: true,
                    });
                }}
                dataSource={menuDataList}
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
                    persistenceKey: 'menuColumnsState',
                    persistenceType: 'localStorage',
                }}
                rowKey="uid"
                search={false}
                dateFormatter="string"
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
            <BetaSchemaForm<API.Menu>
                title={isCreateForm ?  t(`multipurpose.new`) :  t(`multipurpose.edit`)}
                formRef={fromRef}
                open={isFormModalOpen}
                onOpenChange={setIsFormModalOpen}
                layoutType={'ModalForm'}
                columns={schemaColumns as ProFormColumnsType<API.Menu>[]}
                onFinish={onSubmitCreateOREditFrom}
            />
            <Modal title={t(`multipurpose.view`)}  open={isDescriptionsModalOpen} onOk={onDescriptionsOk} onCancel={onDescriptionsCancel}>
                <ProDescriptions
                    dataSource={currentRow}
                    bordered={true}
                    column={1}
                    columns={columns as ProDescriptionsItemProps<API.Menu>[]}
                />
            </Modal>
        </>
    );
}