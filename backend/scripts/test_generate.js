(async function(){
  try{
    const res = await fetch('http://localhost:5000/api/ai/generate',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({difficulty:'mixed',count:4,domain:'fullstack',candidateProfile:{name:'Jane Doe',skills:['React','Node.js','GraphQL'],experience:['Senior Developer']}})
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch(e) {
    console.error('REQ ERROR', e);
  }
})();
