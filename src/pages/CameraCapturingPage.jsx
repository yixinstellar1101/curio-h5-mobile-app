import React, { useState, useEffect } from 'react';
import { PAGES } from '../constants/pages';

// Asset imports from Figma
const imgBackArrow = "/src/assets/40807933db102c5ddfe145202e96cb747d9662c5.svg";
const imgWhiteDot = "/src/assets/5b05d68c3eb2bca3a02f5a3824a8ff08166d4c40.svg";
const imgViewfinder = "/src/assets/7f7f4e9c0ff1336f239a058ecfbcb93598e33f94.svg";
const imgGallery = "/src/assets/01e1d6ae9f47430674fe0f46b61392a43f9c8519.svg";
// Background assets - 使用与ImageUploadPage一致的背景
const imgHomePage = "/src/assets/d8253cac2e39f67fcc735a3c279bbb3caac59cc5.png";

// Loading Spinner Component - exact Figma design
const LoadingSpinner = () => {
  return (
    <div
      className="absolute h-[116px] left-[140px] top-[291px] w-[114px] animate-spin"
      data-name="Component 23"
    >
      <div className="absolute bg-[rgba(173,173,173,0.4)] bottom-[69.16%] left-[45.59%] right-[45.59%] rounded-[20px] top-0" />
      <div className="absolute flex inset-[11.53%_60.44%_60.44%_11.53%] items-center justify-center">
        <div className="flex-none h-[70px] rotate-[315deg] w-5">
          <div className="bg-[rgba(173,173,173,0.2)] rounded-[20px] size-full" />
        </div>
      </div>
      <div className="absolute flex inset-[11.53%_11.53%_60.44%_60.44%] items-center justify-center">
        <div className="flex-none h-[70px] rotate-[45deg] w-5">
          <div className="bg-[rgba(173,173,173,0.6)] rounded-[20px] size-full" />
        </div>
      </div>
      <div className="absolute bottom-[45.59%] flex items-center justify-center left-[69.16%] right-0 top-[45.59%]">
        <div className="flex-none h-[70px] rotate-[90deg] w-5">
          <div className="bg-[rgba(173,173,173,0.8)] rounded-[20px] size-full" />
        </div>
      </div>
      <div className="absolute bg-[#adadad] bottom-0 left-[45.59%] right-[45.59%] rounded-[20px] top-[69.16%]" />
      <div className="absolute flex inset-[60.44%_11.53%_11.53%_60.44%] items-center justify-center">
        <div className="flex-none h-[70px] rotate-[315deg] w-5">
          <div className="bg-[#adadad] rounded-[20px] size-full" />
        </div>
      </div>
      <div className="absolute flex inset-[60.44%_60.44%_11.53%_11.53%] items-center justify-center">
        <div className="flex-none h-[70px] rotate-[45deg] w-5">
          <div className="bg-[rgba(173,173,173,0)] rounded-[20px] size-full" />
        </div>
      </div>
      <div className="absolute bottom-[45.59%] flex items-center justify-center left-0 right-[69.16%] top-[45.59%]">
        <div className="flex-none h-[70px] rotate-[90deg] w-5">
          <div className="bg-[rgba(173,173,173,0.1)] rounded-[20px] size-full" />
        </div>
      </div>
    </div>
  );
};

/**
 * CameraCapturingPage - Shows "Taking picture..." with loading animation
 * This page appears briefly after taking a photo, then navigates to ImageAnalysisPage
 */
const CameraCapturingPage = ({ onNavigate, data }) => {
  const [progress, setProgress] = useState(0);
  const { file } = data || {};

  useEffect(() => {
    // Simulate capture progress
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          // Navigate to ImageAnalysisPage after capture completes
          setTimeout(() => {
            onNavigate && onNavigate(PAGES.IMAGE_ANALYSIS, { file });
          }, 500);
          return 100;
        }
        return prev + 10; // 10% every interval
      });
    }, 200); // Update every 200ms, total 2 seconds

    return () => clearInterval(timer);
  }, [onNavigate, file]);

  const handleBack = () => {
    // Navigate back to CameraCapturePage
    onNavigate && onNavigate(PAGES.CAMERA_CAPTURE);
  };

  const handleGallery = () => {
    // Navigate to GalleryPage
    onNavigate && onNavigate(PAGES.GALLERY);
  };

  return (
    <div
      className="bg-center bg-cover bg-no-repeat relative w-full h-full"
      data-name="CameraCapturingPage"
      style={{ backgroundImage: `url('${imgHomePage}')` }}
    >
      {/* Back Button */}
      <button
        className="absolute left-5 size-[42px] top-[53px] z-20 cursor-pointer hover:scale-110 transition-transform duration-200"
        onClick={handleBack}
        data-name="返回 1"
      >
        <img alt="Back" className="block max-w-none size-full" src={imgBackArrow} />
      </button>

      {/* Viewfinder Frame */}
      <div
        className="absolute h-[336px] left-[47px] top-[217px] w-[299px] z-10"
      >
        <div className="absolute inset-[-0.74%_-0.84%]">
          <img
            alt=""
            className="block max-w-none size-full"
            src={imgViewfinder}
          />
        </div>
      </div>

      {/* Loading Spinner */}
      <LoadingSpinner />

      {/* Taking Picture Text */}
      <div
        className="absolute bg-[rgba(0,0,0,0.5)] box-border content-stretch flex flex-col gap-2.5 h-8 items-center justify-center left-1/2 px-[19px] py-[3px] rounded-[20px] translate-x-[-50%] translate-y-[-50%] w-[165px] z-20"
        style={{ top: "calc(50% + 47px)" }}
      >
        <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
          <div className="[grid-area:1_/_1] font-medium h-[22px] ml-0 mt-0 not-italic opacity-90 relative text-[#ffffff] text-[16px] text-left w-[116px]">
            <p className="block leading-[1.6]">Taking picture...</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="absolute left-1/2 translate-x-[-50%] w-48 h-1 bg-gray-600 rounded-full overflow-hidden z-20"
        style={{ top: "calc(50% + 90px)" }}
      >
        <div
          className="h-full bg-white transition-all duration-200 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Capture Button (disabled during capture) */}
      <div
        className="absolute left-[164px] size-[66px] top-[715px] z-20 opacity-50"
        data-name="white dot"
      >
        <div className="absolute inset-[-1.52%_-10.61%_-37.88%_-10.61%]">
          <img
            alt="Capturing..."
            className="block max-w-none size-full"
            src={imgWhiteDot}
          />
        </div>
      </div>

      {/* Gallery Button */}
      <button
        className="absolute left-[290px] top-[727px] z-20 cursor-pointer hover:scale-110 transition-transform duration-200"
        onClick={handleGallery}
      >
        <div className="backdrop-blur-[0.778px] backdrop-filter bg-[rgba(0,0,0,0.3)] rounded-[7.778px] size-[42px]">
          <div className="absolute contents inset-[20.37%_18.52%]">
            <div className="absolute inset-[20.37%_18.52%]">
              <img
                alt="Gallery"
                className="block max-w-none size-full"
                src={imgGallery}
              />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default CameraCapturingPage;
