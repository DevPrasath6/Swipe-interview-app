// Lightweight pdf parser: attempts to use pdfjs-dist if installed, otherwise returns plain-text read.
export async function extractTextFromPdfFile(file){
  try{
    // try dynamic import to avoid forcing dependency
    const pdfjs = await import('pdfjs-dist/build/pdf');
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({data: arrayBuffer});
    const pdf = await loadingTask.promise;
    let text = '';
    for(let i=1;i<=pdf.numPages;i++){
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strs = content.items.map(it => it.str).join(' ');
      text += '\n' + strs;
    }
    return text;
  }catch(e){
    // fallback to naive read
    return new Promise((res,rej)=>{
      const reader = new FileReader();
      reader.onload = ()=> res(reader.result || '');
      reader.onerror = rej;
      reader.readAsText(file);
    });
  }
}
