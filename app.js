import {site, images} from './content.js';
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const basePath = document.body?.dataset.basePath || '';
const siteUrl = path => path.startsWith('/') && !path.startsWith('//') ? basePath + path : path;
const money = value => value.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
$$('[data-whatsapp]').forEach(a => {a.href=site.whatsapp;a.target='_blank';a.rel='noopener noreferrer';});
$$('[data-group]').forEach(a => {a.href=site.group;a.target='_blank';a.rel='noopener noreferrer';});
$$('[data-image]').forEach(img => {img.src=siteUrl(images[Number(img.dataset.image)]);});
$('#year').textContent=new Date().getFullYear();
if ($('#bio')) $('#bio').innerHTML=site.bio.map(text=>'<p>'+escape(text)+'</p>').join('');
if ($('#articles')) $('#articles').innerHTML=site.articles.map(article=>
 '<article class="article-card"><div class="article-image"><img src="'+escape(siteUrl(images[article.image]))+'" alt="'+(article.image===2?'Silhueta em uma postura de yoga diante do pôr do sol':'Prática de mobilidade no tapete de yoga, com um cachorro por perto')+'" loading="lazy"></div><div class="eyebrow">'+escape(article.category)+'</div><h3>'+escape(article.title)+'</h3><p>'+escape(article.excerpt)+'</p><div class="article-meta"><span>Por '+escape(site.author)+' · 19 de maio</span><a class="text-link" href="'+siteUrl('/blog/'+article.slug+'/')+'" aria-label="Ler '+escape(article.title)+'">Ler texto <span aria-hidden="true">↗</span></a></div></article>'
).join('');
if ($('#products')) $('#products').innerHTML=site.products.map(product=>
 '<article class="product-card"><div class="product-visual"><span class="illustration-label">ILUSTRAÇÃO · DEMONSTRAÇÃO</span><img src="'+escape(siteUrl(product.image))+'" alt="Ilustração demonstrativa: '+escape(product.name)+'" loading="lazy"></div><div class="product-info"><h3>'+escape(product.name)+'</h3><span>'+money(product.price)+'</span></div><p>'+escape(product.note)+'</p><button class="add-button" data-add="'+product.id+'" aria-label="Adicionar '+escape(product.name)+' ao carrinho demonstrativo">Adicionar ao carrinho <span aria-hidden="true">+</span></button></article>'
).join('');
const menu=$('.menu-toggle');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu');$('#navigation').classList.remove('open');}
menu.addEventListener('click',()=>{const opened=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(opened));menu.setAttribute('aria-label',opened?'Fechar menu':'Abrir menu');$('#navigation').classList.toggle('open',opened);});
$$('#navigation a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape' && menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
$$('dialog').forEach(dialog=>{$('[data-close]',dialog).addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});});
let cart={};
try{const saved=JSON.parse(localStorage.getItem('respira-cart')||'{}');if(saved && typeof saved==='object' && !Array.isArray(saved)){site.products.forEach(p=>{if(Number.isInteger(saved[p.id])&&saved[p.id]>0&&saved[p.id]<=99)cart[p.id]=saved[p.id];});}}catch{/* Carrinho indisponível: continuar em memória. */}
let shippingReady=false;
const cartDialog=$('#cart-dialog');
const subtotal=()=>site.products.reduce((sum,p)=>sum+p.price*(cart[p.id]||0),0);
const freight=()=>shippingReady?Number($('input[name="shipping"]:checked').value):0;
function save(){try{localStorage.setItem('respira-cart',JSON.stringify(cart));}catch{/* Navegação funciona sem armazenamento local. */}}
function updateTotals(){$('#subtotal').textContent=money(subtotal());$('#total').textContent=money(subtotal()+freight());$('#freight-note').textContent=shippingReady?'com frete fictício':'sem frete';}
function renderCart(){
 const count=Object.values(cart).reduce((a,b)=>a+b,0);
 $$('[data-count]').forEach(el=>el.textContent=count);
 $$('[data-cart]').forEach(el=>{if(el.classList.contains('cart-trigger'))el.setAttribute('aria-label','Abrir carrinho, '+count+' '+(count===1?'item':'itens'));});
 $('#checkout').hidden=count===0;
 $('#cart-items').innerHTML=count?site.products.filter(p=>cart[p.id]).map(p=>'<div class="cart-item"><img src="'+escape(siteUrl(p.image))+'" alt="Ilustração de '+escape(p.name)+'"><div><h3>'+escape(p.name)+'</h3><p>'+money(p.price)+' por unidade</p><button class="remove" data-remove="'+p.id+'" aria-label="Remover '+escape(p.name)+'">Remover</button></div><div class="quantity"><button data-quantity="'+p.id+'" data-change="-1" aria-label="Diminuir quantidade de '+escape(p.name)+'">−</button><span aria-label="Quantidade">'+cart[p.id]+'</span><button data-quantity="'+p.id+'" data-change="1" aria-label="Aumentar quantidade de '+escape(p.name)+'" '+(cart[p.id]>=99?'disabled':'')+'>+</button></div></div>').join(''):'<div class="empty-cart"><h3>'+escape(site.copy.cart.emptyTitle)+'</h3><p>O carrinho está vazio. Explore as peças da nossa vitrine demonstrativa.</p><a class="button" href="'+siteUrl('/lojinha/')+'">Conhecer as peças ↗</a></div>';
 updateTotals();
}
let toastTimer;function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2800);}
$$('[data-add]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.add;if((cart[id]||0)>=99){toast('Limite de 99 unidades por peça.');return;}cart[id]=(cart[id]||0)+1;save();renderCart();toast(site.products.find(p=>p.id===id).name+' adicionada ao carrinho.');}));
$$('[data-cart]').forEach(button=>button.addEventListener('click',()=>{$('#order-result').hidden=true;$('#cart-items').hidden=false;renderCart();cartDialog.showModal();cartDialog.scrollTop=0;}));
$('#cart-items').addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.dataset.remove){delete cart[button.dataset.remove];save();renderCart();$('.dialog-close',cartDialog).focus();}if(button.dataset.quantity){const id=button.dataset.quantity;const change=Number(button.dataset.change);const quantity=(cart[id]||0)+change;if(quantity<1)delete cart[id];else cart[id]=Math.min(99,quantity);save();renderCart();const next=$('[data-quantity="'+id+'"][data-change="'+change+'"]',cartDialog);(next&&!next.disabled?next:$('.dialog-close',cartDialog)).focus();}});
$('#cep').addEventListener('input',()=>{const digits=$('#cep').value.replace(/\D/g,'').slice(0,8);$('#cep').value=digits.length>5?digits.slice(0,5)+'-'+digits.slice(5):digits;shippingReady=false;$('#shipping-options').hidden=true;$('#shipping-error').textContent='';$('#cep').removeAttribute('aria-invalid');updateTotals();});
$('#shipping-form').addEventListener('submit',event=>{event.preventDefault();const digits=$('#cep').value.replace(/\D/g,'');if(digits.length!==8||/^(\d)\1{7}$/.test(digits)){$('#shipping-error').textContent='Informe um CEP com 8 dígitos, como 44000-000.';$('#cep').setAttribute('aria-invalid','true');$('#cep').focus();return;}$('#cep').removeAttribute('aria-invalid');$('#shipping-error').textContent='';shippingReady=true;$('#shipping-options').hidden=false;updateTotals();toast('Opções fictícias de frete disponíveis.');});
$$('input[name="shipping"]').forEach(input=>input.addEventListener('change',updateTotals));
$('#simulate').addEventListener('click',()=>{if(!shippingReady){$('#shipping-error').textContent='Calcule o frete demonstrativo antes de simular o pedido.';$('#cep').focus();return;}if(subtotal()<=0)return;const result=$('#order-result');result.innerHTML='<div class="eyebrow">SIMULAÇÃO CONCLUÍDA</div><h3>'+escape(site.copy.cart.summaryTitle)+'</h3><p>Este é apenas um resumo demonstrativo. Nenhum pedido foi criado e nenhuma cobrança foi realizada.</p><div class="order-summary">'+site.products.filter(p=>cart[p.id]).map(p=>'<p><span>'+cart[p.id]+' × '+escape(p.name)+'</span><span>'+money(p.price*cart[p.id])+'</span></p>').join('')+'<p><span>Frete fictício</span><span>'+money(freight())+'</span></p><p><strong>Total demonstrativo</strong><strong>'+money(subtotal()+freight())+'</strong></p></div><button class="button full" id="back-cart">Voltar ao carrinho</button>';$('#checkout').hidden=true;$('#cart-items').hidden=true;result.hidden=false;$('#back-cart').addEventListener('click',()=>{result.hidden=true;$('#cart-items').hidden=false;renderCart();$('#simulate').focus();});cartDialog.scrollTop=0;$('#back-cart').focus();});
renderCart();
