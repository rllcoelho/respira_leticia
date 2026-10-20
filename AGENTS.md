# Instruções para agentes

Estas instruções se aplicam a todo o projeto. Consulte o README.md para detalhes de execução e estrutura.

## Estrutura e edição

- O site usa HTML, CSS e JavaScript, sem framework ou dependências de instalação.
- Edite textos, contatos, artigos e produtos em content.js.
- Edite a estrutura compartilhada e a página inicial em templates/; a composição das páginas de blog, artigos e lojinha fica em build.mjs.
- Edite a aparência e a responsividade em styles.css.
- Para GitHub Pages, use npm run build:pages. O pacote dist/ usa /respira_leticia/ como base e não deve alterar as páginas locais. Preserve os caminhos-base nos links e imagens dinâmicos.
- Os arquivos index.html da raiz, do blog, dos artigos e da lojinha são gerados. Altere suas fontes e execute npm run build; não edite esses HTML diretamente.

## Conteúdo e identidade

- Mantenha o conteúdo e a interface em português brasileiro.
- Preserve os textos, contatos e informações reais fornecidos; não invente credenciais, depoimentos ou dados pessoais.
- Mantenha a identidade popular e vibrante descrita em DESIGN.md: composição de cartaz, títulos fortes, fotos reais e linguagem direta e acolhedora sobre yoga, autonomia e resistência.
- O manifesto é um texto autoral de Letícia. Preserve sua redação integral; mudanças de interface não autorizam reescrever a biografia ou os artigos.
- Enquanto a loja for simulada, mantenha explícito que produtos, preços, frete e conclusão de pedidos são demonstrativos, sem compras ou cobranças reais.

## Validação

- Após alterações funcionais, execute npm run build, npm run check e npm test.
- Para mudanças visuais, revise o layout responsivo e a navegação por teclado em navegador, quando disponível.
- Os testes usam HTTP e um DOM mínimo; não substituem a revisão visual. Informe as verificações realizadas e qualquer limitação.
