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

Rules:  
- Only use real dictionary words (no made-up terms).  
- All keywords must be directly relevant to the niche.  
- Use single words or short, meaningful phrases (max 2 words).  
- Focus on descriptive, brandable, and SEO-friendly keywords.  
- Avoid generic filler words like "best", "cheap", "online".  
- Output only the keyword list, no explanations. 

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

/**
 * Extract industry terms from domain list using OpenAI
 */
export const extractIndustryTermsFromDomains = async (domainList: string[], niche: string): Promise<string[]> => {
  try {
    const prompt = `Analyze these domain names from the "${niche}" industry and extract exactly 10 industry-specific terms that are:

Requirements:
- Extract exactly 10 industry terms
- Each term must be a full word (not partial words or abbreviations)
- Terms should be relevant to the ${niche} industry
- Terms should be commonly used in business and marketing for this niche
- Terms should be single words or short phrases (max 3 words)
- Focus on industry-specific terminology found in the domain names
- Avoid overly generic terms like "store", "shop", "online"
- Make them actionable and useful for domain naming

Domain names to analyze:
${domainList.join(', ')}

Consider these aspects for ${niche}:
- Industry-specific terminology found in the domains
- Common business terms in ${niche}
- Product or service related terms
- Customer behavior and needs
- Market trends and popular terms

Return ONLY a JSON array of lower case industry terms, no code fences, no markdown, no explanations or additional text:
["term1", "term2", ...]`;

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
    let industryTerms: string[] = [];
    try {
      industryTerms = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Fallback to basic industry terms
      return generateBasicIndustryTerms(domainList, niche);
    }

    // Ensure we have unique terms and they are full words
    const uniqueTerms = [...new Set(industryTerms)]
      .filter(term => term && term.trim().length > 0)
      .slice(0, 10);
    
    // If we don't have enough, fill with basic terms
    if (uniqueTerms.length < 10) {
      const basicTerms = generateBasicIndustryTerms(domainList, niche);
      const additionalTerms = basicTerms.filter(t => !uniqueTerms.includes(t));
      uniqueTerms.push(...additionalTerms.slice(0, 10 - uniqueTerms.length));
    }

    return uniqueTerms;
  } catch (error) {
    console.error('Error extracting industry terms from domains:', error);
    // Fallback to basic industry terms
    return generateBasicIndustryTerms(domainList, niche);
  }
};

/**
 * Generate basic industry terms as fallback
 */
const generateBasicIndustryTerms = (domainList: string[], niche: string): string[] => {
  const terms: string[] = [];
  const nicheLower = niche.toLowerCase();
  
  // Extract common words from domain names
  const allWords = domainList.flatMap(domain => {
    const name = domain.replace('.com', '').toLowerCase();
    return name.split(/[^a-z]+/).filter(word => word.length > 2);
  });
  
  // Count word frequency
  const wordCount: Record<string, number> = {};
  allWords.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Get most common words
  const commonWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word);
  
  // Filter out generic terms
  const genericTerms = ['store', 'shop', 'online', 'web', 'site', 'com', 'net', 'org'];
  const industryTerms = commonWords.filter(word => !genericTerms.includes(word));
  
  // Add niche-specific terms
  if (nicheLower.includes('fitness')) {
    terms.push('gym', 'workout', 'training', 'health', 'strength');
  } else if (nicheLower.includes('tech')) {
    terms.push('digital', 'online', 'web', 'app', 'tech');
  } else if (nicheLower.includes('fashion')) {
    terms.push('style', 'trend', 'wear', 'outfit', 'fashion');
  }
  
  return [...new Set([...industryTerms, ...terms])].slice(0, 10);
};
