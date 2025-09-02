import React from 'react';

// Asset imports from Figma
const imgVector = "./d84d1463db2967ad16c63a138581a4d524675326.png";
const imgBack = "./8d8cbe981109a48150a98003a8693f5fbd8569a0.svg";
const imgFrame = "./259391b1dd8a0c7c3d73db060c8f4aab38bff52e.svg";

/**
 * CharacterDetailFullPage - Full character profile page following Figma design
 */
export default function CharacterDetailFullPage({ onClose }) {
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  return (
    <div
      className="bg-[#fffaf4] relative size-full fixed inset-0 z-50"
      data-name="CharacterDetailFullPage"
    >
      {/* Back Button */}
      <button
        className="absolute left-6 size-[42px] top-[52px] cursor-pointer hover:opacity-80 transition-opacity"
        data-name="Back Button"
        onClick={handleClose}
      >
        <img alt="Back" className="block max-w-none size-full" src={imgBack} />
      </button>

      {/* Heart and Share Icons */}
      <div
        className="absolute h-[17px] left-[302px] top-[65px] w-14"
      >
        <div className="absolute inset-[-1.76%_-0.54%]">
          <img
            alt="Actions"
            className="block max-w-none size-full"
            src={imgFrame}
          />
        </div>
      </div>

      {/* Character Portrait */}
      <div
        className="absolute h-[210px] top-[106px] translate-x-[-50%] w-[314.4px]"
        style={{ left: "calc(50% - 0.3px)" }}
      >
        <div
          className="absolute bg-[0%_33.43%] bg-no-repeat h-[210.208px] left-1.5 rounded-[31.2px] top-0 w-[302.8px]"
          data-name="Vector"
          style={{ 
            backgroundImage: `url('${imgVector}')`,
            backgroundSize: "100% 182.05%"
          }}
        />
      </div>

      {/* Character Information */}
      <div
        className="absolute box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 top-[334px] translate-x-[-50%] w-[346px]"
        style={{ left: "calc(50% + 0.5px)" }}
      >
        {/* Name */}
        <div
          className="leading-[0] not-italic opacity-90 relative shrink-0 text-[#232323] text-[22px] text-center w-full font-black"
          style={{ fontFamily: "'ABC Ginto Normal Variable Unlicensed Trial', sans-serif" }}
        >
          <p className="block leading-[1.4]">Vincent van Gogh</p>
        </div>

        {/* Quote */}
        <div
          className="leading-[0] not-italic opacity-90 relative shrink-0 text-[#232323] text-[16px] text-left w-full italic"
          style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
        >
          <p className="block leading-[1.45]">"I painted not what I saw, but what I felt in that night of madness."</p>
        </div>

        {/* Hashtags */}
        <div
          className="leading-[0] not-italic opacity-90 relative shrink-0 text-[#0051ae] text-[16px] text-left w-full"
          style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
        >
          <p className="block leading-[1.6]">
            #LonelyGenius #PostImpressionist #NightOfTheMind
          </p>
        </div>

        {/* Identity Section */}
        <div
          className="box-border content-stretch flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#232323] text-left w-full"
        >
          <div
            className="opacity-90 relative shrink-0 text-[16px] w-full font-bold"
            style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
          >
            <p className="block leading-[1.6]">Identity</p>
          </div>
          <div
            className="opacity-90 relative shrink-0 text-[14px] w-full"
            style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
          >
            <p className="block leading-[1.6]">
              19th-century Dutch painter, creator of The Starry Night
            </p>
          </div>
        </div>

        {/* Artistic Traits Section */}
        <div
          className="box-border content-stretch flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#232323] text-left w-full"
        >
          <div
            className="opacity-90 relative shrink-0 text-[16px] w-full font-bold"
            style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
          >
            <p className="block leading-[1.6]">Artistic Traits</p>
          </div>
          <div
            className="opacity-90 relative shrink-0 text-[14px] w-full"
            style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
          >
            <p className="block leading-[1.6]">
              Frequently quoted from personal letters; deeply sensitive to the
              emotional power of color
            </p>
          </div>
        </div>

        {/* Perspective Section */}
        <div
          className="box-border content-stretch flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#232323] text-left w-full"
        >
          <div
            className="opacity-90 relative shrink-0 text-[16px] w-full font-bold"
            style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
          >
            <p className="block leading-[1.6]">Perspective</p>
          </div>
          <div
            className="opacity-90 relative shrink-0 text-[14px] w-full"
            style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
          >
            <p className="block leading-[1.6]">
              Interprets the swirling sky, cypress trees, and dreamlike village
              through a lens of self-healing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
