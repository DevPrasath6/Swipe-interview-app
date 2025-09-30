import { mkdir, stat, readdir, copyFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

async function copyDir(src, dest) {
  const entries = await readdir(src, { withFileTypes: true });
  await ensureDir(dest);

  for (const entry of entries) {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await copyFile(srcPath, destPath);
    }
  }
}

async function main(){
  const src = resolve(process.cwd(), 'frontend', 'dist');
  const dest = resolve(process.cwd(), 'dist');
  try{
    // confirm src exists
    await stat(src);
    await copyDir(src, dest);
    console.log('Copied frontend/dist to ./dist');
  }catch(err){
    console.error('Failed to copy dist:', err.message || err);
    process.exit(1);
  }
}

main();
