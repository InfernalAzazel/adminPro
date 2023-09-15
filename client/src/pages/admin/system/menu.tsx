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
import {useMenuAdd, useMenuList, useMenuEdit, useMenuDelete} from '@/services';
import {getTreeDataAndHalfCheckedKeys} from "@/utils";

export default function MenuPage() {
    const actionRef = useRef<ActionType>();
    const fromRef = useRef<ProFormInstance>()
    const [menuTreeData, setMenuTreeData] = useState<API.Menu[]>();
    const [currentRow, setCurrentRow] = useState<API.Menu>();
    const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
    const [isCreateForm, setIsCreateForm] = useState<boolean>(false);
    const [descriptionsModalOpen, setDescriptionsModalOpen] = useState<boolean>(false);
    const [pagination, setPagination] = useState<Partial<PaginationProps>>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const {data, loading, run} = useMenuList()
    const {run: runReqMenuAdd} = useMenuAdd({manual:true})
    const {run: runReqMenuEdit} = useMenuEdit({manual:true})
    const {run: runReqMenuDelete} = useMenuDelete({manual:true})

    useEffect(() => {
        const {treeData} = getTreeDataAndHalfCheckedKeys(data?.data || [])
        setMenuTreeData(treeData)
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


    const columns: ProColumns<API.Menu>[] = [
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
            title: 'icon',
            dataIndex: 'icon',
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
            title: 'key',
            dataIndex: 'key',
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
            title: 'father',
            dataIndex: 'father',
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
            title: 'order',
            dataIndex: 'order',
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
            dataIndex: 'create_at',
            valueType: 'date',
            sorter: true,
        },
        {
            title: '更新时间',
            dataIndex: 'update_at',
            valueType: 'date',
            sorter: true,
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
        setFormModalOpen(true);
    }

    async function onSubmitCreateOREditFrom(value: API.Menu) {
        if(isCreateForm){
            runReqMenuAdd(value)
        }else {
            runReqMenuEdit(value)
        }
        setFormModalOpen(false);
        actionRef.current?.reload()
    }
    function onView(row: API.Menu) {
        setCurrentRow(row)
        setDescriptionsModalOpen(true);
    }
    function onDelete(row: API.Menu) {
        runReqMenuDelete(row.uid)
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
            <ProTable<API.Menu>
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
                dataSource={menuTreeData}
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
                        新建
                    </Button>,
                ]}
            />
            <BetaSchemaForm<API.Menu>
                title={isCreateForm ? '创建' : '编辑'}
                formRef={fromRef}
                open={formModalOpen}
                onOpenChange={setFormModalOpen}
                layoutType={'ModalForm'}
                columns={schemaColumns as ProFormColumnsType<API.Menu>[]}
                onFinish={onSubmitCreateOREditFrom}
            />
            <Modal title="详细" open={descriptionsModalOpen} onOk={handleOk} onCancel={handleCancel}>
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