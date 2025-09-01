import React, { useState, useRef } from 'react';
import LanguageModal from '../components/modals/LanguageModal';
import { PAGES } from '../constants/pages';
import { useLanguage } from '../context/LanguageContext';
import { texts } from '../constants/texts';

// Asset imports
const imgImage176 = "/src/assets/dff6fe23fdbc66a95b73bccee1330324b70d1957.png";
const imgImage179 = "/src/assets/e956d03147a1ec74c8563980180fa452db51f275.png";
const imgHomePage = "/src/assets/d8253cac2e39f67fcc735a3c279bbb3caac59cc5.png";
const imgVector = "/src/assets/1009f07f9dd6944bb263d745bad2a94943c5a897.svg";

/**
 * HomePage - Main entry screen with Upload button and picture frames
 * Entry button "上传图片" → Navigate to ImageUploadPage
 * Swipe right → Navigate to GalleryPage
 */
const HomePage = ({ onNavigate }) => {
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { currentLanguage } = useLanguage();
  const containerRef = useRef(null);

  const t = texts.homePage;

  const handleUploadClick = () => {
    if (onNavigate) {
      onNavigate(PAGES.IMAGE_UPLOAD);
    }
  };

  const handleSettingsClick = () => {
    setShowLanguageModal(true);
  };

  // Handle right edge click to go to Gallery
  const handleRightEdgeClick = () => {
    onNavigate && onNavigate(PAGES.GALLERY);
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
    
    // Right swipe (swipe left to right) - go to GalleryPage
    if (deltaX < -threshold) {
      onNavigate && onNavigate(PAGES.GALLERY);
    }
    
    setIsDragging(false);
    setStartX(0);
  };

  return (
    <div
      ref={containerRef}
      className="bg-center bg-cover bg-no-repeat relative w-full h-full overflow-hidden"
      style={{ backgroundImage: `url('${imgHomePage}')` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd} 
    >
      {/* Picture Frames */}
      <div className="absolute box-border content-stretch flex flex-row gap-[23px] items-center justify-start left-14 p-0 top-[158px]">
        <div
          className="bg-center bg-cover bg-no-repeat h-[421px] shadow-[82px_201px_61px_0px_rgba(0,0,0,0.01),53px_128px_56px_0px_rgba(0,0,0,0.06),30px_72px_47px_0px_rgba(0,0,0,0.2),13px_32px_35px_0px_rgba(0,0,0,0.34),3px_8px_19px_0px_rgba(0,0,0,0.39)] shrink-0 w-[281px] hover:scale-105 transition-transform duration-300 cursor-pointer"
          style={{ backgroundImage: `url('${imgImage176}')` }}
          onClick={() => onNavigate && onNavigate(PAGES.IMAGE_UPLOAD)}
        />
        <div
          className="bg-[12.08%_51.25%] bg-no-repeat h-[339px] opacity-70 shadow-[82px_201px_61px_0px_rgba(0,0,0,0.01),53px_128px_56px_0px_rgba(0,0,0,0.06),30px_72px_47px_0px_rgba(0,0,0,0.2),13px_32px_35px_0px_rgba(0,0,0,0.34),3px_8px_19px_0px_rgba(0,0,0,0.39)] shrink-0 w-[33px] hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          style={{ 
            backgroundImage: `url('${imgImage179}')`,
            backgroundSize: '949.05% 130.58%'
          }}
        />
      </div>

      {/* Right edge click area for Gallery navigation */}
      <div 
        className="absolute right-0 top-0 w-[60px] h-full cursor-pointer z-10 flex items-center justify-end pr-3"
        onClick={handleRightEdgeClick}
      >
        {/* Optional visual indicator */}
        <div className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 hover:opacity-100">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Settings Icon */}
      <div
        className="absolute left-[341px] overflow-clip size-[26px] top-[58px] cursor-pointer hover:rotate-12 transition-transform duration-200 z-20"
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
          <p className="block leading-[40px] whitespace-pre">{t.upload[currentLanguage]}</p>
        </div>
      </div>

      {/* Language Modal */}
      <LanguageModal 
        isOpen={showLanguageModal} 
        onClose={() => setShowLanguageModal(false)} 
      />
    </div>
  );
};

export default HomePage;