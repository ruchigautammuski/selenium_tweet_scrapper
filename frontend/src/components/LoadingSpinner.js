import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text, small }) => {
  if (small) {
    return <Loader2 className="h-5 w-5 animate-spin" />;
  }
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      <p className="text-lg font-semibold text-gray-300">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
