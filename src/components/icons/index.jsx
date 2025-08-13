import React from 'react';

// Import icon assets
const settingsIcon = "/src/assets/93a02d26a502971a89c3344708fc357ec3d89403.svg";
const batteryIcon = "/src/assets/c0c091687c62d7337bf318e17f3769ffc34d3a72.svg";
const wifiIcon = "/src/assets/94bdfe1a8077b65bf75e0473782ae3df50cd473f.svg";
const cellularIcon = "/src/assets/a883d1003c9c8d00c12b4d64e84ed02fcbbf9603.svg";

// Icon components for reuse across pages
export const SettingsIcon = ({ onClick, className = "w-[26px] h-[26px] cursor-pointer hover:rotate-12 transition-transform duration-200" }) => (
  <div className={className} onClick={onClick}>
    <img alt="Settings" className="block max-w-none w-full h-full" src={settingsIcon} />
  </div>
);

export const BatteryIcon = ({ className = "w-[27.328px] h-[13px]" }) => (
  <div className={className}>
    <img alt="Battery" className="block max-w-none w-full h-full" src={batteryIcon} />
  </div>
);

export const WifiIcon = ({ className = "w-[17px] h-3" }) => (
  <div className={className}>
    <img alt="Wifi" className="block max-w-none w-full h-full" src={wifiIcon} />
  </div>
);

export const CellularIcon = ({ className = "w-[19.2px] h-3" }) => (
  <div className={className}>
    <img alt="Cellular" className="block max-w-none w-full h-full" src={cellularIcon} />
  </div>
);

// Status Bar Component (can be reused across pages)
export const StatusBar = () => (
  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[393px] z-10">
    <div className="h-11 relative w-full">
      <div className="absolute h-[22px] left-[26px] top-[15px] w-[54px]">
        <div className="absolute font-semibold text-white text-[17px] text-center top-1/2 transform -translate-y-1/2 left-0 right-0">
          <p className="leading-[22px]">12:15</p>
        </div>
      </div>
      <div className="absolute right-[26.339px] top-[19.333px]">
        <BatteryIcon />
      </div>
      <div className="absolute right-[61px] top-5">
        <WifiIcon />
      </div>
      <div className="absolute right-[85.4px] top-5">
        <CellularIcon />
      </div>
    </div>
  </div>
);

// Home Indicator Component (can be reused across pages)
export const HomeIndicator = () => (
  <div className="absolute bottom-0 left-0 w-full h-[34px] flex items-center justify-center">
    <div className="w-[134px] h-[5px] bg-[#919191] rounded-[2.5px]"></div>
  </div>
);
