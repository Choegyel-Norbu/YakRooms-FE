import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/button';

const ToastTest = () => {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Sonner Toast Test (Bottom-Left Position)</h2>
      
      <div className="space-y-2">
        <Button 
          onClick={() => toast.success("This is a success message!")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Show Success Toast
        </Button>
        
        <Button 
          onClick={() => toast.error("This is an error message!")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Show Error Toast
        </Button>
        
        <Button 
          onClick={() => toast.info("This is an info message!")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Show Info Toast
        </Button>
        
        <Button 
          onClick={() => toast.warning("This is a warning message!")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Show Warning Toast
        </Button>
      </div>
    </div>
  );
};

export default ToastTest; 