// Type definitions
export interface DomainPatterns {
  averageLength: number;
  lengthRange: { min: number; max: number };
  wordCount: Record<number, number>;
  mostCommonWordCount: number;
  commonWords: string[];
  nicheKeywords: string[];
  industryTerms: string[];
  suffixes: string[];
  prefixes: string[];
  structurePatterns: string[];
  containsNumbers: number;
  brandTypes: string[];
}

// Extract niche keywords
export const extractNicheKeywords = (niche: string): string[] => {
  const nicheKeywords: Record<string, string[]> = {
    'horse riding': ['horse', 'equine', 'saddle', 'saddlery', 'tack', 'riding', 'equestrian', 
                    'bridle', 'stable', 'ranch', 'cowboy', 'western'],
    'backyard': ['yard', 'lawn', 'patio', 'garden', 'outdoor', 'deck', 'bbq', 'barbecue',
                'grill', 'fire', 'porch', 'flame'],
    'fireplace': ['fire', 'flame', 'hearth', 'chimney', 'electric', 'stove',
                 'warm', 'heat', 'cozy', 'pit', 'pits'],
    'wellness': ['health', 'wellness', 'vital', 'life', 'care', 'pure', 'recovery',
                'sauna', 'therapy', 'fitness'],
    'golf': ['golf', 'club', 'simulator', 'indoor', 'swing', 'putt', 'tee'],
    'fitness': ['fitness', 'gym', 'strength', 'warehouse', 'zone', 'factory',
               'global', 'pro', 'equipment'],
    'kitchen': ['kitchen', 'appliance', 'coffee', 'gear', 'premium', 'range'],
    'sauna': ['sauna', 'spa', 'steam', 'heat', 'finnish', 'infrared', 'heaven'],
    'pizza oven': ['pizza', 'oven', 'wood', 'fire', 'patio', 'outdoor'],
    'drones': ['drone', 'fly', 'maverick', 'nerds', 'uav', 'aviation']
  };

  const nicheLower = niche.toLowerCase();
  
  for (const [key, keywords] of Object.entries(nicheKeywords)) {
    if (nicheLower.includes(key)) {
      return keywords;
    }
  }

  return nicheLower.split(' ');
};

// Fallback domain splitting
export const fallbackSplitDomain = (domainName: string): string[] => {
  const commonWords = new Set([
    // Backyard/outdoor related
    'fire', 'pit', 'pits', 'bbq', 'barbecue', 'grill', 'porch', 'swing', 'backyard',
    'yard', 'lawn', 'patio', 'garden', 'outdoor', 'deck', 'all', 'things', 'the',
    // Horse-related
    'horse', 'equine', 'saddle', 'saddlery', 'tack', 'bridle', 'riding', 'equestrian',
    'stable', 'ranch', 'barn', 'pony', 'dover', 'chicks', 'smart', 'pak', 'state', 'line',
    // Business-related
    'direct', 'supply', 'depot', 'mart', 'store', 'shop', 'pro', 'hub', 'zone',
    'warehouse', 'factory', 'outlet', 'gear', 'world', 'central', 'place', 'company',
    'guys', 'surplus', 'plus',
    // Descriptors
    'premium', 'quality', 'best', 'top', 'elite', 'master', 'expert', 'global',
    'national', 'american', 'western', 'english', 'online', 'discount', 'wholesale'
  ]);

  const name = domainName.toLowerCase();
  const words: string[] = [];
  let remaining = name;

  while (remaining) {
    let found = false;
    
    for (let length = remaining.length; length > 0; length--) {
      const substring = remaining.substring(0, length);
      if (commonWords.has(substring) || (length <= 3 && /^[a-z]+$/.test(substring))) {
        words.push(substring);
        remaining = remaining.substring(length);
        found = true;
        break;
      }
    }

    if (!found) {
      if (remaining) {
        if (words.length > 0 && words[words.length - 1].length < 5 && /^[sz]/.test(remaining)) {
          words[words.length - 1] += remaining[0];
          remaining = remaining.substring(1);
        } else {
          words.push(remaining[0]);
          remaining = remaining.substring(1);
        }
      }
    }
  }

  return words.filter(w => w.length > 1 || ['z', 's'].includes(w)) || [name];
};

// Split domain into words
export const splitDomainIntoWords = (domainName: string): string[] => {
  return fallbackSplitDomain(domainName);
};

// Analyze domain structure
export const analyzeDomainStructureImproved = (words: string[], nicheKeywords: string[]): string | null => {
  if (words.length === 1) {
    return "single word";
  } else if (words.length === 2) {
    const businessSuffixes = ['supply', 'direct', 'mart', 'surplus', 'company', 'guys', 
                             'outlet', 'depot', 'pro', 'hub', 'zone'];
    if (businessSuffixes.includes(words[1])) {
      return "niche word + business term";
    } else if (['the', 'all', 'my'].includes(words[0])) {
      return "article + main word";
    } else {
      return "two-word combination";
    }
  } else if (words.length === 3) {
    return "three-word combination";
  } else if (words.length >= 4) {
    return "multi-word phrase";
  }

  return null;
};

