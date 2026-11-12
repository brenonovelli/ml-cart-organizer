import { StorageData } from '../types';
import { StorageService } from '../services/storage';

export interface ParsedCartElement {
  element: HTMLElement;
  groupElement: HTMLElement | null;
  id: string;
  candidateIds: string[];
  title: string;
  url: string;
  price: number;
  isSelected?: boolean;
}

export class DomParser {
  /**
   * Extrai o ID do anúncio (suporta MLB, MLBU, MLBP, MLBF).
   * O formato original do path é mantido como prioritário.
   */
  static extractMlbId(input: string): string | null {
    if (!input) return null;
    const match = input.match(/MLB[UFPB]?[-_]?(\d+)/i);
    return match ? `MLB${match[1]}` : null;
  }

  /**
   * Extrai todos os possíveis identificadores de um produto (path, item_id, wid, id do card)
   */
  static extractAllCandidateIds(input: string, container?: HTMLElement): string[] {
    const ids = new Set<string>();

    if (input) {
      // 1. Path principal canônico original (ex: /p/MLB77825085 ou /MLB-12345)
      const primary = this.extractMlbId(input);
      if (primary) ids.add(primary);

      // 2. Parâmetros query de variação específica (item_id ou wid)
      const itemIdMatch = input.match(/(?:item_id|wid)(?:%3D|=)(MLB[UFPB]?\d+)/i);
      if (itemIdMatch) ids.add(itemIdMatch[1].toUpperCase());

      // 3. Todos os formatos MLB na URL
      const allMatches = Array.from(input.matchAll(/MLB[UFPB]?[-_]?(\d+)/gi));
      for (const m of allMatches) {
        ids.add(`MLB${m[1]}`);
      }
    }

    if (container) {
      // 4. Elementos que possuem id na árvore do card (ex: <div id="MLB4435401223">)
      const elWithId = container.querySelector('[id^="MLB"]');
      if (elWithId && elWithId.id) {
        const m = elWithId.id.match(/MLB[UFPB]?[-_]?(\d+)/i);
        if (m) ids.add(`MLB${m[1]}`);
      }
    }

    return Array.from(ids);
  }

