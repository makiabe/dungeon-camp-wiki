import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'wiki-data.js'),'utf8'),context);
const original=context.window.WIKI_DATA;
const base=structuredClone(original), chunks={};
fs.mkdirSync(path.join(root,'data'),{recursive:true});
function writeChunk(key,value){
 const json=JSON.stringify(value),hash=crypto.createHash('sha256').update(json).digest('hex').slice(0,12);
 const file=`data/${key}-${hash}.json`;fs.writeFileSync(path.join(root,file),json);return file;
}
chunks.contracts=writeChunk('contracts',base.contracts);base.contracts=[];
chunks.events={};
for(const event of base.events){chunks.events[event.id]=writeChunk(event.id,event.difficulties);delete event.difficulties;}
fs.writeFileSync(path.join(root,'wiki-core.js'),'window.WIKI_DATA='+JSON.stringify(base)+';\nwindow.WIKI_CHUNKS='+JSON.stringify(chunks)+';\n');
const englishHash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'locale-en.js'))).digest('hex').slice(0,12);
const loaderPath=path.join(root,'locale-loader.js');
fs.writeFileSync(loaderPath,fs.readFileSync(loaderPath,'utf8').replace(/locale-en.js\?v=[a-f0-9]+/,`locale-en.js?v=${englishHash}`));
let html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script defer src="wiki-data.js[^\"]*"><\/script>/,'<script defer src="wiki-core.js"></script><script defer src="data-loader.js"></script>');
for(const name of ['wiki-core.js','data-loader.js','locale-loader.js','locale.js','app.js','style.css']){
 const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex').slice(0,12);
 html=html.replace(new RegExp(`${name.replaceAll('.','\\.')}([^" ]*)`,'g'),`${name}?v=${hash}`);
}
fs.writeFileSync(path.join(root,'index.html'),html);
console.log('Core data:',Buffer.byteLength(JSON.stringify(base)),'bytes; full data:',Buffer.byteLength(JSON.stringify(original)),'bytes');
