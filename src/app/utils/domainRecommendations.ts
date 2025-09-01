import { DomainPatterns, generateRecommendations } from './domainAnalyzer';

export interface DomainRecommendation {
    domain: string;
    available: boolean;
    price?: string;
    reason?: string;
    qualityScore?: number;
}

/**
 * Generate domain suggestions based on analyzed patterns
 */
export const generateDomainSuggestions = (patterns: DomainPatterns, niche: string): string[] => {
    const suggestions: string[] = [];
    const nicheKeywords = patterns.nicheKeywords;
    const industryTerms = patterns.industryTerms;
    const suffixes = patterns.suffixes;
    const prefixes = patterns.prefixes;

    // Generate combinations based on patterns
    if (nicheKeywords.length > 0 && suffixes.length > 0) {
        // Niche keyword + suffix combinations
        nicheKeywords.slice(0, 3).forEach(keyword => {
            suffixes.slice(0, 2).forEach(suffix => {
                suggestions.push(`${keyword}${suffix}.com`);
            });
        });
    }

    if (industryTerms.length > 0 && suffixes.length > 0) {
        // Industry term + suffix combinations
        industryTerms.slice(0, 3).forEach(term => {
            suffixes.slice(0, 2).forEach(suffix => {
                suggestions.push(`${term}${suffix}.com`);
            });
        });
    }

    if (prefixes.length > 0 && nicheKeywords.length > 0) {
        // Prefix + niche keyword combinations
        prefixes.slice(0, 2).forEach(prefix => {
            nicheKeywords.slice(0, 3).forEach(keyword => {
                suggestions.push(`${prefix}${keyword}.com`);
            });
        });
    }

    // Add some generic combinations
    if (nicheKeywords.length > 0) {
        suggestions.push(`${nicheKeywords[0]}central.com`);
        suggestions.push(`${nicheKeywords[0]}hub.com`);
        suggestions.push(`${nicheKeywords[0]}pro.com`);
    }

    return suggestions.slice(0, 10); // Limit to 10 suggestions
};

/**
 * Analyze domain quality using OpenAI
 */
export const analyzeDomainQuality = async (domain: string, niche: string, patterns: DomainPatterns): Promise<number> => {
    try {
        const prompt = `Rate the quality of this domain name "${domain}" for a ${niche} business on a scale of 1-100.

Consider these factors:
- Relevance to ${niche} industry
- Memorability and brandability
- Length (7-20 characters is optimal)
- Clarity and descriptiveness
- Potential for SEO
- Professional appearance
- Ease of spelling and pronunciation

Context from competitor analysis:
- Niche Keywords: ${patterns.nicheKeywords.join(', ')}
- Industry Terms: ${patterns.industryTerms.join(', ')}
- Common Patterns: ${patterns.structurePatterns.join(', ')}

Return ONLY a number between 1-100, no explanations or additional text.`;

        const response = await fetch('/api/openai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                domains: [domain]
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.analysis.trim();

        // Parse the score
        const score = parseInt(aiResponse);
        if (isNaN(score) || score < 1 || score > 100) {
            // Fallback to basic scoring
            return calculateBasicScore(domain, patterns);
        }

        return score;
    } catch (error) {
        console.error(`Error analyzing quality for ${domain}:`, error);
        // Fallback to basic scoring
        return calculateBasicScore(domain, patterns);
    }
};

/**
 * Calculate basic quality score as fallback
 */
const calculateBasicScore = (domain: string, patterns: DomainPatterns): number => {
    let score = 50; // Base score
    const name = domain.replace('.com', '').toLowerCase();

    // Length scoring
    if (name.length >= 7 && name.length <= 12) score += 20;
    else if (name.length >= 13 && name.length <= 16) score += 15;
    else if (name.length >= 17 && name.length <= 20) score += 10;
    else score -= 10;

    // Check if contains niche keywords
    if (patterns.nicheKeywords.some(keyword => name.includes(keyword))) score += 15;

    // Check if contains industry terms
    if (patterns.industryTerms.some(term => name.includes(term))) score += 10;

    // Check for numbers (penalty)
    if (/\d/.test(name)) score -= 10;

    // Check for hyphens (penalty)
    if (name.includes('-')) score -= 5;

    return Math.max(1, Math.min(100, score));
};

/**
 * Check domain availability via Name.com API
 */
export const checkDomainAvailability = async (domains: string[], niche: string, patterns: DomainPatterns): Promise<DomainRecommendation[]> => {
    const results: DomainRecommendation[] = [];
    console.log(domains);

    for (const domain of domains) {
        try {
            // Use the Name.com API route
            const response = await fetch('/api/namecom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ domain })
            });

            if (response.ok) {
                const data = await response.json();

                if (data.available) {
                    // Analyze domain quality
                    const qualityScore = await analyzeDomainQuality(domain, niche, patterns);

                    results.push({
                        domain,
                        available: data.available || false,
                        price: `$${data.price}` || '$12.99',
                        reason: generateReason(domain, domains[0]),
                        qualityScore: qualityScore
                    });
                }
            } else {
                // If API fails, mark as unavailable
                const qualityScore = await analyzeDomainQuality(domain, niche, patterns);
                results.push({
                    domain,
                    available: false,
                    reason: generateReason(domain, domains[0]),
                    qualityScore: qualityScore
                });
            }
        } catch (error) {
            console.error(`Error checking ${domain}:`, error);
            // Fallback: mark as unavailable on error
            const qualityScore = calculateBasicScore(domain, patterns);
            results.push({
                domain,
                available: false,
                reason: generateReason(domain, domains[0]),
                qualityScore: qualityScore
            });
        }
    }

    return results;
};

