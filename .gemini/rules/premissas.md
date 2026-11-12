# Regras e Premissas Inegociáveis do ML Cart Organizer

Sempre que atuar neste projeto (criação de código, refatoração, documentação ou preparação de release), você DEVE obrigatoriamente validar e seguir as seguintes premissas:

1. **JAMAIS MEXER EM LINKS DE AFILIADOS:**
   - Nunca altere, substitua, injete ou remova parâmetros de afiliados (`matt_tool`, `tracking_id`, queries e cookies de criadores e canais de ofertas).
   - A extensão existe para ajudar o usuário a se organizar, nunca para sequestrar comissões ou tráfego.

2. **ESCOPO EXCLUSIVO AO CARRINHO:**
   - A extensão deve rodar apenas nas rotas de carrinho (`/gz/cart*` e `/cart*`).
   - NUNCA atuar no checkout, pagamento, PDP ou telas com dados de cartão/endereço/CPF.

3. **100% CLIENT-SIDE & ZERO TELEMETRIA:**
   - Não adicione `fetch()`, `XMLHttpRequest` ou scripts externos de telemetria ou analytics.
   - Todos os dados ficam salvos em `chrome.storage.local`.

4. **PERMISSÕES MÍNIMAS NO MANIFEST:**
   - Mantenha `permissions: ["storage"]`.
   - Não adicione permissões invasivas como `<all_urls>`, `webRequest`, `cookies` etc.

5. **NÃO QUEBRAR O LAYOUT NATIVO E FAIL-SAFE:**
   - A extensão deve funcionar em harmonia com o DOM do Mercado Livre (Andes UI/React).
   - Se algo falhar, o carrinho nativo deve continuar funcionando perfeitamente.
   - Sempre forneça a opção de desativação que restaura o DOM nativo.
