# Guia de Contribuição / Contributing Guide

Obrigado pelo interesse em contribuir com o **ML Cart Organizer**! 🎉  
Este é um projeto de código aberto desenvolvido para a comunidade e toda ajuda é muito bem-vinda: seja corrigindo bugs, melhorando a documentação ou sugerindo novas funcionalidades.

---

## 🛠️ Como Começar no Desenvolvimento

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** (gerenciador de pacotes)
- Navegador baseado em Chromium (**Google Chrome**, **Brave**, **Edge**, etc.)

### Passo a Passo

1. **Faça um Fork e clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/ml-cart-organizer.git
   cd ml-cart-organizer
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Compile o projeto:**
   ```bash
   npm run build
   ```
   *Isso executará a verificação de tipos do TypeScript (`tsc`) e o empacotador Vite/Node (`scripts/build.js`), gerando a pasta `dist/`.*

4. **Carregue no navegador:**
   - Acesse `chrome://extensions` ou `brave://extensions`.
   - Ative a opção **Modo do Desenvolvedor** no canto superior direito.
   - Clique em **Carregar sem compactação** (ou *Load unpacked*).
   - Selecione a pasta **`dist`** gerada no projeto.
   - Abra [mercadolivre.com.br/gz/cart](https://www.mercadolivre.com.br/gz/cart) para testar suas alterações.

---

## 📐 Padrões de Código e Arquitetura

- **TypeScript Estrito:** Mantenha os tipos bem definidos em `src/types/index.ts`. Evite uso de `any`.
- **Privacidade em Primeiro Lugar:** Todos os dados do usuário (tags, preços monitorados, configurações) são armazenados **exclusivamente localmente** via `chrome.storage.local`. Nunca adicione telemetria, analytics ou rastreamento remoto.
- **Respeito ao Layout Nativo:** A extensão deve se integrar de forma limpa e não destrutiva à interface do Mercado Livre:
  - Estilos bem encapsulados com classes iniciadas em `ml-`.
  - Tratamento para evitar nós duplicados ou quebras de grid com elementos dinâmicos do React / Andes UI.
  - Tipografia limpa, sem negritos desnecessários e sem emojis em títulos e rótulos da interface.

---

## 📋 Padrão de Pull Requests (PRs)

Para manter o repositório organizado e acelerar as revisões, adotamos os seguintes padrões:

### 1. Nomenclatura de Branches
Crie branches descritivas baseadas no tipo de alteração:
- `feat/nome-da-feature` (ex: `feat/filtro-selecionados`, `feat/export-csv`)
- `fix/nome-do-bug` (ex: `fix/calculo-subtotal`, `fix/overlap-footer`)
- `docs/nome-da-melhoria` (ex: `docs/passo-a-passo-leigo`)

### 2. Mensagens de Commit e Título do PR
Adotamos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

| Prefixo | Significado | Exemplo |
| :--- | :--- | :--- |
| `feat:` | Nova funcionalidade para o usuário | `feat(toolbar): adiciona botão para filtrar apenas selecionados` |
| `fix:` | Correção de bug | `fix(parser): corrige leitura de preços com centavos destacados` |
| `docs:` | Mudanças na documentação | `docs(readme): adiciona guia de instalação para leigos` |
| `style:` | Ajustes visuais de CSS ou layout | `style(cards): remove negrito excessivo nas tags` |
| `refactor:` | Refatoração interna sem alterar comportamento | `refactor(storage): simplifica resolução de aliases de produtos` |
| `perf:` | Melhoria de performance | `perf(observer): adiciona debounce em mutações do DOM` |

### 3. Conteúdo Obrigatório do PR
Ao abrir um PR, o GitHub preencherá automaticamente nosso template. Certifique-se de:
- **Explicar a motivação:** Por que essa mudança é necessária?
- **Anexar imagens ou vídeos:** Se a alteração impactar a interface visual, inclua capturas de tela comparando o **Antes** e o **Depois**.
- **Instruções de teste:** Indique exatamente como os mantenedores podem testar a funcionalidade na prática.
- **Passar no build local:** Garanta que `npm run build` executa com sucesso antes de abrir a PR.

---

## 🚀 Como Submeter sua Pull Request

1. Crie uma branch a partir da `main`:
   ```bash
   git checkout -b feat/minha-melhoria
   ```
2. Realize suas alterações e teste compilando:
   ```bash
   npm run build
   ```
3. Faça commits claros e objetivos:
   ```bash
   git commit -m "feat(filtro): adiciona contagem de itens visíveis"
   ```
4. Envie para o seu fork:
   ```bash
   git push origin feat/minha-melhoria
   ```
5. Abra o Pull Request no repositório oficial e preencha o checklist!
