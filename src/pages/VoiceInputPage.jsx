import React from 'react';
import StatusBar from '../components/common/StatusBar';
import HomeIndicator from '../components/common/HomeIndicator';

/**
 * VoiceInputPage - Voice input interface (placeholder)
 */
const VoiceInputPage = ({ onClose }) => {
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-gray-100">
      <StatusBar />
      
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-6xl mb-4">🎤</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Voice Input</h1>
        <p className="text-gray-600 text-center mb-8">Voice input functionality coming soon...</p>
        
        <button 
          onClick={handleClose}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Back
        </button>
      </div>
      
      <HomeIndicator />
    </div>
  );
};

export default VoiceInputPage;
