import React, {useState} from 'react';
import Timer from './Timer';

export default function QuestionCard({question, onSubmit}){
  const [answer, setAnswer] = useState('');
  return (
    <div style={{border:'1px solid #ddd', padding:12}}>
      <div style={{marginBottom:8}}>{question?.text}</div>
      <textarea value={answer} onChange={e=>setAnswer(e.target.value)} style={{width:'100%',height:120}} />
      <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
        <Timer seconds={30} onExpire={()=>onSubmit(answer)} />
        <div>
          <button onClick={()=>onSubmit(answer)}>Submit</button>
        </div>
      </div>
    </div>
  );
}
