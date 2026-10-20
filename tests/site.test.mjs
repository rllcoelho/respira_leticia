import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {spawn,execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {site,images} from '../content.js';
const root=new URL('../',import.meta.url);
const paths=['/','/blog/','/lojinha/',...site.articles.map(a=>'/blog/'+a.slug+'/')];
const source=(await readFile(new URL('app.js',root),'utf8')).replace(/^import[^\n]+\n/,'');
const htmlFor=path=>readFile(new URL('.'+path+'index.html',root),'utf8');
const brl=value=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

// Um DOM mínimo verifica inicialização em páginas com componentes diferentes.
// Layout, foco e renderização visual continuam exigindo um navegador real.
function boot(html,storage={value:'{}'}){
 class Element{
  constructor(classes=''){this.hidden=false;this.value='';this.innerHTML='';this.textContent='';this.dataset={};this.attrs={};this.listeners={};this.classList={contains:c=>classes.split(' ').includes(c),add(){},remove(){},toggle(){}};}
  addEventListener(type,fn){this.listeners[type]=fn;}
  setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}removeAttribute(k){delete this.attrs[k];}
  focus(){}showModal(){this.open=true;}close(){this.open=false;}
  querySelector(){return new Element();}
  click(){this.listeners.click?.({});}
 }
 const elements=new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>['#'+m[1],new Element()]));
 const menu=new Element();elements.set('.menu-toggle',menu);
 const selected=new Element();selected.value='18.90';elements.set('input[name="shipping"]:checked',selected);
 const groups={
  '[data-whatsapp]':[new Element()],'[data-group]':[new Element()],
  '[data-image]':[...html.matchAll(/data-image="(\d+)"/g)].map(m=>{const el=new Element();el.dataset.image=m[1];return el;}),'#navigation a':[],
  'dialog':[elements.get('#cart-dialog')],
  '[data-count]':[new Element()],'[data-cart]':[new Element('cart-trigger')],
  'input[name="shipping"]':[new Element(),new Element()]
 };
 const document={
  body:{dataset:{basePath:html.match(/data-base-path="([^"]*)"/)?.[1]||''}},
  querySelector:s=>{if(!elements.has(s)&&s.startsWith('#')&&[...elements.values()].some(el=>el.innerHTML.includes('id="'+s.slice(1)+'"')))elements.set(s,new Element());return elements.get(s)||null;},
  querySelectorAll:s=>s==='[data-add]'?(elements.has('#products')?site.products.map(p=>{const el=new Element();el.dataset.add=p.id;return el;}):[]):groups[s]||[],
  addEventListener(){}
 };
 // Capturar botões criados depois da renderização da vitrine.
 const findAll=document.querySelectorAll;let adds;
 document.querySelectorAll=s=>s==='[data-add]'?(adds??=findAll(s)):findAll(s);
 vm.runInNewContext(source,{document,site,images,localStorage:{getItem:()=>storage.value,setItem:(k,v)=>{storage.value=v;}},setTimeout:()=>0,clearTimeout(){},console});
 return {elements,groups,adds,get:s=>elements.get(s),storage};
}

test('todas as páginas inicializam sem depender de seções ausentes',async()=>{
 for(const path of paths){const html=await htmlFor(path);const view=boot(html);assert.match(html,/<html lang="pt-BR">/);assert.equal((html.match(/<h1[ >]/g)||[]).length,1);assert.ok(!html.includes('article-dialog'));assert.equal(view.get('#checkout').hidden,true);if(path==='/blog/'||path==='/')assert.match(view.get('#articles').innerHTML,/href="\/blog\/yoga-e-saude-mental\/"/);}
});
test('carrinho persiste entre início, blog e loja; frete e resumo são demonstrativos',async()=>{
 const storage={value:'{}'};let view=boot(await htmlFor('/'),storage);
 view.adds[0].click();view.adds[0].click();view.adds[1].click();assert.deepEqual(JSON.parse(storage.value),{caneca:2,xicara:1});
 view=boot(await htmlFor('/blog/'),storage);assert.equal(view.groups['[data-count]'][0].textContent,3);assert.equal(view.get('#subtotal').textContent,brl(243));
 view=boot(await htmlFor('/lojinha/'),storage);view.groups['[data-cart]'][0].click();assert.equal(view.get('#cart-dialog').open,true);
 view.get('#cep').value='123';view.get('#shipping-form').listeners.submit({preventDefault(){}});assert.match(view.get('#shipping-error').textContent,/8 dígitos/);
 view.get('#cep').value='44000000';view.get('#cep').listeners.input();assert.equal(view.get('#cep').value,'44000-000');view.get('#shipping-form').listeners.submit({preventDefault(){}});assert.equal(view.get('#total').textContent,brl(261.9));
 view.get('#simulate').click();assert.match(view.get('#order-result').innerHTML,/Nenhum pedido foi criado/);assert.equal(view.get('#order-result').hidden,false);
 view.groups['[data-cart]'][0].click();view.get('#cep').listeners.input();assert.equal(view.get('#shipping-options').hidden,true);assert.equal(view.get('#total').textContent,brl(243));
 const change=dataset=>view.get('#cart-items').listeners.click({target:{closest:()=>({dataset})}});
 change({quantity:'caneca',change:'-1'});assert.equal(JSON.parse(storage.value).caneca,1);change({remove:'caneca'});change({remove:'xicara'});assert.equal(view.get('#checkout').hidden,true);assert.match(view.get('#cart-items').innerHTML,/href="\/lojinha\/"/);
});
test('artigos completos têm autoria, data e links para continuar lendo',async()=>{
 for(const article of site.articles){const html=await htmlFor('/blog/'+article.slug+'/');assert.ok(html.includes(article.title));assert.ok(html.includes(site.author));for(const paragraph of article.paragraphs)assert.ok(html.includes(paragraph.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll("'",'&#39;')));assert.match(html,/Voltar ao blog/);assert.match(html,/CONTINUE A LEITURA/);}
});
test('servidor atende páginas, assets, links internos e redirecionamentos',async()=>{
 const child=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 let output='';const origin=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Servidor não iniciou')),10000);child.once('error',reject);child.stdout.on('data',data=>{output+=data;const match=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0]);}});child.once('exit',code=>{clearTimeout(timer);reject(new Error('Servidor encerrou: '+code));});});
 try{
  const targets=new Set([...paths,...images,...site.products.map(p=>p.image)]);
  for(const path of paths){const html=await htmlFor(path);for(const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g))targets.add(match[1].split('#')[0]||'/');}
  for(const path of targets){const response=await fetch(origin+encodeURI(path));assert.equal(response.status,200,path);}
  for(const path of paths.filter(p=>p!=='/')){const response=await fetch(origin+path.slice(0,-1)+'?teste=1',{redirect:'manual'});assert.equal(response.status,308);assert.equal(response.headers.get('location'),path+'?teste=1');}
  assert.equal((await fetch(origin+'/pagina-inexistente/')).status,404);
 }finally{child.kill();}
});

