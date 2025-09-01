'use client';

import { useState } from 'react';
import { analyzeDomainPatterns, type DomainPatterns } from './utils/domainAnalyzer';
import { getTopStoresForNiche, extractDomainNames } from './utils/nicheHelper';
import PatternsDisplay from './components/PatternsDisplay';
import RecommendationsDisplay from './components/RecommendationsDisplay';
import DomainRecommendations from './components/DomainRecommendations';

export default function Home() {
  const [niche, setNiche] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [topStores, setTopStores] = useState<{ domain: string }[]>([]);
  const [selectedNiche, setSelectedNiche] = useState<string>('backyard');
  const [domainPatterns, setDomainPatterns] = useState<DomainPatterns>();

  // Function to generate domain recommendations based on patterns
  const generateDomainRecommendations = async (patterns: DomainPatterns, niche: string, p0: never[]) => {
    try {
      // Generate domain suggestions based on patterns
      const suggestions = generateDomainSuggestions(patterns, niche);
      
      // Check availability for each suggestion
      const availableDomains = await checkDomainAvailability(suggestions);
      
      return availableDomains;
    } catch (error) {
      console.error('Error generating domain recommendations:', error);
      return [];
    }
  };

  // Function to generate domain suggestions based on patterns
  const generateDomainSuggestions = (patterns: DomainPatterns, niche: string): string[] => {
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

  // Function to check domain availability via Name.com API
  const checkDomainAvailability = async (domains: string[]): Promise<Array<{domain: string, available: boolean, price?: string}>> => {
    const results = [];
    
    for (const domain of domains) {
      try {
        // Note: You'll need to replace this with actual Name.com API integration
        // For now, this is a mock implementation
        const isAvailable = Math.random() > 0.7; // Mock availability check
        const price = isAvailable ? '$12.99' : undefined;
        
        results.push({
          domain,
          available: isAvailable,
          price
        });
      } catch (error) {
        console.error(`Error checking ${domain}:`, error);
        results.push({
          domain,
          available: false
        });
      }
    }
    
    return results;
  };

  const handleAnalyze = () => {
    if (!niche.trim()) return;

    setIsAnalyzing(true);
    setSelectedNiche(niche);

    try {
      const stores = getTopStoresForNiche(niche);
      setTopStores(stores);

      const domainList = extractDomainNames(stores);
      const patterns = analyzeDomainPatterns(domainList, niche);
      setDomainPatterns(patterns);
      
      // Generate domain recommendations
      generateDomainRecommendations(patterns, niche, []).then(recommendations => {
        // Handle the recommendations here
        console.log('Domain recommendations:', recommendations);
      });
      
      //generateOpenAIPatterns(domainList);
    } catch (error) {
      console.error('Error analyzing competitors:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to generate OpenAI content for patterns
  const generateOpenAIPatterns = async (domains:string[]) => {

    try {
      const prompt = `Analyze the domain name patterns like average length,
      range length, word count, most common word count, common words, niche keywords, industry terms,
      suffixes, prefixes, unique patterns, contains a number, brand types to the following domain names and aggregate all the findings:
      ${domains.join(', ')}
      
      Do not include any suggestions in the findings.
      Also do not include a summary of the domain names in the findings.

      Return the output as a raw JSON array with no code fences, markdown or additional text.`;

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          domains
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiAnalysis = data.analysis;
    } catch (error) {
      console.error('Error generating OpenAI patterns:', error);
    } finally {
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
            </div>;
            ;            {/* Top E-commerce Stores Section */}
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

                {/* Domain Patterns Found Section - Full Width */}
                {domainPatterns && (
                  <PatternsDisplay patterns={domainPatterns} title="Domain Patterns Found" />
                )}

                {/* Recommendations for Your Domain Section */}
                {domainPatterns && (
                  <RecommendationsDisplay 
                    patterns={domainPatterns} 
                    niche={selectedNiche}
                    title="Recommendations for Your Domain" 
                  />
                )}

                {/* Our Recommendation Section */}
                {domainPatterns && (
                  <DomainRecommendations patterns={domainPatterns} niche={selectedNiche} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
