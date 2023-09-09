import { useMenuList } from '@/services';
import { API } from '@/services/typings';
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, TableDropdown, BetaSchemaForm, ModalForm, ProDescriptions } from '@ant-design/pro-components';
import { Button, Dropdown, Space, Tag, PaginationProps, Modal } from 'antd';
import React, { useEffect, useRef, useState, useCallback } from "react";
import type { ProFormInstance, ProFormColumnsType, ProDescriptionsItemProps } from '@ant-design/pro-components';





export default () => {
  const actionRef = useRef<ActionType>(null);
  const fromRef = useRef<ProFormInstance>()
  const [menuList, setMenuList] = useState<API.Menu[]>();
  const [currentRow, setCurrentRow] = useState<API.Menu>();
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
  const [isCreateForm, setIsCreateForm] = useState<boolean>(false);
  const [descriptionsModalOpen, setDescriptionsModalOpen] = useState<boolean>(false);
  const [pagination, setPagination] = useState<Partial<PaginationProps>>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { data, error, loading, run } = useMenuList()

  useEffect(() => {
    setMenuList(data?.data);
    setPagination({
      ...pagination,
      total: data?.total,
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

  const showModal = (row: API.Menu) => {
    setDescriptionsModalOpen(true);
    setCurrentRow(row)
  };

  const handleOk = () => {
    setDescriptionsModalOpen(false);
    setCurrentRow(undefined)
  };

  const handleCancel = () => {
    setDescriptionsModalOpen(false);
    setCurrentRow(undefined)
  };


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
      hideInForm: isCreateForm,
      disable: true,
      formItemProps: (form, config) => {
        config.title = 'hhh'
        config.disable = true
        return {
          isEditable: false,
          rules: [
            {
              required: true,
              message: '此项为必填项',
            },
          ],
        }
      }
    },
    {
      title: 'title',
      dataIndex: 'title',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'path',
      dataIndex: 'path',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'order',
      dataIndex: 'order',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'key',
      dataIndex: 'key',
      copyable: true,
      ellipsis: true,
    },
    {
      title: '创建时间',
      key: 'showTime',
      dataIndex: 'create_at',
      valueType: 'date',
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      hideInDescriptions: true,
      render: (text, record, _, action) => [
        <a
          key="edit"
          onClick={() => {
            actionRef.current?.reload();
            setIsCreateForm(false);
            setFormModalOpen(true);
            setCurrentRow(record)
          }}
        >
          编辑
        </a>,
        <a key="view"
          onClick={() => showModal(record)}
        >
          查看
        </a>,
        <TableDropdown
          key="actionGroup"
          onSelect={() => action?.reload()}
          menus={[
            { key: 'copy', name: '复制' },
            { key: 'delete', name: '删除' },
          ]}
        />,
      ],
    },
  ];

  return (
    <>
      <ProTable<API.Menu>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={(params) => {
          run(params)
          return Promise.resolve({
            data: [],
            success: true,
          });
        }}
        dataSource={menuList}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          showQuickJumper: true,
        }}
        columnsState={{
          persistenceKey: 'menuColumnsState',
          persistenceType: 'localStorage',
        }}
        rowKey="uid"
        search={{
          labelWidth: 'auto',
        }}

        form={{
          // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
          syncToUrl: (values, type) => {
            if (type === 'get') {
              return {
                ...values,
                create_at: [values.startTime, values.endTime],
              };
            }
            return values;
          },
        }}
        dateFormatter="string"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              actionRef.current?.reload();
              setIsCreateForm(true)
              setFormModalOpen(true);
              setCurrentRow(undefined)
            }}
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
        columns={columns as ProFormColumnsType<API.Menu>[]}
        onFinish={async (value) => {
        }}
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
};