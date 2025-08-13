import React, { useState } from 'react';
import { PAGES } from '../constants/pages';

// Asset imports - using exact Figma paths
const imgImageUploadPage = "/src/assets/d8253cac2e39f67fcc735a3c279bbb3caac59cc5.png";
const imgImage177 = "/src/assets/cc8c0a6205dd7253e86ab080322dec689122ecb2.png";
const imgImage176 = "/src/assets/dff6fe23fdbc66a95b73bccee1330324b70d1957.png";
const imgImage179 = "/src/assets/e956d03147a1ec74c8563980180fa452db51f275.png";
const img = "/src/assets/c0c091687c62d7337bf318e17f3769ffc34d3a72.svg";
const img1 = "/src/assets/94bdfe1a8077b65bf75e0473782ae3df50cd473f.svg";
const img2 = "/src/assets/a883d1003c9c8d00c12b4d64e84ed02fcbbf9603.svg";
const imgRectangle346603543 = "/src/assets/9b6dc444b0feeb650edd472c766d9b00af5ddbb8.svg";
const img3 = "/src/assets/93a02d26a502971a89c3344708fc357ec3d89403.svg";

/**
 * ImageUploadPage - 严格按照Figma设计的层级顺序
 * 层级顺序 (从底到顶):
 * 1. 主背景图 (imgImageUploadPage) - 容器背景
 * 2. 状态栏
 * 3. Home Indicator  
 * 4. 背景覆盖层 (imgRectangle346603543)
 * 5. 模态框按钮
 * 6. 模糊背景图 (imgImage177) - 在模态框之后
 * 7. 相框图片
 * 8. 设置图标
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
      className="bg-center bg-cover bg-no-repeat relative size-full"
      data-name="ImageUploadPage"
      style={{ backgroundImage: `url('${imgImageUploadPage}')` }}
    >
      {/* 1. Status Bar */}
      <div
        className="absolute box-border content-stretch flex flex-col items-start justify-start left-1/2 p-0 top-0 translate-x-[-50%] w-[393px]"
        data-name="Status bar V2"
      >
        <div
          className="h-11 relative shrink-0 w-full"
          data-name="Status Bar"
        >
          <div
            className="absolute h-[22px] left-[26px] top-[15px] w-[54px]"
            data-name="Time"
          >
            <div
              className="absolute font-semibold leading-[0] left-0 not-italic right-0 text-[#ffffff] text-[17px] text-center"
              style={{ top: "calc(50% - 11px)" }}
            >
              <p className="block leading-[22px]">12:15</p>
            </div>
          </div>
          <div
            className="absolute h-[13px] right-[26.34px] top-[19.33px] w-[27.328px]"
            data-name="Battery"
          >
            <img alt="" className="block max-w-none size-full" src={img} />
          </div>
          <div
            className="absolute h-3 right-[61px] top-5 w-[17px]"
            data-name="Wifi"
          >
            <img alt="" className="block max-w-none size-full" src={img1} />
          </div>
          <div
            className="absolute h-3 right-[85.4px] top-5 w-[19.2px]"
            data-name="Cellular Connection"
          >
            <img alt="" className="block max-w-none size-full" src={img2} />
          </div>
        </div>
      </div>

      {/* 2. Home Indicator */}
      <div
        className="absolute box-border content-stretch flex flex-col items-center justify-start left-0 p-0 top-[818px] w-[393px]"
      >
        <div
          className="h-[34px] relative shrink-0 w-full"
          data-name="Home Indicator"
        >
          <div
            className="absolute bg-[#919191] inset-[61.77%_32%_23.53%_32.27%] rounded-[2.5px]"
            data-name="Color"
          />
        </div>
      </div>

      {/* 3. Background Overlay (Rectangle) */}
      <div
        className="absolute h-[852px] left-0 top-0 w-[393px]"
      >
        <div className="absolute bottom-[-0.94%] left-[-1.02%] right-[-1.02%] top-0">
          <img
            alt=""
            className="block max-w-none size-full"
            src={imgRectangle346603543}
          />
        </div>
      </div>

      {/* 4. Modal Buttons - MUST be before blurred background */}
      <div className="absolute contents left-5 top-[642px]">
        {/* Choose from Album & Camera Buttons */}
        <div
          className="absolute h-28 left-5 overflow-clip rounded-[14px] top-[642px] w-[353px]"
          data-name="Header and Buttons"
        >
          <div
            className="absolute h-[458px] left-0 overflow-clip right-0 top-0"
            data-name="Materials"
          >
            <div
              className="absolute backdrop-blur-[25px] backdrop-filter bg-[rgba(179,179,179,0.82)] inset-0"
              data-name="Regular"
            />
          </div>
          
          {/* Choose from Album Button */}
          <button
            className="absolute h-14 left-0 right-0 top-0 flex items-center justify-center font-semibold text-[17px] text-[#007aff] tracking-[-0.43px] disabled:opacity-50 hover:bg-[rgba(0,122,255,0.1)] transition-colors duration-200"
            onClick={handleChooseFromAlbum}
            disabled={isProcessing}
            data-name="Button 1"
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
            data-name="Button 2"
          >
            Camera
          </button>
        </div>
        
        {/* Cancel Button */}
        <div
          className="absolute h-14 left-5 overflow-clip rounded-[14px] top-[762px] w-[353px]"
          data-name="Cancel Button"
        >
          <div
            className="absolute inset-0 overflow-clip"
            data-name="Materials"
          >
            <div
              className="absolute backdrop-blur-[25px] backdrop-filter bg-[rgba(153,153,153,0.97)] inset-0"
              data-name="Thick"
            />
          </div>
          <div
            className="absolute flex flex-col font-semibold font-[590] justify-center leading-[0] left-[176.5px] size-14 text-[#007aff] text-[17px] text-center top-7 tracking-[-0.43px] translate-x-[-50%] translate-y-[-50%]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="adjustLetterSpacing block leading-[22px] bg-transparent border-0 text-[#007aff] hover:bg-[rgba(0,122,255,0.1)] transition-colors duration-200 w-full h-full cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* 5. Blurred Background Image - AFTER modal buttons in Figma */}
      <div
        className="absolute bg-[47.69%_0%] bg-no-repeat bg-size-[121.99%_100%] h-[852px] left-0 opacity-70 top-0 w-[393px]"
        data-name="image 177"
        style={{ backgroundImage: `url('${imgImage177}')` }}
      />

      {/* 6. Picture Frames */}
      <div
        className="absolute box-border content-stretch flex flex-row gap-[23px] items-center justify-start left-14 p-0 top-[158px]"
      >
        <div
          className="bg-center bg-cover bg-no-repeat h-[421px] shadow-[82px_201px_61px_0px_rgba(0,0,0,0.01),53px_128px_56px_0px_rgba(0,0,0,0.06),30px_72px_47px_0px_rgba(0,0,0,0.2),13px_32px_35px_0px_rgba(0,0,0,0.34),3px_8px_19px_0px_rgba(0,0,0,0.39)] shrink-0 w-[281px]"
          data-name="image 176"
          style={{ backgroundImage: `url('${imgImage176}')` }}
        />
        <div
          className="bg-[12.08%_51.25%] bg-no-repeat bg-size-[949.05%_130.58%] h-[339px] opacity-70 shadow-[82px_201px_61px_0px_rgba(0,0,0,0.01),53px_128px_56px_0px_rgba(0,0,0,0.06),30px_72px_47px_0px_rgba(0,0,0,0.2),13px_32px_35px_0px_rgba(0,0,0,0.34),3px_8px_19px_0px_rgba(0,0,0,0.39)] shrink-0 w-[33px]"
          data-name="image 179"
          style={{ backgroundImage: `url('${imgImage179}')` }}
        />
      </div>

      {/* 7. Settings Icon */}
      <div
        className="absolute left-[341px] size-[26px] top-[58px]"
        data-name="设置 1"
      >
        <img alt="" className="block max-w-none size-full" src={img3} />
      </div>
    </div>
  );
};

export default ImageUploadPage;
