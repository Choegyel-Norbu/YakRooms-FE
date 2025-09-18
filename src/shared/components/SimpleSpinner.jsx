import React from 'react';
import { Loader2 } from 'lucide-react';

const SimpleSpinner = ({ 
  size = 32, 
  className = "",
  text = "Loading..."
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 className="animate-spin text-primary" size={size} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
};

export default SimpleSpinner;
