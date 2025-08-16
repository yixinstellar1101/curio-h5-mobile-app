import React, { useState, useEffect, useRef } from 'react';
import { PAGES } from '../constants/pages';
import { musicManager } from '../utils/musicManager';
import { 
  mockCreateConversationStream, 
  mockGenerateConversation, 
  mockSubmitUserMessage,
  mockSendReaction,
  CHARACTERS,
  REACTION_EMOJIS 
} from '../services/mockLiveRoomApi';
import CharacterDetailCardPage from '../components/CharacterDetailCardPage';
import CharacterDetailFullPage from '../components/CharacterDetailFullPage';

// Asset imports from Figma
const imgStatusBattery = "/src/assets/c0c091687c62d7337bf318e17f3769ffc34d3a72.svg";
const imgStatusWifi = "/src/assets/94bdfe1a8077b65bf75e0473782ae3df50cd473f.svg";
const imgStatusCellular = "/src/assets/a883d1003c9c8d00c12b4d64e84ed02fcbbf9603.svg";
const imgBackground = "/src/assets/2339a82e4b6020c219c18a48dca73ef3ba006ffe.png";
const imgBackArrow = "/src/assets/02a9c17137ed17e4e423e148f47a120c213111eb.svg";
const imgSettings = "/src/assets/897f897fc1bc39bd5029b1c130459a892fd38f31.svg";
const imgShare = "/src/assets/5477b83fa49bc1086b66f6e98ea33e17d7a7dcde.svg";
const imgMicrophone = "/src/assets/076ad16a88cfddb5f6212dc8a0e121d73f2c0b24.svg";
const imgKeyboard = "/src/assets/f0ca8d23de930dde65471ef8f667466d5bf4c10a.svg";
const imgRecheck = "/src/assets/15be4f7c5adf58b331f84aeb133ea7c7eb2eef70.svg";
const imgLike = "/src/assets/a996fbaf85b7c9f17c8f104ff2ba4feb228e993b.svg";

// Character avatars from Figma
const imgAvatarLuXun = "/src/assets/0a0aca255a6a424fd8f131455677b58d6309fa99.png";
const imgAvatarSuShi = "/src/assets/bb22518de19c944000484ee66f86147664b959a6.png"; 
const imgAvatarVanGogh = "/src/assets/855a8fe22b8b7ac5f293f93e60065e26a3efd17d.png";
const imgAvatarQianlong = "/src/assets/6b326c99ea19859605dd14cb228f024ce6a52c08.png";

/**
 * LiveRoomPage - Real-time AI conversation interface
 * Based on exact Figma design with mock API integration
 */
