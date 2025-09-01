import React from 'react';
import { DomainPatterns, generateRecommendations } from '../utils/domainAnalyzer';

interface RecommendationsDisplayProps {
  patterns: DomainPatterns;
  niche: string;
  title?: string;
}

const RecommendationsDisplay: React.FC<RecommendationsDisplayProps> = ({ 
  patterns, 
  niche,
  title = "Recommendations for Your Domain" 
}) => {
  const recommendations = generateRecommendations(niche, patterns);

  return (
    <div className="bg-[#333333] border border-[#FACC15] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 bg-[#FACC15] rounded-full"></div>
        <h3 className="text-xl font-semibold text-[#FACC15]">{title}:</h3>
      </div>
      
      <ul className="space-y-2 text-[#A0A0A0]">
        {recommendations.map((recommendation, index) => (
          <li key={index}>• {recommendation}</li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendationsDisplay;
