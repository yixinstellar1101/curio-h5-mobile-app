import React, { useState, useRef } from 'react';
import { PAGES } from '../constants/pages';

// Asset imports from Figma
const imgStatusBattery = "/src/assets/c0c091687c62d7337bf318e17f3769ffc34d3a72.svg";
const imgStatusWifi = "/src/assets/94bdfe1a8077b65bf75e0473782ae3df50cd473f.svg";
const imgStatusCellular = "/src/assets/a883d1003c9c8d00c12b4d64e84ed02fcbbf9603.svg";
const imgBackground = "/src/assets/2339a82e4b6020c219c18a48dca73ef3ba006ffe.png";

const GalleryPage = ({ data = {}, onNavigate }) => {
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  
  const { image, analysis } = data || {};
  
  // Get metadata from analysis results or use defaults for demo
  const getMetadata = () => {
    if (analysis?.analysis) {
      // Use actual analysis data if available
      return {
        title: analysis.metadata?.name || "The Enigmatic Aristocat", 
        timestamp: analysis.metadata?.timestamp || new Date().toLocaleString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        description: analysis.metadata?.description || analysis.analysis.description || "This Persian might featured in Tissot's 1866 portrait of the Marquise de Miramon epitomizes Victorian aristocratic cats, its gemstone eyes echoing the luxury of Empress Eugénie's court pets...."
      };
    }
    
    // Default metadata for demo showing the expected structure
    return {
      title: "The Enigmatic Aristocat",
      timestamp: "July 8, 3:42PM", 
      description: "This Persian might featured in Tissot's 1866 portrait of the Marquise de Miramon epitomizes Victorian aristocratic cats, its gemstone eyes echoing the luxury of Empress Eugénie's court pets...."
    };
  };

  const metadata = getMetadata();
  
  // Background image selection based on category or use default
  const getBackgroundImage = () => {
    if (analysis?.background?.imageUrl) {
      return analysis.background.imageUrl;
    }
    
    // Default Victorian/aristocratic background for the demo
    return imgBackground;
  };

  const backgroundImageSrc = getBackgroundImage();
  
  // Create composed image URL - use composite if available, otherwise captured image
  const getComposedImage = () => {
    if (analysis?.compositeImageUrl) {
      return analysis.compositeImageUrl;
    }
    
    if (image) {
      return URL.createObjectURL(image);
    }
    
    // Fallback to a placeholder image
    return "/src/assets/2339a82e4b6020c219c18a48dca73ef3ba006ffe.png";
  };

  const composedImageSrc = getComposedImage();

  // Handle swipe gestures
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    // Optional: Add visual feedback during drag
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;
    const threshold = 100; // Minimum swipe distance
    
    // Left swipe (swipe right to left) - go back to HomePage
    if (deltaX > threshold) {
      onNavigate && onNavigate(PAGES.HOME);
    }
    
    setIsDragging(false);
    setStartX(0);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-[393px] h-[852px] bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImageSrc})`
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Status bar */}
      <div className="absolute flex items-center justify-between w-full px-[24px] top-[12px]">
        <div className="text-white text-[15px] font-semibold leading-[20px] font-sf-pro">
          12:15
        </div>
        <div className="flex items-center gap-[5px]">
          <img className="w-[17px] h-[10px]" src={imgStatusCellular} alt="Cellular" />
          <img className="w-[15px] h-[11px]" src={imgStatusWifi} alt="WiFi" />
          <img className="w-[24px] h-[11px]" src={imgStatusBattery} alt="Battery" />
        </div>
      </div>

      {/* Main image container - no frame */}
      <div className="absolute left-[50%] top-[120px] transform -translate-x-1/2">
        <div className="relative w-[300px] h-[400px]">
          <img 
            className="w-full h-full object-cover rounded-[8px]"
            src={composedImageSrc}
            alt="Captured scene"
          />
        </div>
      </div>

      {/* Text content - following Figma design exactly */}
      <div className="absolute left-[50%] bottom-[140px] transform -translate-x-1/2 text-center">
        {/* Title */}
        <h1 className="text-white text-[28px] font-bold leading-[34px] font-sf-pro mb-[8px]">
          {metadata.title}
        </h1>
        
        {/* Timestamp */}
        <div className="text-white/70 text-[16px] font-normal leading-[21px] font-sf-pro mb-[16px]">
          {metadata.timestamp}
        </div>
        
        {/* Description */}
        <div className="text-white/90 text-[16px] font-normal leading-[24px] font-sf-pro max-w-[345px]">
          {metadata.description}
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="absolute bottom-[8px] left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] bg-white rounded-[2.5px]" />
    </div>
  );
};

export default GalleryPage;