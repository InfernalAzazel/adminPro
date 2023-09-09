import { useState, useEffect, EffectCallback } from 'react';

export default function Loading() {
  const [msg, setMsg] = useState('');
  console.log(msg);
  // useEffect(()=>{
  //   console.log(msg);
  // },[msg])
  function ok() {
    setMsg('randomValue');
  }
  return (
    <div>
      角色...
     
      <button onClick={ok}>
        点击
      </button>
    </div>
  );
}