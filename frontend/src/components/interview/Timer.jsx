import React, {useEffect, useState} from 'react';

export default function Timer({seconds=30,onExpire}){
  const [remaining,setRemaining] = useState(seconds);

  useEffect(()=>{
    setRemaining(seconds);
    const t = setInterval(()=>{
      setRemaining(r=>{
        if(r <= 1){
          clearInterval(t);
          onExpire && onExpire();
          return 0;
        }
        return r-1;
      });
    },1000);
    return ()=> clearInterval(t);
  },[seconds,onExpire]);

  return (
    <div style={{minWidth:80, textAlign:'center'}}>
      <strong>{remaining}s</strong>
    </div>
  );
}