// Count word frequency
export const countWordFrequency = (words: string[]): Record<string, number> => {
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  return frequency;
};

// Main domain analysis function
export const analyzeDomainPatterns = (domains: string[], niche: string): DomainPatterns => {
  const patterns: DomainPatterns = {
    averageLength: 0,
    lengthRange: { min: 0, max: 0 },
    wordCount: {},
    mostCommonWordCount: 1,
    commonWords: [],
    nicheKeywords: [],
    industryTerms: [],
    suffixes: [],
    prefixes: [],
    structurePatterns: [],
    containsNumbers: 0,
    brandTypes: []
  };

  let totalLength = 0;
  const lengths: number[] = [];
  const allWords: string[] = [];
  const allMeaningfulWords: string[] = [];
  const nicheRelatedWords = extractNicheKeywords(niche);

  domains.forEach(domain => {
    const name = domain.replace('.com', '').toLowerCase();
    totalLength += name.length;
    lengths.push(name.length);

    const words = splitDomainIntoWords(name);
    allWords.push(...words);

    const meaningfulWords = words.filter(w => w.length > 2);
    allMeaningfulWords.push(...meaningfulWords);

    // Track compound words
    const compoundWords: string[] = [];
    if (words.includes('fire') && (words.includes('pit') || words.includes('pits'))) {
      compoundWords.push('firepit');
    }
    if (words.includes('porch') && words.includes('swing')) {
      compoundWords.push('porchswing');
    }
    if (words.includes('bbq') || (words.includes('bar') && words.includes('b') && words.includes('q'))) {
      compoundWords.push('bbq');
    }

    allMeaningfulWords.push(...compoundWords);

    // Count words
    const wordCount = words.length;
    patterns.wordCount[wordCount] = (patterns.wordCount[wordCount] || 0) + 1;

    // Check for numbers
    if (/\d/.test(name)) {
      patterns.containsNumbers++;
    }

    // Analyze structure
    const structure = analyzeDomainStructureImproved(words, nicheRelatedWords);
    if (structure) {
      patterns.structurePatterns.push(structure);
    }
  });

  // Calculate statistics
  patterns.averageLength = domains.length > 0 ? Math.floor(totalLength / domains.length) : 0;
  patterns.lengthRange.min = lengths.length > 0 ? Math.min(...lengths) : 0;
  patterns.lengthRange.max = lengths.length > 0 ? Math.max(...lengths) : 0;

  // Find most common meaningful words
  const wordFrequency = countWordFrequency(allMeaningfulWords);

  // Filter industry terms
  const genericBusinessTerms = new Set(['the', 'all', 'my', 'get', 'new', 'best', 'top']);
  const businessSuffixes = new Set(['direct', 'company', 'guys', 'pro', 'supply', 'depot', 
                                  'mart', 'store', 'shop', 'hub', 'zone', 'outlet', 'surplus']);

  // Get candidate words for industry terms
  const candidateWords: [string, number][] = [];
  Object.entries(wordFrequency).forEach(([word, count]) => {
    if (count >= 2 && word.length >= 3 && !businessSuffixes.has(word)) {
      candidateWords.push([word, count]);
    }
  });

  // Simple industry term filtering (AI filtering would require API call)
  patterns.industryTerms = candidateWords
    .filter(([word]) => !genericBusinessTerms.has(word))
    .slice(0, 10)
    .map(([word]) => word);

  // Common words (excluding industry terms)
  patterns.commonWords = Object.entries(wordFrequency)
    .filter(([word, count]) => 
      count >= 2 && 
      !patterns.industryTerms.includes(word) && 
      !genericBusinessTerms.has(word) &&
      !businessSuffixes.has(word)
    )
    .slice(0, 5)
    .map(([word]) => word);

  // Niche-specific keywords
  patterns.nicheKeywords = [...new Set(allMeaningfulWords.filter(word => 
    nicheRelatedWords.includes(word)
  ))];

  // Most common word count
  if (Object.keys(patterns.wordCount).length > 0) {
    patterns.mostCommonWordCount = parseInt(
      Object.entries(patterns.wordCount)
        .reduce((a, b) => patterns.wordCount[a[0]] > patterns.wordCount[b[0]] ? a : b)[0]
    );
  }

  // Clean up structure patterns
  patterns.structurePatterns = [...new Set(patterns.structurePatterns)].slice(0, 3);

  // Analyze suffixes and prefixes
  const suffixCounter: Record<string, number> = {};
  const prefixCounter: Record<string, number> = {};

  domains.forEach(domain => {
    const name = domain.replace('.com', '').toLowerCase();
    const words = splitDomainIntoWords(name);
    
    if (words.length > 1) {
      const lastWord = words[words.length - 1];
      if (businessSuffixes.has(lastWord)) {
        suffixCounter[lastWord] = (suffixCounter[lastWord] || 0) + 1;
      }

      const firstWord = words[0];
      const commonPrefixes = ['smart', 'pro', 'super', 'best', 'top', 'premium', 'elite', 
                             'the', 'all', 'my', 'total', 'pure', 'prime'];
      if (commonPrefixes.includes(firstWord)) {
        prefixCounter[firstWord] = (prefixCounter[firstWord] || 0) + 1;
      }
    }
  });

  patterns.suffixes = Object.entries(suffixCounter)
    .filter(([, count]) => count >= 2)
    .slice(0, 3)
    .map(([suffix]) => suffix);

  patterns.prefixes = Object.entries(prefixCounter)
    .filter(([, count]) => count >= 2)
    .slice(0, 3)
    .map(([prefix]) => prefix);

  // Determine brand types
  const brandTypesCounter: Record<string, number> = {};
  
  domains.forEach(domain => {
    const name = domain.replace('.com', '').toLowerCase();
    const words = splitDomainIntoWords(name);

    if (words.some(term => patterns.industryTerms.includes(term))) {
      brandTypesCounter['industry-specific'] = (brandTypesCounter['industry-specific'] || 0) + 1;
    }

    if (words.length >= 2) {
      brandTypesCounter['compound'] = (brandTypesCounter['compound'] || 0) + 1;
    }

    if (words.length === 1 && !allMeaningfulWords.includes(words[0])) {
      brandTypesCounter['brandable'] = (brandTypesCounter['brandable'] || 0) + 1;
    }
  });

  patterns.brandTypes = Object.entries(brandTypesCounter)
    .filter(([, count]) => count >= 2)
    .slice(0, 3)
    .map(([btype]) => btype);

  return patterns;
};

