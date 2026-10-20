# Respira Letícia

Site em português brasileiro com página inicial, blog, artigos e lojinha demonstrativa. HTML, CSS e JavaScript sem dependências de instalação.

## Executar e verificar

Com Node.js 18 ou superior:

- `npm start` gera as páginas e inicia http://127.0.0.1:4173.
- `npm run build` atualiza os arquivos HTML a partir dos templates e do conteúdo.
- `npm run check` verifica a sintaxe JavaScript.
- `npm test` verifica as páginas, os links e assets via HTTP e a lógica do carrinho em um DOM mínimo. Os testes não substituem revisão visual e de teclado em navegador.

## Páginas

- `/`: apresentação, comunidade e prévias do blog e da lojinha.
- `/blog/`: textos e reflexões.
- `/blog/yoga-e-saude-mental/` e `/blog/yoga-para-quem-passa-o-dia-sentado/`: leitura integral e links compartilháveis.
- `/lojinha/`: produtos, carrinho e simulação de entrega.

Endereços de diretórios sem a barra final são redirecionados para a versão com barra.

## Editar

- `content.js`: chamadas compartilhadas, manifesto integral de Letícia, apresentação, artigos (com slug próprio), contatos, catálogo e preços em reais.
- `templates/layout.html`: cabeçalho, rodapé e carrinho compartilhados. `templates/home.html`: conteúdo da página inicial.
- `build.mjs`: composição das páginas de blog, artigos e loja.
- `styles.css`: identidade, escala tipográfica e layouts responsivos. Conteúdo até 1.600 px, corpo de 18 px no desktop e 17 px no celular; leitura dos artigos com coluna limitada.
- `assets/images`: fotografias originais. `assets/illustrations`: ilustrações demonstrativas dos produtos.

Depois de editar templates ou conteúdo, execute `npm run build` ou reinicie `npm start`. Os arquivos HTML são gerados; faça alterações em suas fontes para preservá-las.

## Loja demonstrativa

Produtos, preços, frete e conclusão do pedido são demonstrativos. Não há pagamento, cotação real, estoque ou criação de pedidos. O carrinho mantém a chave `respira-cart` no armazenamento local e persiste entre páginas; o CEP não é salvo. Os links de WhatsApp são os fornecidos pela instrutora.

As fontes são carregadas do Google Fonts, com alternativas locais. As fotos originais foram preservadas. A identidade popular e vibrante — yoga, autonomia e resistência — está documentada em DESIGN.md. Ela usa composição de cartaz, fotografias reais e vermelho, amarelo e azul sobre fundo de papel. A biografia e os artigos foram preservados.

## Publicação no GitHub Pages

URL pública: https://rllcoelho.github.io/respira_leticia/

Execute `npm run build:pages` para gerar somente os arquivos públicos em `dist/`. O comando usa `/respira_leticia` como caminho-base, sem alterar os HTML da versão local. É possível definir `SITE_BASE_PATH` para outro caminho ou para uma string vazia ao publicar na raiz de um domínio.

O workflow `.github/workflows/pages.yml` verifica o projeto e publica a cada push na branch `main`; também pode ser iniciado manualmente em Actions. Configure **Settings → Pages → Build and deployment → Source → GitHub Actions** no repositório. Não é necessário instalar dependências, cadastrar secrets ou publicar o servidor Node.js.

Os links gerados no HTML e no JavaScript respeitam o caminho-base informado em `data-base-path`. Preserve esse comportamento ao adicionar páginas e imagens. `dist/` não é versionado e contém apenas páginas, scripts, estilos e assets, sem os testes, templates ou arquivos de desenvolvimento.
