import{l as Z,r,q as z,v as G,w as K,x as N,y as V,z as l,j as a,B as J,D as Q}from"./index-bca867e7.js";import{P as W,a as X,B as $,M as ee,b as se}from"./Table-da38efb5.js";import"./index-99662a6d.js";function ue(){const{t:s}=Z(),d=r.useRef(),c=r.useRef(),[C,D]=r.useState(),[x,p]=r.useState(),[g,f]=r.useState(!1),[n,h]=r.useState(!1),[w,y]=r.useState(!1),[S,q]=r.useState({current:1,pageSize:10,total:0}),[M,b]=r.useState([]),{data:o,loading:P,runAsync:Y,refresh:F}=z(),{runAsync:_}=G({manual:!0}),{runAsync:U}=K({manual:!0}),{runAsync:v}=N({manual:!0}),{data:i,runAsync:j}=V({manual:!0});r.useEffect(()=>{D(o==null?void 0:o.data),q({...S,total:o==null?void 0:o.total,showSizeChanger:!0,showQuickJumper:!0})},[o]),r.useEffect(()=>{b(i==null?void 0:i.data),console.log(i==null?void 0:i.data)},[i]),r.useEffect(()=>{var e,t;n?(e=c.current)==null||e.resetFields():(t=c.current)==null||t.setFieldsValue(x)},[g]);const m=[{dataIndex:"index",valueType:"indexBorder",width:48},{title:s("multipurpose.uid"),dataIndex:"uid",copyable:!0,ellipsis:!0},{title:s("pages.system.users.username"),dataIndex:"username",copyable:!0,ellipsis:!0,formItemProps:{rules:[{required:!0,message:s("multipurpose.rules.required")}]}},{title:s("pages.system.users.disabled"),dataIndex:"disabled",copyable:!0,ellipsis:!0,valueType:"switch",initialValue:!1,formItemProps:{rules:[{required:!0,message:s("multipurpose.rules.required")}]}},{title:s("pages.system.users.role_name"),dataIndex:"role_name",copyable:!0,ellipsis:!0,valueType:"select",valueEnum:()=>{const e=M||[];return e==null?void 0:e.reduce((t,u)=>(t[u.name]={text:u.name},t),{})},formItemProps:{rules:[{required:!0,message:s("multipurpose.rules.required")}]}},{title:s("pages.system.users.name"),dataIndex:"name",copyable:!0,ellipsis:!0,formItemProps:{rules:[{required:!0,message:s("multipurpose.rules.required")}]}},{title:s("pages.system.users.mail"),dataIndex:"mail",copyable:!0,ellipsis:!0,formItemProps:{rules:[{required:!0,message:s("multipurpose.rules.required")}]}},{title:s("pages.system.users.company"),dataIndex:"company",copyable:!0,ellipsis:!0,formItemProps:{rules:[{required:!0,message:s("multipurpose.rules.required")}]}},{title:s("pages.system.users.department"),dataIndex:"department",copyable:!0,ellipsis:!0,formItemProps:{rules:[{required:!0,message:s("multipurpose.rules.required")}]}},{title:s("multipurpose.create_at"),key:"create_at",dataIndex:"create_at",valueType:"dateRange",search:{transform:e=>({startCreateTime:l(e[0],"YYYY-MM-DDTHH:mm:ss.SSS[Z]"),endCreateTime:l(e[1],"YYYY-MM-DDTHH:mm:ss.SSS[Z]")})},render:(e,t)=>l(t.create_at)},{title:s("multipurpose.update_at"),dataIndex:"update_at",valueType:"dateRange",search:{transform:e=>({startUpdateTime:l(e[0],"YYYY-MM-DDTHH:mm:ss.SSS[Z]"),endUpdateTime:l(e[1],"YYYY-MM-DDTHH:mm:ss.SSS[Z]")})},render:(e,t)=>l(t.update_at)},{title:s("multipurpose.operate"),valueType:"option",key:"option",fixed:"right",hideInDescriptions:!0,render:(e,t)=>[a.jsx("a",{onClick:()=>T(t,!1),children:s("multipurpose.edit")}),a.jsx("a",{className:"text-blueGray",onClick:()=>H(t),children:s("multipurpose.view")}),a.jsx(W,{title:s("multipurpose.prompt"),description:s("multipurpose.isDel"),onConfirm:()=>O(t),okText:s("multipurpose.yes"),cancelText:s("multipurpose.no"),children:a.jsx("a",{className:"text-red",children:s("multipurpose.del")})})]}],I=m.map(e=>{const t=(u,L)=>e.dataIndex===u?{...e,...L}:e;return{...t("uid",{readonly:!0,hideInForm:n}),...t("create_at",{hideInForm:!0}),...t("update_at",{hideInForm:!0})}}),R=[...m.filter(({dataIndex:e})=>["username","disabled","role_name"].includes(e)),{title:"password",dataIndex:"password",valueType:"password",formItemProps:{rules:[{required:!0,message:"此项为必填项"}]}}],k=r.useMemo(()=>n?R:I,[n,R,I]);async function T(e,t=!0){var u;(u=d.current)==null||u.reload(),t?(h(!0),p(void 0)):(h(!1),p(e)),await j(),f(!0)}async function E(e){var t;if(n)await _(e);else{const u=e;await U(u.uid,u)}f(!1),(t=d.current)==null||t.reload()}function H(e){p(e),y(!0)}async function O(e){var t;await v(e.uid),F(),(t=d.current)==null||t.reload()}function A(){y(!1),p(void 0)}function B(){y(!1),p(void 0)}return a.jsxs(a.Fragment,{children:[a.jsx(X,{columns:m,actionRef:d,cardBordered:!0,loading:P,request:async e=>(await Y(e),Promise.resolve({data:[],success:!0})),dataSource:C,options:{setting:{listsHeight:400}},pagination:S,onChange:e=>{q(e)},columnsState:{persistenceKey:"usersColumnsState",persistenceType:"localStorage"},rowKey:"uid",toolBarRender:()=>[a.jsx(J,{icon:a.jsx(Q,{}),onClick:()=>T(),type:"primary",children:s("multipurpose.new")},"button")]}),a.jsx($,{title:s(n?"multipurpose.new":"multipurpose.edit"),formRef:c,open:g,onOpenChange:f,layoutType:"ModalForm",columns:k,onFinish:E}),a.jsx(ee,{title:s("multipurpose.view"),open:w,onOk:A,onCancel:B,children:a.jsx(se,{dataSource:x,bordered:!0,column:1,columns:m})})]})}export{ue as default};