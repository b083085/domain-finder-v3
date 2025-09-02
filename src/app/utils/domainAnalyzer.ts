import { businessSuffixes, commonPrefixes, genericBusinessTerms } from "../niches";

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

/**
 * Split domain into words using OpenAI for better accuracy
 */
export const splitDomainIntoWordsWithAI = async (domainName: string): Promise<string[]> => {
  try {
    const prompt = `Split this domain name into individual words. 

Domain: ${domainName}

Requirements:
- Remove the .com extension first
- Split the domain into meaningful words
- Each word should be a complete, recognizable word
- Handle compound words properly (e.g., "firepit" -> ["fire", "pit"])
- Handle business terms (e.g., "supply", "direct", "mart")
- Handle articles and prepositions (e.g., "the", "all", "my")
- Return only the words, not the original domain
- Use lowercase for all words
- Don't include numbers as separate words unless they're part of a word

Examples:
- "firepitsupply" -> ["fire", "pit", "supply"]
- "allthingsbbq" -> ["all", "things", "bbq"]
- "porchswingmart" -> ["porch", "swing", "mart"]
- "thefireplace" -> ["the", "fire", "place"]

Return ONLY a JSON array of words, no code fences, no markdown, no explanations:
["word1", "word2", "word3"]`;

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
    let words: string[] = [];
    try {
      words = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Fallback to basic splitting
      return fallbackSplitDomain(domainName);
    }

    // Ensure we have valid words
    const validWords = words
      .filter(word => word && typeof word === 'string' && word.trim().length > 0)
      .map(word => word.toLowerCase().trim());

    return validWords.length > 0 ? validWords : fallbackSplitDomain(domainName);
  } catch (error) {
    console.error('Error splitting domain with AI:', error);
    // Fallback to basic splitting
    return fallbackSplitDomain(domainName);
  }
};

// Split domain into words (updated to use AI)
export const splitDomainIntoWords = async (domainName: string): Promise<string[]> => {
  return await splitDomainIntoWordsWithAI(domainName);
};

