import React from 'react';
import { Search } from 'lucide-react';
import { Button } from './button';

const SearchButton = ({ children, className, ...props }) => {
  return (
    <Button 
      type="submit" 
      className={className} 
      {...props}
    >
      <Search className="w-4 h-4 mr-2" />
      {children}
    </Button>
  );
};

export default SearchButton;
