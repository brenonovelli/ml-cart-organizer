import { StorageService } from '../services/storage';

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[ML Cart Organizer] Extensão instalada/atualizada:', details.reason);
  // Initialize default tags if first time
  const data = await StorageService.getData();
  if (!data.tags || data.tags.length === 0) {
    await StorageService.addTag('Favoritos');
    await StorageService.addTag('Supermercado');
    await StorageService.addTag('Tech');
  }
});
