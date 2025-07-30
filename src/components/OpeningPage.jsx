import React from 'react';

// Asset imports from Figma
const imgImage176 = "/src/assets/dff6fe23fdbc66a95b73bccee1330324b70d1957.png";
const imgImage179 = "/src/assets/e956d03147a1ec74c8563980180fa452db51f275.png";
const imgOpeningPage = "/src/assets/d8253cac2e39f67fcc735a3c279bbb3caac59cc5.png";
const imgVector = "/src/assets/1009f07f9dd6944bb263d745bad2a94943c5a897.svg";
const img = "/src/assets/c0c091687c62d7337bf318e17f3769ffc34d3a72.svg";
const img1 = "/src/assets/94bdfe1a8077b65bf75e0473782ae3df50cd473f.svg";
const img2 = "/src/assets/a883d1003c9c8d00c12b4d64e84ed02fcbbf9603.svg";

export default function OpeningPage() {
  const handleUploadClick = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('Selected file:', file.name);
        // Here you would handle the file upload
      }
    };
    input.click();
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
    // Handle settings functionality here
  };

  return (
    <div
      className="bg-center bg-cover bg-no-repeat relative w-[393px] h-[852px] mx-auto"
      data-name="opening page"
      id="node-1_369"
      style={{ backgroundImage: `url('${imgOpeningPage}')` }}
    >
      {/* Status bar */}
      <div
        className="absolute box-border content-stretch flex flex-col items-start justify-start left-1/2 p-0 top-0 translate-x-[-50%] w-[393px]"
        data-name="Status bar V2"
        id="node-1_378"
      >
        <div
          className="h-11 relative shrink-0 w-full"
          data-name="Status Bar"
          id="node-I1_378-21249_211657"
        >
          <div
            className="absolute h-[22px] left-[26px] top-[15px] w-[54px]"
            data-name="Time"
            id="node-I1_378-21249_211658"
          >
            <div
              className="absolute font-semibold leading-[0] left-0 not-italic right-0 text-[#ffffff] text-[17px] text-center"
              id="node-I1_378-21249_211659"
              style={{ top: "calc(50% - 11px)" }}
            >
              <p className="block leading-[22px]">12:15</p>
            </div>
          </div>
          <div
            className="absolute h-[13px] right-[26.339px] top-[19.333px] w-[27.328px]"
            data-name="Battery"
            id="node-I1_378-21249_211660"
          >
            <img alt="Battery" className="block max-w-none size-full" src={img} />
          </div>
          <div
            className="absolute h-3 right-[61px] top-5 w-[17px]"
            data-name="Wifi"
            id="node-I1_378-21249_211664"
          >
            <img alt="Wifi" className="block max-w-none size-full" src={img1} />
          </div>
          <div
            className="absolute h-3 right-[85.4px] top-5 w-[19.2px]"
            data-name="Cellular Connection"
            id="node-I1_378-21249_211668"
          >
            <div
              className="absolute bottom-0 left-0 right-[-0.001%] top-0"
              style={{
                "--fill-0": "rgba(255, 255, 255, 1)"
              }}
            >
              <img alt="Cellular" className="block max-w-none size-full" src={img2} />
            </div>
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div
        className="absolute box-border content-stretch flex flex-col items-center justify-start left-0 p-0 top-[818px] w-[393px]"
        id="node-1_379"
      >
        <div
          className="h-[34px] relative shrink-0 w-full"
          data-name="Home Indicator"
          id="node-1_380"
        >
          <div
            className="absolute bg-[#919191] bottom-[23.529%] left-[32.267%] right-[32%] rounded-[2.5px] top-[61.765%]"
            data-name="Color"
            id="node-1_381"
          />
        </div>
      </div>

      {/* Upload Button */}
      <div
        className="absolute backdrop-blur-[2.5px] backdrop-filter bg-[rgba(255,255,255,0.3)] box-border content-stretch flex flex-row gap-2.5 h-[55px] items-center justify-center px-[23px] py-0 rounded-[20px] top-[649px] translate-x-[-50%] w-[222px] cursor-pointer hover:bg-[rgba(255,255,255,0.4)] transition-all duration-200"
        id="node-1_371"
        style={{ left: "calc(50% + 0.5px)" }}
        onClick={handleUploadClick}
      >
        <div className="absolute border border-[#c5c5c5] border-solid inset-0 pointer-events-none rounded-[20px]" />
        <div
          className="font-medium leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-center text-nowrap"
          id="node-1_372"
        >
          <p className="block leading-[40px] whitespace-pre">Upload an image</p>
        </div>
      </div>

      {/* Picture Frames - Using actual Figma images */}
      <div
        className="absolute box-border content-stretch flex flex-row gap-[23px] items-center justify-start left-14 p-0 top-[158px]"
        id="node-12_3208"
      >
        <div
          className="bg-center bg-cover bg-no-repeat h-[421px] shadow-[82px_201px_61px_0px_rgba(0,0,0,0.01),53px_128px_56px_0px_rgba(0,0,0,0.06),30px_72px_47px_0px_rgba(0,0,0,0.2),13px_32px_35px_0px_rgba(0,0,0,0.34),3px_8px_19px_0px_rgba(0,0,0,0.39)] shrink-0 w-[281px] hover:scale-105 transition-transform duration-300 cursor-pointer"
          data-name="image 176"
          id="node-1_374"
          style={{ backgroundImage: `url('${imgImage176}')` }}
        />
        <div
          className="[background-size:119.54%_130.58%] bg-[66.1%_51.25%] bg-no-repeat h-[339px] opacity-70 shadow-[82px_201px_61px_0px_rgba(0,0,0,0.01),53px_128px_56px_0px_rgba(0,0,0,0.06),30px_72px_47px_0px_rgba(0,0,0,0.2),13px_32px_35px_0px_rgba(0,0,0,0.34),3px_8px_19px_0px_rgba(0,0,0,0.39)] shrink-0 w-[262px] hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          data-name="image 179"
          id="node-1_375"
          style={{ backgroundImage: `url('${imgImage179}')` }}
        />
      </div>

      {/* Settings Icon */}
      <div
        className="absolute left-[341px] overflow-clip size-[26px] top-[58px] cursor-pointer hover:rotate-12 transition-transform duration-200"
        data-name="设置 1"
        id="node-12_3209"
        onClick={handleSettingsClick}
      >
        <div className="relative size-full" data-name="设置 1">
          <div
            className="absolute bottom-[5.313%] left-[2.812%] right-[2.713%] top-[5.312%]"
            data-name="Vector"
          >
            <img alt="Settings" className="block max-w-none size-full" src={imgVector} />
          </div>
        </div>
      </div>
    </div>
  );
}
