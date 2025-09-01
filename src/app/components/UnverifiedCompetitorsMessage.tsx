import React from 'react';

interface UnverifiedCompetitorsMessageProps {
  niche: string;
}

const UnverifiedCompetitorsMessage: React.FC<UnverifiedCompetitorsMessageProps> = ({
  niche
}) => {
  return (
    <>
    <div className="bg-[#333333] border border-[#FACC15] text-[#A0A0A0] rounded-xl p-6">
      <b>Note:</b> {`We don't have verified competitors for '${niche}' yet. Domain suggestions below are based on general e-commerce patterns.`}
    </div>
    <div className="bg-[#333333] border border-[#FACC15] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 bg-[#FACC15] rounded-full"></div>
        <h3 className="text-xl font-semibold text-[#FACC15]">General Domain Tips:</h3>
      </div>
      
      <ul className="space-y-2 text-[#A0A0A0]">
        <li>{`• Consider using professional suffixes like 'pro', 'direct', 'hub'.`}</li>
        <li>{`• Keep domain length between 10-15 characters.`}</li>
        <li>{`• Use niche-specific keywords.`}</li>
      </ul>
    </div>
    </>
  );
};

export default UnverifiedCompetitorsMessage;
