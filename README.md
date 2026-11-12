# 🛒 ML Cart Organizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Extensão open-source para navegadores baseados em Chromium (**Google Chrome**, **Brave**, **Microsoft Edge**) que aprimora a experiência de compras no carrinho do **Mercado Livre**.

O Mercado Livre não oferece agrupamento ou filtros personalizados no carrinho de compras. Para quem costuma planejar compras, separar itens por categorias ou gerenciar dezenas de produtos, a navegação pode ser confusa e cansativa. O **ML Cart Organizer** resolve isso adicionando um painel inteligente de tags, filtros rápidos, cálculo de subtotais e rastreamento de oscilações de preços direto na página do carrinho.

---

## ✨ Funcionalidades

### 🏷️ 1. Organização por Tags
- Atribua uma ou mais etiquetas a qualquer produto diretamente no seu card (ex: `Oficina`, `Cozinha`, `Presentes`, `Materiais`).
- Barra de navegação intuitiva no topo do carrinho com contadores de itens em tempo real organizados em ordem alfabética.
- Filtre produtos instantaneamente com um clique. Itens e blocos de vendedores que não pertencem à lista ativa são ocultados de forma limpa.

### ☑️ 2. Filtro de Produtos "Selecionados"
- Visualize de imediato **apenas os itens marcados** no carrinho.
- Evita ter que rolar dezenas de itens para conferir o que você realmente selecionou para comprar agora.
- Subtotal e contadores atualizados em tempo real conforme você marca ou desmarca os checkboxes dos produtos.

### 💵 3. Subtotal Dinâmico
- Exibe o valor total e quantidade de itens calculados especificamente para a tag ou filtro ativo no momento.

### 📈 4. Monitoramento e Histórico de Preços
- Acompanhamento automático dos preços dos itens a cada visita ao carrinho (vinculado aos identificadores `MLB` dos anúncios).
- Indicadores visuais nos cards:
  - 🟢 **Baixou R$ X,XX (-Y%)**
  - 🔴 **Subiu R$ X,XX (+Y%)**
  - ⚪ **Preço monitorado**
- Botão para **Resetar Preços**, permitindo atualizar o valor base de comparação a qualquer momento mantendo todas as tags intactas.

### ⏸️ 5. Modo de Pausa e Desativação
- Opção rápida para pausar a extensão tanto pelo popup quanto por um botão discreto na barra do carrinho.
- Ao desativar, restaura 100% o DOM original do Mercado Livre e exibe um botão discreto flutuante para reativação a qualquer hora.

### 🔒 6. Privacidade Total e Backup
- **100% Local**: Nenhum dado sai do seu computador. Não há servidores externos, APIs de terceiros ou telemetria.
- Armazenamento seguro via `chrome.storage.local`.
- Popup com opção de **Exportar JSON** e **Importar JSON** para manter seus dados seguros e transferir entre navegadores.

---

## 🛡️ Premissas e Princípios Éticos

O **ML Cart Organizer** foi construído sob princípios inegociáveis de respeito à comunidade, criadores de conteúdo e usuários:

1. **Zero Sequestro de Afiliados (Anti-Hijacking):** Jamais alteramos, injetamos ou substituímos parâmetros de afiliados (`matt_tool`, `tracking_id`, queries ou cookies). Se você adicionou produtos por indicação de um canal de ofertas, criador de conteúdo ou grupo, a atribuição pertence 100% a eles.
2. **Escopo Restrito ao Carrinho:** A extensão atua única e exclusivamente na página do carrinho. Nunca acessamos telas de checkout, pagamento, endereço, CPF ou dados bancários.
3. **100% Client-Side & Sem Rastreamento:** Todo o processamento, tags e histórico de preços ficam salvos exclusivamente no seu navegador (`chrome.storage.local`). Sem telemetria, sem analytics e sem envio de dados para servidores externos.
4. **Sem Interferência na Compra:** A extensão organiza visualmente seus produtos e calcula subtotais para planejamento; ela jamais manipula o preço oficial cobrado pelo Mercado Livre nem impede a conclusão de um pedido.

📄 Consulte o documento completo em [**PREMISSAS.md**](PREMISSAS.md).

---

## 🚀 Como Instalar no Navegador

Você pode instalar a extensão de duas formas: de maneira super simples (sem precisar de nenhum conhecimento técnico) ou compilando você mesmo pelo código-fonte.

### 🟢 Método 1: Instalação Rápida (Para qualquer pessoa / Sem programar)

> Ideal para quem só quer usar a extensão no dia a dia. Você não precisa instalar Node.js nem abrir terminal!

