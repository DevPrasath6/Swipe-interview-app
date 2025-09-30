import {useState, useEffect, useRef} from 'react';

export default function useTimer(initialSeconds=30){
  const [remaining, setRemaining] = useState(initialSeconds);
  const ref = useRef(null);

  useEffect(()=>{
    return ()=>{
      if(ref.current) clearInterval(ref.current);
    };
  },[]);

  function start(){
    if(ref.current) clearInterval(ref.current);
    ref.current = setInterval(()=>{
      setRemaining(r=>Math.max(0,r-1));
    },1000);
  }

  function stop(){
    if(ref.current) clearInterval(ref.current);
    ref.current = null;
  }

  function reset(s=initialSeconds){
    setRemaining(s);
  }

  return {remaining,start,stop,reset};
}
