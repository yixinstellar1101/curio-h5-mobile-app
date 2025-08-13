import React, { useEffect, useState } from 'react';
import StatusBar from '../components/common/StatusBar';
import HomeIndicator from '../components/common/HomeIndicator';

/**
 * CameraCapturingPage - Show capture process animation during photo capture
 */
const CameraCapturingPage = ({ file, onComplete }) => {
  const [animationStage, setAnimationStage] = useState('flash');

  useEffect(() => {
    const animationSequence = async () => {
      // Stage 1: Flash effect (200ms)
      setTimeout(() => {
        setAnimationStage('processing');
      }, 200);
      
      // Stage 2: Processing effect (1500ms)
      setTimeout(() => {
        setAnimationStage('complete');
      }, 1700);
      
      // Stage 3: Complete and callback (500ms)
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 2200);
    };
    
    animationSequence();
  }, [onComplete]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <StatusBar />
      
      {/* Flash Stage */}
      {animationStage === 'flash' && (
        <div className="absolute inset-0 bg-white animate-pulse">
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl animate-bounce">📸</div>
          </div>
        </div>
      )}
      
      {/* Processing Stage */}
      {animationStage === 'processing' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
          <div className="flex flex-col items-center justify-center h-full p-8">
            
            {/* Captured Image Preview */}
            {file && (
              <div className="w-64 h-64 rounded-3xl overflow-hidden shadow-2xl mb-8 animate-pulse">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Captured" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Processing Animation */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-white/20 rounded-full animate-spin">
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-white border-r-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Processing Image</h2>
              <p className="text-gray-300">Preparing your capture...</p>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-4 h-4 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="absolute top-32 right-16 w-3 h-3 bg-blue-300/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute bottom-40 left-20 w-2 h-2 bg-purple-300/50 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-60 right-12 w-5 h-5 bg-pink-300/30 rounded-full animate-bounce" style={{ animationDelay: '0.7s' }}></div>
          </div>
        </div>
      )}
      
      {/* Complete Stage */}
      {animationStage === 'complete' && (
        <div className="absolute inset-0 bg-green-900">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-8xl mb-4 animate-bounce">✅</div>
            <h2 className="text-3xl font-bold text-white mb-2">Perfect!</h2>
            <p className="text-green-200">Image captured successfully</p>
            
            {/* Success ripple effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-4 border-white/30 rounded-full animate-ping"></div>
              <div className="absolute w-48 h-48 border-4 border-white/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <HomeIndicator />
    </div>
  );
};

export default CameraCapturingPage;
