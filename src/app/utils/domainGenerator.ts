
export interface GeneratedDomain {
  domain: string;
  relevance: string;
  industry: string;
}

/**
 * Generate unique domain list using OpenAI for a specific niche
 */
export const generateUniqueDomainList = async (niche: string, nicheKeywords: string[]): Promise<string[]> => {
  try {
    const prompt = `Generate exactly 20 unique, creative domain names for a ${niche} business that are:

Niche Keywords: ${nicheKeywords.join(', ')}

Requirements:
- Generate exactly 20 unique domain names
- Use .com extension
- Avoid repetitive patterns
- Avoid using the same keyword multiple times
- Make them brandable and memorable
- Make them descriptive and clear
- Ensure they're relevant to the ${niche} industry
- Don't include numbers unless absolutely necessary
- Keep domains between 7-20 characters (excluding .com)
- lowercase the domain names
- Avoid alliterations

Consider these aspects for ${niche}:
- Industry-specific terminology
- Common business terms in ${niche}
- Descriptive and clear naming
- Modern and contemporary feel
- Potential for brand recognition

Return ONLY a JSON array of domain names with .com extension, no code fences, no markdown, no explanations or additional text:
["domain1.com", "domain2.com", ...]`;

    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        domains: [] // Empty array since we're generating, not analyzing
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.analysis;
    
    // Parse the JSON response
    let suggestions: string[] = [];
    try {
      suggestions = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Fallback to basic suggestions
      return generateBasicDomainSuggestions(niche);
    }

    // Ensure we have unique suggestions
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 20);
    
    // If we don't have enough, fill with basic suggestions
    if (uniqueSuggestions.length < 20) {
      const basicSuggestions = generateBasicDomainSuggestions(niche);
      const additionalSuggestions = basicSuggestions.filter(s => !uniqueSuggestions.includes(s));
      uniqueSuggestions.push(...additionalSuggestions.slice(0, 20 - uniqueSuggestions.length));
    }

    return uniqueSuggestions;
  } catch (error) {
    console.error('Error generating unique domain list:', error);
    // Fallback to basic suggestions
    return generateBasicDomainSuggestions(niche);
  }
};

/**
 * Generate basic domain suggestions as fallback
 */
const generateBasicDomainSuggestions = (niche: string): string[] => {
  const suggestions: string[] = [];
  const nicheLower = niche.toLowerCase();
  
  // Common business suffixes
  const suffixes = ['pro', 'hub', 'central', 'direct', 'store', 'shop', 'zone', 'mart', 'depot', 'supply'];
  
  // Generate combinations based on niche
  suffixes.forEach(suffix => {
    suggestions.push(`${nicheLower}${suffix}.com`);
  });

  // Add some variations
  const words = nicheLower.split(' ');
  if (words.length > 1) {
    words.forEach(word => {
      suffixes.slice(0, 5).forEach(suffix => {
        suggestions.push(`${word}${suffix}.com`);
      });
    });
  }

  // Add some generic but relevant combinations
  suggestions.push(`${nicheLower}central.com`);
  suggestions.push(`${nicheLower}hub.com`);
  suggestions.push(`${nicheLower}pro.com`);
  suggestions.push(`${nicheLower}store.com`);
  suggestions.push(`${nicheLower}shop.com`);

  return suggestions.slice(0, 20);
};

/**
 * Validate domain suggestions
 */
export const validateDomainSuggestions = (domains: string[]): string[] => {
  return domains.filter(domain => {
    const name = domain.replace('.com', '').toLowerCase();
    
    // Basic validation rules
    if (name.length < 3 || name.length > 20) return false;
    if (!/^[a-z]+$/.test(name)) return false; // Only letters
    if (name.includes('--')) return false; // No consecutive hyphens
    if (name.startsWith('-') || name.endsWith('-')) return false; // No leading/trailing hyphens
    
    return true;
  });
};
