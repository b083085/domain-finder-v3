import React from 'react';
import { DomainPatterns, formatPatternsForDisplay } from '../utils/domainAnalyzer';

interface PatternsDisplayProps {
  patterns: DomainPatterns;
  title?: string;
}

const PatternsDisplay: React.FC<PatternsDisplayProps> = ({ 
  patterns, 
  title = "Domain Analysis Results" 
}) => {
  const formattedPatterns = formatPatternsForDisplay(patterns);

  return (
    <div className="bg-[#333333] border border-[#FACC15] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 bg-[#FACC15] rounded"></div>
        <h3 className="text-xl font-semibold text-[#FACC15]">{title}:</h3>
      </div>
      
      <div className="space-y-4 text-[#A0A0A0]">
        {Object.entries(formattedPatterns).map(([key, value]) => (
          value && (
            <div key={key}>
              <strong className="text-[#FACC15]">{key}:</strong> {value}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default PatternsDisplay;
