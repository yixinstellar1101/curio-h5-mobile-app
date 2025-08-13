import React, { useState, useRef, useEffect } from 'react';
import StatusBar from '../components/common/StatusBar';
import HomeIndicator from '../components/common/HomeIndicator';

/**
 * VolumeSettingsPage - Volume settings modal (matches Page 17 from HTML)
 */
const VolumeSettingsPage = ({ onClose }) => {
  const [volumeLevel, setVolumeLevel] = useState(16); // Initial position matches HTML
  const sliderRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !sliderRef.current) return;
      
      const slider = sliderRef.current;
      const rect = slider.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newLevel = Math.max(0, Math.min(248, x)); // 248px is the slider width
      setVolumeLevel(newLevel);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current || !sliderRef.current) return;
      
      const touch = e.touches[0];
      const slider = sliderRef.current;
      const rect = slider.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const newLevel = Math.max(0, Math.min(248, x));
      setVolumeLevel(newLevel);
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  const handleSliderClick = (e) => {
    if (!sliderRef.current) return;
    
    const slider = sliderRef.current;
    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newLevel = Math.max(0, Math.min(248, x));
    setVolumeLevel(newLevel);
  };

  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  const handleTouchStart = () => {
    isDraggingRef.current = true;
  };

  return (
    <div className="absolute inset-0 w-full h-full" style={{ width: '393px', height: '852px' }}>
      {/* Background with museum artwork */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat" 
        style={{ backgroundImage: "url('./src/assets/2339a82e4b6020c219c18a48dca73ef3ba006ffe.png')" }}
      ></div>
      
      {/* Full screen overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      
      {/* Status bar V2 */}
      <div className="absolute flex flex-col items-start justify-start left-1/2 p-0 top-0 transform -translate-x-1/2 w-[393px] z-30">
        <div className="h-11 relative w-full">
          <div className="absolute h-[22px] left-[26px] top-[15px] w-[54px]">
            <div 
              className="absolute font-semibold leading-[0] left-0 not-italic right-0 text-[#ffffff] text-[17px] text-center" 
              style={{ 
                top: 'calc(50% - 11px)',
                fontFamily: "'SF Pro Text', sans-serif" 
              }}
            >
              <p className="block leading-[22px]">12:15</p>
            </div>
          </div>
          <div className="absolute h-[13px] right-[26.339px] top-[19.333px] w-[27.328px]">
            <img 
              alt="Battery" 
              className="block max-w-none w-full h-full" 
              src="./src/assets/c0c091687c62d7337bf318e17f3769ffc34d3a72.svg" 
            />
          </div>
          <div className="absolute h-3 right-[61px] top-5 w-[17px]">
            <img 
              alt="Wifi" 
              className="block max-w-none w-full h-full" 
              src="./src/assets/94bdfe1a8077b65bf75e0473782ae3df50cd473f.svg" 
            />
          </div>
          <div className="absolute h-3 right-[85.4px] top-5 w-[19.2px]">
            <div className="absolute bottom-0 left-0 right-[-0.001%] top-0">
              <img 
                alt="Cellular" 
                className="block max-w-none w-full h-full" 
                src="./src/assets/a883d1003c9c8d00c12b4d64e84ed02fcbbf9603.svg" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div 
        className="absolute left-[26px] w-[42px] h-[42px] top-[52px] cursor-pointer z-30"
        onClick={handleClose}
      >
        <img 
          alt="Back" 
          className="block max-w-none w-full h-full" 
          src="./src/assets/40807933db102c5ddfe145202e96cb747d9662c5.svg" 
        />
      </div>

      {/* Volume Settings Modal */}
      <div 
        className="absolute bg-[#fffaf4] h-[146px] rounded-[20px] top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[306px] z-40" 
        style={{ left: 'calc(50% + 0.5px)' }}
      >
        {/* Close Icon */}
        <div 
          className="absolute left-[9px] w-9 h-9 top-[9px] cursor-pointer"
          onClick={handleClose}
        >
          <img 
            alt="Close" 
            className="block max-w-none w-full h-full" 
            src="./src/assets/d23e0c72b637adf4346f1d26038aa38e3d04555c.svg" 
          />
        </div>
        
        {/* Volume Settings Content */}
        <div className="absolute flex flex-col gap-3 items-start justify-start left-[29px] p-0 top-[67px] w-[248px]">
          <div className="flex flex-row items-center justify-between p-0 relative shrink-0 w-full">
            <div 
              className="font-medium leading-[0] not-italic opacity-90 relative shrink-0 text-[#232323] text-[15px] text-left whitespace-nowrap" 
              style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
            >
              <p className="block leading-[1.45] whitespace-pre">Background music volume</p>
            </div>
          </div>
          
          {/* Volume Slider */}
          <div className="h-4 relative shrink-0 w-[248px]">
            {/* Slider Track */}
            <div className="absolute bg-[#d9d9d9] bottom-[37.5%] left-0 right-0 rounded-[10px] top-[37.5%]"></div>
            
            {/* Slider Progress */}
            <div 
              className="absolute bg-[#fbbb5d] bottom-0 left-0 rounded-[10px] top-0 border border-[#a4720e] border-solid shadow-[0px_8px_2px_0px_rgba(0,0,0,0),0px_5px_2px_0px_rgba(0,0,0,0.01),0px_3px_2px_0px_rgba(0,0,0,0.05),0px_1px_1px_0px_rgba(0,0,0,0.09),0px_0px_1px_0px_rgba(0,0,0,0.1)]" 
              style={{ width: `${volumeLevel}px` }}
            ></div>
            
            {/* Slider Handle */}
            <div 
              className="absolute w-4 h-4 bg-[#fbbb5d] border-2 border-[#a4720e] rounded-full cursor-grab active:cursor-grabbing shadow-md transform -translate-y-1/2" 
              style={{ 
                left: `${volumeLevel - 8}px`, 
                top: '50%' 
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            ></div>
            
            {/* Invisible clickable area for easier interaction */}
            <div 
              ref={sliderRef}
              className="absolute inset-0 cursor-pointer"
              onClick={handleSliderClick}
            ></div>
          </div>
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
};

export default VolumeSettingsPage;
