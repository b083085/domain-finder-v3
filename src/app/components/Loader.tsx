import React from 'react';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const Loader: React.FC<LoaderProps> = ({ 
  message = 'Analyzing...', 
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {/* Spinning loader */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-[#333333] border-t-[#FACC15] rounded-full animate-spin`}></div>
      </div>
      
      {/* Loading message */}
      <div className="text-center">
        <p className="text-[#FACC15] text-lg font-semibold">{message}</p>
        <p className="text-[#A0A0A0] text-sm mt-1">Please wait while we analyze your niche...</p>
      </div>
      
      {/* Animated dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-[#FACC15] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-[#FACC15] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-[#FACC15] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default Loader;
