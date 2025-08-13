import React from 'react';
import StatusBar from '../components/common/StatusBar';
import HomeIndicator from '../components/common/HomeIndicator';
import { PAGES } from '../constants/pages';

// Asset imports
const imgImage176 = "/src/assets/dff6fe23fdbc66a95b73bccee1330324b70d1957.png";
const imgImage179 = "/src/assets/e956d03147a1ec74c8563980180fa452db51f275.png";
const imgHomePage = "/src/assets/d8253cac2e39f67fcc735a3c279bbb3caac59cc5.png";
const imgVector = "/src/assets/1009f07f9dd6944bb263d745bad2a94943c5a897.svg";
const imgBattery = "/src/assets/c0c091687c62d7337bf318e17f3769ffc34d3a72.svg";
const imgWifi = "/src/assets/94bdfe1a8077b65bf75e0473782ae3df50cd473f.svg";
const imgCellular = "/src/assets/a883d1003c9c8d00c12b4d64e84ed02fcbbf9603.svg";

/**
 * HomePage - Main entry screen with Upload button and picture frames
 * Entry button "Upload an Image" → Navigate to ImageUploadPage
 * Swipe right → Navigate to GalleryPage
 */
const HomePage = ({ onNavigate }) => {
  const handleUploadClick = () => {
    if (onNavigate) {
      onNavigate(PAGES.IMAGE_UPLOAD);
    }
  };

  const handleSettingsClick = () => {
    if (onNavigate) {
      onNavigate(PAGES.VOLUME_SETTINGS);
    }
  };

  const handleSwipeRight = (e) => {
    // Simple swipe detection
    const touchStartX = e.touches?.[0]?.clientX || e.clientX;
    
    const handleTouchEnd = (endEvent) => {
      const touchEndX = endEvent.changedTouches?.[0]?.clientX || endEvent.clientX;
      const swipeDistance = touchEndX - touchStartX;
      
      if (swipeDistance > 100) { // Swipe right threshold
        onNavigate && onNavigate(PAGES.GALLERY);
      }
      
      // Clean up event listener
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mouseup', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('mouseup', handleTouchEnd);
  };

  return (
    <div
      className="bg-center bg-cover bg-no-repeat relative w-full h-full"
      style={{ backgroundImage: `url('${imgHomePage}')` }}
      onTouchStart={handleSwipeRight}
      onMouseDown={handleSwipeRight}
    >
      {/* Status Bar */}
      <div className="absolute box-border content-stretch flex flex-col items-start justify-start left-1/2 p-0 top-0 translate-x-[-50%] w-[393px]">
        <div className="h-11 relative shrink-0 w-full">
          <div className="absolute h-[22px] left-[26px] top-[15px] w-[54px]">
            <div
              className="absolute font-semibold leading-[0] left-0 not-italic right-0 text-[#ffffff] text-[17px] text-center"
              style={{ top: "calc(50% - 11px)" }}
            >
              <p className="block leading-[22px]">12:15</p>
            </div>
          </div>
          <div className="absolute h-[13px] right-[26.34px] top-[19.33px] w-[27.328px]">
            <img alt="Battery" className="block max-w-none size-full" src={imgBattery} />
          </div>
          <div className="absolute h-3 right-[61px] top-5 w-[17px]">
            <img alt="Wifi" className="block max-w-none size-full" src={imgWifi} />
          </div>
          <div className="absolute h-3 right-[85.4px] top-5 w-[19.2px]">
            <img alt="Cellular" className="block max-w-none size-full" src={imgCellular} />
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute box-border content-stretch flex flex-col items-center justify-start left-0 p-0 top-[818px] w-[393px]">
        <div className="h-[34px] relative shrink-0 w-full">
          <div className="absolute bg-[#919191] inset-[61.77%_32%_23.53%_32.27%] rounded-[2.5px]" />
        </div>
      </div>

      {/* Picture Frames */}
      <div className="absolute box-border content-stretch flex flex-row gap-[23px] items-center justify-start left-14 p-0 top-[158px]">
        <div
          className="bg-center bg-cover bg-no-repeat h-[421px] shadow-[82px_201px_61px_0px_rgba(0,0,0,0.01),53px_128px_56px_0px_rgba(0,0,0,0.06),30px_72px_47px_0px_rgba(0,0,0,0.2),13px_32px_35px_0px_rgba(0,0,0,0.34),3px_8px_19px_0px_rgba(0,0,0,0.39)] shrink-0 w-[281px] hover:scale-105 transition-transform duration-300 cursor-pointer"
          style={{ backgroundImage: `url('${imgImage176}')` }}
          onClick={() => onNavigate && onNavigate(PAGES.LIVE_ROOM)}
        />
        <div
          className="bg-[12.08%_51.25%] bg-no-repeat h-[339px] opacity-70 shadow-[82px_201px_61px_0px_rgba(0,0,0,0.01),53px_128px_56px_0px_rgba(0,0,0,0.06),30px_72px_47px_0px_rgba(0,0,0,0.2),13px_32px_35px_0px_rgba(0,0,0,0.34),3px_8px_19px_0px_rgba(0,0,0,0.39)] shrink-0 w-[33px] hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          style={{ 
            backgroundImage: `url('${imgImage179}')`,
            backgroundSize: '949.05% 130.58%'
          }}
        />
      </div>

      {/* Settings Icon */}
      <div
        className="absolute left-[341px] overflow-clip size-[26px] top-[58px] cursor-pointer hover:rotate-12 transition-transform duration-200"
        onClick={handleSettingsClick}
      >
        <div className="relative size-full">
          <div className="absolute inset-[5.31%_2.71%_5.31%_2.81%]">
            <img alt="Settings" className="block max-w-none size-full" src={imgVector} />
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div
        className="absolute backdrop-blur-[2.5px] backdrop-filter bg-[rgba(255,255,255,0.3)] box-border content-stretch flex flex-row gap-2.5 h-[55px] items-center justify-center px-[23px] py-0 rounded-[20px] top-[649px] translate-x-[-50%] w-[222px] cursor-pointer hover:bg-[rgba(255,255,255,0.4)] transition-all duration-200"
        style={{ left: "calc(50% + 0.5px)" }}
        onClick={handleUploadClick}
      >
        <div className="absolute border border-[#c5c5c5] border-solid inset-0 pointer-events-none rounded-[20px]" />
        <div className="font-medium leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-center text-nowrap">
          <p className="block leading-[40px] whitespace-pre">Upload an image</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;