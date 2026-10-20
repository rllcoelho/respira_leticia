# Respira Letícia

Site em português brasileiro com página inicial, blog, artigos e lojinha com lista de interesse. HTML, CSS e JavaScript sem dependências de instalação.

## Executar e verificar

Com Node.js 18 ou superior:

- `npm start` gera as páginas e inicia http://127.0.0.1:4173.
- `npm run build` atualiza os arquivos HTML a partir dos templates e do conteúdo.
- `npm run check` verifica a sintaxe JavaScript.
- `npm test` verifica as páginas, os links e assets via HTTP e a inicialização em um DOM mínimo. Os testes não substituem revisão visual e de teclado em navegador.

## Páginas

- `/`: apresentação, comunidade e prévias do blog e da lojinha.
- `/blog/`: textos e reflexões.
- `/blog/yoga-e-saude-mental/` e `/blog/yoga-para-quem-passa-o-dia-sentado/`: leitura integral e links compartilháveis.
- `/lojinha/`: Caneca Capitalismo Depressão e lista de interesse.

Endereços de diretórios sem a barra final são redirecionados para a versão com barra.

## Editar

- `content.js`: chamadas compartilhadas, manifesto integral de Letícia, apresentação, artigos (com slug próprio), contatos, catálogo e preços em reais.
- `templates/layout.html`: cabeçalho e rodapé compartilhados. `templates/home.html`: conteúdo da página inicial.
- `build.mjs`: composição das páginas de blog, artigos e loja.
- `styles.css`: identidade, escala tipográfica e layouts responsivos. Conteúdo até 1.600 px, corpo de 18 px no desktop e 17 px no celular; leitura dos artigos com coluna limitada.
- `assets/images`: fotografias originais. `assets/products`: foto real da caneca.

Depois de editar templates ou conteúdo, execute `npm run build` ou reinicie `npm start`. Os arquivos HTML são gerados; faça alterações em suas fontes para preservá-las.

## Caneca e lista de interesse

A única peça é a **Caneca Capitalismo Depressão**, por **R$ 70,00**, sem estoque. O cadastro de interesse não envolve pagamento nem garante unidade. Não há carrinho, checkout, cálculo de frete ou criação de pedidos. O JavaScript ignora os carrinhos antigos sem ler, alterar ou apagar o armazenamento do navegador.

O formulário público está configurado em `site.interestForm.url`, no `content.js`. A loja incorpora a versão com `embedded=true` e oferece “Abrir formulário em outra aba”. Preserve o endereço completo terminado em `/viewform` ao atualizar a configuração.

Antes do lançamento, na conta proprietária do Forms:

- Alterar “Reseve sua caneca” para “Lista de interesse — Caneca Capitalismo Depressão”.
- Incluir o aviso de uso de dados de `site.interestForm.notice` no próprio formulário, também para quem abrir o link diretamente.
- Conferir Nome, WhatsApp e Email obrigatórios e acesso sem login obrigatório.
- Confirmar vínculo das respostas com Google Sheets e acesso de Letícia à planilha; isso não pode ser comprovado pela página pública.
- Após configurar a planilha, testar a incorporação em celular e desktop e enviar uma resposta claramente identificada como teste.

Letícia acompanhará os cadastros e contatará os interessados manualmente, sem notificações automáticas ou promessa de prazo. Credenciais e respostas não devem entrar no repositório nem no pacote público. Mercado Pago, cobrança e frete ficam para a etapa de venda com disponibilidade confirmada.

Dados registrados em `shippingPackage` para uso futuro: CEP de origem **46875-000**, peso total embalado **400 g**, comprimento **11 cm**, largura **9,5 cm**, altura **9,5 cm**. São medidas da embalagem, não da caneca.

As fontes são carregadas do Google Fonts, com alternativas locais. As fotos originais foram preservadas. A identidade popular e vibrante — yoga, autonomia e resistência — está documentada em DESIGN.md. Ela usa composição de cartaz, fotografias reais e vermelho, amarelo e azul sobre fundo de papel. A biografia e os artigos foram preservados.

## Publicação no GitHub Pages

URL pública: https://rllcoelho.github.io/respira_leticia/

Execute `npm run build:pages` para gerar somente os arquivos públicos em `dist/`. O comando usa `/respira_leticia` como caminho-base, sem alterar os HTML da versão local. É possível definir `SITE_BASE_PATH` para outro caminho ou para uma string vazia ao publicar na raiz de um domínio.

O workflow `.github/workflows/pages.yml` verifica o projeto e publica a cada push na branch `main`; também pode ser iniciado manualmente em Actions. Configure **Settings → Pages → Build and deployment → Source → GitHub Actions** no repositório. Não é necessário instalar dependências, cadastrar secrets ou publicar o servidor Node.js.

Os links gerados no HTML e no JavaScript respeitam o caminho-base informado em `data-base-path`. Preserve esse comportamento ao adicionar páginas e imagens. `dist/` não é versionado e contém apenas páginas, scripts, estilos e assets, sem os testes, templates ou arquivos de desenvolvimento.