  /**
   * Extrai o preço correto de dentro do card completo
   */
  /**
   * Extrai o preço efetivo atual de dentro do card, ignorando preços antigos/riscados.
   */
  static parsePriceFromContainer(container: Element): number {
    const isPreviousPrice = (el: Element): boolean => {
      if (
        el.classList.contains('andes-money-amount--previous') ||
        el.classList.contains('cl-price__content-ds-prev') ||
        el.classList.contains('poly-price__previous') ||
        el.classList.contains('cl-price__previous-wrapper')
      ) {
        return true;
      }
      return !!el.closest(
        '.andes-money-amount--previous, .cl-price__content-ds-prev, .poly-price__previous, [class*="previous"], [class*="ds-prev"], del, s, strike'
      );
    };

    const extractAmount = (el: Element): number => {
      if (!el) return 0;

      // 1. Procura fraction e cents dentro do elemento
      const fractionEl = el.querySelector(
        '.andes-money-amount__fraction, .andes-ui-money-amount__fraction, [class*="fraction"]'
      );
      const centsEl = el.querySelector(
        '.andes-money-amount__cents, .andes-ui-money-amount__cents, [class*="cents"]'
      );

      if (fractionEl && fractionEl.textContent) {
        const cleanFraction = fractionEl.textContent.replace(/\./g, '').trim();
        let cents = '00';
        if (centsEl && centsEl.textContent) {
          cents = centsEl.textContent.trim().replace(/[^\d]/g, '');
        } else {
          const text = el.textContent || '';
          const commaMatch = text.match(/,\s*(\d{2})/);
          if (commaMatch) {
            cents = commaMatch[1];
          }
        }
        const num = parseFloat(`${cleanFraction}.${cents}`);
        if (!isNaN(num) && num > 0) return num;
      }

      // 2. Fallback: padrão monetário R$ X,XX no texto
      const text = el.textContent?.trim() || '';
      const match = text.match(/R\$\s*([\d\.]+)(?:,(\d{2}))?/);
      if (match) {
        const rawInt = match[1].replace(/\./g, '');
        const cents = match[2] || '00';
        const val = parseFloat(`${rawInt}.${cents}`);
        if (!isNaN(val) && val > 0) return val;
      }

      // 3. Fallback: aria-label (ex: "3 reales con 72 centavos" ou "3 reais e 72 centavos")
      const aria = el.getAttribute('aria-label') || '';
      const ariaMatch = aria.match(/(\d+)\s*(?:reais|reales)(?:\s*(?:com|con|e)\s*(\d+)\s*centavos)?/i);
      if (ariaMatch) {
        const rawInt = ariaMatch[1];
        const cents = (ariaMatch[2] || '00').padStart(2, '0');
        const val = parseFloat(`${rawInt}.${cents}`);
        if (!isNaN(val) && val > 0) return val;
      }

      return 0;
    };

    // 1. Prioridade Máxima: Segunda coluna (.cl-item-card__second-column) onde fica o preço final do item
    const secondColumn = container.querySelector(
      '.cl-item-card__second-column, [class*="second-column"]'
    );
    if (secondColumn) {
      // 1a. Procura pelo container exclusivo de preço atual
      const currentPriceEl = secondColumn.querySelector(
        '.cl-price__current, .poly-price__current, [class*="price__current"]'
      );
      if (currentPriceEl) {
        const p = extractAmount(currentPriceEl);
        if (p > 0) return p;
      }

      // 1b. Procura por qualquer andes-money-amount na segunda coluna que NÃO seja preço antigo/riscado
      const moneyAmounts = Array.from(
        secondColumn.querySelectorAll('.andes-money-amount, [class*="andes-money-amount"]')
      );
      for (const m of moneyAmounts) {
        if (isPreviousPrice(m)) continue;
        const p = extractAmount(m);
        if (p > 0) return p;
      }
    }

    // 2. Procura por seletores explícitos de preço atual no card inteiro
    const currentPriceEl = container.querySelector(
      '.cl-price__current, .poly-price__current, [class*="price__current"]'
    );
    if (currentPriceEl && !isPreviousPrice(currentPriceEl)) {
      const p = extractAmount(currentPriceEl);
      if (p > 0) return p;
    }

    // 3. Varre todos os andes-money-amount ignorando preços anteriores e banners promocionais
    const allMoney = Array.from(
      container.querySelectorAll('.andes-money-amount, [class*="andes-money-amount"]')
    );
    for (const m of allMoney) {
      if (isPreviousPrice(m)) continue;
      // Ignora se estiver dentro de sugestões ("Leve este similar") ou cupom
      if (m.closest('[class*="suggested"], [class*="coupon"], [class*="cupom"]')) continue;
      const p = extractAmount(m);
      if (p > 0) return p;
    }

    // 4. Fallback final: texto livre R$ no container do preço
    const target = secondColumn || container;
    const elementsWithText = Array.from(target.querySelectorAll('span, div, p'));
    for (const el of elementsWithText) {
      if (isPreviousPrice(el)) continue;
      if (el.closest('[class*="suggested"], [class*="coupon"], [class*="cupom"]')) continue;
      const text = el.textContent?.trim() || '';
      if (text.startsWith('R$') && text.length < 25 && !text.includes('OFF')) {
        const match = text.match(/R\$\s*([\d\.]+)(?:,(\d{2}))?/);
        if (match) {
          const rawInt = match[1].replace(/\./g, '');
          const cents = match[2] || '00';
          const val = parseFloat(`${rawInt}.${cents}`);
          if (!isNaN(val) && val > 0) return val;
        }
      }
    }

    return 0;
  }

