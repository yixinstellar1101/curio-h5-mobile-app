import React from 'react';
import StatusBar from '../components/common/StatusBar';
import HomeIndicator from '../components/common/HomeIndicator';

/**
 * CharacterDetailFullPage - Full character profile page (matches Page 16 from HTML)
 */
const CharacterDetailFullPage = ({ character, onClose, onStartChat }) => {
  // Default character data matching HTML content
  const defaultCharacter = {
    name: 'Vincent van Gogh',
    image: './src/assets/d84d1463db2967ad16c63a138581a4d524675326.png',
    quote: '"I painted not what I saw, but what I felt in that night of madness."',
    tags: '#LonelyGenius #PostImpressionist #NightOfTheMind',
    identity: '19th-century Dutch painter, creator of The Starry Night',
    artisticTraits: 'Frequently quoted from personal letters; deeply sensitive to the emotional power of color',
    perspective: 'Interprets the swirling sky, cypress trees, and dreamlike village through a lens of self-healing'
  };

  const characterData = character || defaultCharacter;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  const handleStartChat = () => {
    if (onStartChat) {
      onStartChat(characterData);
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full" style={{ width: '393px', height: '852px' }}>
      {/* Background */}
      <div className="absolute inset-0 bg-[#fffaf4]"></div>
      
      {/* Status bar V2 */}
      <div className="absolute flex flex-col items-start justify-start left-1/2 p-0 top-0 transform -translate-x-1/2 w-[375px] z-30">
        <div className="h-11 relative w-full">
          <div className="absolute h-[22px] left-[26px] top-[15px] w-[54px]">
            <div 
              className="absolute font-semibold leading-[0] left-0 not-italic right-0 text-[#000000] text-[17px] text-center" 
              style={{ 
                top: 'calc(50% - 11px)',
                fontFamily: "'SF Pro Text', sans-serif" 
              }}
            >
              <p className="block leading-[22px]">12:15</p>
            </div>
          </div>
          <div className="absolute h-[13px] right-[26.339px] top-[19.333px] w-[27.328px]">
            <img 
              alt="Battery" 
              className="block max-w-none w-full h-full" 
              src="./src/assets/b939cc1b874d195c26939816cd53400a2e8b4c87.svg" 
            />
          </div>
          <div className="absolute h-3 right-[61px] top-5 w-[17px]">
            <img 
              alt="Wifi" 
              className="block max-w-none w-full h-full" 
              src="./src/assets/9e9c3b3e9690915df33d6e0de894f1c5141290b1.svg" 
            />
          </div>
          <div className="absolute h-3 right-[85.4px] top-5 w-[19.2px]">
            <img 
              alt="Cellular" 
              className="block max-w-none w-full h-full" 
              src="./src/assets/c5f03e2be0e817b2af3b2b51903f13f82eb6050b.svg" 
            />
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div 
        className="absolute left-6 w-[42px] h-[42px] top-[52px] cursor-pointer z-30"
        onClick={handleClose}
      >
        <img 
          alt="Back" 
          className="block max-w-none w-full h-full" 
          src="./src/assets/8d8cbe981109a48150a98003a8693f5fbd8569a0.svg" 
        />
      </div>

      {/* Character Image (Larger) */}
      <div 
        className="absolute h-[210px] top-[106px] transform -translate-x-1/2 w-[314.4px]" 
        style={{ left: 'calc(50% - 0.3px)' }}
      >
        <div 
          className="absolute bg-no-repeat h-[210.208px] left-1.5 rounded-[31.2px] top-0 w-[302.8px]" 
          style={{ 
            backgroundImage: `url('${characterData.image}')`,
            backgroundSize: '100% 182.05%',
            backgroundPosition: '0% 33.43%'
          }}
        ></div>
      </div>

      {/* Character Info (Expanded) */}
      <div 
        className="absolute flex flex-col gap-6 items-center justify-start p-0 top-[334px] transform -translate-x-1/2 w-[346px]" 
        style={{ left: 'calc(50% + 0.5px)' }}
      >
        {/* Character Name */}
        <div 
          className="font-black leading-[0] not-italic opacity-90 relative shrink-0 text-[#232323] text-[22px] text-center w-full" 
          style={{ fontFamily: "'ABC Ginto Normal Variable Unlicensed Trial', sans-serif" }}
        >
          <p className="block leading-[1.4]">{characterData.name}</p>
        </div>
        
        {/* Quote */}
        <div 
          className="italic leading-[0] not-italic opacity-90 relative shrink-0 text-[#232323] text-[16px] text-left w-full" 
          style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
        >
          <p className="block leading-[1.45]">{characterData.quote}</p>
        </div>
        
        {/* Tags */}
        <div 
          className="leading-[0] not-italic opacity-90 relative shrink-0 text-[#0051ae] text-[16px] text-left w-full" 
          style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
        >
          <p className="block leading-[1.6]">{characterData.tags}</p>
        </div>
        
        {/* Identity Section */}
        <div className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#232323] text-left w-full">
          <div 
            className="font-bold opacity-90 relative shrink-0 text-[16px] w-full" 
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
            className="font-bold opacity-90 relative shrink-0 text-[16px] w-full" 
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
        
        {/* Perspective Section */}
        <div className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#232323] text-left w-full">
          <div 
            className="font-bold opacity-90 relative shrink-0 text-[16px] w-full" 
            style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
          >
            <p className="block leading-[1.6]">Perspective</p>
          </div>
          <div 
            className="opacity-90 relative shrink-0 text-[14px] w-full" 
            style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
          >
            <p className="block leading-[1.6]">{characterData.perspective}</p>
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute flex flex-col items-center justify-start left-0 p-0 top-[826px] w-[393px]">
        <div className="h-[26px] relative shrink-0 w-[375px]">
          <div className="absolute bottom-2 flex h-[5px] items-center justify-center left-1/2 transform -translate-x-1/2 w-36">
            <div className="bg-[#000000] h-[5px] rounded-[100px] w-36"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetailFullPage;
