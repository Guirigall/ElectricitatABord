// Node-based contract tests. These do not replace installation tests on a real phone.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
const scope='https://example.org/apps/aboard/',source=fs.readFileSync('sw.js','utf8');
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
assert.equal(manifest.display,'standalone');assert.equal(new URL(manifest.start_url,scope).href,scope);assert.equal(new URL(manifest.scope,scope).href,scope);
for(const icon of manifest.icons){const b=fs.readFileSync(icon.src);assert.equal(b.subarray(1,4).toString(),'PNG');const size=+icon.sizes.split('x')[0];assert.equal(b.readUInt32BE(16),size);assert.equal(b.readUInt32BE(20),size);}
assert.ok(manifest.icons.some(i=>i.purpose==='maskable'));
const html=fs.readFileSync('index.html','utf8');assert.match(html,/rel="manifest"/);assert.match(html,/apple-touch-icon/);assert.match(html,/data-i18n-ignore/);assert.ok(!html.includes('value="fixture-not-a-real-key"'));
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
const files=new Map();let failInstall=false,network=0,skips=0,claims=0;
const caches={async open(key){if(!files.has(key))files.set(key,new Map());const store=files.get(key);return{async addAll(requests){if(failInstall)throw Error('offline');const pending=[];for(const r of requests){const url=new URL(r.url);assert.ok(url.href.startsWith(scope));const relative=url.pathname.slice(new URL(scope).pathname.length)||'index.html';pending.push([r.url,new Response(fs.readFileSync(relative))]);}for(const[k,v]of pending)store.set(k,v);},async match(key){return store.get(typeof key==='string'?key:key.url)?.clone();}};},async keys(){return [...files.keys()];},async delete(key){return files.delete(key);}};
function worker(code=source){const events={};const context={URL,Request,Response,Set,Promise,caches,fetch:async()=>{network++;throw Error('offline');},self:{registration:{scope},location:{origin:new URL(scope).origin},clients:{claim:async()=>{claims++;}},skipWaiting:async()=>{skips++;},addEventListener:(name,fn)=>events[name]=fn}};vm.runInNewContext(code,context);return events;}
async function lifecycle(events,type,data={}){let promise;events[type]({...data,waitUntil:p=>promise=p});await promise;}
async function request(events,url,options={}){let response;events.fetch({request:{method:'GET',url:new URL(url,scope).href,mode:options.mode||'cors',...options},respondWith:p=>response=p});return response===undefined?null:await response;}
const events=worker();await lifecycle(events,'install');assert.equal(skips,0);assert.equal(files.size,1);
const cacheName=[...files.keys()][0];assert.ok(files.get(cacheName).has(new URL('pwa.js',scope).href));
for(const url of ['./','./index.html','./?source=homescreen'])assert.match(await(await request(events,url,{mode:'navigate'})).text(),/id="pwa-status"/);
assert.match(await(await request(events,'./simulador-autonom.html',{mode:'navigate'})).text(),/A BORD/);assert.ok(!(await(await request(events,'./simulador-autonom.html',{mode:'navigate'})).text()).includes('id="pwa-status"'));
assert.match(await(await request(events,'./pwa.css')).text(),/pwa-panel/);assert.equal(network,0);
assert.equal(await request(events,'https://api.open-meteo.com/v1/forecast?latitude=41'),null);
assert.equal(await request(events,'https://api.openweathermap.org/data/2.5/weather?appid=private'),null);
assert.equal(await request(events,'./unknown',{mode:'navigate'}),null);assert.equal(await request(events,'./index.html',{method:'POST'}),null);
const unrelated='another-app-cache',nested='abord-pwa:https://example.org/apps/aboard/other/:old',old='abord-pwa:'+scope+':old';files.set(unrelated,new Map());files.set(nested,new Map());files.set(old,new Map());await lifecycle(events,'activate');assert.equal(claims,1);assert.ok(files.has(unrelated)&&files.has(nested)&&files.has(cacheName));assert.ok(!files.has(old));
failInstall=true;await assert.rejects(lifecycle(worker(),'install'));assert.ok(files.has(cacheName));failInstall=false;
await lifecycle(events,'message',{data:{type:'OTHER'}});assert.equal(skips,0);await lifecycle(events,'message',{data:{type:'ACTIVATE_UPDATE'}});assert.equal(skips,1);
// Validate that every PWA phrase has a translation in the same seven languages.
const pwa=fs.readFileSync('pwa.js','utf8');const messages=vm.runInNewContext('('+pwa.split('const messages = ')[1].split('\nconst el =')[0].trim().replace(/;$/,'')+')');assert.deepEqual(Object.keys(messages).sort(),['ast','ca','en','es','eu','fr','gl']);for(const values of Object.values(messages)){assert.deepEqual(Object.keys(values),Object.keys(messages.ca));assert.ok(Object.values(values).every(v=>typeof v==='string'&&v.length>0));}
// Exercise app-side install, registration and user-controlled updates with a small DOM double.
function ui({secure=true,serviceWorker=true}={}){
 const listeners={},elements=new Map(),swListeners={},registrationEvents={};let reloads=0,observed;
 const reg={waiting:null,installing:null,addEventListener:(name,fn)=>registrationEvents[name]=fn,update:async()=>{}};
 const element=id=>{if(!elements.has(id))elements.set(id,{textContent:'',hidden:false,onclick:null,attrs:{},setAttribute(k,v){this.attrs[k]=v;},showModal(){this.open=true;},close(){this.open=false;}});return elements.get(id);};
 const document={documentElement:{lang:'ca'},getElementById:element,createElement:()=>({click(){}})};
 const sw={register:async(url,options)=>{assert.equal(url,'./sw.js');assert.equal(options.scope,'./');return reg;},ready:Promise.resolve(reg),addEventListener:(name,fn)=>swListeners[name]=fn};
 const context={document,navigator:{onLine:true,...(serviceWorker?{serviceWorker:sw}:{})},window:{isSecureContext:secure,matchMedia:()=>({matches:false}),addEventListener:(name,fn)=>listeners[name]=fn},location:{protocol:'https:',reload:()=>reloads++},MutationObserver:class{constructor(fn){observed=fn;}observe(){}},URL,fetch:async()=>new Response('standalone'),setTimeout:fn=>fn()};vm.runInNewContext(pwa,context);
 return{context,element,reg,listeners,swListeners,registrationEvents,refresh:()=>observed(),reloads:()=>reloads};
}
const app=ui();for(let i=0;i<6;i++)await Promise.resolve();assert.match(app.element('pwa-status').textContent,/preparat/);assert.equal(app.element('pwa-install').hidden,true);
let prompted=0;app.listeners.beforeinstallprompt({preventDefault(){},prompt:async()=>prompted++,userChoice:Promise.resolve({outcome:'dismissed'})});assert.equal(app.element('pwa-install').hidden,false);await app.element('pwa-install').onclick();assert.equal(prompted,1);assert.equal(app.reloads(),0);
app.reg.waiting={postMessage:data=>{assert.equal(data.type,'ACTIVATE_UPDATE');app.swListeners.controllerchange();}};app.refresh();assert.equal(app.element('pwa-update').hidden,false);app.element('pwa-update').onclick();assert.match(app.element('pwa-dialog-text').textContent,/reiniciarà/);app.element('pwa-dialog-later').onclick();assert.equal(app.reloads(),0);app.element('pwa-dialog-apply').onclick();assert.equal(app.reloads(),1);
app.context.document.documentElement.lang='eu';app.refresh();assert.equal(app.element('pwa-help').textContent,messages.eu.help);app.context.navigator.onLine=false;app.listeners.offline();assert.match(app.element('pwa-status').textContent,/Konexiorik gabe/);
const insecure=ui({secure:false});assert.match(insecure.element('pwa-status').textContent,/HTTPS/);
const noWorker=ui({serviceWorker:false});assert.match(noWorker.element('pwa-status').textContent,/No s’ha pogut/);
console.log('PWA checks passed: manifest/icons, offline shell, subfolder/query URLs, API exclusion, scoped cleanup, failed installation, seven languages, install UI and opt-in updates. No browser or live network used.');
