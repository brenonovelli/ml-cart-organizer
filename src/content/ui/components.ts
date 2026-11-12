import { StorageData, ItemData } from '../../types';
import { StorageService } from '../../services/storage';
import { INJECTED_STYLES } from './styles';

export class UIComponents {
  private static activePopover: HTMLElement | null = null;

  static injectStyles(): void {
    if (document.getElementById('ml-cart-organizer-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'ml-cart-organizer-styles';
    styleEl.textContent = INJECTED_STYLES;
    document.head.appendChild(styleEl);

    document.addEventListener('click', (e) => {
      if (this.activePopover && !this.activePopover.contains(e.target as Node)) {
        this.closePopover();
      }
    });
  }

  static closePopover(): void {
    if (this.activePopover) {
      this.activePopover.remove();
      this.activePopover = null;
    }
  }

  /**
   * Renderiza ou atualiza a barra de navegação/filtros no topo.
   * As contagens agora consideram ESTRITAMENTE os produtos presentes no carrinho atual.
   */
  static renderToolbar(
    storageData: StorageData,
    cartItemCount: number,
    visibleCount: number,
    visibleSubtotal: number,
    onSelectTag: (tag: string | null) => void,
    onAddNewTag: (tag: string) => void,
    onDeleteTag: (tag: string) => void,
    currentCartItemIds: string[] = [],
    onResetPrices?: () => void,
    onDisable?: () => void,
    selectedCount: number = 0
  ): HTMLElement {
    let container = document.getElementById('ml-cart-organizer-toolbar');
    const isNew = !container;

    if (!container) {
      container = document.createElement('section');
      container.id = 'ml-cart-organizer-toolbar';
      container.className = 'ml-tag-toolbar-container';
    }

    const formattedSubtotal = visibleSubtotal.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    const activeFilter = storageData.activeFilter ? storageData.activeFilter.replace(/^#/, '') : null;

    // Contagem de tags ESTRITAMENTE baseada nos itens presentes no carrinho agora
    const tagCounts: Record<string, number> = {};
    let untaggedCount = 0;

    const itemIdsToCount = currentCartItemIds.length > 0
      ? currentCartItemIds
      : Object.keys(storageData.items);

    for (const id of itemIdsToCount) {
      const item = StorageService.resolveItemData(id, [], '', storageData);
      const tags = (item?.tags || []).map((t) => t.replace(/^#/, ''));
      if (tags.length === 0) {
        untaggedCount++;
      } else {
        tags.forEach((t) => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      }
    }

    const cleanTags = storageData.tags
      .map((t) => t.replace(/^#/, ''))
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
    const existingTagsHash = container.getAttribute('data-tags-list') || '';
    const currentTagsHash = cleanTags.join(',');

    if (
      !isNew &&
      existingTagsHash === currentTagsHash &&
      container.querySelector('.ml-tag-toolbar-header') &&
      container.querySelector('[data-tag="__SELECTED__"]')
    ) {
      const subtotalBox = container.querySelector('.ml-tag-subtotal-box');
      if (subtotalBox) {
        subtotalBox.innerHTML = `
          <span>Subtotal (${visibleCount} ${visibleCount === 1 ? 'item' : 'itens'}):</span>
          <strong>${formattedSubtotal}</strong>
        `;
      }

      const pills = container.querySelectorAll<HTMLButtonElement>('.ml-tag-pill');
      pills.forEach((pill) => {
        const tag = pill.getAttribute('data-tag');
        const isActive =
          (tag === 'ALL' && activeFilter === null) ||
          (tag === '__SELECTED__' && activeFilter === '__SELECTED__') ||
          (tag === '__UNTAGGED__' && activeFilter === '__UNTAGGED__') ||
          tag === activeFilter;

        pill.classList.toggle('active', isActive);

        const countSpan = pill.querySelector('.pill-count');
        if (countSpan) {
          if (tag === 'ALL') countSpan.textContent = String(cartItemCount);
          else if (tag === '__SELECTED__') countSpan.textContent = String(selectedCount);
          else if (tag === '__UNTAGGED__') countSpan.textContent = String(untaggedCount);
          else if (tag) {
            countSpan.textContent = String(tagCounts[tag] || 0);
          }
        }
      });

      return container;
    }

    container.setAttribute('data-tags-list', currentTagsHash);
    container.innerHTML = `
      <div class="ml-tag-toolbar-header">
        <div class="ml-tag-toolbar-title">
          <span>Minhas tags</span>
          <span class="ml-tag-toolbar-title-badge">Filtro</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" class="ml-tag-btn-toolbar" id="ml-btn-reset-prices" title="Redefinir preço base de monitoramento de todos os produtos">
            🔄 Resetar Preços
          </button>
          <button type="button" class="ml-tag-btn-toolbar" id="ml-btn-disable-widget" title="Desativar temporariamente o organizador e filtros">
            👁️ Desativar
          </button>
          <div class="ml-tag-subtotal-box">
            <span>Subtotal (${visibleCount} ${visibleCount === 1 ? 'item' : 'itens'}):</span>
            <strong>${formattedSubtotal}</strong>
          </div>
        </div>
      </div>
      <div class="ml-tag-list" id="ml-tags-list-container">
        <button type="button" class="ml-tag-pill ${activeFilter === null ? 'active' : ''}" data-tag="ALL">
          Todos <span class="pill-count">${cartItemCount}</span>
        </button>
        <button type="button" class="ml-tag-pill ${activeFilter === '__SELECTED__' ? 'active' : ''}" data-tag="__SELECTED__">
          Selecionados <span class="pill-count">${selectedCount}</span>
        </button>
        <button type="button" class="ml-tag-pill ${activeFilter === '__UNTAGGED__' ? 'active' : ''}" data-tag="__UNTAGGED__">
          Sem tag <span class="pill-count">${untaggedCount}</span>
        </button>
        ${cleanTags
          .map(
            (tag) => `
          <button type="button" class="ml-tag-pill ${activeFilter === tag ? 'active' : ''}" data-tag="${tag}">
            ${tag} <span class="pill-count">${tagCounts[tag] || 0}</span>
            <span class="ml-tag-delete-btn" data-delete-tag="${tag}" title="Excluir tag ${tag}">×</span>
          </button>
        `
          )
          .join('')}
        <button type="button" class="ml-tag-btn-add" id="ml-btn-create-tag">
          + Nova Tag
        </button>
      </div>
    `;

    const pills = container.querySelectorAll('.ml-tag-pill');
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const tag = pill.getAttribute('data-tag');
        if (tag === 'ALL') {
          onSelectTag(null);
        } else if (tag === activeFilter) {
          onSelectTag(null);
        } else {
          onSelectTag(tag);
        }
      });

      const tag = pill.getAttribute('data-tag');
      if (tag && tag !== 'ALL' && tag !== '__UNTAGGED__' && tag !== '__SELECTED__') {
        pill.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          if (window.confirm(`Deseja realmente excluir a tag "${tag}"? Ela será removida de todos os produtos.`)) {
            onDeleteTag(tag);
          }
        });
      }
    });

    const deleteButtons = container.querySelectorAll('.ml-tag-delete-btn');
    deleteButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = btn.getAttribute('data-delete-tag');
        if (tag && window.confirm(`Deseja realmente excluir a tag "${tag}"? Ela será removida de todos os produtos.`)) {
          onDeleteTag(tag);
        }
      });
    });

    const btnAdd = container.querySelector('#ml-btn-create-tag');
    if (btnAdd) {
      btnAdd.addEventListener('click', (e) => {
        e.stopPropagation();
        const newTag = window.prompt('Nome da nova tag (ex: Supermercado, Tech, Presentes):');
        if (newTag) {
          onAddNewTag(newTag.trim().replace(/^#/, ''));
        }
      });
    }

    const btnResetPrices = container.querySelector('#ml-btn-reset-prices');
    if (btnResetPrices && onResetPrices) {
      btnResetPrices.addEventListener('click', (e) => {
        e.stopPropagation();
        if (
          window.confirm(
            'Deseja resetar o monitoramento de preço? O preço atual de cada produto se tornará a nova base de comparação. Todas as suas tags serão mantidas intactas.'
          )
        ) {
          onResetPrices();
        }
      });
    }

    const btnDisable = container.querySelector('#ml-btn-disable-widget');
    if (btnDisable && onDisable) {
      btnDisable.addEventListener('click', (e) => {
        e.stopPropagation();
        onDisable();
      });
    }

    return container;
  }

  /**
   * Renderiza o rodapé/footer do card do produto
   */
  static renderItemWidget(
    cardContainer: HTMLElement,
    itemData: ItemData,
    allTags: string[],
    onTagToggled: (tag: string) => void,
    onAddNewTag: (tag: string) => void
  ): void {
    cardContainer.classList.add('ml-card-wrapped-container');

    // 1. Limpa quaisquer widgets acidentalmente injetados em containers internos da linha
    cardContainer.querySelectorAll('[class*="cl-item-card__"] .ml-item-tag-widget').forEach((w) => w.remove());
    cardContainer.querySelectorAll('[class*="cl-item-card__"].ml-card-wrapped-container').forEach((el) => {
      el.classList.remove('ml-card-wrapped-container');
    });

    // 2. Garante que só existe UM widget como filho direto deste card raiz
    const directWidgets = Array.from(cardContainer.children).filter((c) =>
      c.classList.contains('ml-item-tag-widget')
    );
    if (directWidgets.length > 1) {
      directWidgets.slice(1).forEach((w) => w.remove());
    }

    let widget = directWidgets[0] as HTMLElement;
    if (!widget) {
      widget = document.createElement('div');
      widget.className = 'ml-item-tag-widget';
      cardContainer.appendChild(widget);
    }

    const cleanTags = (itemData.tags || [])
      .map((t) => t.replace(/^#/, ''))
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
    const tagsKey = cleanTags.slice().sort().join(',');
    const allTagsKey = allTags.map((t) => t.replace(/^#/, '')).sort().join(',');
    const currentHash = `${tagsKey}|${itemData.currentPrice}|${allTagsKey}`;
    if (widget.getAttribute('data-render-hash') === currentHash) {
      return;
    }
    widget.setAttribute('data-render-hash', currentHash);

    let priceBadgeHtml = '<span class="ml-price-badge ml-price-same">⚪ Preço monitorado</span>';
    const validHistory = (itemData.priceHistory || []).filter((h) => h.price > 0);

    if (validHistory.length > 1 && itemData.currentPrice > 0) {
      const firstPrice = validHistory[0].price;
      if (firstPrice > 0) {
        const diff = itemData.currentPrice - firstPrice;

        if (diff < -0.01) {
          const pct = Math.round(Math.abs(diff / firstPrice) * 100);
          const diffFmt = Math.abs(diff).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          priceBadgeHtml = `<span class="ml-price-badge ml-price-down" title="Preço inicial: R$ ${firstPrice.toFixed(2)}">🟢 Baixou ${diffFmt} (-${pct}%)</span>`;
        } else if (diff > 0.01) {
          const pct = Math.round((diff / firstPrice) * 100);
          const diffFmt = diff.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          priceBadgeHtml = `<span class="ml-price-badge ml-price-up" title="Preço inicial: R$ ${firstPrice.toFixed(2)}">🔴 Subiu ${diffFmt} (+${pct}%)</span>`;
        }
      }
    }

    widget.innerHTML = `
      <div class="ml-item-tags-container">
        <span class="ml-item-tags-label">Tags:</span>
        ${cleanTags
          .map(
            (tag) => `
          <span class="ml-item-chip">
            ${tag}
            <span class="remove-tag" data-tag="${tag}" title="Remover tag deste produto">×</span>
          </span>
        `
          )
          .join('')}
        <button type="button" class="ml-item-add-tag-trigger" data-item-id="${itemData.id}">
          + Tag
        </button>
      </div>
      <div>
        ${priceBadgeHtml}
      </div>
    `;

    const removeButtons = widget.querySelectorAll('.remove-tag');
    removeButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = btn.getAttribute('data-tag');
        if (tag) onTagToggled(tag);
      });
    });

    const addTrigger = widget.querySelector('.ml-item-add-tag-trigger');
    if (addTrigger) {
      addTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openTagPopover(addTrigger as HTMLElement, itemData, allTags, onTagToggled, onAddNewTag);
      });
    }
  }

  /**
   * Menu flutuante para vincular tags ao produto
   */
  private static openTagPopover(
    anchor: HTMLElement,
    itemData: ItemData,
    allTags: string[],
    onTagToggled: (tag: string) => void,
    onAddNewTag: (tag: string) => void
  ): void {
    this.closePopover();

    const popover = document.createElement('div');
    popover.className = 'ml-tag-popover';

    const rect = anchor.getBoundingClientRect();
    popover.style.top = `${window.scrollY + rect.bottom + 6}px`;
    popover.style.left = `${window.scrollX + rect.left}px`;

    const currentTags = new Set((itemData.tags || []).map((t) => t.replace(/^#/, '')));
    const cleanAllTags = allTags
      .map((t) => t.replace(/^#/, ''))
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

    const tagsHtml = cleanAllTags.length
      ? cleanAllTags
          .map((tag) => {
            const checked = currentTags.has(tag) ? 'checked' : '';
            return `
            <label class="ml-tag-popover-item">
              <input type="checkbox" data-tag="${tag}" ${checked} />
              <span>${tag}</span>
            </label>
          `;
          })
          .join('')
      : '<div style="color: #888; padding: 4px;">Nenhuma tag criada</div>';

    popover.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 13px;">Vincular tags:</div>
      <div class="ml-tag-popover-list">
        ${tagsHtml}
      </div>
      <div class="ml-tag-popover-input-row">
        <input type="text" class="ml-tag-popover-input" placeholder="Nova tag..." />
        <button type="button" class="ml-tag-popover-btn">Criar</button>
      </div>
    `;

    document.body.appendChild(popover);
    this.activePopover = popover;

    const checkboxes = popover.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    checkboxes.forEach((cb) => {
      cb.addEventListener('change', () => {
        const tag = cb.getAttribute('data-tag');
        if (tag) onTagToggled(tag);
      });
    });

    const input = popover.querySelector<HTMLInputElement>('.ml-tag-popover-input');
    const btnCreate = popover.querySelector<HTMLButtonElement>('.ml-tag-popover-btn');

    const handleCreate = () => {
      if (input && input.value.trim()) {
        const newTag = input.value.trim().replace(/^#/, '');
        this.closePopover();
        onAddNewTag(newTag);
      }
    };

    if (btnCreate) {
      btnCreate.addEventListener('click', (e) => {
        e.stopPropagation();
        handleCreate();
      });
    }

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCreate();
        }
      });
    }
  }
}
