'use client';

import { useState } from 'react';
import { niche_variations, PRIVATE_ECOM_STORES } from './niches';

interface DomainPatterns {
  averageLength: number;
  lengthRange: string;
  wordCount: number;
  mostCommonWordCount: number;
  commonWords: string[];
  nicheKeywords: string[];
  industryTerms: string[];
  suffixes: string[];
  prefixes: string[];
  structurePatterns: string[];
  containsNumbers: boolean;
  brandTypes: string[];
  openAIAnalysis?: string;
}

export default function Home() {
  const [niche, setNiche] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [topStores, setTopStores] = useState<{domain: string}[]>([]);
  const [selectedNiche, setSelectedNiche] = useState<string>('backyard');
  const [domainPatterns, setDomainPatterns] = useState<DomainPatterns | null>(null);
  const [isGeneratingPatterns, setIsGeneratingPatterns] = useState(false);

  // Function to analyze domain patterns
  const analyzeDomainPatterns = (domains: {domain: string}[]) => {
    const domainList = domains.map(store => store.domain);
    
    // Calculate basic statistics
    const lengths = domainList.map(domain => domain.length);
    const averageLength = Math.round(lengths.reduce((sum, len) => sum + len, 0) / lengths.length);
    const minLength = Math.min(...lengths);
    const maxLength = Math.max(...lengths);
    const lengthRange = `${minLength}-${maxLength} characters`;
    
    // Word count analysis
    const wordCounts = domainList.map(domain => domain.split(/[.-]/).filter(word => word.length > 0).length);
    const mostCommonWordCount = wordCounts.sort((a, b) => 
      wordCounts.filter(v => v === a).length - wordCounts.filter(v => v === b).length
    ).pop() || 0;
    
    // Extract common words
    const allWords = domainList.flatMap(domain => 
      domain.split(/[.-]/).filter(word => word.length > 0)
    );
    const wordFrequency = allWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const commonWords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
    
    // Check for numbers
    const containsNumbers = domainList.some(domain => /\d/.test(domain));
    
    // Extract suffixes and prefixes
    const suffixes = [...new Set(domainList.map(domain => {
      const parts = domain.split('.');
      return parts[parts.length - 1];
    }))];
    
    const prefixes = [...new Set(domainList.map(domain => {
      const parts = domain.split(/[.-]/);
      return parts[0];
    }))];
    
    // Structure patterns
    const structurePatterns = domainList.map(domain => {
      const parts = domain.split(/[.-]/).filter(word => word.length > 0);
      if (parts.length === 1) return 'single-word';
      if (parts.length === 2) return 'two-word';
      if (parts.length === 3) return 'three-word';
      return 'multi-word';
    });
    
    const uniquePatterns = [...new Set(structurePatterns)];
    
    // Brand types
    const brandTypes = [];
    if (uniquePatterns.includes('single-word')) brandTypes.push('brandable');
    if (uniquePatterns.includes('two-word') || uniquePatterns.includes('three-word')) brandTypes.push('descriptive');
    if (uniquePatterns.includes('multi-word')) brandTypes.push('phrase-based');
    
    // Niche keywords and industry terms (extract from common words)
    const nicheKeywords = commonWords.filter(word => 
      word.length > 3 && !['com', 'net', 'org'].includes(word)
    );
    
    const industryTerms = commonWords.filter(word => 
      word.length > 3 && !['com', 'net', 'org'].includes(word)
    );
    
    const patterns: DomainPatterns = {
      averageLength,
      lengthRange,
      wordCount: wordCounts.length,
      mostCommonWordCount,
      commonWords,
      nicheKeywords,
      industryTerms,
      suffixes,
      prefixes,
      structurePatterns: uniquePatterns,
      containsNumbers,
      brandTypes
    };
    
    setDomainPatterns(patterns);
  };

  // Function to generate OpenAI content for patterns
  const generateOpenAIPatterns = async (patterns: DomainPatterns) => {
    setIsGeneratingPatterns(true);
    
    try {
      const prompt = `Analyze these domain patterns for an e-commerce niche and provide insights:

Domain Statistics:
- Average Length: ${patterns.averageLength} characters
- Length Range: ${patterns.lengthRange}
- Word Count: ${patterns.wordCount}
- Most Common Word Count: ${patterns.mostCommonWordCount}
- Common Words: ${patterns.commonWords.join(', ')}
- Industry Terms: ${patterns.industryTerms.join(', ')}
- Structure Patterns: ${patterns.structurePatterns.join(', ')}
- Brand Types: ${patterns.brandTypes.join(', ')}
- Contains Numbers: ${patterns.containsNumbers}

Please provide a comprehensive analysis including:
1. Length optimization insights
2. Word structure recommendations
3. Keyword strategy
4. Brand positioning advice
5. SEO optimization tips
6. Specific actionable recommendations for domain selection

Format the response with clear bullet points and actionable insights.`;

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          patterns
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiAnalysis = data.analysis;

      setDomainPatterns(prev => prev ? { ...prev, openAIAnalysis: aiAnalysis } : null);
    } catch (error) {
      console.error('Error generating OpenAI patterns:', error);
      // Fallback to mock response if API fails
      const mockResponse = await simulateOpenAIResponse(prompt);
      setDomainPatterns(prev => prev ? { ...prev, openAIAnalysis: mockResponse } : null);
    } finally {
      setIsGeneratingPatterns(false);
    }
  };

  // Mock function to simulate OpenAI response (fallback)
  const simulateOpenAIResponse = async (prompt: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return `• Length Analysis: Domains in this niche typically range from ${domainPatterns?.lengthRange}, with an average of ${domainPatterns?.averageLength} characters. This suggests optimal readability and memorability.

• Word Structure: The most common pattern is ${domainPatterns?.mostCommonWordCount}-word domains, indicating a preference for descriptive yet concise naming.

• Keyword Insights: Top keywords include ${domainPatterns?.commonWords.slice(0, 3).join(', ')}, showing strong industry relevance and search optimization potential.

• Structural Patterns: ${domainPatterns?.structurePatterns.join(', ')} patterns dominate, suggesting multiple viable naming strategies for this niche.

• Brand Strategy: ${domainPatterns?.brandTypes.join(', ')} approaches work well, allowing flexibility in brand positioning and market positioning.

• Optimization Tips: Focus on ${domainPatterns?.averageLength}-character domains with ${domainPatterns?.mostCommonWordCount} words, incorporating industry terms like ${domainPatterns?.industryTerms.slice(0, 2).join(', ')} for better SEO performance.`;
  };

  // Function to search competitors based on niche
  const searchCompetitors = (searchNiche: string) => {
    const normalizedNiche = searchNiche.toLowerCase().trim();
    
    // First, check if niche is in niche_variations
    if (normalizedNiche in niche_variations) {
      const mappedNiche = niche_variations[normalizedNiche as keyof typeof niche_variations];
      if (mappedNiche in PRIVATE_ECOM_STORES) {
        setSelectedNiche(mappedNiche);
        const stores = PRIVATE_ECOM_STORES[mappedNiche as keyof typeof PRIVATE_ECOM_STORES];
        setTopStores(stores);
        analyzeDomainPatterns(stores);
        return;
      }
    }
    
    // If not found in niche_variations, check if niche is directly in PRIVATE_ECOM_STORES
    if (normalizedNiche in PRIVATE_ECOM_STORES) {
      setSelectedNiche(normalizedNiche);
      const stores = PRIVATE_ECOM_STORES[normalizedNiche as keyof typeof PRIVATE_ECOM_STORES];
      setTopStores(stores);
      analyzeDomainPatterns(stores);
      return;
    }
    
    // If still not found, check if any niche in PRIVATE_ECOM_STORES contains the search term
    for (const [nicheKey, stores] of Object.entries(PRIVATE_ECOM_STORES)) {
      if (nicheKey.toLowerCase().includes(normalizedNiche) || 
          normalizedNiche.includes(nicheKey.toLowerCase())) {
        setSelectedNiche(nicheKey);
        setTopStores(stores);
        analyzeDomainPatterns(stores);
        return;
      }
    }
    
    // If no matches found, set default backyard stores
    setSelectedNiche('backyard');
    const stores = PRIVATE_ECOM_STORES['backyard'];
    setTopStores(stores);
    analyzeDomainPatterns(stores);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Search for competitors based on the entered niche
    searchCompetitors(niche);
    
    // Simulate analysis delay
    setTimeout(() => setIsAnalyzing(false), 1000);
  };

  const handleGeneratePatterns = () => {
    if (domainPatterns) {
      generateOpenAIPatterns(domainPatterns);
    }
  };


  const otherOptions = [
    'porchconnect.com',
    'porchteam.com',
    'barbecueedge.com',
    'barbecuevault.com',
    'barbecueconnect.com'
  ];

  return (
    <main className="min-h-screen bg-[#1A1A1A] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Main Card Container */}
        <div className="bg-[#1A1A1A] rounded-2xl shadow-xl border border-[#FACC15] overflow-hidden">
          {/* Header Section */}
          <div className="bg-[#1A1A1A] text-[#FACC15] p-8 border-b border-[#FACC15]">
            <h1 className="text-4xl font-bold mb-2">Domain Finder</h1>
            <p className="text-xl text-[#A0A0A0]">
              Find the perfect domain name by analyzing successful e-commerce stores in your niche.
            </p>
          </div>

          {/* Content Section */}
          <div className="p-8 space-y-8">
            {/* Input and Action Section */}
            <div className="flex gap-4 w-full">
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAnalyze();
                  }
                }}
                className="flex-1 px-4 py-3 border border-[#FACC15] rounded-lg text-lg bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FACC15] placeholder-[#A0A0A0]"
                placeholder="Enter your niche"
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-[#eab308] text-black font-semibold rounded-lg hover:bg-[#fbbf24] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Competitors'}
              </button>
            </div>

            {/* Top E-commerce Stores Section */}
            {topStores.length > 0 && (
              <>
                <div className="bg-[#333333] rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-[#FACC15] mb-4">
                    Top Private E-commerce Stores in "{selectedNiche}"
                  </h2>
                  <ol className="space-y-2">
                    {topStores.map((store, index) => (
                      <li key={index} className="bg-[#1A1A1A] p-3 rounded-lg border border-[#333333]">
                        <a
                          href={`https://${store.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FACC15] hover:underline text-lg"
                        >
                          {index + 1}. {store.domain}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Two Column Layout for Patterns and Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Domain Patterns Found Section */}
                  <div className="bg-[#333333] border border-[#FACC15] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#FACC15] rounded"></div>
                        <h3 className="text-xl font-semibold text-[#FACC15]">Domain Patterns Found:</h3>
                      </div>
                      {domainPatterns && (
                        <button
                          onClick={handleGeneratePatterns}
                          disabled={isGeneratingPatterns}
                          className="px-4 py-2 bg-[#FACC15] text-black text-sm font-medium rounded-lg hover:bg-[#fbbf24] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingPatterns ? 'Generating...' : 'Generate AI Analysis'}
                        </button>
                      )}
                    </div>
                    
                    {domainPatterns ? (
                      <div className="space-y-4">
                        {/* Basic Statistics */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-[#1A1A1A] p-3 rounded-lg">
                            <span className="text-[#FACC15] font-medium">Average Length:</span>
                            <span className="text-white ml-2">{domainPatterns.averageLength} chars</span>
                          </div>
                          <div className="bg-[#1A1A1A] p-3 rounded-lg">
                            <span className="text-[#FACC15] font-medium">Length Range:</span>
                            <span className="text-white ml-2">{domainPatterns.lengthRange}</span>
                          </div>
                          <div className="bg-[#1A1A1A] p-3 rounded-lg">
                            <span className="text-[#FACC15] font-medium">Most Common Words:</span>
                            <span className="text-white ml-2">{domainPatterns.mostCommonWordCount}</span>
                          </div>
                          <div className="bg-[#1A1A1A] p-3 rounded-lg">
                            <span className="text-[#FACC15] font-medium">Contains Numbers:</span>
                            <span className="text-white ml-2">{domainPatterns.containsNumbers ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                        
                        {/* Common Words */}
                        <div className="bg-[#1A1A1A] p-3 rounded-lg">
                          <span className="text-[#FACC15] font-medium">Common Words:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {domainPatterns.commonWords.map((word, index) => (
                              <span key={index} className="px-2 py-1 bg-[#333333] text-white text-sm rounded">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Structure Patterns */}
                        <div className="bg-[#1A1A1A] p-3 rounded-lg">
                          <span className="text-[#FACC15] font-medium">Structure Patterns:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {domainPatterns.structurePatterns.map((pattern, index) => (
                              <span key={index} className="px-2 py-1 bg-[#333333] text-white text-sm rounded">
                                {pattern}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Brand Types */}
                        <div className="bg-[#1A1A1A] p-3 rounded-lg">
                          <span className="text-[#FACC15] font-medium">Brand Types:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {domainPatterns.brandTypes.map((type, index) => (
                              <span key={index} className="px-2 py-1 bg-[#333333] text-white text-sm rounded">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* OpenAI Generated Analysis */}
                        {domainPatterns.openAIAnalysis && (
                          <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#FACC15]">
                            <span className="text-[#FACC15] font-medium">AI Analysis:</span>
                            <div className="text-[#A0A0A0] text-sm mt-2 whitespace-pre-line">
                              {domainPatterns.openAIAnalysis}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <ul className="space-y-2 text-[#A0A0A0]">
                        <li>• Length: 7-20 characters (average: 14)</li>
                        <li>• Structure: Most use 3-word compound domains</li>
                        <li>• Industry terms: bbq, fire, pits, firepit</li>
                        <li>• Domain structures: niche word + business term, multi-word phrase, three-word combination</li>
                        <li>• Brand approach: compound and industry-specific</li>
                      </ul>
                    )}
                  </div>

                  {/* Recommendations for Your Domain Section */}
                  <div className="bg-[#333333] border border-[#FACC15] rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-6 h-6 bg-[#FACC15] rounded-full"></div>
                      <h3 className="text-xl font-semibold text-[#FACC15]">Recommendations for Your Domain:</h3>
                    </div>
                    <ul className="space-y-2 text-[#A0A0A0]">
                      <li>• Keep domain length between 7-20 characters (average: 14)</li>
                      <li>• Most successful stores use 3-word domains</li>
                      <li>• Consider industry-specific terms: bbq, fire, pits</li>
                      <li>• Popular structure: niche word + business term</li>
                      <li>• Brand styles: compound and industry-specific names work well</li>
                      <li>• Avoid using numbers in your domain</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* Our Recommendation Section */}
            <div className="bg-[#333333] border-2 border-[#FACC15] rounded-xl p-6">
              <h3 className="text-xl font-semibold text-[#FACC15] mb-4">Our Recommendation:</h3>
              <div className="bg-[#1A1A1A] border border-[#FACC15] rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">porchcentral.com</div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 font-medium">Available</span>
                    </div>
                    <div className="text-sm text-[#A0A0A0] italic">
                      Selected because: optimal length
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">$12.99</div>
                </div>
              </div>
            </div>

            {/* Other Options Section */}
            <div className="bg-[#333333] rounded-xl p-6">
              <h3 className="text-xl font-semibold text-[#FACC15] mb-4">Other options:</h3>
              <div className="space-y-3">
                {otherOptions.map((option, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-[#1A1A1A] border border-[#333333] rounded-lg">
                    <span className="text-lg font-medium text-white">{option}</span>
                    <span className="text-lg font-bold text-white">$12.99</span>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <button className="px-6 py-3 bg-[#eab308] text-black font-semibold rounded-lg hover:bg-[#fbbf24]">
                  + Generate 5 More Options
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
