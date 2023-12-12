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
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useLoginRequest, useStateInitRequest} from '@/services';
import {useAppStore} from "@/store";
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
    const {data, runAsync: loginRequest} = useLoginRequest({manual: true})
    const {run: runStateInitRequest} =  useStateInitRequest({manual: true})
    const navigate = useNavigate();
    const setAccessToken = useAppStore((state: any) => state.setAccessToken);
    const {token} = theme.useToken();
    const { t } = useTranslation();
    const [isAutoComplete, setIsAutoComplete] = useState(false)

    useEffect(() => {
        runStateInitRequest()
    }, []);

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
        setIsAutoComplete(values?.autoLogin || false)
        await loginRequest(values)
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
                        initialValues={{
                            autoLogin: true,
                        }}
                        autoComplete={isAutoComplete?`on`:`off`}
                        logo="https://github.githubassets.com/images/modules/logos_page/Octocat.png"
                        title={t(`pages.login.title`)}
                        subTitle={t(`pages.login.describe`)}
                        onFinish={onSubmit}
                        actions={
                            <Space>
                                {t(`pages.login.other`)}
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
                                placeholder={t(`pages.login.username`)}

                                rules={[
                                    {
                                        required: true,
                                        message: t(`pages.login.placeholder.username`),
                                    },
                                ]}
                            />
                            <ProFormText.Password
                                name="password"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <LockOutlined className={'prefixIcon'}/>,
                                }}
                                placeholder={t(`pages.login.password`)}
                                rules={[
                                    {
                                        required: true,
                                        message: t(`pages.login.placeholder.password`),
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
                                {t(`pages.login.checkbox.autoLogin`)}
                            </ProFormCheckbox>
                            <a
                                style={{
                                    float: 'right',
                                }}
                            >
                                {t(`pages.login.a.forgotPassword`)}
                            </a>
                        </div>
                    </LoginForm>
                </div>
            </div>

        </Layout>
    );
}