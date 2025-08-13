import React, { useState } from 'react';
import StatusBar from '../components/common/StatusBar';
import HomeIndicator from '../components/common/HomeIndicator';
import { PAGES } from '../constants/pages';

// Asset imports
const imgImageUploadPage = "/src/assets/d8253cac2e39f67fcc735a3c279bbb3caac59cc5.png";
const imgImage177 = "/src/assets/cc8c0a6205dd7253e86ab080322dec689122ecb2.png";
const imgImage176 = "/src/assets/dff6fe23fdbc66a95b73bccee1330324b70d1957.png";
const imgImage179 = "/src/assets/e956d03147a1ec74c8563980180fa452db51f275.png";
const imgBattery = "/src/assets/c0c091687c62d7337bf318e17f3769ffc34d3a72.svg";
const imgWifi = "/src/assets/94bdfe1a8077b65bf75e0473782ae3df50cd473f.svg";
const imgCellular = "/src/assets/a883d1003c9c8d00c12b4d64e84ed02fcbbf9603.svg";
const imgOverlay = "/src/assets/9b6dc444b0feeb650edd472c766d9b00af5ddbb8.svg";
const imgSettings = "/src/assets/93a02d26a502971a89c3344708fc357ec3d89403.svg";

/**
 * ImageUploadPage - Choose from Album or Camera modal
 * - Choose from Album: Trigger system's native image picker (≤ 5MB, jpeg|png|webp)
 * - Camera: Navigate to CameraCapturePage
 * - Cancel: Return to HomePage
 */
const ImageUploadPage = ({ onNavigate }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChooseFromAlbum = async () => {
    try {
      // Create file input element to trigger native image picker
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
      input.style.display = 'none';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          // Validate file size (≤ 5MB)
          if (file.size > 5 * 1024 * 1024) {
            alert('File size must be ≤ 5MB');
            return;
          }
          
          // Validate file type
          if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
            alert('Please select a JPEG, PNG, or WebP image');
            return;
          }
          
          setIsProcessing(true);
          
          // TODO: Interface Call - analyzeImage(file, requestId)
          console.log('Selected file:', file.name, 'Size:', file.size, 'Type:', file.type);
          
          // Simulate processing delay
          setTimeout(() => {
            setIsProcessing(false);
            // Navigate to ImageAnalysisPage after successful upload
            onNavigate && onNavigate(PAGES.IMAGE_ANALYSIS);
          }, 1000);
        }
      };
      
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
      
    } catch (error) {
      console.error('Error selecting image:', error);
      setIsProcessing(false);
    }
  };

  const handleCamera = () => {
    // Navigate to CameraCapturePage
    onNavigate && onNavigate(PAGES.CAMERA_CAPTURE);
  };

  const handleCancel = () => {
    // Return to HomePage
    onNavigate && onNavigate(PAGES.HOME);
  };

  return (
    <div
      className="bg-center bg-cover bg-no-repeat relative w-full h-full"
      style={{ backgroundImage: `url('${imgImageUploadPage}')` }}
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

      {/* Background Overlay */}
      <div className="absolute h-[852px] left-0 top-0 w-[393px]">
        <div className="absolute bottom-[-0.94%] left-[-1.02%] right-[-1.02%] top-0">
          <img
            alt=""
            className="block max-w-none size-full"
            src={imgOverlay}
          />
        </div>
      </div>

      {/* Blurred Background Image */}
      <div
        className="absolute bg-[47.69%_0%] bg-no-repeat bg-size-[121.99%_100%] h-[852px] left-0 opacity-70 top-0 w-[393px]"
        style={{ backgroundImage: `url('${imgImage177}')` }}
      />

      {/* Picture Frames (Background) */}
      <div className="absolute box-border content-stretch flex flex-row gap-[23px] items-center justify-start left-14 p-0 top-[158px]">
        <div
          className="bg-center bg-cover bg-no-repeat h-[421px] shadow-[82px_201px_61px_0px_rgba(0,0,0,0.01),53px_128px_56px_0px_rgba(0,0,0,0.06),30px_72px_47px_0px_rgba(0,0,0,0.2),13px_32px_35px_0px_rgba(0,0,0,0.34),3px_8px_19px_0px_rgba(0,0,0,0.39)] shrink-0 w-[281px]"
          style={{ backgroundImage: `url('${imgImage176}')` }}
        />
        <div
          className="bg-[12.08%_51.25%] bg-no-repeat bg-size-[949.05%_130.58%] h-[339px] opacity-70 shadow-[82px_201px_61px_0px_rgba(0,0,0,0.01),53px_128px_56px_0px_rgba(0,0,0,0.06),30px_72px_47px_0px_rgba(0,0,0,0.2),13px_32px_35px_0px_rgba(0,0,0,0.34),3px_8px_19px_0px_rgba(0,0,0,0.39)] shrink-0 w-[33px]"
          style={{ backgroundImage: `url('${imgImage179}')` }}
        />
      </div>

      {/* Settings Icon */}
      <div className="absolute left-[341px] size-[26px] top-[58px]">
        <img alt="Settings" className="block max-w-none size-full" src={imgSettings} />
      </div>

      {/* Modal Buttons */}
      <div className="absolute left-5 top-[642px]">
        {/* Choose from Album & Camera Buttons */}
        <div className="h-28 overflow-clip rounded-[14px] w-[353px] relative">
          {/* Background */}
          <div className="absolute backdrop-blur-[25px] backdrop-filter bg-[rgba(179,179,179,0.82)] inset-0" />
          
          {/* Choose from Album Button */}
          <button
            className="absolute h-14 left-0 right-0 top-0 flex items-center justify-center font-semibold text-[17px] text-[#007aff] tracking-[-0.43px] disabled:opacity-50 hover:bg-[rgba(0,122,255,0.1)] transition-colors duration-200"
            onClick={handleChooseFromAlbum}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Choose from Album'}
          </button>
          
          {/* Separator */}
          <div className="absolute h-px bg-[rgba(60,60,67,0.36)] left-4 right-4 top-14" />
          
          {/* Camera Button */}
          <button
            className="absolute h-14 left-0 right-0 top-14 flex items-center justify-center font-semibold text-[17px] text-[#007aff] tracking-[-0.43px] hover:bg-[rgba(0,122,255,0.1)] transition-colors duration-200"
            onClick={handleCamera}
            disabled={isProcessing}
          >
            Camera
          </button>
        </div>
        
        {/* Cancel Button */}
        <div className="h-14 overflow-clip rounded-[14px] w-[353px] mt-2 relative">
          {/* Background */}
          <div className="absolute backdrop-blur-[25px] backdrop-filter bg-[rgba(153,153,153,0.97)] inset-0" />
          
          <button
            className="absolute inset-0 flex items-center justify-center font-semibold text-[17px] text-[#007aff] tracking-[-0.43px] hover:bg-[rgba(0,122,255,0.1)] transition-colors duration-200"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadPage;
