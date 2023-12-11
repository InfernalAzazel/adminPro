import {PageContainer} from "@ant-design/pro-components";
import {Avatar, Space} from "antd";
import {getTimePeriod} from "@/utils";

export default function Loading() {
    return (
        <div>
            <PageContainer
                header={{
                    title: '',
                    breadcrumb: {},
                }}
                content={
                    <Space className={`flex items-center`}>
                        <Avatar
                            size={64}
                            src={'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg'}/>
                        <Space direction="vertical">
                            <span className={`text-lg`}>{getTimePeriod()}好，panda，祝你开心每一天！</span>
                            <span className={`text-coolGray`}>交互专家</span>
                        </Space>
                    </Space>
                }
            />
        </div>
    );
}