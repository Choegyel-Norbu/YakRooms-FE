import React, { useState } from 'react';
import Toast from './Toast';
import { Button } from '@/components/ui/button';

const ToastTest = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Toast Visibility Test (Yellow Theme)</h2>
      
      <div className="space-y-2">
        <Button 
          onClick={() => setShowSuccess(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Show Success Toast
        </Button>
        
        <Button 
          onClick={() => setShowError(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Show Error Toast
        </Button>
        
        <Button 
          onClick={() => setShowInfo(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Show Info Toast
        </Button>
        
        <Button 
          onClick={() => setShowWarning(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Show Warning Toast
        </Button>
      </div>

      {/* Toast Components */}
      {showSuccess && (
        <Toast
          type="success"
          message="This is a success message with yellow theme!"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {showError && (
        <Toast
          type="error"
          message="This is an error message with yellow theme!"
          onClose={() => setShowError(false)}
        />
      )}

      {showInfo && (
        <Toast
          type="info"
          message="This is an info message with yellow theme!"
          onClose={() => setShowInfo(false)}
        />
      )}

      {showWarning && (
        <Toast
          type="warning"
          message="This is a warning message with yellow theme!"
          onClose={() => setShowWarning(false)}
        />
      )}
    </div>
  );
};

export default ToastTest; 