const LiveRoomPage = ({ data = {}, onNavigate }) => {
  const { 
    image, 
    analysis, 
    backgroundImage, 
    originalImage, 
    imageUrl, 
    category, 
    style, 
    objects,
    backgroundId // 添加backgroundId以保持音乐一致性
  } = data || {};
  
  // 音乐控制 - 从GalleryPage继续播放相同音乐
  useEffect(() => {
    const handleLiveRoomMusic = async () => {
      console.log('=== LIVE ROOM MUSIC CONTROL ===');
      console.log('LiveRoom data:', { category, style, backgroundId });
      
      const musicCategory = style || category || 'European';
      const musicBackgroundId = backgroundId || `${musicCategory}_live`;
      
      // 等待足够长的时间确保GalleryPage完全卸载和音乐清理
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 继续播放音乐（不重新开始）
      // 如果音乐管理器已经在播放相同分类的音乐，则继续
      const currentStatus = musicManager.getStatus();
      console.log('Current music status after delay:', currentStatus);
      
      // 由于GalleryPage已经停止音乐，这里总是需要重新开始
      console.log('Starting music for live room after GalleryPage cleanup');
      try {
        await musicManager.playMusic(musicCategory, musicBackgroundId, true); // 强制重新开始
      } catch (error) {
        console.error('Error starting LiveRoom music:', error);
      }
    };

    handleLiveRoomMusic();
  }, [category, style, backgroundId]);
  
  // 组件卸载时清理音乐
  useEffect(() => {
    return () => {
      console.log('LiveRoomPage unmounting, stopping music completely');
      // 使用stop()来完全清理音乐
      musicManager.stop().catch(error => {
        console.error('Error stopping music on LiveRoom unmount:', error);
      });
    };
  }, []);
  
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [conversationStream, setConversationStream] = useState(null);
  
  // Character detail modal states
  const [showCharacterCard, setShowCharacterCard] = useState(false);
  const [showCharacterFull, setShowCharacterFull] = useState(false);
  const [showIntroPopup, setShowIntroPopup] = useState(false);
  
  // Right channel emoji system
  const [channelEmojis, setChannelEmojis] = useState([]);
  const [burstEmojis, setBurstEmojis] = useState([]);
  const emojiIdCounter = useRef(0);
  
  const messagesEndRef = useRef(null);
  const autoLoopIntervalRef = useRef(null);
  const continuousEmojiIntervalRef = useRef(null);
  
  // Available emojis from design (limited set)
  const availableEmojis = ['😍', '👏', '🥳', '👍', '❤️', '😘'];
  const MAX_EMOJIS = 60; // Prevent frame drops
  
  // Character avatar mapping
  const characterAvatars = {
    'Lu Xun': imgAvatarLuXun,
    'Su Shi': imgAvatarVanGogh,
    'Vincent van Gogh': imgAvatarSuShi
  };

  // Get background image - use the same background as GalleryPage
  const getBackgroundImage = () => {
    // Use the background image passed from GalleryPage
    if (backgroundImage) {
      console.log('Using background image from GalleryPage:', backgroundImage);
      return backgroundImage;
    }
    
    // Fallback to default background
    console.log('Using default background fallback');
    return imgBackground;
  };

  const backgroundImageSrc = getBackgroundImage();

  useEffect(() => {
    initializeConversation();
    startContinuousEmojis();
    return () => {
      if (autoLoopIntervalRef.current) {
        clearInterval(autoLoopIntervalRef.current);
      }
      if (continuousEmojiIntervalRef.current) {
        clearInterval(continuousEmojiIntervalRef.current);
      }
      // 注意：不停止音乐，因为返回GalleryPage时需要继续播放
      console.log('LiveRoomPage unmounting, music continues playing');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeConversation = async () => {
    try {
      setIsLoading(true);
      
      // Create conversation stream with mock API
      const streamResult = await mockCreateConversationStream(image, {
        autoLoop: true,
        loopInterval: 8000
      });
      
      if (streamResult.success) {
        setConversationStream(streamResult);
        setMessages(streamResult.initialMessages);
        startAutoLoop(streamResult.streamId, streamResult.category);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      setIsLoading(false);
    }
  };

  const startAutoLoop = (streamId, category) => {
    // Auto-generate new conversation loops
    autoLoopIntervalRef.current = setInterval(async () => {
      try {
        const result = await mockGenerateConversation(streamId, {
          generateNewLoop: true,
          category
        });
        
        if (result.messages) {
          setMessages(prev => [...prev, ...result.messages]);
        }
      } catch (error) {
        console.error('Auto-loop generation failed:', error);
      }
    }, 8000);
  };

  const startContinuousEmojis = () => {
    // Generate emojis above the like button continuously
    continuousEmojiIntervalRef.current = setInterval(() => {
      if (channelEmojis.length >= MAX_EMOJIS) return;
      
      const newEmoji = {
        id: emojiIdCounter.current++,
        emoji: availableEmojis[Math.floor(Math.random() * availableEmojis.length)],
        // Position above like button area (right side)
        left: Math.random() * 40 + 320, // Around like button x position
        type: 'continuous'
      };
      
      setChannelEmojis(prev => [...prev, newEmoji]);
      
      // Auto cleanup after animation duration
      setTimeout(() => {
        setChannelEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
      }, 3500); // Reduced from 4000 for faster cleanup
      
    }, Math.random() * 600 + 600); // 0.6-1.2s intervals for more emojis
  };

  const handleBack = () => {
    onNavigate && onNavigate(PAGES.GALLERY);
  };

  const handleVoiceInput = () => {
    onNavigate && onNavigate(PAGES.VOICE_INPUT, { returnTo: PAGES.LIVE_ROOM });
  };

  const handleTextInput = () => {
    onNavigate && onNavigate(PAGES.TEXT_INPUT, { returnTo: PAGES.LIVE_ROOM });
  };

  const handleReroll = async () => {
    if (!conversationStream) return;
    
    try {
      const result = await mockGenerateConversation(conversationStream.streamId, {
        generateNewLoop: true,
        category: conversationStream.category
      });
      
      if (result.messages) {
        setMessages(prev => [...prev, ...result.messages]);
      }
    } catch (error) {
      console.error('Reroll failed:', error);
    }
  };

  const handleLike = async () => {
    // Create burst emojis above the like button - quick release without stagger
    const newBurstEmojis = [];
    for (let i = 0; i < 3; i++) { // Reduced from 5 to 3 for less clutter
      const burstEmoji = {
        id: emojiIdCounter.current++,
        emoji: availableEmojis[Math.floor(Math.random() * availableEmojis.length)],
        // Position above like button (right side of screen)
        left: Math.random() * 60 + 310, // Around like button area
        delay: i * 50, // Much smaller stagger (50ms instead of 200ms)
        type: 'burst'
      };
      newBurstEmojis.push(burstEmoji);
    }
    
    setBurstEmojis(prev => [...prev, ...newBurstEmojis]);
    
    // Cleanup burst emojis after animation
    setTimeout(() => {
      setBurstEmojis(prev => prev.filter(e => !newBurstEmojis.some(be => be.id === e.id)));
    }, 3000);
    
    // Send reaction to API
    try {
      await mockSendReaction(messages[messages.length - 1]?.id, '❤️');
    } catch (error) {
      console.error('Failed to send reaction:', error);
    }
  };

  // Character detail modal handlers
  const handleVanGoghClick = () => {
    setShowIntroPopup(true);
  };

  const handleIntroPopupBack = () => {
    setShowIntroPopup(false);
  };

  const handleIntroPopupExpand = () => {
    setShowIntroPopup(false);
    setShowCharacterFull(true);
  };

  const handleCharacterCardBack = () => {
    setShowCharacterCard(false);
  };

  const handleCharacterCardExpand = () => {
    setShowCharacterCard(false);
    setShowCharacterFull(true);
  };

  const handleCharacterFullBack = () => {
    setShowCharacterFull(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderFloatingEmojis = () => {
    return (
      <>
        {/* Floating emojis above like button area - matching Figma Component 26 */}
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
          {/* Continuous floating emojis */}
          {channelEmojis.map((emojiObj) => (
            <div
              key={emojiObj.id}
              className="absolute text-2xl animate-emoji-float-fast"
              style={{
                left: `${emojiObj.left}px`,
                bottom: '80px', // Lowered by 20px from 100px
              }}
            >
              {emojiObj.emoji}
            </div>
          ))}
          
          {/* Burst emojis from like button clicks */}
          {burstEmojis.map((emojiObj) => (
            <div
              key={emojiObj.id}
              className="absolute text-2xl animate-emoji-burst-fast"
              style={{
                left: `${emojiObj.left}px`,
                bottom: '80px', // Lowered by 20px from 120px, same as continuous
                animationDelay: `${emojiObj.delay}ms`,
              }}
            >
              {emojiObj.emoji}
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div 
      className="h-full w-full bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImageSrc})` }}
    >
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center pt-3 pb-2 px-4 bg-transparent z-10">
        <div className="text-white text-sm font-medium">9:41</div>
        <div className="flex items-center space-x-1">
          <img src={imgStatusCellular} alt="cellular" className="w-4 h-4" />
          <img src={imgStatusWifi} alt="wifi" className="w-4 h-4" />
          <img src={imgStatusBattery} alt="battery" className="w-6 h-3" />
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 mt-8">
        <button 
          onClick={handleBack}
          className="w-8 h-8 flex items-center justify-center"
        >
          <img src={imgBackArrow} alt="back" className="w-6 h-6" />
        </button>
        
        <div className="text-white text-lg font-semibold flex-1 text-center">
          Live Discussion
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="w-6 h-6">
            <img src={imgSettings} alt="settings" className="w-full h-full" />
          </button>
          <button className="w-6 h-6">
            <img src={imgShare} alt="share" className="w-full h-full" />
          </button>
        </div>
      </div>

      {/* Character Avatars */}
      <div className="flex justify-center space-x-12 px-4 mb-6">
        {Object.entries(characterAvatars).map(([name, avatar]) => (
          <div key={name} className="flex flex-col items-center space-y-2">
            <div className="relative">
              <img 
                src={avatar} 
                alt={name}
                className={`w-16 h-16 rounded-full border-2 border-white shadow-lg ${
                  name === 'Vincent van Gogh' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                }`}
                onClick={name === 'Vincent van Gogh' ? handleVanGoghClick : undefined}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <span className="text-white text-xs font-medium text-center">
              {name}
            </span>
          </div>
        ))}
      </div>

      {/* Messages Container - Above control panel */}
      <div className="absolute bottom-20 left-4 right-16 h-64 pointer-events-none">
        <div className="h-full overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="flex items-center justify-start h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={message.id} className="mb-3 animate-fade-in">
                  <div className="inline-flex items-center gap-3">
                    <img 
                      src={characterAvatars[message.speaker]}
                      alt={message.speaker}
                      className={`w-8 h-8 rounded-full flex-shrink-0 ${
                        message.speaker === 'Vincent van Gogh' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                      }`}
                      onClick={message.speaker === 'Vincent van Gogh' ? handleVanGoghClick : undefined}
                    />
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl px-3 py-2 max-w-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-xs">
                          {message.speaker}
                        </span>
                        <span className="text-white/60 text-xs">
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-white text-sm leading-5">
                        {message.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Control Panel - Match exact Figma design */}
      <div className="absolute bottom-8 left-5 right-5">
        <div className="flex items-center gap-3">
          {/* Voice input with text */}
          <div className="backdrop-blur-[1px] bg-black/30 flex items-center gap-4 px-3 py-2 rounded-full flex-1">
            <div className="w-[22px] h-[22px] flex-shrink-0">
              <img src={imgMicrophone} alt="microphone" className="w-full h-full" />
            </div>
            <span className="text-[#e5e0dc] text-[13px] font-['Avenir_LT_Std:55_Roman',sans-serif] leading-[22px]">
              Press and hold to speak
            </span>
          </div>
          
          {/* Keyboard button */}
          <button 
            onClick={handleTextInput}
            className="backdrop-blur-[1px] bg-black/30 flex items-center justify-center p-2 rounded-full w-[38px] h-[38px] flex-shrink-0"
          >
            <div className="w-[22px] h-[22px]">
              <img src={imgKeyboard} alt="keyboard" className="w-full h-full" />
            </div>
          </button>
          
          {/* Reroll button */}
          <button 
            onClick={handleReroll}
            className="backdrop-blur-[1px] bg-black/30 flex items-center justify-center p-2 rounded-full w-[38px] h-[38px] flex-shrink-0"
          >
            <div className="w-[22px] h-[22px]">
              <img src={imgRecheck} alt="reroll" className="w-full h-full" />
            </div>
          </button>
          
          {/* Like button */}
          <button 
            onClick={handleLike}
            className="backdrop-blur-[1px] bg-black/30 flex items-center justify-center p-2 rounded-full w-[38px] h-[38px] flex-shrink-0"
          >
            <div className="w-[22px] h-[22px]">
              <img src={imgLike} alt="like" className="w-full h-full" />
            </div>
          </button>
        </div>
      </div>

      {/* Floating Emojis */}
      {renderFloatingEmojis()}

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-1 bg-white/30 rounded-full"></div>
      </div>

      {/* Character Detail Modals */}
      {showCharacterCard && (
        <CharacterDetailCardPage 
          onBack={handleCharacterCardBack}
          onExpand={handleCharacterCardExpand}
        />
      )}
      
      {showCharacterFull && (
        <CharacterDetailFullPage 
          onBack={handleCharacterFullBack}
        />
      )}

      {/* Intro Popup */}
      {showIntroPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-[#fffaf4] relative rounded-[20px] w-[306px] h-[538px]"
            data-name="intro"
            id="node-32_1044"
          >
            {/* Van Gogh portrait - 严格按照Figma位置和尺寸 */}
            <div
              className="absolute h-[175px] left-[22px] top-11 w-[262px]"
              id="node-2_2195"
            >
              <div
                className="absolute bg-[0%_33.43%] bg-no-repeat bg-size-[100%_182.05%] h-[175.174px] left-[5px] rounded-[26px] top-0 w-[252.333px]"
                data-name="Vector"
                id="node-2_2196"
                style={{ backgroundImage: `url('/src/assets/d84d1463db2967ad16c63a138581a4d524675326.png')` }}
              />
            </div>

            {/* 展开按钮 - 严格按照Figma位置 */}
            <button
              onClick={handleIntroPopupExpand}
              className="absolute box-border content-stretch flex flex-row gap-3.5 items-center justify-start left-[272px] p-0 top-[11px] cursor-pointer"
              data-name="zoom icon"
              id="node-2_2197"
            >
              <div
                className="relative shrink-0 size-[23px]"
                data-name="展开 1"
                id="node-2_2198"
              >
                <img alt="展开" className="block max-w-none size-full" src="/src/assets/9403ffd15bd9a95db6a8488382897cc71b7212f7.svg" />
              </div>
            </button>

            {/* 返回按钮 - 严格按照Figma位置 */}
            <button
              onClick={handleIntroPopupBack}
              className="absolute left-1.5 size-9 top-1 cursor-pointer"
              data-name="返回 1"
              id="node-2_2200"
            >
              <img alt="返回" className="block max-w-none size-full" src="/src/assets/d23e0c72b637adf4346f1d26038aa38e3d04555c.svg" />
            </button>

            {/* 内容区域 - 严格按照Figma位置和间距 */}
            <div
              className="absolute box-border content-stretch flex flex-col gap-3.5 items-center justify-start p-0 top-[236px] translate-x-[-50%] w-[271px]"
              id="node-2_2202"
              style={{ left: "calc(50% + 0.5px)" }}
            >
              {/* 姓名 - 严格按照Figma字体和样式 */}
              <div
                className="font-bold leading-[0] not-italic opacity-90 relative shrink-0 text-[#232323] text-[18px] text-center w-full"
                id="node-2_2203"
              >
                <p className="block leading-[1.4]">Vincent van Gogh</p>
              </div>

              {/* 引言 - 严格按照Figma字体和样式 */}
              <div
                className="font-medium italic leading-[0] not-italic opacity-90 relative shrink-0 text-[#232323] text-[14px] text-left w-full"
                id="node-2_2204"
              >
                <p className="block leading-[1.45]">
                  "I painted not what I saw, but what I felt in that night of
                  madness."
                </p>
              </div>

              {/* 标签 - 严格按照Figma颜色和字体 */}
              <div
                className="font-medium leading-[0] not-italic opacity-90 relative shrink-0 text-[#0051ae] text-[14px] text-left w-full"
                id="node-2_2205"
              >
                <p className="block leading-[1.6]">
                  #LonelyGenius #PostImpressionist #NightOfTheMind
                </p>
              </div>

              {/* Identity 部分 - 严格按照Figma样式 */}
              <div
                className="box-border content-stretch flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#232323] text-left w-full"
                id="node-2_2206"
              >
                <div
                  className="font-bold opacity-90 relative shrink-0 text-[15px] w-full"
                  id="node-2_2207"
                >
                  <p className="block leading-[1.6]">Identity</p>
                </div>
                <div
                  className="font-medium opacity-90 relative shrink-0 text-[14px] w-full"
                  id="node-2_2208"
                >
                  <p className="block leading-[1.6]">
                    19th-century Dutch painter, creator of The Starry Night
                  </p>
                </div>
              </div>

              {/* Artistic Traits 部分 - 严格按照Figma样式 */}
              <div
                className="box-border content-stretch flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#232323] text-left w-full"
                id="node-2_2209"
              >
                <div
                  className="font-bold opacity-90 relative shrink-0 text-[15px] w-full"
                  id="node-2_2210"
                >
                  <p className="block leading-[1.6]">Artistic Traits</p>
                </div>
                <div
                  className="font-medium opacity-90 relative shrink-0 text-[14px] w-full"
                  id="node-2_2211"
                >
                  <p className="block leading-[1.6]">
                    Frequently quoted from personal letters; deeply sensitive to the
                    emotional power of color
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveRoomPage;