/**
 * Generate reason for recommendation
 */
const generateReason = (domain: string, topDomain: string): string => {
    if (domain === topDomain) {
        return "optimal length and structure";
    }

    const length = domain.replace('.com', '').length;
    if (length <= 12) {
        return "short and memorable";
    } else if (length <= 16) {
        return "good balance of length";
    } else {
        return "descriptive and clear";
    }
};

/**
 * Generate unique domain suggestions using OpenAI
 */
export const generateUniqueDomainSuggestions = async (patterns: DomainPatterns, niche: string, domains: string[]): Promise<string[]> => {
    try {
        const prompt = `Generate exactly 15 unique, creative domain names for a ${niche} business based on these patterns:

Niche Keywords: ${patterns.nicheKeywords.join(', ')}
Industry Terms: ${patterns.industryTerms.join(', ')}
Common Suffixes: ${patterns.suffixes.join(', ')}
Common Prefixes: ${patterns.prefixes.join(', ')}

Requirements:
- Generate exactly 15 unique domain names
- Use .com extension
- Combine niche keywords, industry terms, prefixes, and suffixes creatively
- Avoid repetitive patterns
- Avoid using the same keyword multiple times
- Make them brandable and memorable
- Make them descriptive and clear
- Ensure they're relevant to the ${niche} industry
- Don't include numbers unless absolutely necessary
- Keep domains between 7-20 characters (excluding .com)
- lowercase the domain names
- Avoid alliterations   

Excludes these domains: ${domains.join(', ')}

Return ONLY a JSON array of domain names, no code fences, no markdown, no explanations or no additional text:
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
            return generateDomainSuggestions(patterns, niche);
        }

        // Ensure we have exactly 15 unique suggestions
        const uniqueSuggestions = [...new Set(suggestions)].slice(0, 15);

        // If we don't have enough, fill with basic suggestions
        if (uniqueSuggestions.length < 15) {
            const basicSuggestions = generateDomainSuggestions(patterns, niche);
            const additionalSuggestions = basicSuggestions.filter(s => !uniqueSuggestions.includes(s));
            uniqueSuggestions.push(...additionalSuggestions.slice(0, 15 - uniqueSuggestions.length));
        }

        return uniqueSuggestions;
    } catch (error) {
        console.error('Error generating unique domain suggestions:', error);
        // Fallback to basic suggestions
        return generateDomainSuggestions(patterns, niche);
    }
};

/**
 * Main function to generate domain recommendations
 */
export const generateDomainRecommendations = async (patterns: DomainPatterns, niche: string, domains: string[]): Promise<DomainRecommendation[]> => {
    try {
        const suggestions = await generateUniqueDomainSuggestions(patterns, niche, domains);
        console.log('Generated suggestions:', suggestions);

        const availableDomains = await checkDomainAvailability(suggestions, niche, patterns);

        // Sort by quality score first, then availability
        const sortedAvailableDomains = availableDomains.sort((a, b) => {
            const scoreA = a.qualityScore || 0;
            const scoreB = b.qualityScore || 0;

            if (scoreB !== scoreA) return scoreB - scoreA; // Higher score first
            if (a.available && !b.available) return -1;
            if (!a.available && b.available) return 1;
            return 0;
        });
        console.log(sortedAvailableDomains);
        return sortedAvailableDomains;
    } catch (error) {
        console.error('Error generating domain recommendations:', error);
        return [];
    }
};