// Analyze domain structure
export const analyzeDomainStructureImproved = (words: string[]): string | null => {
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

/**
 * Filter words by niche relevance using OpenAI
 */
export const filterWordsByNicheWithAI = async (words: string[], niche: string): Promise<string[]> => {
  try {
    const prompt = `From the following list of words, return only the words that are relevant to the "${niche}" niche.
 
Words: ${JSON.stringify(words)}
 
Requirements:
- Only include words that are clearly relevant to the "${niche}" business niche
- Exclude generic business terms (e.g., "store", "shop", "online", "company", "direct", "mart", "depot", "outlet", "hub", "zone", "surplus", "pro", "guys")
- Exclude common articles or filler terms ("the", "all", "my", "get", "new", "best", "top")
- Use lowercase for all words
- Return ONLY a JSON array of relevant words, no markdown, no explanations
 
Examples:
- Niche "fireplace": keep ["fire", "flame", "hearth", "chimney"], drop ["store", "company", "direct"]
- Niche "horse riding": keep ["horse", "equine", "saddle", "riding"], drop ["shop", "mart"]
 
Return ONLY a JSON array:
["word1", "word2"]`;

    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.analysis;

    let relevant: string[] = [];
    try {
      relevant = JSON.parse(aiResponse);
    } catch {
      return getBasicNicheFilteredWords(words, niche);
    }

    const valid = Array.isArray(relevant)
      ? relevant
        .filter(w => typeof w === 'string' && w.trim().length > 0)
        .map(w => w.toLowerCase().trim())
      : [];

    return valid.length > 0 ? valid : getBasicNicheFilteredWords(words, niche);
  } catch (err) {
    console.error('Error filtering words by niche with AI:', err);
    return getBasicNicheFilteredWords(words, niche);
  }
};

/**
 * Basic fallback for filtering words by niche relevance
 */
const getBasicNicheFilteredWords = (words: string[], niche: string): string[] => {
  const generic = new Set(['the', 'all', 'my', 'get', 'new', 'best', 'top']);
  const business = new Set(['direct', 'company', 'guys', 'pro', 'supply', 'depot',
    'mart', 'store', 'shop', 'hub', 'zone', 'outlet', 'surplus']);

  const nicheKeywords = new Set(extractNicheKeywords(niche).map(k => k.toLowerCase()));

  const filtered = words.filter(w =>
    w.length >= 3 &&
    !generic.has(w) &&
    !business.has(w) &&
    (nicheKeywords.size === 0 || nicheKeywords.has(w))
  );

  // If too strict and nothing remains, relax to just removing generic/business terms
  if (filtered.length === 0) {
    return words.filter(w =>
      w.length >= 3 &&
      !generic.has(w) &&
      !business.has(w)
    );
  }

  return filtered;
};

/**
 * Get compound words from array of words using OpenAI
 */
export const getCompoundWordsWithAI = async (words: string[]): Promise<string[]> => {
  try {
    const prompt = `Analyze these words and identify potential compound words that could be formed by combining them.

Words: ${words.join(', ')}

Requirements:
- Identify compound words that can be formed by combining 2 or more words from the list
- Focus on business-relevant compound words
- Consider industry-specific terminology
- Return only the compound words, not the individual words
- Use lowercase for all compound words
- Don't include compound words that are just concatenations without meaning

Examples:
- If words include: ["fire", "pit", "supply"] -> compound words: ["firepit"]
- If words include: ["porch", "swing", "mart"] -> compound words: ["porchswing"]
- If words include: ["backyard", "bbq", "grill"] -> compound words: ["backyardbbq"]

Return ONLY a JSON array of compound words, no code fences, no markdown, no explanations:
["compoundword1", "compoundword2"]`;

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
    let compoundWords: string[] = [];
    try {
      compoundWords = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Fallback to basic compound word detection
      return getBasicCompoundWords(words);
    }

    // Ensure we have valid compound words
    const validCompoundWords = compoundWords
      .filter(word => word && typeof word === 'string' && word.trim().length > 0)
      .map(word => word.toLowerCase().trim());

    return validCompoundWords;
  } catch (error) {
    console.error('Error getting compound words with AI:', error);
    // Fallback to basic compound word detection
    return getBasicCompoundWords(words);
  }
};

/**
 * Get basic compound words as fallback
 */
const getBasicCompoundWords = (words: string[]): string[] => {
  const compoundWords: string[] = [];

  // Check for common compound word patterns
  if (words.includes('fire') && (words.includes('pit') || words.includes('pits'))) {
    compoundWords.push('firepit');
  }
  if (words.includes('porch') && words.includes('swing')) {
    compoundWords.push('porchswing');
  }
  if (words.includes('bbq') || (words.includes('bar') && words.includes('b') && words.includes('q'))) {
    compoundWords.push('bbq');
  }
  if (words.includes('backyard') && words.includes('bbq')) {
    compoundWords.push('backyardbbq');
  }
  if (words.includes('fire') && words.includes('place')) {
    compoundWords.push('fireplace');
  }
  if (words.includes('horse') && words.includes('riding')) {
    compoundWords.push('horseriding');
  }
  if (words.includes('wellness') && words.includes('spa')) {
    compoundWords.push('wellnessspa');
  }

  return compoundWords;
};

/**
 * Get top 10 industry terms from words using OpenAI
 */
export const getIndustryTermsWithAI = async (words: string[], niche: string): Promise<string[]> => {
  try {
    const prompt = `Analyze these words and identify the top 10 most relevant industry terms for the "${niche}" business niche.

Words to analyze: ${words.join(', ')}

Requirements:
- Identify exactly 10 industry-specific terms
- Use only real, meaningful words (no made-up nonsense) and recognized in dictionaries
- Focus on terms that are most relevant to the ${niche} industry
- Prioritize terms that are commonly used in business and marketing for this niche
- Avoid generic business terms like "store", "shop", "online", "web"
- Avoid common articles and prepositions like "the", "all", "my", "get"
- Focus on product, service, or industry-specific terminology
- Return terms in order of relevance to the niche
- Do not include compound word or closed compound word
- Do not include repetitive word
- Do not include the plural word
- Do not include word that contains from other word
- Do not include slang word
- Use lowercase for all terms

Consider these aspects for ${niche}:
- Industry-specific terminology
- Product or service related terms
- Customer behavior and needs
- Market trends and popular terms
- Technical or specialized vocabulary

Examples for different niches:
- Fitness: ["gym", "workout", "training", "health", "strength", "equipment", "fitness", "wellness", "exercise", "training"]
- Tech: ["digital", "online", "web", "app", "software", "tech", "digital", "platform", "solution", "service"]
- Fashion: ["style", "trend", "wear", "outfit", "fashion", "clothing", "accessories", "design", "brand", "style"]

Return ONLY a JSON array of exactly 10 industry terms, no code fences, no markdown, no explanations:
["term1", "term2", "term3", "term4", "term5", "term6", "term7", "term8", "term9", "term10"]`;

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
      // Fallback to basic industry term filtering
      return getBasicIndustryTerms(words, niche);
    }

    // Ensure we have exactly 10 valid industry terms
    const validIndustryTerms = industryTerms
      .filter(term => term && typeof term === 'string' && term.trim().length > 0)
      .map(term => term.toLowerCase().trim())
      .slice(0, 10);

    // If we don't have enough, fill with basic terms
    if (validIndustryTerms.length < 10) {
      const basicTerms = getBasicIndustryTerms(words, niche);
      const additionalTerms = basicTerms.filter(term => !validIndustryTerms.includes(term));
      validIndustryTerms.push(...additionalTerms.slice(0, 10 - validIndustryTerms.length));
    }

    return validIndustryTerms;
  } catch (error) {
    console.error('Error getting industry terms with AI:', error);
    // Fallback to basic industry term filtering
    return getBasicIndustryTerms(words, niche);
  }
};

