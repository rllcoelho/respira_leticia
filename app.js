import {site, images} from './content.js';
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const basePath = document.body?.dataset.basePath || '';
const siteUrl = path => path.startsWith('/') && !path.startsWith('//') ? basePath + path : path;
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
$$('[data-whatsapp]').forEach(a => {a.href=site.whatsapp;a.target='_blank';a.rel='noopener noreferrer';});
$$('[data-group]').forEach(a => {a.href=site.group;a.target='_blank';a.rel='noopener noreferrer';});
$$('[data-image]').forEach(img => {img.src=siteUrl(images[Number(img.dataset.image)]);});
$('#year').textContent=new Date().getFullYear();
if ($('#bio')) $('#bio').innerHTML=site.bio.map(text=>'<p>'+escape(text)+'</p>').join('');
if ($('#articles')) $('#articles').innerHTML=site.articles.map(article=>
 '<article class="article-card"><div class="article-image"><img src="'+escape(siteUrl(images[article.image]))+'" alt="'+(article.image===2?'Silhueta em uma postura de yoga diante do pôr do sol':'Prática de mobilidade no tapete de yoga, com um cachorro por perto')+'" loading="lazy"></div><div class="eyebrow">'+escape(article.category)+'</div><h3>'+escape(article.title)+'</h3><p>'+escape(article.excerpt)+'</p><div class="article-meta"><span>Por '+escape(site.author)+' · 19 de maio</span><a class="text-link" href="'+siteUrl('/blog/'+article.slug+'/')+'" aria-label="Ler '+escape(article.title)+'">Ler texto <span aria-hidden="true">↗</span></a></div></article>'
).join('');
const menu=$('.menu-toggle');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu');$('#navigation').classList.remove('open');}
menu.addEventListener('click',()=>{const opened=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(opened));menu.setAttribute('aria-label',opened?'Fechar menu':'Abrir menu');$('#navigation').classList.toggle('open',opened);});
$$('#navigation a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape' && menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
