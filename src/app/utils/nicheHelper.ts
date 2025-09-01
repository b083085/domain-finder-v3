import { niche_variations, PRIVATE_ECOM_STORES } from '../niches';

export interface Store {
  domain: string;
}

/**
 * Get top stores for a given niche by searching through variations and direct matches
 */
export const getTopStoresForNiche = (searchNiche: string): Store[] => {
  const normalizedNiche = searchNiche.toLowerCase().trim();

  // Check if niche is in niche_variations
  if (normalizedNiche in niche_variations) {
    const mappedNiche = niche_variations[normalizedNiche as keyof typeof niche_variations];
    if (mappedNiche in PRIVATE_ECOM_STORES) {
      return PRIVATE_ECOM_STORES[mappedNiche as keyof typeof PRIVATE_ECOM_STORES];
    }
  }

  // Check if niche is directly in PRIVATE_ECOM_STORES
  if (normalizedNiche in PRIVATE_ECOM_STORES) {
    return PRIVATE_ECOM_STORES[normalizedNiche as keyof typeof PRIVATE_ECOM_STORES];
  }

  // Check if any niche contains the search term
  for (const [nicheKey, stores] of Object.entries(PRIVATE_ECOM_STORES)) {
    if (nicheKey.toLowerCase().includes(normalizedNiche) ||
      normalizedNiche.includes(nicheKey.toLowerCase())) {
      return stores;
    }
  }

  // Default to backyard stores if no match found
  return PRIVATE_ECOM_STORES['backyard'];
};

/**
 * Extract domain names from store objects
 */
export const extractDomainNames = (stores: Store[]): string[] => {
  return stores.map(store => store.domain);
};

/**
 * Check if a niche exists in the available stores
 */
export const nicheExists = (searchNiche: string): boolean => {
  const normalizedNiche = searchNiche.toLowerCase().trim();
  
  if (normalizedNiche in niche_variations || normalizedNiche in PRIVATE_ECOM_STORES) {
    return true;
  }

  return Object.keys(PRIVATE_ECOM_STORES).some(nicheKey => 
    nicheKey.toLowerCase().includes(normalizedNiche) ||
    normalizedNiche.includes(nicheKey.toLowerCase())
  );
};

/**
 * Get all available niches
 */
export const getAvailableNiches = (): string[] => {
  return Object.keys(PRIVATE_ECOM_STORES);
};
