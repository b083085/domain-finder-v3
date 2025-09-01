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

  // No stores
  return [];
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

/**
 * Get niche keywords using OpenAI
 */
export const getNicheKeywords = async (niche: string): Promise<string[]> => {
  try {
    const prompt = `Generate exactly 10 relevant keywords for the "${niche}" niche that are:

Requirements:
- Generate exactly 10 keywords
- Each keyword must be a full word (not partial words or abbreviations)
- Keywords should be relevant to the ${niche} industry
- Keywords should be commonly used in business and marketing for this niche
- Keywords should be single words or short phrases (max 3 words)
- Avoid overly generic terms
- Focus on industry-specific terminology
- Make them actionable and useful for domain naming

Consider these aspects for ${niche}:
- Industry-specific terminology
- Common business terms in ${niche}
- Product or service related terms
- Customer behavior and needs
- Market trends and popular terms

Return ONLY a JSON array of lower case keywords, no code fences, no markdown, no explanations or additional text:
["keyword1", "keyword2", ...]`;

    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.analysis;
    
    // Parse the JSON response
    let keywords: string[] = [];
    try {
      keywords = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Fallback to basic keywords
      return generateBasicNicheKeywords(niche);
    }

    // Ensure we have unique keywords and they are full words
    const uniqueKeywords = [...new Set(keywords)]
      .filter(keyword => keyword && keyword.trim().length > 0)
      .slice(0, 10);
    
    // If we don't have enough, fill with basic keywords
    if (uniqueKeywords.length < 10) {
      const basicKeywords = generateBasicNicheKeywords(niche);
      const additionalKeywords = basicKeywords.filter(k => !uniqueKeywords.includes(k));
      uniqueKeywords.push(...additionalKeywords.slice(0, 10 - uniqueKeywords.length));
    }

    return uniqueKeywords;
  } catch (error) {
    console.error('Error generating niche keywords:', error);
    // Fallback to basic keywords
    return generateBasicNicheKeywords(niche);
  }
};

/**
 * Generate basic niche keywords as fallback
 */
const generateBasicNicheKeywords = (niche: string): string[] => {
  const nicheLower = niche.toLowerCase();
  const words = nicheLower.split(' ');
  
  // Common business keywords
  const commonKeywords = ['store', 'shop', 'market', 'hub', 'central', 'pro', 'direct', 'supply', 'trade', 'mart'];
  
  // Combine niche words with common keywords
  const keywords: string[] = [];
  
  words.forEach(word => {
    keywords.push(word);
  });
  
  commonKeywords.forEach(keyword => {
    keywords.push(keyword);
  });
  
  // Add some industry-specific variations
  if (nicheLower.includes('fitness')) {
    keywords.push('workout', 'training', 'health', 'gym');
  } else if (nicheLower.includes('tech')) {
    keywords.push('digital', 'online', 'web', 'app');
  } else if (nicheLower.includes('fashion')) {
    keywords.push('style', 'trend', 'wear', 'outfit');
  }
  
  return [...new Set(keywords)].slice(0, 10);
};
