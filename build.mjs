import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {site,images} from './content.js';
const root=new URL('./',import.meta.url);
const pagesBuild=process.argv.includes('--pages');
const basePath=pagesBuild?(process.env.SITE_BASE_PATH??'/respira_leticia').replace(/\/$/,''):'';
if(basePath&&!/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(basePath))throw new Error('SITE_BASE_PATH deve ser um caminho absoluto sem barra final.');
const outputRoot=pagesBuild?new URL('dist/',root):root;
if(pagesBuild){await rm(outputRoot,{recursive:true,force:true});await mkdir(outputRoot,{recursive:true});}
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const layout=await readFile(new URL('templates/layout.html',root),'utf8');
function renderCopy(template){return template.replace(/\{\{([a-zA-Z.]+)\}\}/g,(_,key)=>{
 if(key==='manifesto.paragraphs')return site.manifesto.paragraphs.map(p=>'<p>'+escape(p)+'</p>').join('');
 const source=key.startsWith('manifesto.')||key==='author'?site:site.copy;
 const value=key.split('.').reduce((object,part)=>object?.[part],source);
 if(typeof value!=='string')throw new Error('Texto ausente: '+key);
 return escape(value);
});}
async function page(path,title,description,kind,content){
 let output=layout.replace('{{TITLE}}',()=>escape(title+' — Respira Letícia')).replace('{{DESCRIPTION}}',()=>escape(description)).replace('{{PAGE}}',kind).replace('{{BASE_PATH}}',()=>escape(basePath)).replace('{{CONTENT}}',()=>content);
 output=renderCopy(output);
 if(kind==='blog'||kind==='article')output=output.replace('href="/blog/">Blog','href="/blog/" aria-current="'+(kind==='article'?'location':'page')+'">Blog');
 if(kind==='shop')output=output.replace('href="/lojinha/">Lojinha','href="/lojinha/" aria-current="page">Lojinha');
 output=output.replace(/(href|src)="\/(?!\/)([^"]*)"/g,(_,attribute,path)=>attribute+'="'+basePath+'/'+path+'"');
 await mkdir(new URL(path,outputRoot),{recursive:true});await writeFile(new URL(path+'index.html',outputRoot),output);
}
const productMarkup=site.products.map(product=>
 '<article class="product-card"><div class="product-visual"><img src="'+escape(product.image)+'" alt="Foto da '+escape(product.name)+'" loading="lazy"></div><div class="product-details"><div class="product-info"><h3>'+escape(product.name)+'</h3><span>'+escape(product.price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}))+'</span></div><p class="stock-status">'+escape(product.status)+'</p>'+product.description.map(p=>'<p>'+escape(p)+'</p>').join('')+'<a class="button" href="/lojinha/#lista-de-interesse">Entrar na lista de interesse</a></div></article>'
).join('');
const products='<div class="products" id="products">'+productMarkup+'</div>';
let form='<p>O formulário da lista de interesse estará disponível em breve.</p>';
if(site.interestForm.url){
 const url=new URL(site.interestForm.url);
 if(url.origin!=='https://docs.google.com'||!/^\/forms\/d\/e\/[^/]+\/viewform$/.test(url.pathname))throw new Error('Use o endereço público completo do Google Forms, terminado em /viewform.');
 url.searchParams.delete('embedded');
 const publicUrl=url.href;
 url.searchParams.set('embedded','true');
 form='<a class="text-link" href="'+escape(publicUrl)+'" target="_blank" rel="noopener noreferrer">Abrir formulário em outra aba ↗</a><iframe class="interest-form" src="'+escape(url.href)+'" title="Lista de interesse — Caneca Capitalismo Depressão" loading="lazy"></iframe>';
}
const interest='<section class="interest-section" id="lista-de-interesse" aria-labelledby="interest-title"><div class="eyebrow">SEM ESTOQUE</div><h2 id="interest-title">Lista de interesse</h2><p>'+escape(site.interestForm.notice)+'</p>'+form+'</section>';
await page('','Yoga, autonomia e resistência',site.copy.hero.description,'home',(await readFile(new URL('templates/home.html',root),'utf8')).replace('{{PRODUCTS}}',()=>products));
await page('blog/','Blog — Corpo, cotidiano e pensamento crítico',site.copy.blog.description,'blog',
 '<section class="page-intro wrap"><a class="back-link" href="/">← Página inicial</a><div class="eyebrow">{{blog.kicker}}</div><h1>{{blog.title}}</h1><p>{{blog.description}}</p></section><section class="wrap page-list" aria-label="Textos do blog"><div class="articles" id="articles"></div></section>');
for(const article of site.articles){const other=site.articles.find(a=>a.id!==article.id);
 await page('blog/'+article.slug+'/',article.title,article.excerpt,'article',
 '<article class="reading-page"><header class="reading-header"><a class="back-link" href="/blog/">← Voltar ao blog</a><div class="eyebrow">'+escape(article.category)+'</div><h1>'+escape(article.title)+'</h1><p class="article-author">Por '+escape(site.author)+' · <time datetime="05-19">19 de maio</time></p></header><img class="reading-image" src="'+escape(images[article.image])+'" alt="'+(article.image===2?'Silhueta em postura de yoga diante do pôr do sol':'Prática de mobilidade no tapete de yoga')+'" fetchpriority="high"><div class="reading-body">'+article.paragraphs.map(p=>'<p>'+escape(p)+'</p>').join('')+'</div><nav class="reading-next" aria-label="Mais textos"><span class="eyebrow">CONTINUE A LEITURA</span><a href="/blog/'+other.slug+'/">'+escape(other.title)+' <span aria-hidden="true">↗</span></a><a class="back-link" href="/blog/">Ver todos os textos</a></nav></article>');
}
await page('lojinha/','Lojinha — Caneca Capitalismo Depressão',site.copy.shop.description+' '+site.copy.shop.catalogNote,'shop',
 '<section class="page-intro wrap"><a class="back-link" href="/">← Página inicial</a><div class="eyebrow">{{shop.kicker}}</div><h1>{{shop.title}}</h1><p>{{shop.description}}</p></section><div class="wrap page-list">'+products+interest+'</div>');
if(pagesBuild){
 for(const asset of ['app.js','content.js','styles.css','assets'])await cp(new URL(asset,root),new URL(asset,outputRoot),{recursive:true});
 await writeFile(new URL('.nojekyll',outputRoot),'');
}
console.log(pagesBuild?'Pacote GitHub Pages gerado em dist/ com base '+(basePath||'/'):'Páginas geradas: início, blog, dois artigos e lojinha.');