// Utility functions for specific analysis
export const getDomainLength = (domain: string): number => {
  return domain.replace('.com', '').length;
};

export const getDomainWords = (domain: string): string[] => {
  return splitDomainIntoWords(domain.replace('.com', '').toLowerCase());
};

export const hasNumbers = (domain: string): boolean => {
  return /\d/.test(domain);
};

export const getDomainStructure = (domain: string, niche: string): string | null => {
  const words = getDomainWords(domain);
  const nicheKeywords = extractNicheKeywords(niche);
  return analyzeDomainStructureImproved(words, nicheKeywords);
};

// Helper to format patterns for display
export const formatPatternsForDisplay = (patterns: DomainPatterns): Record<string, string> => {
  return {
    'Average Length': `${patterns.averageLength} characters`,
    'Length Range': `${patterns.lengthRange.min} - ${patterns.lengthRange.max} characters`,
    'Most Common Word Count': `${patterns.mostCommonWordCount} words`,
    'Industry Terms': patterns.industryTerms.join(', '),
    'Common Words': patterns.commonWords.join(', '),
    'Niche Keywords': patterns.nicheKeywords.join(', '),
    'Common Suffixes': patterns.suffixes.join(', '),
    'Common Prefixes': patterns.prefixes.join(', '),
    'Structure Patterns': patterns.structurePatterns.join(', '),
    'Brand Types': patterns.brandTypes.join(', '),
    'Contains Numbers': `${patterns.containsNumbers} domains`
  };
};

// Generate recommendations based on patterns
export const generateRecommendations = (niche: string, patterns: DomainPatterns): string[] => {
  const recommendations: string[] = [];

  // Length recommendation
  if (patterns.averageLength) {
    recommendations.push(
      `Keep domain length between ${patterns.lengthRange.min}-${patterns.lengthRange.max} characters (average: ${patterns.averageLength})`
    );
  }

  // Word count recommendation
  if (patterns.mostCommonWordCount) {
    const wordCountDesc = patterns.mostCommonWordCount === 1 ? "single-word" : `${patterns.mostCommonWordCount}-word`;
    recommendations.push(
      `Most successful stores use ${wordCountDesc} domains`
    );
  }

  // Industry terms recommendation
  if (patterns.industryTerms.length > 0) {
    const termsStr = patterns.industryTerms.slice(0, 3).join(", ");
    recommendations.push(
      `Consider industry-specific terms: ${termsStr}`
    );
  }

  // Common words recommendation
  if (patterns.commonWords.length > 0) {
    const wordsStr = patterns.commonWords.slice(0, 3).join(", ");
    recommendations.push(
      `Other frequently used words: ${wordsStr}`
    );
  }

  // Structure recommendations
  if (patterns.structurePatterns.length > 0) {
    const structureStr = patterns.structurePatterns[0];
    recommendations.push(
      `Popular structure: ${structureStr}`
    );
  }

  // Brand type recommendation
  if (patterns.brandTypes.length > 0) {
    const brandStr = patterns.brandTypes.join(" and ");
    recommendations.push(
      `Brand styles: ${brandStr} names work well`
    );
  }

  // Number usage
  if (patterns.containsNumbers === 0) {
    recommendations.push(
      "Avoid using numbers in your domain"
    );
  }

  return recommendations;
};
