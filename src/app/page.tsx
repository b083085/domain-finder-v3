'use client';

import { useState } from 'react';
import { niche_variations, PRIVATE_ECOM_STORES } from './niches';

export default function Home() {
  const [niche, setNiche] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [topStores, setTopStores] = useState<{domain: string}[]>([]);
  const [selectedNiche, setSelectedNiche] = useState<string>('backyard');

  // Function to search competitors based on niche
  const searchCompetitors = (searchNiche: string) => {
    const normalizedNiche = searchNiche.toLowerCase().trim();
    
    // First, check if niche is in niche_variations
    if (normalizedNiche in niche_variations) {
      const mappedNiche = niche_variations[normalizedNiche as keyof typeof niche_variations];
      if (mappedNiche in PRIVATE_ECOM_STORES) {
        setSelectedNiche(mappedNiche);
        setTopStores(PRIVATE_ECOM_STORES[mappedNiche as keyof typeof PRIVATE_ECOM_STORES]);
        return;
      }
    }
    
    // If not found in niche_variations, check if niche is directly in PRIVATE_ECOM_STORES
    if (normalizedNiche in PRIVATE_ECOM_STORES) {
      setSelectedNiche(normalizedNiche);
      setTopStores(PRIVATE_ECOM_STORES[normalizedNiche as keyof typeof PRIVATE_ECOM_STORES]);
      return;
    }
    
    // If still not found, check if any niche in PRIVATE_ECOM_STORES contains the search term
    for (const [nicheKey, stores] of Object.entries(PRIVATE_ECOM_STORES)) {
      if (nicheKey.toLowerCase().includes(normalizedNiche) || 
          normalizedNiche.includes(nicheKey.toLowerCase())) {
        setSelectedNiche(nicheKey);
        setTopStores(stores);
        return;
      }
    }
    
    // If no matches found, set default backyard stores
    setSelectedNiche('backyard');
    setTopStores(PRIVATE_ECOM_STORES['backyard']);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Search for competitors based on the entered niche
    searchCompetitors(niche);
    
    // Simulate analysis delay
    setTimeout(() => setIsAnalyzing(false), 1000);
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
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-6 h-6 bg-[#FACC15] rounded"></div>
                      <h3 className="text-xl font-semibold text-[#FACC15]">Domain Patterns Found:</h3>
                    </div>
                    <ul className="space-y-2 text-[#A0A0A0]">
                      <li>• Length: 7-20 characters (average: 14)</li>
                      <li>• Structure: Most use 3-word compound domains</li>
                      <li>• Industry terms: bbq, fire, pits, firepit</li>
                      <li>• Domain structures: niche word + business term, multi-word phrase, three-word combination</li>
                      <li>• Brand approach: compound and industry-specific</li>
                    </ul>
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