test('manifesto integral é publicado com autoria e chamadas resolvidas',async()=>{
 const expected="O yoga sempre foi símbolo de revolta, mas quando a gente vê essa imagem de yoga pasteurizado, de roupa bege, tapetinho de quatrocentos a mil reais, é óbvio que a gente não vê essa prática que representa a revolta. O Ocidente pegou uma tecnologia ancestral de ruptura, de desconstrução, de liberdade, de radicalismo, e empacotou nesse produto de bem-estar. O yoga raiz nunca foi sobre você ficar zen, sobre conseguir render mais na escala 6x1. A filosofia do yoga é uma prática de desidentificação total da estrutura. É um ato político. É um ato de não se curvar às estruturas de opressão, principalmente lá atrás no início do yoga. É sobre treinar a mente para ser ingovernável pelo sistema. Só que o capitalismo é mestre em domesticar o que é subversivo, e aí transformaram essa ferramenta em mais um produto para lucro, mas resistiremos!";
 assert.equal(site.manifesto.paragraphs.join(' '),expected);
 const home=await htmlFor('/');
 assert.match(home,/id="manifesto"/);assert.ok(home.includes(site.manifesto.title));
 for(const paragraph of site.manifesto.paragraphs)assert.ok(home.includes(paragraph));
 assert.ok(home.includes('Por '+site.author));assert.ok(home.includes(site.copy.hero.title));
 for(const path of paths){const html=await htmlFor(path);assert.ok(!html.includes('{{'),path);assert.ok(html.includes('href="/#manifesto"'),path);}
});

test('pacote Pages usa o prefixo em HTML e elementos dinâmicos sem modificar o site local',async()=>{
 const before=await Promise.all(paths.map(htmlFor));
 execFileSync(process.execPath,['build.mjs','--pages'],{cwd:root,env:{...process.env,SITE_BASE_PATH:'/respira_leticia'}});
 assert.deepEqual(await Promise.all(paths.map(htmlFor)),before);
 const prefix='/respira_leticia';
 const publicFiles=await readdir(new URL('dist/',root));
 assert.deepEqual(publicFiles.sort(),['.nojekyll','app.js','assets','blog','content.js','index.html','lojinha','styles.css'].sort());
 const checkTarget=async target=>{
  if(target.startsWith('#'))return;
  const url=new URL(target,'https://example.test');
  if(url.origin!=='https://example.test')return;
  assert.ok(url.pathname.startsWith(prefix+'/'),target);
  let path=decodeURIComponent(url.pathname.slice(prefix.length));
  if(path.endsWith('/'))path+='index.html';
  assert.ok((await stat(new URL('dist'+path,root))).isFile(),target);
 };
 for(const path of paths){
  const html=await readFile(new URL('dist'+path+'index.html',root),'utf8');
  assert.ok(html.includes('data-base-path="'+prefix+'"'));
  const view=boot(html);
  for(const match of html.matchAll(/(?:href|src)="([^"]*)"/g))await checkTarget(match[1]);
  for(const img of view.groups['[data-image]'])await checkTarget(img.src);
  for(const selector of ['#articles','#products','#cart-items']){
   const rendered=view.get(selector)?.innerHTML||'';
   for(const match of rendered.matchAll(/(?:href|src)="([^"]*)"/g))await checkTarget(match[1]);
  }
  assert.equal(view.groups['[data-whatsapp]'][0].href,site.whatsapp);
  assert.equal(view.groups['[data-group]'][0].href,site.group);
 }
 const storage={value:'{}'};
 boot(await readFile(new URL('dist/index.html',root),'utf8'),storage).adds[0].click();
 const shop=boot(await readFile(new URL('dist/lojinha/index.html',root),'utf8'),storage);
 assert.equal(shop.groups['[data-count]'][0].textContent,1);
 for(const match of shop.get('#cart-items').innerHTML.matchAll(/src="([^"]*)"/g))await checkTarget(match[1]);
});
