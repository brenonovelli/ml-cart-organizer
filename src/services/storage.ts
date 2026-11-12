import { StorageData, ItemData, PriceRecord } from '../types';

export const STORAGE_KEY = 'ml_cart_organizer_data';

const DEFAULT_STORAGE: StorageData = {
  tags: ['Favoritos', 'Supermercado', 'Tech'],
  items: {},
  activeFilter: null,
  enabled: true,
  aliasMap: {}
};

export class StorageService {
  /**
   * Remove registros duplicados/aliases em data.items provocados por múltiplos candidateIds,
   * unificando tags e histórico no item canônico e populando o aliasMap.
   */
  static deduplicateStorage(data: StorageData): boolean {
    let changed = false;
    data.aliasMap = data.aliasMap || {};
    data.enabled = data.enabled !== false;
    data.tags = (data.tags || [])
      .map((t) => t.replace(/^#/, ''))
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

    const rawItems = Object.values(data.items || {});
    if (rawItems.length === 0) return false;

    // Normaliza cada item e agrupa por chave canônica
    const groups = new Map<string, ItemData[]>();

    for (const item of rawItems) {
      if (!item || !item.id) continue;

      let canonicalKey = '';
      const mlbMatch = item.id.match(/^MLB[UFPB]?[-_]?(\d+)/i) || (item.url && item.url.match(/MLB[UFPB]?[-_]?(\d+)/i));

      if (mlbMatch) {
        canonicalKey = `MLB_${mlbMatch[1]}`;
      } else if (item.title && item.title.trim().length > 6) {
        const normTitle = item.title.trim().toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ');
        canonicalKey = `TITLE_${normTitle}`;
      } else {
        canonicalKey = `ID_${item.id}`;
      }

      if (!groups.has(canonicalKey)) {
        groups.set(canonicalKey, []);
      }
      groups.get(canonicalKey)!.push(item);
    }

    const cleanedItems: Record<string, ItemData> = {};

    for (const [, group] of groups.entries()) {
      if (group.length === 1) {
        const single = group[0];
        cleanedItems[single.id] = single;
        continue;
      }

      // Múltiplos registros representam o mesmo produto físico!
      changed = true;

      // Prioridade do ID primário:
      // 1. ID que é um MLB canônico limpo (ex: MLB123456789)
      // 2. Possui mais tags
      // 3. Possui mais histórico de preço
      group.sort((a, b) => {
        const aCleanMlb = /^MLB\d+$/i.test(a.id) ? 1 : 0;
        const bCleanMlb = /^MLB\d+$/i.test(b.id) ? 1 : 0;
        if (aCleanMlb !== bCleanMlb) return bCleanMlb - aCleanMlb;

        const aTags = (a.tags || []).length;
        const bTags = (b.tags || []).length;
        if (aTags !== bTags) return bTags - aTags;

        return (b.priceHistory || []).length - (a.priceHistory || []).length;
      });

      const primary = { ...group[0] };
      const mergedTags = new Set<string>((primary.tags || []).map((t) => t.replace(/^#/, '')));
      const mergedHistory: PriceRecord[] = [...(primary.priceHistory || []).filter((h) => h.price > 0)];

      for (let i = 1; i < group.length; i++) {
        const dup = group[i];
        (dup.tags || []).forEach((t) => mergedTags.add(t.replace(/^#/, '')));

        if (dup.priceHistory) {
          for (const ph of dup.priceHistory) {
            if (ph.price > 0 && !mergedHistory.some((h) => Math.abs(h.price - ph.price) < 0.01 && h.date === ph.date)) {
              mergedHistory.push(ph);
            }
          }
        }

        if ((primary.currentPrice === 0 || !primary.currentPrice) && dup.currentPrice > 0) {
          primary.currentPrice = dup.currentPrice;
        }

        data.aliasMap[dup.id] = primary.id;
      }

      mergedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      primary.priceHistory = mergedHistory;
      primary.tags = Array.from(mergedTags).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

      cleanedItems[primary.id] = primary;
    }

    if (changed || Object.keys(data.items).length !== Object.keys(cleanedItems).length) {
      data.items = cleanedItems;
      return true;
    }

    return false;
  }

  static async getData(): Promise<StorageData> {
    return new Promise((resolve) => {
      const processData = (rawData: any) => {
        const data: StorageData = {
          ...DEFAULT_STORAGE,
          ...(rawData || {})
        };

        const changed = this.deduplicateStorage(data);
        if (changed) {
          this.saveData(data);
        }

        resolve(data);
      };

      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            processData(JSON.parse(raw));
            return;
          } catch {
            // Fallback
          }
        }
        processData(DEFAULT_STORAGE);
        return;
      }

      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError || !result[STORAGE_KEY]) {
          processData(DEFAULT_STORAGE);
        } else {
          processData(result[STORAGE_KEY]);
        }
      });
    });
  }

  static async saveData(data: StorageData): Promise<void> {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        resolve();
        return;
      }

      chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
        resolve();
      });
    });
  }

  static async getTags(): Promise<string[]> {
    const data = await this.getData();
    return (data.tags || [])
      .map((t) => t.replace(/^#/, ''))
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  }

  static async addTag(tag: string): Promise<string[]> {
    const cleanTag = tag.trim().replace(/^#/, '');
    if (!cleanTag) return this.getTags();

    const data = await this.getData();
    data.tags = (data.tags || []).map((t) => t.replace(/^#/, ''));

    if (!data.tags.includes(cleanTag)) {
      data.tags.push(cleanTag);
      data.tags.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
      await this.saveData(data);
    }
    return data.tags;
  }

  static async deleteTag(tag: string): Promise<string[]> {
    const cleanTag = tag.trim().replace(/^#/, '');
    const data = await this.getData();
    data.tags = (data.tags || []).filter((t) => t.replace(/^#/, '') !== cleanTag);

    for (const id in data.items) {
      data.items[id].tags = (data.items[id].tags || [])
        .map((t) => t.replace(/^#/, ''))
        .filter((t) => t !== cleanTag);
    }

    if (data.activeFilter === cleanTag) {
      data.activeFilter = null;
    }

    await this.saveData(data);
    return data.tags;
  }

  /**
   * Salva snapshots de múltiplos produtos em lote e corrige preços inválidos (ex: R$ 0)
   */
  static async batchRecordItemSnapshots(
    items: { id: string; title: string; url: string; price: number }[]
  ): Promise<StorageData> {
    const data = await this.getData();
    const now = new Date().toISOString();
    let hasChanges = false;

    // Normaliza tags no storage
    data.tags = (data.tags || []).map((t) => t.replace(/^#/, ''));

    for (const item of items) {
      const existing = data.items[item.id];
      if (existing) {
        // Remove quaisquer tags com # antigo
        existing.tags = (existing.tags || []).map((t) => t.replace(/^#/, ''));

        // Limpa histórico inválido com preço 0
        existing.priceHistory = (existing.priceHistory || []).filter((h) => h.price > 0);

        if (item.price > 0) {
          const lastHistory = existing.priceHistory[existing.priceHistory.length - 1];
          const hasPriceChanged = !lastHistory || Math.abs(lastHistory.price - item.price) > 0.01;

          if (hasPriceChanged) {
            existing.priceHistory.push({
              date: now,
              price: item.price
            });
            hasChanges = true;
          }

          if (existing.currentPrice !== item.price) {
            existing.currentPrice = item.price;
            existing.updatedAt = now;
            hasChanges = true;
          }
        }

        if (item.title && existing.title !== item.title) {
          existing.title = item.title;
          hasChanges = true;
        }
      } else {
        const history: PriceRecord[] = item.price > 0 ? [{ date: now, price: item.price }] : [];
        data.items[item.id] = {
          id: item.id,
          title: item.title,
          url: item.url,
          currentPrice: item.price,
          priceHistory: history,
          tags: [],
          updatedAt: now
        };
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await this.saveData(data);
    }

    return data;
  }

  /**
   * Reseta o histórico de preços de todos os produtos, definindo o preço atual como a nova base.
   * Todas as tags e dados dos produtos são mantidos intactos.
   */
  static async resetPriceHistory(): Promise<void> {
    const data = await this.getData();
    const now = new Date().toISOString();

    for (const id in data.items) {
      const item = data.items[id];
      if (item.currentPrice && item.currentPrice > 0) {
        item.priceHistory = [{ date: now, price: item.currentPrice }];
      } else {
        item.priceHistory = [];
      }
      item.updatedAt = now;
    }

    await this.saveData(data);
  }

  /**
   * Obtém os dados do item com resolução profunda de aliases, sufixos de instância (_1, _2) e candidateIds.
   */
  static resolveItemData(
    id: string,
    candidateIds: string[] = [],
    title: string = '',
    data: StorageData
  ): ItemData | undefined {
    if (!data || !data.items) return undefined;

    // 1. Acesso direto por ID
    if (data.items[id]) return data.items[id];

    // 2. Acesso via aliasMap
    if (data.aliasMap && data.aliasMap[id] && data.items[data.aliasMap[id]]) {
      return data.items[data.aliasMap[id]];
    }

    // 3. Remove sufixos de instância como _1, _2, _3
    const baseId = id.replace(/_\d+$/, '');
    if (baseId !== id) {
      if (data.items[baseId]) return data.items[baseId];
      if (data.aliasMap && data.aliasMap[baseId] && data.items[data.aliasMap[baseId]]) {
        return data.items[data.aliasMap[baseId]];
      }
    }

    // 4. Procura se algum candidateId tem correspondência direta ou no aliasMap
    for (const cid of candidateIds) {
      if (data.items[cid]) return data.items[cid];
      if (data.aliasMap && data.aliasMap[cid] && data.items[data.aliasMap[cid]]) {
        return data.items[data.aliasMap[cid]];
      }
      const cBase = cid.replace(/_\d+$/, '');
      if (data.items[cBase]) return data.items[cBase];
      if (data.aliasMap && data.aliasMap[cBase] && data.items[data.aliasMap[cBase]]) {
        return data.items[data.aliasMap[cBase]];
      }
    }

    // 5. Procura por título idêntico (normalizado)
    if (title && title.length > 5) {
      const cleanTitle = title.trim().toLowerCase();
      for (const item of Object.values(data.items)) {
        if (item.title && item.title.trim().toLowerCase() === cleanTitle) {
          return item;
        }
      }
    }

    return undefined;
  }

  /**
   * Encontra a chave existente no storage que melhor corresponde a este produto.
   * Evita perda de tags se o Mercado Livre mudar de /p/MLB para item_id ou vice-versa.
   */
  static resolveExistingItemId(candidateIds: string[], title: string, data: StorageData): string {
    // 0. Procura no aliasMap primeiro
    if (data.aliasMap) {
      for (const cid of candidateIds) {
        const canonical = data.aliasMap[cid];
        if (canonical && data.items[canonical]) {
          return canonical;
        }
      }
    }

    // 1. Procura se algum candidateId já existe no storage e possui tags
    for (const cid of candidateIds) {
      if (data.items[cid] && (data.items[cid].tags || []).length > 0) {
        return cid;
      }
    }

    // 2. Procura se algum candidateId existe no storage (mesmo sem tags)
    for (const cid of candidateIds) {
      if (data.items[cid]) {
        return cid;
      }
    }

    // 3. Procura por título idêntico no storage
    if (title && title.length > 5) {
      const cleanTitle = title.trim().toLowerCase();
      for (const [existingId, item] of Object.entries(data.items)) {
        if (item.title && item.title.trim().toLowerCase() === cleanTitle) {
          return existingId;
        }
      }
    }

    // 4. Se for produto novo, usa o melhor candidateId (priorizando MLB canônico)
    const bestCandidate = candidateIds.find((c) => /^MLB\d+$/i.test(c)) || candidateIds[0];
    return bestCandidate || `ITEM_${Math.abs(title.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0))}`;
  }

  static async toggleTag(
    id: string,
    tag: string,
    candidateIds: string[] = [],
    title: string = '',
    url: string = '',
    price: number = 0
  ): Promise<ItemData> {
    const cleanTag = tag.trim().replace(/^#/, '');
    const data = await this.getData();
    let item = data.items[id];

    if (!item) {
      const resolvedId = this.resolveExistingItemId(candidateIds, title, data);
      item = data.items[resolvedId];
      if (item) {
        id = resolvedId;
      }
    }

    // Se o item ainda não existia no storage, inicializa-o agora!
    if (!item) {
      const now = new Date().toISOString();
      item = {
        id,
        title: title || '',
        url: url || '',
        currentPrice: price || 0,
        priceHistory: price > 0 ? [{ date: now, price }] : [],
        tags: [],
        updatedAt: now
      };
      data.items[id] = item;
    }

    item.tags = (item.tags || []).map((t) => t.replace(/^#/, ''));

    if (item.tags.includes(cleanTag)) {
      item.tags = item.tags.filter((t) => t !== cleanTag);
    } else {
      item.tags.push(cleanTag);
      item.tags.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
      data.tags = (data.tags || []).map((t) => t.replace(/^#/, ''));
      if (!data.tags.includes(cleanTag)) {
        data.tags.push(cleanTag);
        data.tags.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
      }
    }

    item.updatedAt = new Date().toISOString();

    // Mapeia candidateIds para o ID canônico no aliasMap (SEM duplicar registros inteiros em data.items!)
    data.aliasMap = data.aliasMap || {};
    for (const aliasId of candidateIds) {
      if (aliasId !== id) {
        data.aliasMap[aliasId] = id;
      }
    }

    await this.saveData(data);
    return item;
  }

  static async setEnabled(enabled: boolean): Promise<void> {
    const data = await this.getData();
    data.enabled = enabled;
    await this.saveData(data);
  }

  static async getActiveFilter(): Promise<string | null> {
    const data = await this.getData();
    return data.activeFilter ? data.activeFilter.replace(/^#/, '') : null;
  }

  static async setActiveFilter(tag: string | null): Promise<void> {
    const cleanTag = tag ? tag.replace(/^#/, '') : null;
    const data = await this.getData();
    data.activeFilter = cleanTag;
    await this.saveData(data);
  }

  static async exportBackup(): Promise<string> {
    const data = await this.getData();
    return JSON.stringify(data, null, 2);
  }

  static async importBackup(jsonStr: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonStr) as StorageData;
      if (parsed && Array.isArray(parsed.tags) && typeof parsed.items === 'object') {
        parsed.tags = parsed.tags.map((t) => t.replace(/^#/, ''));
        for (const id in parsed.items) {
          parsed.items[id].tags = (parsed.items[id].tags || []).map((t) => t.replace(/^#/, ''));
        }
        await this.saveData(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
