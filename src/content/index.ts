import { DomParser } from './dom-parser';
import { StorageService } from '../services/storage';
import { UIComponents } from './ui/components';
import { StorageData } from '../types';

class CartOrganizerController {
  private static isUpdating = false;
  private static debounceTimer: number | null = null;
  private static cachedData: StorageData | null = null;

  static async init(): Promise<void> {
    console.log('%c[ML Organizer 🛒]%c Inicializando extensão...', 'color: #3483fa; font-weight: bold;', 'color: auto;');

    UIComponents.injectStyles();

    this.cachedData = await StorageService.getData();

    // Se a extensão estiver desativada, limpa tudo e exibe apenas o botão discreto de reativação
    if (this.cachedData.enabled === false) {
      this.teardown();
      this.renderFloatingEnableButton();
    } else {
      // Primeira varredura e gravação de snapshots
      await this.refresh(true);
    }

    // Observa mudanças genuínas no DOM do Mercado Livre
    this.setupMutationObserver();

    // Observa interações de seleção de produtos (checkboxes)
    this.setupCheckboxListeners();

    // Escuta mensagens diretas do popup (ex: contagem de itens em tempo real e toggle)
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message.action === 'GET_CART_STATS') {
          const scanned = DomParser.scanCartItems(this.cachedData || undefined);
          sendResponse({
            itemCount: scanned.length,
            enabled: this.cachedData?.enabled !== false
          });
        } else if (message.action === 'TOGGLE_ENABLED') {
          const newEnabled = message.enabled;
          StorageService.setEnabled(newEnabled).then(() => {
            sendResponse({ success: true });
          });
          return true;
        }
      });
    }

    // Escuta alterações vindas do Popup ou storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((_changes, areaName) => {
        if (areaName === 'local') {
          console.log('%c[ML Organizer 💾]%c Alteração de storage detectada, sincronizando...', 'color: #3483fa; font-weight: bold;', 'color: auto;');
          StorageService.getData().then((data) => {
            const wasEnabled = this.cachedData?.enabled !== false;
            const isEnabled = data.enabled !== false;
            this.cachedData = data;

            if (!isEnabled) {
              this.teardown();
              this.renderFloatingEnableButton();
            } else {
              this.removeFloatingEnableButton();
              if (!wasEnabled) {
                this.refresh(true);
              } else {
                this.applyFilterAndRender();
              }
            }
          });
        }
      });
    }
  }

  /**
   * Remove completamente todos os elementos da extensão e restaura o DOM nativo do ML
   */
  static teardown(): void {
    const toolbar = document.getElementById('ml-cart-organizer-toolbar');
    if (toolbar) toolbar.remove();

    document.querySelectorAll('.ml-item-tag-widget').forEach((w) => w.remove());

    document.querySelectorAll('.ml-cart-item-hidden').forEach((el) => {
      el.classList.remove('ml-cart-item-hidden');
    });
    document.querySelectorAll('.ml-cart-group-hidden').forEach((el) => {
      el.classList.remove('ml-cart-group-hidden');
    });
    document.querySelectorAll('.ml-card-wrapped-container').forEach((el) => {
      el.classList.remove('ml-card-wrapped-container');
    });

    UIComponents.closePopover();
  }

  static renderFloatingEnableButton(): void {
    if (document.getElementById('ml-tag-floating-enable-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'ml-tag-floating-enable-btn';
    btn.className = 'ml-tag-floating-enable-btn';
    btn.type = 'button';
    btn.innerHTML = 'Ativar Tags';
    btn.title = 'Reativar o ML Cart Organizer no carrinho';
    btn.addEventListener('click', async () => {
      btn.remove();
      await StorageService.setEnabled(true);
      this.cachedData = await StorageService.getData();
      await this.refresh(true);
    });
    document.body.appendChild(btn);
  }

  static removeFloatingEnableButton(): void {
    const btn = document.getElementById('ml-tag-floating-enable-btn');
    if (btn) btn.remove();
  }

  /**
   * Varre o carrinho e renderiza os elementos
   */
  static async refresh(updateSnapshots = false): Promise<void> {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      if (!this.cachedData) {
        this.cachedData = await StorageService.getData();
      }

      if (this.cachedData.enabled === false) {
        this.teardown();
        this.renderFloatingEnableButton();
        this.isUpdating = false;
        return;
      }

      const scannedItems = DomParser.scanCartItems(this.cachedData);
      if (scannedItems.length === 0) {
        this.isUpdating = false;
        return;
      }

      console.log(
        `%c[ML Organizer 🔍]%c Varredura concluída: ${scannedItems.length} cards de produtos identificados no carrinho.`,
        'color: #008744; font-weight: bold;',
        'color: auto;'
      );

      // Grava os snapshots de preço em lote se solicitado
      if (updateSnapshots || !this.cachedData) {
        console.log('%c[ML Organizer 📊]%c Gravando snapshots de preço dos produtos...', 'color: #008744;', 'color: auto;');
        this.cachedData = await StorageService.batchRecordItemSnapshots(
          scannedItems.map((item) => ({
            id: item.id,
            title: item.title,
            url: item.url,
            price: item.price
          }))
        );
      }

      const storageData = this.cachedData || (await StorageService.getData());
      this.cachedData = storageData;

      // Monta e posiciona a barra de tags no topo
      this.mountToolbar(scannedItems);

      // Renderiza os widgets nos cards e aplica filtros
      this.applyFilterAndRender(scannedItems);
    } catch (err) {
      console.error('[ML Organizer ❌] Erro ao atualizar carrinho:', err);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Aplica o filtro de visibilidade nos cards e grupos de vendedores de forma instantânea
   */
  static applyFilterAndRender(items?: ReturnType<typeof DomParser.scanCartItems>): void {
    if (!this.cachedData) return;

    const storageData = this.cachedData;
    const currentItems = items || DomParser.scanCartItems(storageData);
    const activeFilter = storageData.activeFilter ? storageData.activeFilter.replace(/^#/, '') : null;

    let visibleCount = 0;
    let visibleSubtotal = 0;
    let selectedCount = 0;

    // 1. Atualiza estado de seleção e filtra os cards individuais
    for (const item of currentItems) {
      item.isSelected = DomParser.isItemChecked(item.element);
      if (item.isSelected) {
        selectedCount++;
      }

      const itemData = StorageService.resolveItemData(item.id, item.candidateIds, item.title, storageData);
      const tags = (itemData?.tags || []).map((t) => t.replace(/^#/, ''));

      let isVisible = true;
      if (activeFilter === '__SELECTED__') {
        isVisible = !!item.isSelected;
      } else if (activeFilter === '__UNTAGGED__') {
        isVisible = tags.length === 0;
      } else if (activeFilter !== null) {
        isVisible = tags.includes(activeFilter);
      }

      if (isVisible) {
        item.element.classList.remove('ml-cart-item-hidden');
        visibleCount++;
        const effectivePrice = item.price > 0 ? item.price : (itemData?.currentPrice || 0);
        visibleSubtotal += effectivePrice;
      } else {
        item.element.classList.add('ml-cart-item-hidden');
      }

      // Renderiza o rodapé/footer do produto com fallback seguro
      const effectiveItemData = itemData || {
        id: item.id,
        title: item.title,
        url: item.url,
        currentPrice: item.price,
        priceHistory: item.price > 0 ? [{ date: new Date().toISOString(), price: item.price }] : [],
        tags: [],
        updatedAt: new Date().toISOString()
      };

      const targetId = effectiveItemData.id || item.id;

      UIComponents.renderItemWidget(
        item.element,
        effectiveItemData,
        storageData.tags,
        async (tag) => {
          console.log(`%c[ML Organizer 🏷️]%c Tag "${tag}" alternada no item ${targetId}`, 'color: #3483fa;', 'color: auto;');
          await StorageService.toggleTag(targetId, tag, item.candidateIds, item.title, item.url, item.price);
          this.cachedData = await StorageService.getData();
          this.applyFilterAndRender();
        },
        async (newTag) => {
          console.log(`%c[ML Organizer ➕]%c Nova tag "${newTag}" criada e associada ao item ${targetId}`, 'color: #3483fa;', 'color: auto;');
          await StorageService.addTag(newTag);
          await StorageService.toggleTag(targetId, newTag, item.candidateIds, item.title, item.url, item.price);
          this.cachedData = await StorageService.getData();
          this.applyFilterAndRender();
        }
      );
    }

    // Limpeza global preventiva de nós duplicados ou classes em sub-elementos internos
    document.querySelectorAll('[class*="cl-item-card__"] > .ml-item-tag-widget').forEach((el) => el.remove());
    document.querySelectorAll('[class*="cl-item-card__"].ml-card-wrapped-container').forEach((el) => {
      el.classList.remove('ml-card-wrapped-container');
    });

    // 2. Oculta TODOS os blocos de vendedores que não têm nenhum produto visível
    const allGroupElements = new Set<HTMLElement>();
    currentItems.forEach((item) => {
      if (item.groupElement) allGroupElements.add(item.groupElement);
    });

    const cardsListChildren = Array.from(
      document.querySelectorAll<HTMLElement>('.cl-cards-list > *, [class*="cl-cards-list"] > *')
    );
    cardsListChildren.forEach((child) => {
      if (child.id !== 'ml-cart-organizer-toolbar' && !child.classList.contains('ml-tag-toolbar-container')) {
        allGroupElements.add(child);
      }
    });

    // Adiciona todos os blocos oficiais de vendedores (.cl-grouped-card raiz)
    document.querySelectorAll<HTMLElement>('.cl-grouped-card').forEach((el) => {
      const classes = Array.from(el.classList);
      if (
        classes.includes('cl-grouped-card') &&
        !classes.some((c) => c.startsWith('cl-grouped-card__')) &&
        el.id !== 'ml-cart-organizer-toolbar' &&
        !el.classList.contains('ml-tag-toolbar-container')
      ) {
        allGroupElements.add(el);
      }
    });

    let hiddenGroupsCount = 0;
    allGroupElements.forEach((groupEl) => {
      if (activeFilter === null) {
        groupEl.classList.remove('ml-cart-group-hidden');
        return;
      }

      // Procura itens reconhecidos dentro deste bloco de vendedor (.cl-item-card raiz)
      const itemsInGroup = Array.from(
        groupEl.querySelectorAll<HTMLElement>('.cl-item-card')
      ).filter((el) => {
        const classes = Array.from(el.classList);
        return classes.includes('cl-item-card') && !classes.some((c) => c.startsWith('cl-item-card__'));
      });

      if (itemsInGroup.length > 0) {
        const visibleItemsInGroup = itemsInGroup.filter((el) => !el.classList.contains('ml-cart-item-hidden'));
        if (visibleItemsInGroup.length === 0) {
          groupEl.classList.add('ml-cart-group-hidden');
          hiddenGroupsCount++;
        } else {
          groupEl.classList.remove('ml-cart-group-hidden');
        }
      } else {
        // Bloco de vendedor que possui cabeçalho ("Produtos de..."), mas nenhum item visível
        if (groupEl.querySelector('.cl-card-header, [class*="cl-card-header"]')) {
          groupEl.classList.add('ml-cart-group-hidden');
          hiddenGroupsCount++;
        }
      }
    });

    const filterLabel =
      activeFilter === '__SELECTED__'
        ? 'Selecionados'
        : activeFilter === '__UNTAGGED__'
        ? 'Sem tag'
        : activeFilter || 'Todos';

    const subtotalFormatted = visibleSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    console.log(
      `%c[ML Organizer 🎯]%c Filtro: "${filterLabel}" | Visíveis: ${visibleCount}/${currentItems.length} (Selecionados: ${selectedCount}) | Grupos vazios ocultados: ${hiddenGroupsCount} | Subtotal: ${subtotalFormatted}`,
      'color: #3483fa; font-weight: bold;',
      'color: auto;'
    );

    // 3. Atualiza os dados da barra de ferramentas no topo (sem recriar os elementos)
    this.mountToolbar(currentItems, visibleCount, visibleSubtotal, selectedCount);
  }

  /**
   * Garante que a barra de ferramentas está inserida e atualizada no topo
   */
  private static mountToolbar(
    items: ReturnType<typeof DomParser.scanCartItems>,
    visibleCount?: number,
    visibleSubtotal?: number,
    selectedCount?: number
  ): void {
    if (!this.cachedData) return;

    const count = visibleCount !== undefined ? visibleCount : items.length;
    const subtotal = visibleSubtotal !== undefined
      ? visibleSubtotal
      : items.reduce((acc, curr) => {
          const itemData = this.cachedData?.items[curr.id];
          const price = curr.price > 0 ? curr.price : (itemData?.currentPrice || 0);
          return acc + price;
        }, 0);

    const selected = selectedCount !== undefined
      ? selectedCount
      : items.filter((i) => i.isSelected ?? DomParser.isItemChecked(i.element)).length;

    const toolbar = UIComponents.renderToolbar(
      this.cachedData,
      items.length,
      count,
      subtotal,
      async (selectedTag) => {
        if (!this.cachedData) return;
        const cleanTag = selectedTag ? selectedTag.replace(/^#/, '') : null;
        console.log(`%c[ML Organizer 👆]%c Tag selecionada na barra: "${cleanTag || 'Todos'}"`, 'color: #3483fa;', 'color: auto;');
        this.cachedData.activeFilter = cleanTag;
        this.applyFilterAndRender();
        await StorageService.setActiveFilter(cleanTag);
      },
      async (newTag) => {
        if (!this.cachedData) return;
        const cleanTag = newTag.replace(/^#/, '');
        console.log(`%c[ML Organizer ➕]%c Nova tag criada pela barra: "${cleanTag}"`, 'color: #3483fa;', 'color: auto;');
        await StorageService.addTag(cleanTag);
        this.cachedData = await StorageService.getData();
        this.cachedData.activeFilter = cleanTag;
        this.applyFilterAndRender();
        await StorageService.setActiveFilter(cleanTag);
      },
      async (tagToDelete) => {
        if (!this.cachedData) return;
        const cleanTag = tagToDelete.replace(/^#/, '');
        console.log(`%c[ML Organizer 🗑️]%c Tag excluída: "${cleanTag}"`, 'color: #d93838; font-weight: bold;', 'color: auto;');
        await StorageService.deleteTag(cleanTag);
        this.cachedData = await StorageService.getData();
        this.applyFilterAndRender();
      },
      items.map((i) => i.id),
      async () => {
        console.log('%c[ML Organizer 🔄]%c Resetando histórico de preços...', 'color: #3483fa;', 'color: auto;');
        await StorageService.resetPriceHistory();
        this.cachedData = await StorageService.getData();
        this.applyFilterAndRender();
      },
      async () => {
        if (
          window.confirm(
            'Deseja desativar o organizador de tags? Você poderá reativá-lo a qualquer momento pelo botão no canto da tela ou pelo ícone da extensão.'
          )
        ) {
          console.log('%c[ML Organizer ⏸️]%c Desativando extensão a pedido do usuário...', 'color: #d93838;', 'color: auto;');
          await StorageService.setEnabled(false);
          this.cachedData = await StorageService.getData();
          this.teardown();
          this.renderFloatingEnableButton();
        }
      },
      selected
    );

    const existingToolbar = document.getElementById('ml-cart-organizer-toolbar');
    const topPoint = DomParser.findTopInsertionPoint();

    if (topPoint) {
      if (!existingToolbar) {
        topPoint.parent.insertBefore(toolbar, topPoint.referenceNode);
      } else if (
        existingToolbar.parentElement !== topPoint.parent ||
        existingToolbar.nextSibling !== topPoint.referenceNode
      ) {
        topPoint.parent.insertBefore(existingToolbar, topPoint.referenceNode);
      }
    }
  }

  private static setupCheckboxListeners(): void {
    let debounceTimer: number | null = null;
    let secondTimer: number | null = null;

    const handleCheckboxEvent = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isCheckbox =
        target.matches('input[type="checkbox"], [data-andes-checkbox-input], .andes-checkbox__input') ||
        !!target.closest('.andes-checkbox, [data-andes-checkbox], .poly-card__checkbox, .cl-card-header__checkbox');

      if (isCheckbox) {
        if (debounceTimer) window.clearTimeout(debounceTimer);
        if (secondTimer) window.clearTimeout(secondTimer);

        debounceTimer = window.setTimeout(() => {
          if (this.cachedData?.enabled !== false) {
            this.applyFilterAndRender();
          }
        }, 70);

        // Segundo disparo leve para garantir sincronia após atualização assíncrona do Mercado Livre
        secondTimer = window.setTimeout(() => {
          if (this.cachedData?.enabled !== false) {
            this.applyFilterAndRender();
          }
        }, 250);
      }
    };

    document.addEventListener('change', handleCheckboxEvent, true);
    document.addEventListener('click', handleCheckboxEvent, true);
  }

  private static setupMutationObserver(): void {
    const observer = new MutationObserver((mutations) => {
      if (this.isUpdating) return;
      if (this.cachedData?.enabled === false) return;

      const isInternal = mutations.every((m) => {
        const el = m.target as HTMLElement;
        if (el.closest?.('#ml-cart-organizer-toolbar, .ml-item-tag-widget, .ml-tag-popover')) {
          return true;
        }
        for (let i = 0; i < m.addedNodes.length; i++) {
          const node = m.addedNodes[i] as HTMLElement;
          if (
            node.classList?.contains?.('ml-item-tag-widget') ||
            node.id === 'ml-cart-organizer-toolbar' ||
            node.classList?.contains?.('ml-tag-popover')
          ) {
            return true;
          }
        }
        return false;
      });

      if (isInternal) return;

      console.log('%c[ML Organizer 👁️]%c Mudança genuína no DOM do carrinho detectada (re-render agendado)...', 'color: #888;', 'color: auto;');

      if (this.debounceTimer) {
        window.clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = window.setTimeout(() => {
        console.log('%c[ML Organizer 🔄]%c Executando re-render após mutação do carrinho...', 'color: #888;', 'color: auto;');
        this.refresh(false);
      }, 500);
    });

    const targetContainer = document.querySelector('.cart-list, [class*="cart-list"], main') || document.body;
    observer.observe(targetContainer, {
      childList: true,
      subtree: true
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CartOrganizerController.init());
} else {
  CartOrganizerController.init();
}
