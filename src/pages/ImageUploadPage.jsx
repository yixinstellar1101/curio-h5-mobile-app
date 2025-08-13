import React, { useState } from 'react';
import { PAGES } from '../constants/pages';

// Asset imports - 使用与HomePage一致的背景
const imgHomePage = "/src/assets/d8253cac2e39f67fcc735a3c279bbb3caac59cc5.png"; // 与HomePage一致的背景
const imgImage176 = "/src/assets/dff6fe23fdbc66a95b73bccee1330324b70d1957.png";
const imgImage179 = "/src/assets/e956d03147a1ec74c8563980180fa452db51f275.png";
const imgBattery = "/src/assets/c0c091687c62d7337bf318e17f3769ffc34d3a72.svg";
const imgWifi = "/src/assets/94bdfe1a8077b65bf75e0473782ae3df50cd473f.svg";
const imgCellular = "/src/assets/a883d1003c9c8d00c12b4d64e84ed02fcbbf9603.svg";
const imgVector = "/src/assets/1009f07f9dd6944bb263d745bad2a94943c5a897.svg"; // 与HomePage一致的设置图标
const imgRectangle346603543 = "/src/assets/9b6dc444b0feeb650edd472c766d9b00af5ddbb8.svg"; // 重要的背景覆盖层

/**
 * ImageUploadPage - 与HomePage背景和画框完全一致，模态框在最上层
 * 层级顺序:
 * 1. 主背景 (与HomePage相同)
 * 2. 状态栏
 * 3. Home Indicator  
 * 4. 背景覆盖层 Rectangle 346603543 (重要!)
 * 5. 相框图片 (在Rectangle之后的层级)
 * 6. 设置图标 (与HomePage完全一致)
 * 7. 模态框按钮 (最上层)
 */
const ImageUploadPage = ({ onNavigate }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChooseFromAlbum = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
      input.style.display = 'none';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            alert('File size must be ≤ 5MB');
            return;
          }
          
          if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
            alert('Please select a JPEG, PNG, or WebP image');
            return;
          }
          
          setIsProcessing(true);
          console.log('Selected file:', file.name, 'Size:', file.size, 'Type:', file.type);
          
          setTimeout(() => {
            setIsProcessing(false);
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
    onNavigate && onNavigate(PAGES.CAMERA_CAPTURE);
  };

  const handleCancel = () => {
    onNavigate && onNavigate(PAGES.HOME);
  };

  return (
    <div
      className="bg-center bg-cover bg-no-repeat relative w-full h-full"
      data-name="ImageUploadPage"
      style={{ backgroundImage: `url('${imgHomePage}')` }}
    >
      {/* 1. Status Bar */}
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

      {/* 2. Home Indicator */}
      <div className="absolute box-border content-stretch flex flex-col items-center justify-start left-0 p-0 top-[818px] w-[393px]">
        <div className="h-[34px] relative shrink-0 w-full">
          <div className="absolute bg-[#919191] inset-[61.77%_32%_23.53%_32.27%] rounded-[2.5px]" />
        </div>
      </div>

      {/* 3. Background Overlay Rectangle - Rectangle 346603543 */}
      <div className="absolute h-[852px] left-0 top-0 w-[393px]">
        <div className="absolute bottom-[-0.94%] left-[-1.02%] right-[-1.02%] top-0">
          <img
            alt=""
            className="block max-w-none size-full"
            src={imgRectangle346603543}
          />
        </div>
      </div>

      {/* 4. Picture Frames - 在Rectangle之后的层级 */}
      <div className="absolute box-border content-stretch flex flex-row gap-[23px] items-center justify-start left-14 p-0 top-[158px]">
        <div
          className="bg-center bg-cover bg-no-repeat h-[421px] shadow-[82px_201px_61px_0px_rgba(0,0,0,0.01),53px_128px_56px_0px_rgba(0,0,0,0.06),30px_72px_47px_0px_rgba(0,0,0,0.2),13px_32px_35px_0px_rgba(0,0,0,0.34),3px_8px_19px_0px_rgba(0,0,0,0.39)] shrink-0 w-[281px]"
          style={{ backgroundImage: `url('${imgImage176}')` }}
        />
        <div
          className="bg-[12.08%_51.25%] bg-no-repeat h-[339px] opacity-70 shadow-[82px_201px_61px_0px_rgba(0,0,0,0.01),53px_128px_56px_0px_rgba(0,0,0,0.06),30px_72px_47px_0px_rgba(0,0,0,0.2),13px_32px_35px_0px_rgba(0,0,0,0.34),3px_8px_19px_0px_rgba(0,0,0,0.39)] shrink-0 w-[33px]"
          style={{ 
            backgroundImage: `url('${imgImage179}')`,
            backgroundSize: '949.05% 130.58%'
          }}
        />
      </div>

      {/* 5. Settings Icon - 与HomePage完全一致 */}
      <div
        className="absolute left-[341px] overflow-clip size-[26px] top-[58px] cursor-pointer hover:rotate-12 transition-transform duration-200"
      >
        <div className="relative size-full">
          <div className="absolute inset-[5.31%_2.71%_5.31%_2.81%]">
            <img alt="Settings" className="block max-w-none size-full" src={imgVector} />
          </div>
        </div>
      </div>

      {/* 6. Modal Buttons - 最上层，覆盖所有内容 */}
      <div className="absolute left-5 top-[642px] z-50">
        {/* Choose from Album & Camera Buttons */}
        <div className="h-28 overflow-clip rounded-[14px] w-[353px] relative mb-2">
          <div className="absolute backdrop-blur-[25px] backdrop-filter bg-[rgba(179,179,179,0.82)] inset-0" />
          
          {/* Choose from Album Button */}
          <button
            className="absolute h-14 left-0 right-0 top-0 flex items-center justify-center font-semibold text-[17px] text-[#007aff] tracking-[-0.43px] disabled:opacity-50 hover:bg-[rgba(0,122,255,0.1)] transition-colors duration-200"
            onClick={handleChooseFromAlbum}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Choose from Album'}
          </button>
          
          {/* Separator Line */}
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
        <div className="h-14 overflow-clip rounded-[14px] w-[353px] relative">
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
