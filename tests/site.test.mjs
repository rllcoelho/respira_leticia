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

// Um DOM mínimo verifica inicialização em páginas com componentes diferentes.
// Layout, foco e renderização visual continuam exigindo um navegador real.
function boot(html){
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
 const groups={
  '[data-whatsapp]':[new Element()],'[data-group]':[new Element()],
  '[data-image]':[...html.matchAll(/data-image="(\d+)"/g)].map(m=>{const el=new Element();el.dataset.image=m[1];return el;}),'#navigation a':[],

 };
 const document={
  body:{dataset:{basePath:html.match(/data-base-path="([^"]*)"/)?.[1]||''}},
  querySelector:s=>{if(!elements.has(s)&&s.startsWith('#')&&[...elements.values()].some(el=>el.innerHTML.includes('id="'+s.slice(1)+'"')))elements.set(s,new Element());return elements.get(s)||null;},
  querySelectorAll:s=>groups[s]||[],
  addEventListener(){}
 };
 vm.runInNewContext(source,{document,site,images,localStorage:new Proxy({}, {get(){throw new Error('O armazenamento antigo não deve ser acessado');}}),console});
 return {elements,groups,get:s=>elements.get(s)};
}

test('todas as páginas inicializam sem depender de seções ausentes',async()=>{
 for(const path of paths){const html=await htmlFor(path);const view=boot(html);assert.match(html,/<html lang="pt-BR">/);assert.equal((html.match(/<h1[ >]/g)||[]).length,1);assert.ok(!html.includes('article-dialog'));assert.ok(!html.includes('id="checkout"'));if(path==='/blog/'||path==='/')assert.match(view.get('#articles').innerHTML,/href="\/blog\/yoga-e-saude-mental\/"/);}
});
test('produto único real, lista de interesse e nenhum checkout ou acesso ao armazenamento',async()=>{
 assert.equal(site.products.length,1);
 const product=site.products[0];
 assert.equal(product.name,'Caneca Capitalismo Depressão');assert.equal(product.price,70);
 assert.deepEqual(product.shippingPackage,{originPostalCode:'46875-000',weightGrams:400,lengthCm:11,widthCm:9.5,heightCm:9.5});
 for(const path of paths){
  const html=await htmlFor(path);assert.doesNotMatch(html,/data-cart|data-add|cart-dialog|shipping-form|Simular pedido/);
  boot(html);
 }
 for(const path of ['/','/lojinha/']){
  const html=await htmlFor(path);
  assert.ok(html.includes(product.image));assert.ok(html.includes('R$ 70,00'));assert.ok(html.includes('Sem estoque'));
  for(const paragraph of product.description)assert.ok(html.includes(paragraph));
  assert.match(html,/href="\/lojinha\/#lista-de-interesse"/);
 }
 const shop=await htmlFor('/lojinha/');assert.ok(shop.includes(site.interestForm.notice));assert.match(shop,/id="lista-de-interesse"/);
 const publicUrl=new URL(site.interestForm.url);
 const embeddedUrl=new URL(publicUrl);embeddedUrl.searchParams.set('embedded','true');
 assert.ok(shop.includes('src="'+embeddedUrl.href.replaceAll('&','&amp;')+'"'));
 assert.ok(shop.includes('href="'+publicUrl.href.replaceAll('&','&amp;')+'" target="_blank" rel="noopener noreferrer"'));
 assert.match(shop,/Abrir formulário em outra aba/);assert.match(shop,/<iframe[^>]+title="Lista de interesse/);
 assert.doesNotMatch(shop,/formulário da lista de interesse estará disponível em breve/);
 assert.doesNotMatch(source,/localStorage|sessionStorage|respira-cart/);
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
  for(const selector of ['#articles','#products']){
   const rendered=view.get(selector)?.innerHTML||'';
   for(const match of rendered.matchAll(/(?:href|src)="([^"]*)"/g))await checkTarget(match[1]);
  }
  assert.equal(view.groups['[data-whatsapp]'][0].href,site.whatsapp);
  assert.equal(view.groups['[data-group]'][0].href,site.group);
 }

});
