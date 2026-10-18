import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {site,images} from './content.js';
const root=new URL('./',import.meta.url);
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const layout=await readFile(new URL('templates/layout.html',root),'utf8');
async function page(path,title,description,kind,content){
 let output=layout.replace('{{TITLE}}',escape(title+' — Respira Letícia')).replace('{{DESCRIPTION}}',escape(description)).replace('{{PAGE}}',kind).replace('{{CONTENT}}',content);
 if(kind==='blog'||kind==='article')output=output.replace('href="/blog/">Blog','href="/blog/" aria-current="'+(kind==='article'?'location':'page')+'">Blog');
 if(kind==='shop')output=output.replace('href="/lojinha/">Lojinha','href="/lojinha/" aria-current="page">Lojinha');
 await mkdir(new URL(path,root),{recursive:true});await writeFile(new URL(path+'index.html',root),output);
}
await page('','Yoga para a vida real','Yoga com Letícia. Um convite para respirar melhor, movimentar o corpo e criar presença na vida cotidiana.','home',await readFile(new URL('templates/home.html',root),'utf8'));
await page('blog/','Blog — Textos e reflexões','Reflexões de Letícia sobre yoga, saúde mental, movimento e cuidado no cotidiano.','blog',
 '<section class="page-intro wrap"><a class="back-link" href="/">← Página inicial</a><div class="eyebrow">PALAVRAS PARA LEVAR COM VOCÊ</div><h1>Entre pausas <em>e reflexões.</em></h1><p>Sobre corpo, cuidado e os pequenos encontros com a gente mesma. Um espaço para ler com calma e levar uma ideia para o seu dia.</p></section><section class="wrap page-list" aria-label="Textos do blog"><div class="articles" id="articles"></div></section>');
for(const article of site.articles){const other=site.articles.find(a=>a.id!==article.id);
 await page('blog/'+article.slug+'/',article.title,article.excerpt,'article',
 '<article class="reading-page"><header class="reading-header"><a class="back-link" href="/blog/">← Voltar ao blog</a><div class="eyebrow">'+escape(article.category)+'</div><h1>'+escape(article.title)+'</h1><p class="article-author">Por '+escape(site.author)+' · <time datetime="05-19">19 de maio</time></p></header><img class="reading-image" src="'+escape(images[article.image])+'" alt="'+(article.image===2?'Silhueta em postura de yoga diante do pôr do sol':'Prática de mobilidade no tapete de yoga')+'" fetchpriority="high"><div class="reading-body">'+article.paragraphs.map(p=>'<p>'+escape(p)+'</p>').join('')+'</div><nav class="reading-next" aria-label="Mais textos"><span class="eyebrow">CONTINUE A LEITURA</span><a href="/blog/'+other.slug+'/">'+escape(other.title)+' <span aria-hidden="true">↗</span></a><a class="back-link" href="/blog/">Ver todos os textos</a></nav></article>');
}
await page('lojinha/','Lojinha — Canecas e cerâmicas','Uma vitrine demonstrativa de canecas e cerâmicas para os pequenos rituais do dia. Conheça as peças e simule seu pedido.','shop',
 '<section class="page-intro wrap"><a class="back-link" href="/">← Página inicial</a><div class="eyebrow">PEQUENOS RITUAIS, FEITOS DE TERRA</div><h1>Uma pausa <em>nas suas mãos.</em></h1><p>Canecas e cerâmicas para trazer mais intenção aos gestos de todo dia. Objetos que convidam a ficar um pouco mais.</p></section><section class="wrap page-list" aria-label="Produtos demonstrativos"><div class="demo-notice"><span aria-hidden="true">◇</span> Vitrine demonstrativa · Peças ilustrativas e preços de exemplo. Nenhuma compra real será realizada.</div><div class="products" id="products"></div><div class="shop-bottom"><span>Uma peça, um café, um momento só seu.</span><button class="text-link" data-cart>Ver meu carrinho <span aria-hidden="true">↗</span></button></div></section>');
console.log('Páginas geradas: início, blog, dois artigos e lojinha.');
