import React, { useState, useEffect, useCallback } from 'react';
import { DomainPatterns } from '../utils/domainAnalyzer';
import { generateDomainRecommendations, DomainRecommendation } from '../utils/domainRecommendations';

interface DomainRecommendationsProps {
  patterns: DomainPatterns;
  niche: string;
}

const DomainRecommendations: React.FC<DomainRecommendationsProps> = ({ patterns, niche }) => {
  const [recommendations, setRecommendations] = useState<DomainRecommendation[]>([]);
  const [otherOptions, setOtherOptions] = useState<DomainRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchDomainRecommendations = useCallback(async () => {
    if (!patterns && !niche) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const recommendations = await generateDomainRecommendations(patterns, niche, []);
      setRecommendations(recommendations);
      setOtherOptions(recommendations.slice(1, 6));
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('Failed to generate recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [patterns, niche]);

  // Only run effect when patterns or niche actually change
  useEffect(() => {
    fetchDomainRecommendations();
  }, [fetchDomainRecommendations]);

  // Function to generate more domain options
  const handleGenerateMoreOptions = async () => {
    setIsGeneratingMore(true);
    
    try {
      const newRecommendations = await generateDomainRecommendations(patterns, niche, otherOptions.map(option => option.domain));
      
      const top5Options = newRecommendations
        .sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0))
        .slice(0, 5);
      
      setOtherOptions(prev => [...prev, ...top5Options]);
    } catch (error) {
      console.error('Error generating more options:', error);
    } finally {
      setIsGeneratingMore(false);
    }
  };

  // Early return for loading state
  if (isLoading) {
    return (
      <div className="bg-[#333333] border-2 border-[#FACC15] rounded-xl p-6">
        <h3 className="text-xl font-semibold text-[#FACC15] mb-4">Our Recommendation:</h3>
        <div className="bg-[#1A1A1A] border border-[#FACC15] rounded-lg p-6">
          <div className="text-center text-[#A0A0A0]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FACC15] mx-auto mb-2"></div>
            <p>Generating domain recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <div className="bg-[#333333] border-2 border-[#FACC15] rounded-xl p-6">
        <h3 className="text-xl font-semibold text-[#FACC15] mb-4">Our Recommendation:</h3>
        <div className="bg-[#1A1A1A] border border-[#FACC15] rounded-lg p-6">
          <div className="text-center text-red-400">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Early return if no recommendations
  if (recommendations.length === 0) {
    return null;
  }

  const topRecommendation = recommendations.find(r => r.available) || recommendations[0];

  return (
    <>
      {/* Our Recommendation Section */}
      <div className="bg-[#333333] border-2 border-[#FACC15] rounded-xl p-6">
        <h3 className="text-xl font-semibold text-[#FACC15] mb-4">Our Recommendation:</h3>
        <div className="bg-[#1A1A1A] border border-[#FACC15] rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-3xl font-bold text-white mb-2">{topRecommendation.domain}</div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-5 h-5 rounded-full ${topRecommendation.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`font-medium ${topRecommendation.available ? 'text-green-400' : 'text-red-400'}`}>
                  {topRecommendation.available ? 'Available' : 'Taken'}
                </span>
              </div>
              <div className="text-sm text-[#A0A0A0] italic">
                Selected because: {topRecommendation.reason}
              </div>
            </div>
            <div className="text-3xl font-bold text-white">
              {topRecommendation.price || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Other Options Section */}
      <div className="bg-[#333333] rounded-xl p-6">
        <h3 className="text-xl font-semibold text-[#FACC15] mb-4">Other options:</h3>
        <div className="space-y-3">
          {otherOptions.map((option, index) => (
            <div key={`${option.domain}-${index}`} className="flex justify-between items-center p-4 bg-[#1A1A1A] border border-[#333333] rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg font-medium text-white">{option.domain}</span>
                <div className={`w-3 h-3 rounded-full ${option.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${option.available ? 'text-green-400' : 'text-red-400'}`}>
                  {option.available ? 'Available' : 'Taken'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white">
                  {option.price || 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <button 
            onClick={handleGenerateMoreOptions}
            disabled={isGeneratingMore}
            className="px-6 py-3 bg-[#eab308] text-black font-semibold rounded-lg hover:bg-[#fbbf24] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingMore ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                Generating...
              </div>
            ) : (
              '+ Generate 5 More Options'
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default DomainRecommendations;
