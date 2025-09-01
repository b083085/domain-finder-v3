'use client';

import { useState } from 'react';
import { analyzeDomainPatterns, type DomainPatterns } from './utils/domainAnalyzer';
import { getTopStoresForNiche, extractDomainNames, getNicheKeywords, extractIndustryTermsFromDomains } from './utils/nicheHelper';
import PatternsDisplay from './components/PatternsDisplay';
import RecommendationsDisplay from './components/RecommendationsDisplay';
import DomainRecommendations from './components/DomainRecommendations';
import { generateUniqueDomainList } from './utils/domainGenerator';
import UnverifiedCompetitorsMessage from './components/UnverifiedCompetitorsMessage';
import { generateDomainRecommendations } from './utils/domainRecommendations';

export default function Home() {
  const [niche, setNiche] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [topStores, setTopStores] = useState<{ domain: string }[]>([]);
  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const [domainPatterns, setDomainPatterns] = useState<DomainPatterns>();
  const [noStores, setNoStores] = useState<boolean>(false);


  const handleAnalyze = () => {
    if (!niche.trim()) return;

    setIsAnalyzing(true);
    setSelectedNiche(niche);

    try {
      const stores = getTopStoresForNiche(niche);
      if (stores && stores.length > 0) {
        setNoStores(false);

        setTopStores(stores);

        const domainList = extractDomainNames(stores);
        const patterns = analyzeDomainPatterns(domainList, niche);
        setDomainPatterns(patterns);

        // Generate domain recommendations
        generateDomainRecommendations(patterns, niche, []).then(recommendations => {
          // Handle the recommendations here
          console.log('Domain recommendations:', recommendations);
        });
      } else {
        setNoStores(true);

        getNicheKeywords(niche).then(keywords => {
          // Generate unique domain list using OpenAI
          generateUniqueDomainList(niche, keywords).then(domainList => {
            const patterns = analyzeDomainPatterns(domainList, niche);
            extractIndustryTermsFromDomains(domainList, niche).then(industryTerms => {
              console.log('Industry terms from generated domains:', industryTerms);
              patterns.industryTerms = industryTerms;
              patterns.nicheKeywords = keywords;
              setDomainPatterns(patterns);
              
              // Generate domain recommendations
              generateDomainRecommendations(patterns, niche, []).then(recommendations => {
                // Handle the recommendations here
                console.log('Domain recommendations:', recommendations);
              });
            });
          });
        });
      }
      //generateOpenAIPatterns(domainList);
    } catch (error) {
      console.error('Error analyzing competitors:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
            {(topStores.length > 0 || noStores) && (
              <>
                {!noStores && (<div className="bg-[#333333] rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-[#FACC15] mb-4">
                    {`Top Private E-commerce Stores in ${selectedNiche}`}
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
                </div>)}

                {noStores && (
                  <UnverifiedCompetitorsMessage niche={selectedNiche} />
                )}

                {/* Domain Patterns Found Section - Full Width */}
                {domainPatterns && !noStores && (
                  <PatternsDisplay patterns={domainPatterns} title="Domain Patterns Found" />
                )}

                {/* Recommendations for Your Domain Section */}
                {domainPatterns && !noStores && (
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
  )
}
