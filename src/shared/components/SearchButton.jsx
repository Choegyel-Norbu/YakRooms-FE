import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from './button';

const SearchButton = ({ children, className, loading, loadingText, ...props }) => {
  return (
    <Button 
      type="submit" 
      className={className} 
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          <Search className="w-4 h-4 mr-2" />
          {children}
        </>
      )}
    </Button>
  );
};

export default SearchButton;
