import React, { useState, useEffect } from 'react'
import OpeningPage from './components/OpeningPage'

// Asset imports for all pages
const museumBg = "/src/assets/5fc9e58748a0fa615330e68c877a6fb860ab55a4.png";
const gradientOverlay = "/src/assets/dfe86cdbd174503d7f6537ed4fda64d4e43bd67e.svg";
const detailPageBg = "/src/assets/2339a82e4b6020c219c18a48dca73ef3ba006ffe.png";
const settingsIcon = "/src/assets/93a02d26a502971a89c3344708fc357ec3d89403.svg";
const batteryIcon = "/src/assets/c0c091687c62d7337bf318e17f3769ffc34d3a72.svg";
const wifiIcon = "/src/assets/94bdfe1a8077b65bf75e0473782ae3df50cd473f.svg";
const cellularIcon = "/src/assets/a883d1003c9c8d00c12b4d64e84ed02fcbbf9603.svg";

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSweping, setIsSweping] = useState(false);

  // Start opening sequence on component mount
  useEffect(() => {
    // Start with page 1
    setCurrentPage(1);
    
    // After 200ms, transition to page 2
    const timer1 = setTimeout(() => {
      setCurrentPage(2);
      
      // After another 1000ms, transition to page 3 (opening page)
      const timer2 = setTimeout(() => {
        setCurrentPage(3);
      }, 1000);
      
      return () => clearTimeout(timer2);
    }, 200);
    
    return () => clearTimeout(timer1);
  }, []);

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e) => {
    if (currentPage !== 3) return;
    setStartX(e.touches[0].clientX);
    setIsSweping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSweping || currentPage !== 3) return;
    setCurrentX(e.touches[0].clientX);
    const diffX = startX - e.touches[0].clientX;
    
    // Prevent scrolling while swiping
    if (Math.abs(diffX) > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!isSweping || currentPage !== 3) return;
    
    const diffX = startX - currentX;
    const threshold = 50;
    
    if (diffX > threshold) {
      // Swipe left (go to page 4)
      setCurrentPage(4);
    }
    
    setIsSweping(false);
    setStartX(0);
    setCurrentX(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && currentPage === 3) {
        setCurrentPage(4);
      } else if (e.key === 'ArrowLeft' && currentPage === 4) {
        setCurrentPage(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  // Status Bar Component
  const StatusBar = () => (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[393px] z-10">
      <div className="h-11 relative w-full">
        <div className="absolute h-[22px] left-[26px] top-[15px] w-[54px]">
          <div className="absolute font-semibold text-white text-[17px] text-center top-1/2 transform -translate-y-1/2 left-0 right-0">
            <p className="leading-[22px]">12:15</p>
          </div>
        </div>
        <div className="absolute right-[26.339px] top-[19.333px] w-[27.328px] h-[13px]">
          <img alt="Battery" className="block max-w-none w-full h-full" src={batteryIcon} />
        </div>
        <div className="absolute right-[61px] top-5 w-[17px] h-3">
          <img alt="Wifi" className="block max-w-none w-full h-full" src={wifiIcon} />
        </div>
        <div className="absolute right-[85.4px] top-5 w-[19.2px] h-3">
          <img alt="Cellular" className="block max-w-none w-full h-full" src={cellularIcon} />
        </div>
      </div>
    </div>
  );

  // Home Indicator Component
  const HomeIndicator = () => (
    <div className="absolute bottom-0 left-0 w-full h-[34px] flex items-center justify-center">
      <div className="w-[134px] h-[5px] bg-[#919191] rounded-[2.5px]"></div>
    </div>
  );

  // Page 1 - Initial Animation
  const Page1 = () => (
    <div 
      className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
        currentPage === 1 ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: '#221400' }}
    >
      <StatusBar />
      <div 
        className="absolute h-[852px] left-[-133px] top-0 w-[642px] animate-pulse"
        style={{ 
          backgroundImage: `url('${museumBg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <HomeIndicator />
      <div className="absolute h-[679px] left-0 top-0 w-[393px]">
        <div className="absolute inset-0 transform scale-110">
          <img alt="" className="block max-w-none w-full h-full" src={gradientOverlay} />
        </div>
      </div>
    </div>
  );

  // Page 2 - CURIO Title
  const Page2 = () => (
    <div 
      className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
        currentPage === 2 ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: '#221400' }}
    >
      <StatusBar />
      <div 
        className="absolute h-[852px] left-[-133px] top-0 w-[642px]"
        style={{ 
          backgroundImage: `url('${museumBg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="absolute left-1/2 top-[185px] transform -translate-x-1/2 animate-fadeIn">
        <h1 className="text-white text-[48px] font-black leading-[50px] text-center whitespace-nowrap">
          CURIO
        </h1>
      </div>
      <HomeIndicator />
    </div>
  );

  // Page 4 - Detail View
  const Page4 = () => (
    <div 
      className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
        currentPage === 4 ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ 
        backgroundImage: `url('${detailPageBg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      onClick={() => setCurrentPage(3)}
    >
      <StatusBar />
      
      {/* Gradient Overlay */}
      <div 
        className="absolute h-[295px] left-0 top-[557px] w-[393px]"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 39.9%)',
          backdropFilter: 'blur(1px)'
        }}
      />

      {/* Content Text */}
      <div className="absolute left-1/2 top-[592px] transform -translate-x-1/2 w-[393px] flex flex-col items-center justify-start p-0">
        <div className="flex flex-col gap-2 items-center justify-start w-[313px] text-center">
          <div className="text-white text-[20px] font-black leading-[1.6] w-full">
            <p>The Enigmatic Aristocat</p>
          </div>
          <div className="text-[#b9b9b9] text-[16px] font-medium leading-[1.6] w-full">
            <p>July 8, 3:42PM</p>
          </div>
          <div className="text-white text-[14px] italic leading-[1.6] w-full">
            <p>This Persian might featured in Tissot's 1866 portrait of the Marquise de Miramon epitomizes Victorian aristocratic cats, its gemstone eyes echoing the luxury of Empress Eugénie's court pets....</p>
          </div>
        </div>
      </div>

      {/* Settings Icon */}
      <div className="absolute left-[341px] top-[58px] w-[26px] h-[26px] cursor-pointer hover:rotate-12 transition-transform duration-200">
        <img alt="Settings" className="block max-w-none w-full h-full" src={settingsIcon} />
      </div>

      <HomeIndicator />
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div 
        className="relative w-[393px] h-[852px] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Page 1 - Initial Animation */}
        <Page1 />
        
        {/* Page 2 - CURIO Title */}
        <Page2 />
        
        {/* Page 3 - Opening Page */}
        <div 
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
            currentPage === 3 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <OpeningPage />
        </div>
        
        {/* Page 4 - Detail View */}
        <Page4 />
      </div>
      
      {/* Instructions */}
      <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
        <p>Page {currentPage}/4</p>
        <p>Swipe right on page 3 →</p>
        <p>Click page 4 to go back</p>
        <p>Arrow keys for desktop</p>
      </div>
    </div>
  );
}

export default App
