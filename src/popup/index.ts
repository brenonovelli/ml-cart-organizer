import { StorageService } from '../services/storage';
import { StorageData } from '../types';

class PopupController {
  static async init(): Promise<void> {
    await this.render();
    this.setupListeners();
  }

  static async render(): Promise<void> {
    const data: StorageData = await StorageService.getData();

    // 1. Calculate Stats
    const items = Object.values(data.items || {});
    const itemCount = items.length;
    const tagCount = (data.tags || []).length;

    let priceDropsCount = 0;
    for (const item of items) {
      if (item.priceHistory && item.priceHistory.length > 1) {
        const initial = item.priceHistory[0].price;
        if (item.currentPrice < initial - 0.01) {
          priceDropsCount++;
        }
      }
    }

    const statItems = document.getElementById('stat-items');
    const statTags = document.getElementById('stat-tags');
    const statPriceDrops = document.getElementById('stat-price-drops');

    if (statItems) statItems.textContent = String(itemCount);
    if (statTags) statTags.textContent = String(tagCount);
    if (statPriceDrops) statPriceDrops.textContent = String(priceDropsCount);

    // Atualiza estado do switch toggle e banner
    const isEnabled = data.enabled !== false;
    const toggle = document.getElementById('extension-toggle') as HTMLInputElement;
    const toggleText = document.getElementById('toggle-status-text');
    const disabledBanner = document.getElementById('disabled-banner');

    if (toggle) {
      toggle.checked = isEnabled;
    }
    if (toggleText) {
      toggleText.textContent = isEnabled ? 'Ativo' : 'Pausado';
      toggleText.className = `toggle-text ${isEnabled ? 'active' : 'inactive'}`;
    }
    if (disabledBanner) {
      disabledBanner.style.display = isEnabled ? 'none' : 'block';
    }

    // Tenta obter contagem exata da aba do carrinho ativa no momento
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          if (activeTab && activeTab.id && activeTab.url && activeTab.url.includes('mercadolivre.com.br/gz/cart')) {
            chrome.tabs.sendMessage(activeTab.id, { action: 'GET_CART_STATS' }, (response) => {
              if (chrome.runtime.lastError) return;
              if (response && typeof response.itemCount === 'number') {
                if (statItems) statItems.textContent = String(response.itemCount);
              }
            });
          }
        });
      }
    } catch {
      // Ignora erro se contexto de extensão não permitir
    }

    // 2. Render Tags
    const tagsContainer = document.getElementById('tags-list');
    if (tagsContainer) {
      if (data.tags.length === 0) {
        tagsContainer.innerHTML = '<span style="color: #999; font-size: 11px;">Nenhuma tag cadastrada.</span>';
      } else {
        const sortedTags = (data.tags || [])
          .map((t) => t.replace(/^#/, ''))
          .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

        tagsContainer.innerHTML = sortedTags
          .map(
            (tag) => `
            <span class="tag-item">
              ${tag}
              <span class="delete-tag" data-tag="${tag}" title="Excluir tag">×</span>
            </span>
          `
          )
          .join('');

        const deleteButtons = tagsContainer.querySelectorAll('.delete-tag');
        deleteButtons.forEach((btn) => {
          btn.addEventListener('click', async () => {
            const tag = btn.getAttribute('data-tag');
            if (tag && window.confirm(`Deseja realmente excluir a tag "${tag}"?`)) {
              await StorageService.deleteTag(tag);
              await this.render();
            }
          });
        });
      }
    }
  }

  static setupListeners(): void {
    const toggle = document.getElementById('extension-toggle') as HTMLInputElement;
    const toggleText = document.getElementById('toggle-status-text');
    const disabledBanner = document.getElementById('disabled-banner');

    if (toggle) {
      toggle.addEventListener('change', async () => {
        const enabled = toggle.checked;
        await StorageService.setEnabled(enabled);

        if (toggleText) {
          toggleText.textContent = enabled ? 'Ativo' : 'Pausado';
          toggleText.className = `toggle-text ${enabled ? 'active' : 'inactive'}`;
        }
        if (disabledBanner) {
          disabledBanner.style.display = enabled ? 'none' : 'block';
        }

        // Envia mensagem direta para a aba ativa se for a página do carrinho
        try {
          if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              const activeTab = tabs[0];
              if (activeTab && activeTab.id) {
                chrome.tabs.sendMessage(activeTab.id, { action: 'TOGGLE_ENABLED', enabled });
              }
            });
          }
        } catch {
          // Ignora se não houver aba aberta
        }
      });
    }

    const input = document.getElementById('new-tag-input') as HTMLInputElement;
    const btnAdd = document.getElementById('btn-add-tag');

    const handleAdd = async () => {
      if (input && input.value.trim()) {
        await StorageService.addTag(input.value.trim());
        input.value = '';
        await this.render();
      }
    };

    if (btnAdd) {
      btnAdd.addEventListener('click', handleAdd);
    }

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAdd();
        }
      });
    }

    // Export JSON
    const btnExport = document.getElementById('btn-export');
    if (btnExport) {
      btnExport.addEventListener('click', async () => {
        const json = await StorageService.exportBackup();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ml-carrinho-tags-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Import JSON
    const btnImport = document.getElementById('btn-import');
    const fileImport = document.getElementById('file-import') as HTMLInputElement;

    if (btnImport && fileImport) {
      btnImport.addEventListener('click', () => {
        fileImport.click();
      });

      fileImport.addEventListener('change', async () => {
        const file = fileImport.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          if (content) {
            const success = await StorageService.importBackup(content);
            if (success) {
              alert('Backup importado com sucesso!');
              await this.render();
            } else {
              alert('Erro ao importar backup: formato de arquivo inválido.');
            }
          }
        };
        reader.readAsText(file);
      });
    }

    // Reset Price History
    const btnResetPrices = document.getElementById('btn-reset-prices');
    if (btnResetPrices) {
      btnResetPrices.addEventListener('click', async () => {
        if (
          window.confirm(
            'Deseja resetar o histórico de preços? O preço atual de cada produto se tornará a nova base de monitoramento. Todas as suas tags serão mantidas intactas.'
          )
        ) {
          await StorageService.resetPriceHistory();
          alert('Histórico de preços resetado com sucesso!');
          await this.render();
        }
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  PopupController.init();
});
