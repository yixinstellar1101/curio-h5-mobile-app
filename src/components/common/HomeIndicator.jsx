import React from 'react';

/**
 * HomeIndicator component - Common home indicator used across all pages
 */
const HomeIndicator = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-[34px] flex items-center justify-center">
      <div className="w-[134px] h-[5px] bg-[#919191] rounded-[2.5px]"></div>
    </div>
  );
};

export default HomeIndicator;