1. **Baixe o arquivo da extensão:**
   - Acesse a página de [Releases](https://github.com/brenonovelli/ml-cart-organizer/releases) do repositório.
   - Baixe o arquivo **`ml-cart-organizer.zip`** da versão mais recente.
   - *(Ou, na página inicial do repositório, clique no botão verde `<> Code` no topo e escolha **Download ZIP**).*
2. **Descompacte a pasta no seu computador:**
   - Dê um clique duplo (no Mac) ou clique com o botão direito e selecione **"Extrair Tudo"** (no Windows).
   - Guarde a pasta descompactada em um local seguro (por exemplo, na sua pasta de `Documentos`).
3. **Abra a tela de extensões do seu navegador:**
   - **Google Chrome:** digite `chrome://extensions` na barra de endereços e dê Enter.
   - **Brave Browser:** digite `brave://extensions` na barra de endereços e dê Enter.
   - **Microsoft Edge:** digite `edge://extensions` na barra de endereços e dê Enter.
4. **Ative o "Modo do desenvolvedor":**
   - No canto superior direito da página de extensões, ative a chavinha **"Modo do desenvolvedor"** (Developer mode).
5. **Carregue a extensão:**
   - Clique no botão **"Carregar sem compactação"** (ou *"Load unpacked"* no canto superior esquerdo).
   - Na janela que se abrir, selecione a pasta da extensão descompactada (a pasta que contém o arquivo `manifest.json`, ou a pasta `dist`).
6. **Pronto! 🎉**
   - Abra o carrinho do Mercado Livre em [mercadolivre.com.br/gz/cart](https://www.mercadolivre.com.br/gz/cart).
   - O painel de tags e o filtro de selecionados já estarão disponíveis no topo do carrinho!

---

### 💻 Método 2: Instalação para Desenvolvedores (Via Terminal)

Para quem deseja contribuir ou compilar o código manualmente:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/brenonovelli/ml-cart-organizer.git
   cd ml-cart-organizer
   ```

2. **Instale as dependências e compile:**
   ```bash
   npm install
   npm run build
   ```
   *(Isso executará o TypeScript e o empacotador Vite, gerando os artefatos finais na pasta `dist/`).*

3. **Carregue no navegador:**
   - Acesse `chrome://extensions` ou `brave://extensions`.
   - Ative o **Modo do desenvolvedor**.
   - Clique em **Carregar sem compactação** e selecione a pasta **`dist`**.

---

## 📋 Padrão de Pull Requests (PRs)

Adoramos contribuições da comunidade! Para que as revisões sejam rápidas e o código se mantenha consistente, pedimos que todos os Pull Requests sigam estas boas práticas:

### 1. Formato do Título do PR
Utilizamos o padrão [Conventional Commits](https://www.conventionalcommits.org/):
- `feat(escopo): descrição da nova funcionalidade`
- `fix(escopo): descrição da correção de bug`
- `docs: melhorias na documentação ou README`
- `style: ajustes de CSS, tipografia ou espaçamentos`
- `refactor: refatoração interna sem alteração de comportamento`

**Exemplos reais:**
- `feat(toolbar): adiciona botão para exibir apenas produtos selecionados`
- `fix(preço): corrige captura de valores com centavos separados`
- `docs(readme): adiciona instruções de instalação para iniciantes`

### 2. Conteúdo e Checklist da PR
Ao abrir seu Pull Request, o formulário automático solicitará:
- **Descrição Clara:** O que foi alterado e qual o benefício.
- **Antes & Depois (Screenshots / Vídeos):** Obrigatório para qualquer alteração na interface do carrinho.
- **Instruções de Teste:** Passo a passo para reproduzir e validar o teste no carrinho real.
- **Validação Local:** Garantir que o comando `npm run build` executa sem erros de TypeScript antes do envio.
- **Privacidade Preservada:** Todos os dados devem permanecer 100% locais no navegador do usuário.

Para mais detalhes sobre como configurar seu ambiente de desenvolvimento, confira o [Guia de Contribuição](CONTRIBUTING.md).

---

## 🛠️ Tecnologias e Arquitetura

- **Manifest V3:** Padrão moderno e seguro para extensões Chromium.
- **TypeScript:** Tipagem estática rigorosa para estabilidade e manutenibilidade.
- **Vite:** Compilação veloz do popup e do background service worker.
- **Content Script Bundle:** Empacotamento IIFE autocontido para isolamento seguro na página do Mercado Livre.
- **MutationObserver + DOM Resiliente:** Monitoramento reativo das mudanças de página e re-renderização suave sem quebrar a experiência do usuário.

```
ml-cart-organizer/
├── .github/                # Workflows do CI, release automática e templates de PR/Issue
├── public/                 # Manifest.json e ícones da extensão
├── src/
│   ├── background/         # Service worker Manifest V3
│   ├── content/            # Injeção no carrinho do Mercado Livre
│   │   ├── dom-parser.ts   # Leitura de preços, checkboxes e identificadores MLB
│   │   ├── index.ts        # Ciclo de vida e sincronização de eventos
│   │   └── ui/             # Componentes visuais e estilos injetados
│   ├── popup/              # Interface do popup da barra de ferramentas
│   ├── services/           # Camada de persistência (StorageService)
│   └── types/              # Definições de tipos TypeScript
├── scripts/                # Script de compilação customizado
└── dist/                   # Artefatos prontos gerados pelo build
```

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações.

---

> *Aviso: Este projeto é independente e de código aberto, mantido pela comunidade e não possui afiliação oficial com o Mercado Livre.*
