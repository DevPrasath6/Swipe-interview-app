import React, {useState} from 'react';
import parseResume from './resumeParser';
import ResumePreview from './ResumePreview';

export default function ResumeUploader({onComplete}){
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);

  async function handleFile(f){
    setFile(f);
    const result = await parseResume(f);
    setParsed(result);
  }

  return (
    <div style={{border:'1px dashed #888', padding:12}}>
      <input type="file" accept="application/pdf, .pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, .docx" onChange={e=>handleFile(e.target.files[0])} />
      {parsed && <ResumePreview parsed={parsed} onConfirm={()=>onComplete && onComplete(parsed)} />}
      {!parsed && <p>Upload a resume (PDF preferred). Parsing is a simple client-side heuristic.</p>}
    </div>
  );
}
