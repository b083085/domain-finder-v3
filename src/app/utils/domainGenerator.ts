
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
    const prompt = `
    You are a domain naming assistant.
    Your task is to generate exactly 20 unique domain names ideas:

Niche:${niche}
Relevant Keywords: ${nicheKeywords.join(', ')}

Task:  
- Generate 20 unique, descriptive, 2 or 3 word domain names.  
- Each domain name must use words related to the given niche and keywords.  
- Use only real, meaningful words (no made-up nonsense).  
- Must be easy to pronounce, brandable, and memorable.  
- Must be poetic domain names or descriptive domain names
- Avoid generic filler words like "best", "pro", "online", "world".  
- Use .com extension
- lowercase the domain names
- Keep domain names between 7-20 characters (excluding .com)
- Don't include numbers unless absolutely necessary 
- Avoid using the same keyword multiple times
- Modern and contemporary feel

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