  /**
   * Encontra exatamente o container da linha do produto (cl-item-card raiz).
   */
  static findFullCardContainer(titleLink: HTMLElement): HTMLElement {
    // 1. Procura subindo até encontrar o elemento com classe 'cl-item-card' que NÃO seja um sub-elemento '__'
    let parent = titleLink.parentElement;
    while (parent && parent !== document.body) {
      const classes = Array.from(parent.classList);
      if (classes.includes('cl-item-card') && !classes.some((c) => c.startsWith('cl-item-card__'))) {
        return parent;
      }
      parent = parent.parentElement;
    }

    // 2. Fallback: subir até um ancestral que contenha TANTO o stepper QUANTO o preço,
    // garantindo que não suba até o grupo do lojista
    let current: HTMLElement = titleLink;
    let bestCandidate: HTMLElement = titleLink;

    while (current.parentElement && current.parentElement !== document.body) {
      const p: HTMLElement = current.parentElement;

      const hasStepper = !!current.querySelector(
        '[class*="stepper"], button[class*="stepper"], [class*="stepper-item"], [class*="quantity"], input[type="number"]'
      );
      const hasPrice = !!current.querySelector('.andes-money-amount, [class*="andes-money-amount"], [class*="cl-price"]');
      const isEsgotado = !!current.querySelector('[class*="esgotado"], [aria-label*="Remover"], [aria-label*="Excluir"]');

      if ((hasStepper && hasPrice) || (isEsgotado && hasPrice)) {
        bestCandidate = current;
        const otherProductLinks = current.querySelectorAll(
          'a[href*="/MLB"], a[href*="/p/"], a[href*="produto.mercadolivre"]'
        );
        const hasSellerHeader = !!current.querySelector('.cl-card-header, [class*="cl-card-header"]');

        if (otherProductLinks.length <= 1 && !hasSellerHeader) {
          return current;
        }
      }

      current = p;
    }

    return bestCandidate;
  }