/**
 * Get basic industry terms as fallback
 */
const getBasicIndustryTerms = (words: string[], niche: string): string[] => {
  const genericBusinessTerms = new Set(['the', 'all', 'my', 'get', 'new', 'best', 'top']);
  const businessSuffixes = new Set(['direct', 'company', 'guys', 'pro', 'supply', 'depot',
    'mart', 'store', 'shop', 'hub', 'zone', 'outlet', 'surplus']);

  // Filter out generic terms and business suffixes
  const candidateWords = words
    .filter(word =>
      word.length >= 3 &&
      !genericBusinessTerms.has(word) &&
      !businessSuffixes.has(word)
    )
    .slice(0, 10);

  return candidateWords;
};

// Main domain analysis function
export const analyzeDomainPatterns = async (domains: string[], niche: string): Promise<DomainPatterns> => {
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

  try {
    let totalLength = 0;
    const lengths: number[] = [];
    const allWords: string[] = [];
    const allMeaningfulWords: string[] = [];
    const nicheRelatedWords = extractNicheKeywords(niche);

    // Analyze suffixes and prefixes
    const suffixCounter: Record<string, number> = {};
    const prefixCounter: Record<string, number> = {};

    console.log(domains);

    for (const domain of domains) {
      const name = domain.replace('.com', '').toLowerCase();
      totalLength += name.length;
      lengths.push(name.length);

      const words = await splitDomainIntoWords(name);
      const filteredWords = await filterWordsByNicheWithAI(words, niche);
      console.log(words, filteredWords);
      allWords.push(...filteredWords);

      const meaningfulWords = filteredWords.filter(w => w.length > 2);
      allMeaningfulWords.push(...meaningfulWords);

      // Track compound words
      const compoundWords = await getCompoundWordsWithAI(filteredWords);
      allMeaningfulWords.push(...compoundWords);

      // Count words
      const wordCount = filteredWords.length;
      patterns.wordCount[wordCount] = (patterns.wordCount[wordCount] || 0) + 1;

      // Check for numbers
      if (/\d/.test(name)) {
        patterns.containsNumbers++;
      }

      // Analyze structure
      const structure = analyzeDomainStructureImproved(filteredWords);
      if (structure) {
        patterns.structurePatterns.push(structure);
      }

      if (filteredWords.length > 1) {
        const lastWord = filteredWords[filteredWords.length - 1];
        if (businessSuffixes.includes(lastWord)) {
          suffixCounter[lastWord] = (suffixCounter[lastWord] || 0) + 1;
        }

        const firstWord = filteredWords[0];
        if (commonPrefixes.includes(firstWord)) {
          prefixCounter[firstWord] = (prefixCounter[firstWord] || 0) + 1;
        }
      }
    }

    // Calculate statistics
    patterns.averageLength = domains.length > 0 ? Math.floor(totalLength / domains.length) : 0;
    patterns.lengthRange.min = lengths.length > 0 ? Math.min(...lengths) : 0;
    patterns.lengthRange.max = lengths.length > 0 ? Math.max(...lengths) : 0;

    // Find most common meaningful words
    const wordFrequency = countWordFrequency(allMeaningfulWords);

    // Get top 10 industry terms using AI
    const allUniqueWords = [...new Set(allMeaningfulWords)];
    patterns.industryTerms = await getIndustryTermsWithAI(allUniqueWords, niche);
    console.log('Industry terms identified by AI:', patterns.industryTerms);

    // Common words (excluding industry terms)
    patterns.commonWords = Object.entries(wordFrequency)
      .filter(([word, count]) =>
        count >= 2 &&
        !patterns.industryTerms.includes(word) &&
        !genericBusinessTerms.includes(word) &&
        !businessSuffixes.includes(word)
      )
      .slice(0, 5)
      .map(([word]) => word);

    // Niche-specific keywords
    patterns.nicheKeywords = [...new Set(allMeaningfulWords.filter(word =>
      nicheRelatedWords.includes(word)
    ))];

    // Most common word count - now properly calculated after all domains are processed
    const maxKey = Object.entries(patterns.wordCount).reduce((a, b) =>
      a[1] >= b[1] ? a : b
    )[0];
    patterns.mostCommonWordCount = Number(maxKey);
    console.log('Word count distribution:', patterns.wordCount);
    console.log('Most common word count:', patterns.mostCommonWordCount);

    patterns.structurePatterns = [...new Set(patterns.structurePatterns)].slice(0, 3);

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

    for (const domain of domains) {
      const name = domain.replace('.com', '').toLowerCase();
      const words = await splitDomainIntoWords(name);

      if (words.some(term => patterns.industryTerms.includes(term))) {
        brandTypesCounter['industry-specific'] = (brandTypesCounter['industry-specific'] || 0) + 1;
      }

      if (words.length >= 2) {
        brandTypesCounter['compound'] = (brandTypesCounter['compound'] || 0) + 1;
      }

      if (words.length === 1 && !allMeaningfulWords.includes(words[0])) {
        brandTypesCounter['brandable'] = (brandTypesCounter['brandable'] || 0) + 1;
      }
    }

    patterns.brandTypes = Object.entries(brandTypesCounter)
      .filter(([, count]) => count >= 2)
      .slice(0, 3)
      .map(([btype]) => btype);
  } catch (e) {
    console.error(e);
  }

  console.log(patterns);

  return patterns;
};

// Utility functions for specific analysis
export const getDomainLength = (domain: string): number => {
  return domain.replace('.com', '').length;
};

export const getDomainWords = async (domain: string): Promise<string[]> => {
  return await splitDomainIntoWords(domain.replace('.com', '').toLowerCase());
};

export const hasNumbers = (domain: string): boolean => {
  return /\d/.test(domain);
};

export const getDomainStructure = async (domain: string): Promise<string | null> => {
  const words = await getDomainWords(domain);
  return analyzeDomainStructureImproved(words);
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
}
