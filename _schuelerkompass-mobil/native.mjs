import './prepare.mjs';
import { access, copyFile, readFile, readdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const cwd=fileURLToPath(new URL('.',import.meta.url));
const platform=process.argv[2];
if(!['android','ios'].includes(platform))throw Error('Aufruf: node native.mjs android oder node native.mjs ios');
process.chdir(cwd);
let exists=true;
try{await access(platform)}catch{exists=false}
const cli=path.join(cwd,'node_modules','@capacitor','cli','bin','capacitor');
const cap=spawnSync(process.execPath,[cli,exists?'sync':'add',platform],{cwd,stdio:'inherit'});
if(cap.status!==0)process.exit(cap.status??1);
if(platform==='ios'){
  const sets='ios/App/App/Assets.xcassets';
  await copyFile('app-icon.png',sets+'/AppIcon.appiconset/AppIcon-512@2x.png');
  for(const file of await readdir(sets+'/Splash.imageset')){
    if(file.endsWith('.png'))await copyFile('app-icon.png',sets+'/Splash.imageset/'+file);
  }
}else{
  const root='android/app/src/main';
  const manifest=root+'/AndroidManifest.xml';
  let xml=(await readFile(manifest,'utf8')).replace('android:allowBackup="true"','android:allowBackup="false"');
  if(!xml.includes('xmlns:tools='))xml=xml.replace('<manifest ','<manifest xmlns:tools="http://schemas.android.com/tools" ');
  if(!xml.includes('android.permission.SCHEDULE_EXACT_ALARM'))xml=xml.replace('</manifest>','    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" tools:node="remove" />\n</manifest>');
  await writeFile(manifest,xml);
  for(const directory of await readdir(root+'/res')){
    const resource=root+'/res/'+directory+'/';
    if(directory.startsWith('mipmap-')&&!directory.includes('anydpi')){
      for(const image of ['ic_launcher.png','ic_launcher_foreground.png','ic_launcher_round.png'])await copyFile('../schuelerkompass/kompass-192.png',resource+image);
    }else if(directory==='drawable'||/^drawable-(land|port)-/.test(directory)){
      await copyFile('../schuelerkompass/kompass-512.png',resource+'splash.png');
    }
  }
}
