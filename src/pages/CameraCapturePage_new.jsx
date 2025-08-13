import React, { useState, useRef, useEffect } from 'react';
import { PAGES } from '../constants/constants';
import StatusBar from '../components/StatusBar';
import HomeIndicator from '../components/HomeIndicator';

// Figma generated Frame component
const Frame = ({ className, ...props }) => (
  <div 
    className={`absolute ${className}`} 
    style={{
      width: 393,
      height: 852,
      background: 'white',
      borderRadius: 16
    }} 
    {...props} 
  />
);

const CameraCapturePage = ({ onNavigate, fileData }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  const initializeCamera = async () => {
    try {
      setHasPermission(null);
      setError('');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setHasPermission(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();

    // 清理函数
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleBack = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onNavigate && onNavigate(PAGES.IMAGE_UPLOAD);
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;
    
    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob && blob.size <= 5 * 1024 * 1024) { // 5MB limit
          console.log('Photo captured:', blob.size, 'bytes');
          
          // Create file object from blob
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          
          // Stop camera and navigate to analysis
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          
          setTimeout(() => {
            setIsCapturing(false);
            onNavigate && onNavigate(PAGES.IMAGE_ANALYSIS, { file, source: 'camera' });
          }, 500);
        } else {
          setError('照片文件过大，请重试');
          setIsCapturing(false);
        }
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      console.error('Capture error:', error);
      setError('拍照失败，请重试');
      setIsCapturing(false);
    }
  };

  const handleSelectFromAlbum = () => {
    // Trigger file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.multiple = false;
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file && file.size <= 5 * 1024 * 1024) {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        onNavigate && onNavigate(PAGES.IMAGE_ANALYSIS, { file, source: 'album' });
      } else {
        alert('Please select an image file under 5MB');
      }
    };
    
    input.click();
  };

  // Error state
  if (hasPermission === false || error) {
    return (
      <div className="absolute inset-0 w-full h-full bg-gray-900 flex flex-col">
        <StatusBar />
        
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-6">📷</div>
          <h2 className="text-2xl font-bold text-white mb-4">Camera Access Required</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            {error || 'Please allow camera access to take photos. You can also select an image from your album instead.'}
          </p>
          
          <div className="w-full max-w-sm space-y-4">
            <button 
              onClick={initializeCamera}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-2xl transition-colors"
            >
              Try Again
            </button>
            
            <button 
              onClick={handleSelectFromAlbum}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-2xl transition-colors"
            >
              Select from Album
            </button>
            
            <button 
              onClick={handleBack}
              className="w-full border-2 border-gray-500 hover:border-gray-400 text-gray-300 hover:text-white font-semibold py-3 px-6 rounded-2xl transition-colors"
            >
              Back
            </button>
          </div>
        </div>
        
        <HomeIndicator />
      </div>
    );
  }

  // Loading state
  if (hasPermission === null) {
    return (
      <div className="absolute inset-0 w-full h-full bg-gray-900 flex flex-col">
        <StatusBar />
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white">Initializing camera...</p>
        </div>
        
        <HomeIndicator />
      </div>
    );
  }

  // Main camera interface with Figma design
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Camera video background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Figma Frame Overlay */}
      <Frame className="inset-0 pointer-events-none" />
      
      {/* Top controls bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <StatusBar />
        
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <h1 className="text-white text-lg font-medium">Camera</h1>
          
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-8">
        <div className="flex items-center justify-center px-8 py-6">
          <div className="flex items-center justify-between w-full max-w-sm">
            {/* Gallery button */}
            <button
              onClick={handleSelectFromAlbum}
              className="w-12 h-12 rounded-xl bg-black/20 backdrop-blur-md flex items-center justify-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="white" strokeWidth="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="white"/>
                <polyline points="21,15 16,10 5,21" stroke="white" strokeWidth="2"/>
              </svg>
            </button>
            
            {/* Capture button */}
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center disabled:opacity-50"
            >
              {isCapturing ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-red-500"></div>
              )}
            </button>
            
            {/* Switch camera button */}
            <button className="w-12 h-12 rounded-xl bg-black/20 backdrop-blur-md flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 8l4 4-4 4m-6-4h9M7 16l-4-4 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        <HomeIndicator />
      </div>

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-x-4 top-20 bg-red-500 text-white px-4 py-3 rounded-lg z-30">
          {error}
        </div>
      )}
    </div>
  );
};

export default CameraCapturePage;
