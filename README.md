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
- Barra de navegação intuitiva no topo do carrinho com contadores de itens em tempo real em ordem alfabética.
- Filtre produtos instantaneamente com um clique. Itens e vendedores que não pertencem à lista ativa são ocultados de forma limpa.

### ☑️ 2. Filtro de Produtos "Selecionados"
- Visualize de imediato **apenas os itens marcados** no carrinho.
- Evita ter que rolar dezenas de itens para conferir o que você realmente selecionou para comprar.
- Subtotal e contadores atualizados em tempo real conforme você marca ou desmarca os checkboxes.

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
- Armazenamento em `chrome.storage.local`.
- Popup com opção de **Exportar JSON** e **Importar JSON** para manter seus dados seguros e transferir entre computadores.

---

## 🚀 Como Instalar

Como a extensão é open-source e está em constante evolução, você pode instalá-la facilmente no modo desenvolvedor:

1. **Baixe ou clone este repositório:**
   ```bash
   git clone https://github.com/brenonovelli/ml-cart-organizer.git
   cd ml-cart-organizer
   ```

2. **Instale as dependências e faça o build:**
   ```bash
   npm install
   npm run build
   ```
   *(Isso criará a pasta `dist/` com todos os arquivos prontos para o navegador).*

3. **Carregue a extensão no navegador:**
   - No Chrome: acesse `chrome://extensions`
   - No Brave: acesse `brave://extensions`
   - No Edge: acesse `edge://extensions`
4. Ative a opção **Modo do desenvolvedor** (Developer mode) no canto superior direito.
5. Clique no botão **Carregar sem compactação** (*Load unpacked*).
6. Selecione a pasta **`dist`** dentro do projeto.
7. Acesse seu carrinho em [mercadolivre.com.br/gz/cart](https://www.mercadolivre.com.br/gz/cart) e aproveite!

---

## 🛠️ Tecnologias e Arquitetura

- **Manifest V3:** Arquitetura moderna de extensões Chromium.
- **TypeScript:** Tipagem estática rigorosa para garantir estabilidade e manutenibilidade.
- **Vite:** Compilação ultra-rápida do popup e do background service worker.
- **Content Script Bundle:** Empacotamento IIFE autocontido para isolamento seguro do script de conteúdo na página do Mercado Livre.
- **MutationObserver + DOM Resiliente:** Monitoramento reativo das mudanças de página e re-renderização suave sem quebrar a experiência do usuário.

```
ml-cart-organizer/
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

## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Se você encontrou algum bug ou tem uma ideia para tornar o carrinho ainda melhor:

1. Dê uma olhada nas [Issues abertas](https://github.com/brenonovelli/ml-cart-organizer/issues).
2. Leia nosso [Guia de Contribuição](CONTRIBUTING.md).
3. Abra um Pull Request com suas melhorias.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações.

---

> *Aviso: Este projeto é independente e de código aberto, mantido pela comunidade e não possui afiliação oficial com o Mercado Livre.*
