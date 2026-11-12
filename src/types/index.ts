export interface PriceRecord {
  date: string; // ISO date string (YYYY-MM-DDTHH:mm:ss.sssZ)
  price: number;
}

export interface ItemData {
  id: string; // Unique announcement / item ID (e.g. MLB123456789)
  title: string;
  url: string;
  currentPrice: number;
  priceHistory: PriceRecord[];
  tags: string[];
  updatedAt: string;
}

export interface StorageData {
  tags: string[]; // List of unique tags created by user (e.g. ["tech", "supermercado"])
  items: Record<string, ItemData>; // Map of itemId -> ItemData
  activeFilter: string | null; // Currently selected tag or null for "all"
  enabled?: boolean; // Whether extension widgets/filters are active (defaults to true)
  aliasMap?: Record<string, string>; // Maps candidateId/alias to canonical itemId
}
