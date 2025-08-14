import React, { useEffect, useState } from 'react';
import StatusBar from '../components/common/StatusBar';
import HomeIndicator from '../components/common/HomeIndicator';
import { PAGES } from '../constants/pages';

/**
 * SplashAnimationPage - Two-stage splash animation sequence
 * Stage 1: Delay 2000ms, ease-out 300s  
 * Stage 2: Delay 2000ms, ease-out 300s  
 */
const SplashAnimationPage = ({ onNavigate }) => {
  const [stage, setStage] = useState(1);

  useEffect(() => {
    // Stage 1: Initial display
    const timer1 = setTimeout(() => {
      setStage(2);
      
      // Stage 2: Transition with title
      const timer2 = setTimeout(() => {
        if (onNavigate) {
          onNavigate(PAGES.HOME);
        }
      }, 1000);
      
      return () => clearTimeout(timer2);
    }, 1000);
    
    return () => clearTimeout(timer1);
  }, [onNavigate]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Stage 1 */}
      <div 
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-out ${
          stage === 1 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ background: '#221400' }}
      >
        <StatusBar />
        
        {/* Background Museum Image */}
        <div 
          className="absolute h-[852px] left-[-133px] top-0 w-[642px] animate-pulse"
          style={{
            backgroundImage: "url('./src/assets/5fc9e58748a0fa615330e68c877a6fb860ab55a4.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            animation: 'fadeInScale 500ms ease-out'
          }}
        />
        
        <HomeIndicator />
        
        {/* Gradient Overlay */}
        <div className="absolute h-[679px] left-0 top-0 w-[393px]">
          <div className="absolute inset-0 transform scale-110">
            <img 
              alt="" 
              className="block max-w-none w-full h-full" 
              src="./src/assets/dfe86cdbd174503d7f6537ed4fda64d4e43bd67e.svg" 
            />
          </div>
        </div>
      </div>

      {/* Stage 2 */}
      <div 
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-out ${
          stage === 2 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ background: '#221400' }}
      >
        <StatusBar />
        
        {/* Background Museum Image */}
        <div 
          className="absolute h-[852px] left-[-133px] top-0 w-[642px]"
          style={{
            backgroundImage: "url('./src/assets/5fc9e58748a0fa615330e68c877a6fb860ab55a4.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            animation: 'fadeIn 500ms ease-out'
          }}
        />
        
        <HomeIndicator />
        
        {/* CURIO Title - positioned according to Figma design */}
        <div className="absolute left-1/2 top-[185px] transform -translate-x-1/2 text-center">
          <h1 
            className="text-white text-[48px] font-black leading-[50px] tracking-normal animate-fadeIn"
            style={{ 
              fontFamily: 'ABC Ginto Nord Unlicensed Trial, sans-serif',
              fontWeight: 900,
              animation: 'titleFadeIn 500ms ease-out'
            }}
          >
            CURIO
          </h1>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute h-[679px] left-0 top-0 w-[393px]">
          <div className="absolute inset-0 transform scale-110 opacity-50">
            <img 
              alt="" 
              className="block max-w-none w-full h-full" 
              src="./src/assets/dfe86cdbd174503d7f6537ed4fda64d4e43bd67e.svg" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashAnimationPage;
