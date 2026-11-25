import { cp, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root=new URL('../schuelerkompass/',import.meta.url);
const out=new URL('./www/',import.meta.url);
await mkdir(out,{recursive:true});
for(const entry of await readdir(root,{withFileTypes:true})){
  if(entry.isFile() && entry.name!=='sw.js') await cp(new URL(entry.name,root),new URL(entry.name,out));
}
console.log('Webdateien für die Geräte-App bereit:',fileURLToPath(out));
