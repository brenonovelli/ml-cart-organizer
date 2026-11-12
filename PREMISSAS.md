# 🛡️ Premissas e Princípios Fundamentais (Core Principles)

Este documento define os **pilares inegociáveis** do **ML Cart Organizer**.  
Toda e qualquer alteração de código, pull request, nova funcionalidade ou versão gerada por desenvolvedores ou agentes de inteligência artificial **deve obrigatoriamente validar e respeitar** as premissas descritas abaixo antes de ser aceita ou publicada.

---

## 1. Integridade de Afiliados e Fair Play (Zero Hijacking)
* **Respeito Absoluto a Criadores de Conteúdo:** Jamais alterar, substituir, injetar ou remover parâmetros de afiliados (`matt_tool`, `tracking_id`, queries ou cookies) presentes nos links de produtos.
* **Sem Canibalização de Tráfego:** A extensão existe com propósito estritamente utilitário para o comprador final organizar seus produtos. Canais de ofertas, criadores e grupos de descontos devem ter suas atribuições e comissões 100% preservadas.
* **Neutralidade:** É terminantemente proibido injetar links patrocinados, anúncios ou priorizar produtos de determinados lojistas em detrimento de outros.

---

## 2. Privacidade e Arquitetura Local-First (100% Client-Side)
* **Zero Telemetria / Zero Analytics:** Nenhuma informação sobre os produtos no carrinho, valores, cliques ou comportamento de compra é enviada para servidores externos.
* **Armazenamento Estritamente Local:** Todos os dados (tags criadas, filtros, histórico de preços) ficam salvos exclusivamente no navegador do usuário via `chrome.storage.local`.
* **Privilégio Mínimo de Permissões:** O `manifest.json` deve solicitar apenas o estritamente necessário (ex: `storage`). Jamais solicitar permissões invasivas como `<all_urls>`, `webRequest`, `cookies` ou acesso a histórico de navegação.
* **Soberania dos Dados:** O usuário tem direito a exportar (JSON) e importar seus dados a qualquer momento, ou apagá-los completamente ao desinstalar a extensão.

---

## 3. Delimitação Estrita de Escopo (Cart-Only)
* **Restrição Exclusiva ao Carrinho:** A extensão só deve carregar e rodar nas URLs de carrinho do Mercado Livre (`mercadolivre.com.br/gz/cart*` ou `/cart*`).
* **Zero Interferência no Checkout / Pagamento:** É estritamente proibido atuar nas telas de finalização de compra (`/checkout/buy` ou equivalentes), onde são digitados dados sensíveis como cartões, endereços, CPF ou dados bancários.
* **Não Manipulação dos Valores Finais:** Subtotais calculados pela extensão servem apenas para o planejamento do usuário. Os valores cobrados, fretes e descontos oficiais processados pelo Mercado Livre nunca devem ser alterados ou forçados pela extensão.

---

## 4. Estabilidade, Resiliência e Fail-Safe
* **Degradação Suave (Graceful Degradation):** Caso o Mercado Livre atualize classes, layout ou estrutura do DOM, a extensão deve falhar de forma silenciosa e segura, sem travar a navegação do usuário ou impedir a conclusão de uma compra.
* **Botão de Desativação Rápida (Kill Switch):** Deve sempre haver uma opção simples e acessível para o usuário desativar a extensão temporariamente, restaurando 100% o DOM original do Mercado Livre.
* **Código Aberto e Auditável:** Proibido o uso de `eval`, `new Function` ou carregamento de scripts externos em tempo de execução. O código que roda no navegador deve ser exatamente aquele auditado e compilado a partir deste repositório público.

---

## ✅ Checklist de Validação Pré-Release (Para Desenvolvedores e Agentes de IA)

Antes de aprovar qualquer PR ou gerar uma nova versão da extensão, valide:

- [ ] **Afiliados intactos:** Os links e URLs dos produtos mantêm seus parâmetros originais?
- [ ] **Escopo restrito:** O content script continua limitado apenas às rotas `/cart` e `/gz/cart`?
- [ ] **Sem chamadas externas:** Foi verificado que não há `fetch()`, `XMLHttpRequest` ou scripts externos chamando servidores de terceiros?
- [ ] **Permissões mínimas:** O `manifest.json` continua sem permissões excessivas?
- [ ] **Checkout seguro:** Nenhuma tela de pagamento ou dados sensíveis é acessada?
- [ ] **DOM limpo:** A desativação da extensão restaura o layout nativo perfeitamente?