  /**
   * Encontra o container GERAL do vendedor/grupo (cl-grouped-card raiz).
   * Este container contém o cabeçalho do vendedor, cupom e todos os produtos dele.
   */
  static findGroupContainer(cardElement: HTMLElement): HTMLElement | null {
    // 1. Sobe até encontrar o container raiz do grupo ('cl-grouped-card')
    let parent = cardElement.parentElement;
    while (parent && parent !== document.body) {
      const classes = Array.from(parent.classList);
      if (classes.includes('cl-grouped-card') && !classes.some((c) => c.startsWith('cl-grouped-card__'))) {
        return parent;
      }
      if (
        classes.includes('cl-cards-list') ||
        classes.includes('cards-list') ||
        parent.tagName.toLowerCase() === 'main'
      ) {
        return cardElement;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  /**
   * Verifica se o produto está selecionado/marcado com checkbox no carrinho.
   */
  static isItemChecked(card: HTMLElement): boolean {
    if (!card) return false;

    // 1. Procura no container específico do checkbox do card
    const target = card.querySelector<HTMLElement>(
      '.poly-card__checkbox, [class*="poly-card__checkbox"]'
    ) || card;

    // 2. Se o container Andes possuir o atributo data-andes-state explícito
    const andesCheckbox = target.querySelector<HTMLElement>(
      '[data-andes-checkbox], .andes-checkbox'
    );
    if (andesCheckbox) {
      const state = andesCheckbox.getAttribute('data-andes-state');
      if (state === 'checked') return true;
      if (state === 'unchecked') return false;
      const ariaChecked = andesCheckbox.getAttribute('aria-checked');
      if (ariaChecked === 'true') return true;
      if (ariaChecked === 'false') return false;
    }

    // 3. Verifica o input nativo do checkbox
    const input = target.querySelector<HTMLInputElement>(
      'input[data-andes-checkbox-input], input.andes-checkbox__input, input[type="checkbox"]'
    );
    if (input) {
      if (input.checked) return true;
      const ariaChecked = input.getAttribute('aria-checked');
      if (ariaChecked === 'true') return true;
      if (ariaChecked === 'false') return false;
      if (input.hasAttribute('checked') && input.getAttribute('checked') !== 'false') return true;
    }

    return false;
  }

  /**
   * Varre o carrinho e retorna todos os produtos.
   * DEDUP POR ELEMENTO DOM (garante que itens duplicados ou variações sejam todos escaneados e filtrados!)
   */
  static scanCartItems(storageData?: StorageData): ParsedCartElement[] {
    const items: ParsedCartElement[] = [];
    const seenElements = new Set<HTMLElement>();

    // Método 1: Busca direta pelos cards oficiais (.cl-item-card)
    // ATENÇÃO: Filtrar para garantir que é o card raiz e NÃO sub-elementos com '__' (ex: cl-item-card__polycard)
    const officialCards = Array.from(
      document.querySelectorAll<HTMLElement>('.cl-item-card')
    ).filter((el) => {
      const classes = Array.from(el.classList);
      return classes.includes('cl-item-card') && !classes.some((c) => c.startsWith('cl-item-card__'));
    });

    if (officialCards.length > 0) {
      for (const card of officialCards) {
        if (seenElements.has(card)) continue;
        seenElements.add(card);

        const titleLink = card.querySelector<HTMLAnchorElement>(
          'a[href*="/MLB"], a[href*="/p/"], a[href*="produto.mercadolivre"], a'
        );
        const title = (
          titleLink?.textContent ||
          card.querySelector('h2, h3, h4, [class*="title"]')?.textContent ||
          ''
        ).trim();

        if (!title || title.length < 2) continue;

        const href = titleLink?.href || '';
        const candidateIds = this.extractAllCandidateIds(href, card);
        let mlbId = this.extractMlbId(href);

        if (storageData) {
          mlbId = StorageService.resolveExistingItemId(candidateIds, title, storageData);
        } else if (!mlbId) {
          mlbId = candidateIds[0] || `ITEM_${Math.abs(title.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0))}`;
        }

        const price = this.parsePriceFromContainer(card);
        const groupElement = this.findGroupContainer(card);
        const isSelected = this.isItemChecked(card);

        items.push({
          element: card,
          groupElement,
          id: mlbId,
          candidateIds,
          title,
          url: href,
          price,
          isSelected
        });
      }

      return items;
    }

    // Método 2 (Fallback): Busca via links de produtos
    const productLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(
        'a[href*="/MLB"], a[href*="/p/MLB"], a[href*="produto.mercadolivre.com.br"], a[href*="/up/MLBU"]'
      )
    );

    for (const link of productLinks) {
      const title = (link.textContent || '').trim();
      if (!title || title.length < 3) continue;

      const fullCard = this.findFullCardContainer(link);
      if (seenElements.has(fullCard)) continue;
      seenElements.add(fullCard);

      const href = link.href || '';
      const candidateIds = this.extractAllCandidateIds(href, fullCard);
      let mlbId = this.extractMlbId(href);

      if (storageData) {
        mlbId = StorageService.resolveExistingItemId(candidateIds, title, storageData);
      } else if (!mlbId) {
        mlbId = candidateIds[0] || `ITEM_${Math.abs(title.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0))}`;
      }

      const price = this.parsePriceFromContainer(fullCard);
      const groupElement = this.findGroupContainer(fullCard);
      const isSelected = this.isItemChecked(fullCard);

      items.push({
        element: fullCard,
        groupElement,
        id: mlbId,
        candidateIds,
        title,
        url: href,
        price,
        isSelected
      });
    }

    return items;
  }

  /**
   * Localiza a posição de inserção antes da lista de cards (cl-cards-list)
   */
  static findTopInsertionPoint(): { parent: HTMLElement; referenceNode: Node | null } | null {
    const cardsList = document.querySelector<HTMLElement>(
      '.cl-cards-list, [class*="cl-cards-list"], [class*="cards-list"]'
    );
    if (cardsList && cardsList.parentElement) {
      return {
        parent: cardsList.parentElement,
        referenceNode: cardsList
      };
    }

    const allTextNodes = Array.from(document.querySelectorAll('span, div, h2, label'));
    const selectAllNode = allTextNodes.find((el) => el.textContent?.trim() === 'Todos os produtos');

    if (selectAllNode) {
      let headerSection: HTMLElement | null = selectAllNode.closest('section, div');
      while (headerSection && headerSection.parentElement) {
        if (
          headerSection.parentElement.classList.contains('cart-list') ||
          headerSection.parentElement.children.length > 1
        ) {
          return {
            parent: headerSection.parentElement,
            referenceNode: headerSection.nextSibling
          };
        }
        headerSection = headerSection.parentElement;
      }
    }

    const cartList = document.querySelector<HTMLElement>('.cart-list, [class*="cart-list"], main');
    if (cartList) {
      return {
        parent: cartList,
        referenceNode: cartList.firstChild
      };
    }

    return null;
  }
}
