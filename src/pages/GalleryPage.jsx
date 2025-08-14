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
  const [showPopup, setShowPopup] = useState(false);
  const containerRef = useRef(null);
  
  // Extract data from the structure passed by ImageAnalysisPage
  const { 
    analysis, 
    originalImage, 
    imageUrl, 
    backgroundImage,
    category,
    style,
    objects = [],
    source,
    timestamp,
    composition
  } = data || {};
  
  console.log('GalleryPage received data:', data); // Debug log
  
  // Get metadata from analysis results or use defaults for demo
  const getMetadata = () => {
    if (analysis?.analysis) {
      // Use actual analysis data if available
      const analysisData = analysis.analysis;
      return {
        title: `The ${category ? category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Enigmatic'} Scene`, 
        timestamp: timestamp ? new Date(timestamp).toLocaleString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }) : new Date().toLocaleString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        description: `${analysisData.description} Enhanced with ${style || 'classic'} artistic styling.`
      };
    }
    
    // Default metadata for demo showing the expected structure
    return {
      title: "The Enigmatic Scene",
      timestamp: new Date().toLocaleString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }), 
      description: `A beautifully captured moment enhanced with AI analysis and ${style || 'classic'} artistic background composition.`
    };
  };

  const metadata = getMetadata();
  
  // Background image selection based on category or use default
  const getBackgroundImage = () => {
    // Use the backgroundImage from analysis data (already randomly selected)
    if (backgroundImage) {
      console.log('Using backgroundImage from analysis:', backgroundImage);
      return backgroundImage;
    }
    
    // Use analysis background if available
    if (analysis?.analysis?.backgroundImage) {
      console.log('Using analysis.analysis.backgroundImage:', analysis.analysis.backgroundImage);
      return analysis.analysis.backgroundImage;
    }
    
    // Fallback: randomly select background based on style and category
    if (style) {
      const getRandomBackground = (styleType) => {
        const backgroundCounts = {
          'Chinese': 4,    // Chinese_3_4_01.jpg to Chinese_3_4_04.jpg
          'European': 6,   // European_3_4_01.jpg to European_3_4_06.jpg  
          'Morden': 6      // Morden_3_4_01.jpg to Morden_3_4_06.jpg
        };
        
        const count = backgroundCounts[styleType] || 4;
        const randomNum = Math.floor(Math.random() * count) + 1;
        const paddedNum = randomNum.toString().padStart(2, '0');
        
        return `/src/assets/backgrounds/${styleType}/${styleType}_3_4_${paddedNum}.jpg`;
      };
      
      const selectedBackground = getRandomBackground(style);
      console.log('Generated random background for style', style, ':', selectedBackground);
      return selectedBackground;
    }
    
    // Final fallback to default
    console.log('Using default background fallback');
    return imgBackground;
  };

  const backgroundImageSrc = getBackgroundImage();
  
  // Create composed image URL - use the uploaded/captured image
  const getComposedImage = () => {
    // First priority: use the imageUrl passed from ImageAnalysisPage
    if (imageUrl) {
      console.log('Using imageUrl from data:', imageUrl);
      return imageUrl;
    }
    
    // Second priority: create URL from originalImage file
    if (originalImage) {
      console.log('Creating URL from originalImage file');
      return URL.createObjectURL(originalImage);
    }
    
    // Legacy support: check if there's an 'image' property
    if (data.image) {
      console.log('Using legacy image property');
      return URL.createObjectURL(data.image);
    }
    
    // Fallback: use a placeholder
    console.log('Using fallback placeholder image');
    return "/src/assets/2339a82e4b6020c219c18a48dca73ef3ba006ffe.png";
  };

  const composedImageSrc = getComposedImage();

  // Handle image click to show popup
  const handleImageClick = () => {
    setShowPopup(true);
  };

  // Handle popup actions
  const handleEnterLiveRoom = () => {
    setShowPopup(false);
    onNavigate && onNavigate(PAGES.LIVE_ROOM, { 
      originalImage, 
      imageUrl, 
      analysis,
      backgroundImage,
      category,
      style,
      objects 
    });
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

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
        <div className="relative w-[300px] h-[400px] cursor-pointer" onClick={handleImageClick}>
          <img 
            className="w-full h-full object-cover rounded-[8px]"
            src={composedImageSrc}
            alt="Captured scene"
          />
        </div>
      </div>

      {/* Text content - following Figma design exactly */}
      <div className="absolute left-0 right-0 bottom-[140px] flex flex-col items-center gap-2 px-[24px]">
        {/* Title */}
        <h1 className="text-white text-[28px] font-bold leading-[34px] font-sf-pro text-center">
          {metadata.title}
        </h1>
        
        {/* Timestamp */}
        <div className="text-white/70 text-[16px] font-normal leading-[21px] font-sf-pro text-center">
          {metadata.timestamp}
        </div>
        
        {/* Description */}
        <div className="text-white/90 text-[16px] font-normal leading-[24px] font-sf-pro text-center max-w-[345px]">
          {metadata.description}
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="absolute bottom-[8px] left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] bg-white rounded-[2.5px]" />

      {/* Popup Modal */}
      {showPopup && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[16px] p-[24px] mx-[32px] max-w-[329px] w-full">
            {/* Modal Header */}
            <div className="text-center mb-[20px]">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[8px]">
                Enter Live Room
              </h3>
              <p className="text-[16px] text-gray-600 leading-[24px]">
                Would you like to enter the live room and start a conversation about this image?
              </p>
            </div>
            
            {/* Modal Buttons */}
            <div className="flex gap-[12px]">
              <button
                onClick={handleClosePopup}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-[12px] px-[20px] rounded-[12px] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEnterLiveRoom}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-[12px] px-[20px] rounded-[12px] font-medium transition-colors"
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;