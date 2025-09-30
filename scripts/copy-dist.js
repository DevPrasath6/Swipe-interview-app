import { copy } from 'fs-extra';
import { resolve } from 'path';

async function main(){
  const src = resolve(process.cwd(), 'frontend', 'dist');
  const dest = resolve(process.cwd(), 'dist');
  try{
    await copy(src, dest, { overwrite: true });
    console.log('Copied frontend/dist to ./dist');
  }catch(err){
    console.error('Failed to copy dist:', err);
    process.exit(1);
  }
}

main();
