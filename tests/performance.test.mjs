import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const original={window:{}};
vm.runInNewContext(fs.readFileSync('wiki-data.js','utf8'),original);
function setup(fetch){
 const c={window:{},fetch};vm.createContext(c);
 vm.runInContext(fs.readFileSync('wiki-core.js','utf8'),c);
 c.WIKI_DATA=c.window.WIKI_DATA;c.WIKI_CHUNKS=c.window.WIKI_CHUNKS;
 vm.runInContext(fs.readFileSync('data-loader.js','utf8'),c);return c;
}
test('All split data reconstructs exactly; home needs no detail request',async()=>{
 const requests=[];
 const c=setup(async url=>{requests.push(url);return {ok:true,json:async()=>JSON.parse(fs.readFileSync(url,'utf8'))};});
 await c.window.WikiDataLoader.ensure('home','');assert.equal(requests.length,0);
 await c.window.WikiDataLoader.ensure('search','');
 for(const e of c.WIKI_DATA.events)await c.window.WikiDataLoader.ensure('event',e.id);
 assert.deepEqual(JSON.parse(JSON.stringify(c.WIKI_DATA)),JSON.parse(JSON.stringify(original.window.WIKI_DATA)));
 const count=requests.length;await c.window.WikiDataLoader.ensure('contracts','');assert.equal(requests.length,count);
 assert.ok(fs.statSync('wiki-core.js').size<fs.statSync('wiki-data.js').size*.3);
});
test('Concurrent detail requests share work; failed downloads can be retried',async()=>{
 let attempts=0;
 const c=setup(async url=>{attempts++;return {ok:attempts>1,status:503,json:async()=>JSON.parse(fs.readFileSync(url,'utf8'))};});
 await assert.rejects(c.window.WikiDataLoader.ensure('contracts',''));
 await Promise.all([c.window.WikiDataLoader.ensure('contracts',''),c.window.WikiDataLoader.ensure('search','')]);
 assert.equal(attempts,2);assert.ok(c.WIKI_DATA.contracts.length);
});
