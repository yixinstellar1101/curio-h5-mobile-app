import React from 'react';

/**
 * StatusBar component - Common status bar used across all pages
 */
const StatusBar = () => {
  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[393px] z-10">
      <div className="h-11 relative w-full">
        {/* Time Display */}
        <div className="absolute h-[22px] left-[26px] top-[15px] w-[54px]">
          <div className="absolute font-semibold text-white text-[17px] text-center top-1/2 transform -translate-y-1/2 left-0 right-0" style={{ fontFamily: 'SF Pro Text, sans-serif' }}>
            <p className="leading-[22px]">12:15</p>
          </div>
        </div>
        
        {/* Battery Icon */}
        <div className="absolute right-[26.339px] top-[19.333px] w-[27.328px] h-[13px]">
          <img 
            alt="Battery" 
            className="block max-w-none w-full h-full" 
            src="./src/assets/c0c091687c62d7337bf318e17f3769ffc34d3a72.svg" 
          />
        </div>
        
        {/* WiFi Icon */}
        <div className="absolute right-[61px] top-5 w-[17px] h-3">
          <img 
            alt="Wifi" 
            className="block max-w-none w-full h-full" 
            src="./src/assets/94bdfe1a8077b65bf75e0473782ae3df50cd473f.svg" 
          />
        </div>
        
        {/* Cellular Icon */}
        <div className="absolute right-[85.4px] top-5 w-[19.2px] h-3">
          <img 
            alt="Cellular" 
            className="block max-w-none w-full h-full" 
            src="./src/assets/a883d1003c9c8d00c12b4d64e84ed02fcbbf9603.svg" 
          />
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
