// Minimal resume parser stub: extracts email and phone using regex from a PDF or plain text file.
// NOTE: This is a light-weight client-side stub suitable for MVP. For production use, use pdfjs and/or server-side parsing.
export default async function parseResume(file){
  if(!file) return null;
  const text = await readFileAsText(file);
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4})/);
  const name = guessNameFromText(text);
  return {name: name || '', email: emailMatch ? emailMatch[0] : '', phone: phoneMatch ? phoneMatch[0] : '', rawText: text};
}

function readFileAsText(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(reader.result || '');
    reader.onerror = e=> reject(e);
    // For PDFs this will give binary — but many PDFs have embedded text in the blob; this is a naive approach.
    reader.readAsText(file);
  });
}

function guessNameFromText(text){
  // Very naive: pick the first line with two words starting with capital letters
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  for(const line of lines.slice(0,10)){
    const words = line.split(/\s+/);
    if(words.length >= 2 && /^[A-Z]/.test(words[0]) && /^[A-Z]/.test(words[1])){
      return words.slice(0,3).join(' ');
    }
  }
  return '';
}
