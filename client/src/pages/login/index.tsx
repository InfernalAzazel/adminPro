import {
    AlipayCircleOutlined,
    LockOutlined,
    TaobaoCircleOutlined,
    UserOutlined,
    WeiboCircleOutlined,
} from '@ant-design/icons';
import {LoginForm, ProFormCheckbox, ProFormText, setAlpha,} from '@ant-design/pro-components';
import {Layout, Space, theme} from 'antd';
import type {CSSProperties} from 'react';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useLogin} from '@/services';
import {useAppStore} from "@/store";

export default function LoginPage() {
    const {data, runAsync} = useLogin({manual: true})
    const navigate = useNavigate();
    const setAccessToken = useAppStore((state: any) => state.setAccessToken);
    const {token} = theme.useToken();

    useEffect(() => {
        if (data && data.access_token) {
            setAccessToken(data.access_token);
            navigate('/');
        }
    }, [data]);

    const iconStyles: CSSProperties = {
        marginInlineStart: '16px',
        color: setAlpha(token.colorTextBase, 0.2),
        fontSize: '24px',
        verticalAlign: 'middle',
        cursor: 'pointer',
    };

    async function onSubmit(values: any) {
        await runAsync(values)
    }

    return (
        <Layout
            style={{
                backgroundImage: "url('https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg')",
                backgroundSize: '100% 100%',
            }}
        >
            <div style={{
                backgroundImage: "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
                backgroundSize: '100% 100%',
            }}>
                <div
                    className={'flex pt-22'}
                >
                    <LoginForm
                        contentStyle={{
                            minWidth: 280,
                            maxWidth: '75vw',

                        }}
                        logo="https://github.githubassets.com/images/modules/logos_page/Octocat.png"
                        title="adminPro"
                        subTitle="后台管理通用解决方案"
                        onFinish={onSubmit}
                        actions={
                            <Space>
                                其他登录方式
                                <AlipayCircleOutlined style={iconStyles}/>
                                <TaobaoCircleOutlined style={iconStyles}/>
                                <WeiboCircleOutlined style={iconStyles}/>
                            </Space>
                        }
                    >
                        <>
                            <ProFormText
                                name="username"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <UserOutlined className={'prefixIcon'}/>,
                                }}
                                placeholder={'用户名: admin or user'}
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入用户名!',
                                    },
                                ]}
                            />
                            <ProFormText.Password
                                name="password"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <LockOutlined className={'prefixIcon'}/>,
                                }}
                                placeholder={'密码: ant.design'}
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入密码！',
                                    },
                                ]}
                            />
                        </>
                        <div
                            style={{
                                marginBlockEnd: 24,
                            }}
                        >
                            <ProFormCheckbox noStyle name="autoLogin">
                                自动登录
                            </ProFormCheckbox>
                            <a
                                style={{
                                    float: 'right',
                                }}
                            >
                                忘记密码
                            </a>
                        </div>
                    </LoginForm>
                </div>
            </div>

        </Layout>
    );
}