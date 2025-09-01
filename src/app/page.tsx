'use client';

import { useState } from 'react';
import { analyzeDomainPatterns, type DomainPatterns } from './utils/domainAnalyzer';
import { getTopStoresForNiche, extractDomainNames } from './utils/nicheHelper';
import PatternsDisplay from './components/PatternsDisplay';
import RecommendationsDisplay from './components/RecommendationsDisplay';

export default function Home() {
  const [niche, setNiche] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [topStores, setTopStores] = useState<{ domain: string }[]>([]);
  const [selectedNiche, setSelectedNiche] = useState<string>('backyard');
  const [domainPatterns, setDomainPatterns] = useState<DomainPatterns>();

  // Function to analyze domain patterns
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
      
      generateOpenAIPatterns(domainList);
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
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
