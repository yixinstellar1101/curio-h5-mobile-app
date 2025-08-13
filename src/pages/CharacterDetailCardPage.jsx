import React from 'react';
import StatusBar from '../components/common/StatusBar';
import HomeIndicator from '../components/common/HomeIndicator';

/**
 * CharacterDetailCardPage - Character profile modal view (matches Page 15 from HTML)
 */
const CharacterDetailCardPage = ({ character, onClose, onExpandToFull }) => {
  // Default character data matching HTML content
  const defaultCharacter = {
    name: 'Vincent van Gogh',
    image: './src/assets/d84d1463db2967ad16c63a138581a4d524675326.png',
    quote: '"I painted not what I saw, but what I felt in that night of madness."',
    tags: '#LonelyGenius #PostImpressionist #NightOfTheMind',
    identity: '19th-century Dutch painter, creator of The Starry Night',
    artisticTraits: 'Frequently quoted from personal letters; deeply sensitive to the emotional power of color',
    historicalContext: 'Born in 1853 in the Netherlands, Van Gogh struggled with mental illness throughout his life but created some of the most influential works in Western art history. His bold use of color and distinctive brushwork became hallmarks of Post-Impressionism.',
    famousWorks: 'The Starry Night, Sunflowers, The Bedroom, Café Terrace at Night, and over 2,000 artworks including around 900 paintings and 1,100 drawings and sketches.'
  };

  const characterData = character || defaultCharacter;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  const handleExpand = () => {
    if (onExpandToFull) {
      onExpandToFull(characterData);
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full" style={{ width: '393px', height: '852px' }}>
      {/* Background with museum artwork */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat" 
        style={{ backgroundImage: "url('./src/assets/2339a82e4b6020c219c18a48dca73ef3ba006ffe.png')" }}
      ></div>
      
      {/* Full screen overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      
      <StatusBar />

      {/* Back Button */}
      <div 
        className="absolute left-[26px] w-[42px] h-[42px] top-[52px] cursor-pointer z-30"
        onClick={handleClose}
      >
        <img 
          alt="Back" 
          className="block max-w-none w-full h-full" 
          src="./src/assets/40807933db102c5ddfe145202e96cb747d9662c5.svg" 
        />
      </div>

      {/* Character Intro Modal */}
      <div 
        className="absolute bg-[#fffaf4] h-[538px] rounded-[20px] top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[306px] z-40" 
        style={{ left: 'calc(50% + 0.5px)' }}
      >
        {/* Character Image */}
        <div className="absolute h-[175px] left-[22px] top-11 w-[262px]">
          <div 
            className="absolute bg-no-repeat h-[175.174px] left-[5px] rounded-[26px] top-0 w-[252.333px]" 
            style={{ 
              backgroundImage: `url('${characterData.image}')`,
              backgroundSize: '100% 182.05%',
              backgroundPosition: '0% 33.43%'
            }}
          ></div>
        </div>
        
        {/* Zoom Icon */}
        <div 
          className="absolute flex flex-row gap-3.5 items-center justify-start left-[272px] p-0 top-[11px] cursor-pointer z-50"
          onClick={handleExpand}
        >
          <div className="relative w-[23px] h-[23px]">
            <img 
              alt="Zoom" 
              className="block max-w-none w-full h-full" 
              src="./src/assets/9403ffd15bd9a95db6a8488382897cc71b7212f7.svg" 
            />
          </div>
        </div>
        
        {/* Close Icon */}
        <div 
          className="absolute left-1.5 w-9 h-9 top-1 cursor-pointer"
          onClick={handleClose}
        >
          <img 
            alt="Close" 
            className="block max-w-none w-full h-full" 
            src="./src/assets/d23e0c72b637adf4346f1d26038aa38e3d04555c.svg" 
          />
        </div>
        
        {/* Character Info (Scrollable) */}
        <div 
          className="absolute flex flex-col gap-3.5 items-center justify-start p-0 top-[236px] transform -translate-x-1/2 w-[271px] max-h-[280px] overflow-y-auto overflow-x-hidden character-info-scroll" 
          style={{ 
            left: 'calc(50% + 0.5px)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.2) transparent'
          }}
        >
          {/* Character Name */}
          <div 
            className="font-bold leading-[0] not-italic opacity-90 relative shrink-0 text-[#232323] text-[18px] text-center w-full" 
            style={{ fontFamily: "'ABC Ginto Normal Variable Unlicensed Trial', sans-serif" }}
          >
            <p className="block leading-[1.4]">{characterData.name}</p>
          </div>
          
          {/* Quote */}
          <div 
            className="italic leading-[0] not-italic opacity-90 relative shrink-0 text-[#232323] text-[14px] text-left w-full" 
            style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
          >
            <p className="block leading-[1.45]">{characterData.quote}</p>
          </div>
          
          {/* Tags */}
          <div 
            className="leading-[0] not-italic opacity-90 relative shrink-0 text-[#0051ae] text-[14px] text-left w-full" 
            style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
          >
            <p className="block leading-[1.6]">{characterData.tags}</p>
          </div>
          
          {/* Identity Section */}
          <div className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#232323] text-left w-full">
            <div 
              className="font-bold opacity-90 relative shrink-0 text-[15px] w-full" 
              style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
            >
              <p className="block leading-[1.6]">Identity</p>
            </div>
            <div 
              className="opacity-90 relative shrink-0 text-[14px] w-full" 
              style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
            >
              <p className="block leading-[1.6]">{characterData.identity}</p>
            </div>
          </div>
          
          {/* Artistic Traits Section */}
          <div className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#232323] text-left w-full">
            <div 
              className="font-bold opacity-90 relative shrink-0 text-[15px] w-full" 
              style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
            >
              <p className="block leading-[1.6]">Artistic Traits</p>
            </div>
            <div 
              className="opacity-90 relative shrink-0 text-[14px] w-full" 
              style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
            >
              <p className="block leading-[1.6]">{characterData.artisticTraits}</p>
            </div>
          </div>
          
          {/* Historical Context Section */}
          <div className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#232323] text-left w-full">
            <div 
              className="font-bold opacity-90 relative shrink-0 text-[15px] w-full" 
              style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
            >
              <p className="block leading-[1.6]">Historical Context</p>
            </div>
            <div 
              className="opacity-90 relative shrink-0 text-[14px] w-full" 
              style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
            >
              <p className="block leading-[1.6]">{characterData.historicalContext}</p>
            </div>
          </div>
          
          {/* Famous Works Section */}
          <div className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#232323] text-left w-full">
            <div 
              className="font-bold opacity-90 relative shrink-0 text-[15px] w-full" 
              style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
            >
              <p className="block leading-[1.6]">Famous Works</p>
            </div>
            <div 
              className="opacity-90 relative shrink-0 text-[14px] w-full" 
              style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
            >
              <p className="block leading-[1.6]">{characterData.famousWorks}</p>
            </div>
          </div>
          
          {/* Scroll padding at bottom */}
          <div className="h-4 w-full"></div>
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
};

export default CharacterDetailCardPage;
