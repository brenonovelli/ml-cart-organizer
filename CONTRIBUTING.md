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

- **TypeScript Estrito:** Mantenha os tipos bem definidos em `src/types/index.ts`.
- **Privacidade em Primeiro Lugar:** Todos os dados do usuário (tags, preços monitorados, configurações) são armazenados **exclusivamente localmente** via `chrome.storage.local`. Nunca adicione telemetria ou rastreamento remoto.
- **Respeito ao Layout Nativo:** A extensão deve se integrar de forma limpa e não destrutiva à interface do Mercado Livre:
  - Estilos bem encapsulados com classes iniciadas em `ml-`.
  - Tratamento para evitar nós duplicados ou quebras de grid com elementos dinâmicos do React / Andes UI.
- **Padrão de Commits:** Recomendamos o uso de [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat:` Nova funcionalidade
  - `fix:` Correção de bug
  - `docs:` Alterações na documentação
  - `refactor:` Refatoração de código sem mudança de comportamento
  - `style:` Formatação ou ajustes de estilo

---

## 🚀 Como Submeter uma Pull Request (PR)

1. Crie uma branch para a sua feature ou correção:
   ```bash
   git checkout -b minha-feature
   ```
2. Realize suas modificações e certifique-se de que a compilação passa com sucesso:
   ```bash
   npm run build
   ```
3. Faça o commit das suas alterações:
   ```bash
   git commit -m "feat: adiciona suporte a ..."
   ```
4. Envie a branch para o seu fork:
   ```bash
   git push origin minha-feature
   ```
5. Abra uma Pull Request no GitHub com uma descrição detalhada do problema resolvido ou da melhoria implementada.
