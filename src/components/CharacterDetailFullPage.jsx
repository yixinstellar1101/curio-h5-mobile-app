import React from 'react';

// Asset imports from Figma
const imgVector = "/src/assets/d84d1463db2967ad16c63a138581a4d524675326.png";
const imgBattery = "/src/assets/b939cc1b874d195c26939816cd53400a2e8b4c87.svg";
const imgWifi = "/src/assets/9e9c3b3e9690915df33d6e0de894f1c5141290b1.svg";
const imgCellular = "/src/assets/c5f03e2be0e817b2af3b2b51903f13f82eb6050b.svg";
const imgBack = "/src/assets/8d8cbe981109a48150a98003a8693f5fbd8569a0.svg";
const imgShare = "/src/assets/259391b1dd8a0c7c3d73db060c8f4aab38bff52e.svg";

export default function CharacterDetailFullPage({ onBack }) {
  return (
    <div
      className="bg-[#fffaf4] relative size-full min-h-screen fixed inset-0 z-50"
      data-name="CharacterDetailFullPage"
    >
      {/* Status bar */}
      <div
        className="absolute box-border content-stretch flex flex-col items-start justify-start left-1/2 p-0 top-0 translate-x-[-50%] w-[375px]"
        data-name="Status bar V2"
      >
        <div className="h-11 relative shrink-0 w-full" data-name="Status Bar">
          <div
            className="absolute h-[22px] left-[26px] top-[15px] w-[54px]"
            data-name="Time"
          >
            <div
              className="absolute font-semibold leading-[0] left-0 not-italic right-0 text-[#000000] text-[17px] text-center"
              style={{ top: "calc(50% - 11px)" }}
            >
              <p className="block leading-[22px]">12:15</p>
            </div>
          </div>
          <div
            className="absolute h-[13px] right-[26.34px] top-[19.33px] w-[27.328px]"
            data-name="Battery"
          >
            <img alt="Battery" className="block max-w-none size-full" src={imgBattery} />
          </div>
          <div
            className="absolute h-3 right-[61px] top-5 w-[17px]"
            data-name="Wifi"
          >
            <img alt="Wifi" className="block max-w-none size-full" src={imgWifi} />
          </div>
          <div
            className="absolute h-3 right-[85.4px] top-5 w-[19.2px]"
            data-name="Cellular Connection"
          >
            <img alt="Cellular" className="block max-w-none size-full" src={imgCellular} />
          </div>
        </div>
      </div>

      {/* Home indicator */}
      <div
        className="absolute box-border content-stretch flex flex-col items-center justify-start left-0 p-0 top-[826px] w-[393px]"
      >
        <div className="h-[26px] relative shrink-0 w-[375px]" data-name="Home Indicator">
          <div className="absolute bottom-2 flex h-[5px] items-center justify-center left-1/2 translate-x-[-50%] w-36">
            <div className="flex-none rotate-[180deg] scale-y-[-100%]">
              <div
                className="bg-[#000000] h-[5px] rounded-[100px] w-36"
                data-name="Home Indicator"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute left-6 size-[42px] top-[52px] cursor-pointer"
        data-name="返回 1"
      >
        <img alt="Back" className="block max-w-none size-full" src={imgBack} />
      </button>

      {/* Share button */}
      <div className="absolute h-[17px] left-[302px] top-[65px] w-14">
        <div className="absolute inset-[-1.76%_-0.54%]">
          <img alt="Share" className="block max-w-none size-full" src={imgShare} />
        </div>
      </div>

      {/* Van Gogh portrait */}
      <div
        className="absolute h-[210px] top-[106px] translate-x-[-50%] w-[314.4px]"
        style={{ left: "calc(50% - 0.3px)" }}
      >
        <div
          className="absolute bg-[0%_33.43%] bg-no-repeat bg-size-[100%_182.05%] h-[210.208px] left-1.5 rounded-[31.2px] top-0 w-[302.8px]"
          data-name="Vector"
          style={{ backgroundImage: `url('${imgVector}')` }}
        />
      </div>

      {/* Content */}
      <div
        className="absolute box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 top-[334px] translate-x-[-50%] w-[346px]"
        style={{ left: "calc(50% + 0.5px)" }}
      >
        {/* Name */}
        <div
          className="font-bold leading-[0] not-italic opacity-90 relative shrink-0 text-[#232323] text-[22px] text-center w-full"
        >
          <p className="block leading-[1.4]">Vincent van Gogh</p>
        </div>

        {/* Quote */}
        <div
          className="font-medium italic leading-[0] not-italic opacity-90 relative shrink-0 text-[#232323] text-[16px] text-left w-full"
        >
          <p className="block leading-[1.45]">
            "I painted not what I saw, but what I felt in that night of madness."
          </p>
        </div>

        {/* Hashtags */}
        <div
          className="font-normal leading-[0] not-italic opacity-90 relative shrink-0 text-[#0051ae] text-[16px] text-left w-full"
        >
          <p className="block leading-[1.6]">
            #LonelyGenius #PostImpressionist #NightOfTheMind
          </p>
        </div>

        {/* Identity section */}
        <div
          className="box-border content-stretch flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#232323] text-left w-full"
        >
          <div
            className="font-bold opacity-90 relative shrink-0 text-[16px] w-full"
          >
            <p className="block leading-[1.6]">Identity</p>
          </div>
          <div
            className="font-normal opacity-90 relative shrink-0 text-[14px] w-full"
          >
            <p className="block leading-[1.6]">
              19th-century Dutch painter, creator of The Starry Night
            </p>
          </div>
        </div>

        {/* Artistic Traits section */}
        <div
          className="box-border content-stretch flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#232323] text-left w-full"
        >
          <div
            className="font-bold opacity-90 relative shrink-0 text-[16px] w-full"
          >
            <p className="block leading-[1.6]">Artistic Traits</p>
          </div>
          <div
            className="font-normal opacity-90 relative shrink-0 text-[14px] w-full"
          >
            <p className="block leading-[1.6]">
              Frequently quoted from personal letters; deeply sensitive to the
              emotional power of color
            </p>
          </div>
        </div>

        {/* Perspective section */}
        <div
          className="box-border content-stretch flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#232323] text-left w-full"
        >
          <div
            className="font-bold opacity-90 relative shrink-0 text-[16px] w-full"
          >
            <p className="block leading-[1.6]">Perspective</p>
          </div>
          <div
            className="font-normal opacity-90 relative shrink-0 text-[14px] w-full"
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
