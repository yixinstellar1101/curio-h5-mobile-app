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
import TextInputBar from '../components/TextInputBar';

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
const imgAvatarSuShi = "/src/assets/855a8fe22b8b7ac5f293f93e60065e26a3efd17d.png"; 
const imgAvatarVanGogh = "/src/assets/bb22518de19c944000484ee66f86147664b959a6.png";
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
  
  // Text input state
  const [showTextInput, setShowTextInput] = useState(false);
  
  // Message display queue for sequential appearance
  const [messageQueue, setMessageQueue] = useState([]);
  const [isDisplayingMessages, setIsDisplayingMessages] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  
  // Character detail modal states
  const [showCharacterCard, setShowCharacterCard] = useState(false);
  const [showCharacterFull, setShowCharacterFull] = useState(false);
  const [showIntroPopup, setShowIntroPopup] = useState(false);
  const [showSuShiPopup, setShowSuShiPopup] = useState(false);
  const [showLuXunPopup, setShowLuXunPopup] = useState(false);
  
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
    'Su Shi': imgAvatarSuShi,
    'Vincent van Gogh': imgAvatarVanGogh
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

  // Process message queue for sequential display
  useEffect(() => {
    if (messageQueue.length === 0 || isDisplayingMessages) return;

    const displayNextMessage = async () => {
      setIsDisplayingMessages(true);
      
      const nextMessage = messageQueue[0];
      setMessages(prev => [...prev, nextMessage]);
      setMessageQueue(prev => prev.slice(1));
      
      // Wait random 1-3 seconds before showing next message
      const randomDelay = Math.random() * 2000 + 1000; // 1000ms-3000ms 随机间隔
      await new Promise(resolve => setTimeout(resolve, randomDelay));
      
      setIsDisplayingMessages(false);
    };

    displayNextMessage();
  }, [messageQueue, isDisplayingMessages]);

  // Helper function to add messages to queue for sequential display
  const addMessagesToQueue = (newMessages) => {
    if (Array.isArray(newMessages)) {
      setMessageQueue(prev => [...prev, ...newMessages]);
    } else {
      setMessageQueue(prev => [...prev, newMessages]);
    }
  };

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
        // 使用队列逐条显示初始消息
        if (streamResult.initialMessages && streamResult.initialMessages.length > 0) {
          addMessagesToQueue(streamResult.initialMessages);
        }
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
          // 使用队列逐条显示新消息
          addMessagesToQueue(result.messages);
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
    setShowTextInput(true);
  };

  const handleSendMessage = async (messageText) => {
    if (!conversationStream || !messageText.trim()) return;

    console.log('=== USER MESSAGE SENT ===');
    console.log('Message:', messageText);

    try {
      // 提交用户消息到mock API
      const result = await mockSubmitUserMessage(conversationStream.streamId, messageText, 'text');
      
      if (result.success) {
        // 立即添加用户消息到对话中（不使用队列，因为用户消息需要立即显示）
        const userMessage = {
          ...result.userMessage,
          speaker: 'You', // 显示为用户
          avatar: null // 用户没有头像
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        // 添加AI角色的回复到队列中逐条显示
        if (result.aiResponses && result.aiResponses.length > 0) {
          // 延迟添加到队列，让用户消息先显示
          setTimeout(() => {
            addMessagesToQueue(result.aiResponses);
          }, 500); // 500ms延迟后开始显示AI回复
        }
        
        // 滚动到用户消息
        setTimeout(() => {
          forceScrollToBottom();
        }, 100);
      }
    } catch (error) {
      console.error('Failed to send user message:', error);
    }
  };

  const handleCloseTextInput = () => {
    setShowTextInput(false);
  };

  const handleReroll = async () => {
    if (!conversationStream) {
      console.warn('No conversation stream available for reroll');
      return;
    }
    
    console.log('=== REROLL BUTTON CLICKED ===');
    console.log('Generating new conversation messages...');
    
    try {
      // 添加视觉反馈：显示加载状态
      setIsLoading(true);
      
      const result = await mockGenerateConversation(conversationStream.streamId, {
        generateNewLoop: true,
        category: conversationStream.category
      });
      
      if (result.messages && result.messages.length > 0) {
        console.log(`Generated ${result.messages.length} new messages`);
        // 使用队列逐条显示新的消息
        addMessagesToQueue(result.messages);
      } else {
        console.warn('No new messages generated');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Reroll failed:', error);
      setIsLoading(false);
      
      // 可以添加错误提示给用户
      // 这里可以显示一个toast或其他提示
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

  const handleSuShiClick = () => {
    setShowSuShiPopup(true);
  };

  const handleLuXunClick = () => {
    setShowLuXunPopup(true);
  };

  const handleIntroPopupBack = () => {
    setShowIntroPopup(false);
  };

  const handleSuShiPopupBack = () => {
    setShowSuShiPopup(false);
  };

  const handleLuXunPopupBack = () => {
    setShowLuXunPopup(false);
  };

  const handleIntroPopupExpand = () => {
    setShowIntroPopup(false);
    setShowCharacterFull(true);
  };

  const handleSuShiPopupExpand = () => {
    setShowSuShiPopup(false);
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
    const messagesContainer = messagesEndRef.current?.parentElement;
    if (messagesContainer) {
      // If user hasn't scrolled up to view history, always force scroll to bottom
      if (!userScrolledUp) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If user has scrolled up, only auto-scroll if they're near the bottom
        const isNearBottom = messagesContainer.scrollTop + messagesContainer.clientHeight >= messagesContainer.scrollHeight - 50;
        if (isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const forceScrollToBottom = () => {
    setUserScrolledUp(false); // Reset scroll state when user manually goes to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e) => {
    const container = e.target;
    const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
    
    // Track if user has scrolled up to view history
    if (!isNearBottom && !userScrolledUp) {
      setUserScrolledUp(true);
    } else if (isNearBottom && userScrolledUp) {
      setUserScrolledUp(false);
    }
    
    setShowScrollToBottom(!isNearBottom && messages.length > 0);
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
          <div key={name} className={`flex flex-col items-center space-y-2 ${name === 'Su Shi' ? 'ml-6' : ''}`}>
            <div className="relative">
              <img 
                src={avatar} 
                alt={name}
                className={`w-16 h-16 rounded-full border-2 border-white shadow-lg ${
                  name === 'Vincent van Gogh' || name === 'Su Shi' || name === 'Lu Xun' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                }`}
                onClick={name === 'Vincent van Gogh' ? handleVanGoghClick : name === 'Su Shi' ? handleSuShiClick : name === 'Lu Xun' ? handleLuXunClick : undefined}
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
      <div className="absolute bottom-20 left-4 right-16 h-64 pointer-events-auto">
        <div className="h-full overflow-y-auto scrollbar-hide relative" style={{ scrollBehavior: 'smooth' }} onScroll={handleScroll}>
          {isLoading ? (
            <div className="flex items-center justify-start h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={message.id} className="mb-3 animate-fade-in">
                  <div className={`inline-flex items-center gap-3 ${
                    message.speaker === 'You' ? 'flex-row-reverse' : ''
                  }`}>
                    {message.speaker === 'You' ? (
                      // 用户消息：没有头像，使用不同的样式
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">You</span>
                      </div>
                    ) : (
                      <img 
                        src={characterAvatars[message.speaker]}
                        alt={message.speaker}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className={`rounded-2xl px-3 py-2 max-w-xs ${
                      message.speaker === 'You' 
                        ? 'bg-blue-600/80 backdrop-blur-md' 
                        : 'bg-white/10 backdrop-blur-md'
                    }`}>
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
              
              {/* Scroll to bottom button */}
              {showScrollToBottom && (
                <div className="absolute bottom-2 right-2 z-10">
                  <button
                    onClick={forceScrollToBottom}
                    className="bg-black/50 backdrop-blur-md text-white p-2 rounded-full shadow-lg hover:bg-black/70 transition-all duration-200"
                    title="回到底部"
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Control Panel - Match exact Figma design */}
      {!showTextInput && (
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
              disabled={isLoading}
              className={`backdrop-blur-[1px] bg-black/30 flex items-center justify-center p-2 rounded-full w-[38px] h-[38px] flex-shrink-0 transition-opacity ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/40 active:scale-95'
              }`}
              title="重新生成对话"
            >
              <div className="w-[22px] h-[22px]">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-full w-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <img src={imgRecheck} alt="reroll" className="w-full h-full" />
                )}
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
      )}

      {/* Text Input Bar */}
      {showTextInput && (
        <TextInputBar
          onSendMessage={handleSendMessage}
          onClose={handleCloseTextInput}
          placeholder="Type here"
        />
      )}

      {/* Floating Emojis */}
      {renderFloatingEmojis()}

      {/* Home Indicator - only show when text input is not visible */}
      {!showTextInput && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-32 h-1 bg-white/30 rounded-full"></div>
        </div>
      )}

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

      {/* Lu Xun Popup - 按照Figma设计 */}
      {showLuXunPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-[#fffaf4] relative rounded-[20px] w-[306px] h-[538px] overflow-hidden"
            data-name="Lu Xun"
            data-node-id="165:990"
          >
            {/* 滚动内容容器 */}
            <div className="h-full overflow-y-auto scrollbar-hide">
              {/* Lu Xun portrait - 严格按照Figma位置和尺寸 */}
              <div
                className="h-[175px] mt-11 mx-[22px] w-[262px]"
                data-node-id="165:991"
              >
                <div
                  className="bg-no-repeat bg-cover bg-center h-[175.174px] ml-[5px] rounded-[26px] w-[252.333px]"
                  data-name="Vector"
                  data-node-id="165:992"
                  style={{ backgroundImage: `url('/src/assets/1185dfe3ed5446ee8a00fd39bef04880678bfc5a.png')` }}
                />
              </div>

              {/* 内容区域 - 严格按照Figma位置和间距 */}
              <div
                className="flex flex-col gap-3.5 items-center justify-start px-[17.5px] mt-[25px] w-full"
                data-node-id="165:998"
              >
                {/* 姓名 - 严格按照Figma字体和样式 */}
                <div
                  className="font-bold leading-[0] not-italic opacity-90 text-[#232323] text-[18px] text-center w-full"
                  data-node-id="165:999"
                >
                  <p className="block leading-[1.4]">Lu Xun</p>
                </div>

                {/* 引言 - 严格按照Figma字体和样式 */}
                <div
                  className="font-medium italic leading-[0] not-italic opacity-90 text-[#232323] text-[14px] text-left w-full"
                  data-node-id="165:1000"
                >
                  <p className="block leading-[1.45]">
                    "The pen is but a scalpel; it cuts through the illness beneath the skin of society."
                  </p>
                </div>

                {/* 标签 - 严格按照Figma颜色和字体 */}
                <div
                  className="font-medium leading-[0] not-italic opacity-90 text-[#0051ae] text-[14px] text-left w-full"
                  data-node-id="165:1001"
                >
                  <p className="block leading-[1.6]">
                    #SharpSatirist #ModernChineseLiterature #SocialCritic
                  </p>
                </div>

                {/* Identity 部分 - 严格按照Figma样式 */}
                <div
                  className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full"
                  data-node-id="165:1002"
                >
                  <div
                    className="font-bold opacity-90 text-[15px] w-full"
                    data-node-id="165:1003"
                  >
                    <p className="block leading-[1.6]">Identity</p>
                  </div>
                  <div
                    className="font-medium opacity-90 text-[14px] w-full"
                    data-node-id="165:1004"
                  >
                    <p className="block leading-[1.6]">
                      Pioneer of modern Chinese literature, known for sharp social commentary and reformist spirit.
                    </p>
                  </div>
                </div>

                {/* Artistic Traits 部分 - 严格按照Figma样式 */}
                <div
                  className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full"
                  data-node-id="165:1005"
                >
                  <div
                    className="font-bold opacity-90 text-[15px] w-full"
                    data-node-id="165:1006"
                  >
                    <p className="block leading-[1.6]">Artistic Traits</p>
                  </div>
                  <div
                    className="font-medium opacity-90 text-[14px] w-full"
                    data-node-id="165:1007"
                  >
                    <p className="block leading-[1.6]">
                      Concise, metaphor-rich prose with a tone of irony and compassion.
                    </p>
                  </div>
                </div>

                {/* Perspective 部分 - 严格按照Figma样式 */}
                <div
                  className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full"
                  data-node-id="165:1008"
                >
                  <div
                    className="font-bold opacity-90 text-[15px] w-full"
                    data-node-id="165:1009"
                  >
                    <p className="block leading-[1.6]">Perspective</p>
                  </div>
                  <div
                    className="font-medium opacity-90 text-[14px] w-full"
                    data-node-id="165:1010"
                  >
                    <p className="block leading-[1.6]">
                      Critical and progressive; seeks to awaken society through literature, believing in the power of culture to transform minds.
                    </p>
                  </div>
                </div>

                {/* 添加更多内容以展示滚动功能 */}
                <div className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full">
                  <div className="font-bold opacity-90 text-[15px] w-full">
                    <p className="block leading-[1.6]">Famous Works</p>
                  </div>
                  <div className="font-medium opacity-90 text-[14px] w-full">
                    <p className="block leading-[1.6]">
                      "The True Story of Ah Q", "Diary of a Madman", "Kong Yiji", "Medicine", and numerous essays on social reform.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full">
                  <div className="font-bold opacity-90 text-[15px] w-full">
                    <p className="block leading-[1.6]">Historical Context</p>
                  </div>
                  <div className="font-medium opacity-90 text-[14px] w-full">
                    <p className="block leading-[1.6]">
                      Lived during China's transition from imperial to republican era (1881-1936), and advocated for modernization and enlightenment.
                    </p>
                  </div>
                </div>

                {/* 底部间距，确保内容不被截断 */}
                <div className="h-8 w-full"></div>
              </div>
            </div>

            {/* 返回按钮 - 固定在顶部 */}
            <button
              onClick={handleLuXunPopupBack}
              className="absolute left-1.5 size-9 top-1 cursor-pointer z-10"
              data-name="返回 1"
              data-node-id="165:996"
            >
              <img alt="返回" className="block max-w-none size-full" src="/src/assets/d23e0c72b637adf4346f1d26038aa38e3d04555c.svg" />
            </button>
          </div>
        </div>
      )}

      {/* Su Shi Popup - 按照Figma设计 */}
      {showSuShiPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-[#fffaf4] relative rounded-[20px] w-[306px] h-[538px] overflow-hidden"
            data-name="Su Shi"
            data-node-id="165:962"
          >
            {/* 滚动内容容器 */}
            <div className="h-full overflow-y-auto scrollbar-hide">
              {/* Su Shi portrait - 严格按照Figma位置和尺寸 */}
              <div
                className="h-[175px] mt-11 mx-[22px] w-[262px]"
                data-node-id="165:963"
              >
                <div
                  className="bg-no-repeat bg-cover bg-[center_10%] h-[175.174px] ml-[5px] rounded-[26px] w-[252.333px]"
                  data-name="Vector"
                  data-node-id="165:964"
                  style={{ backgroundImage: `url('/src/assets/506fd9bda269153d8d02ca5992650f763a3d1255.png')` }}
                />
              </div>

              {/* 内容区域 - 严格按照Figma位置和间距 */}
              <div
                className="flex flex-col gap-3.5 items-center justify-start px-[17.5px] mt-[25px] w-full"
                data-node-id="165:970"
              >
                {/* 姓名 - 严格按照Figma字体和样式 */}
                <div
                  className="font-bold leading-[0] not-italic opacity-90 text-[#232323] text-[18px] text-center w-full"
                  data-node-id="165:971"
                >
                  <p className="block leading-[1.4]">Su Shi</p>
                </div>

                {/* 引言 - 严格按照Figma字体和样式 */}
                <div
                  className="font-medium italic leading-[0] not-italic opacity-90 text-[#232323] text-[14px] text-left w-full"
                  data-node-id="165:972"
                >
                  <p className="block leading-[1.45]">
                    "The moonlight upon this artifact would inspire verses flowing like the river beyond my window."
                  </p>
                </div>

                {/* 标签 - 严格按照Figma颜色和字体 */}
                <div
                  className="font-medium leading-[0] not-italic opacity-90 text-[#0051ae] text-[14px] text-left w-full"
                  data-node-id="165:973"
                >
                  <p className="block leading-[1.6]">
                    #SongDynastyPoet #Calligrapher #FreeSpirit
                  </p>
                </div>

                {/* Identity 部分 - 严格按照Figma样式 */}
                <div
                  className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full"
                  data-node-id="165:974"
                >
                  <div
                    className="font-bold opacity-90 text-[15px] w-full"
                    data-node-id="165:975"
                  >
                    <p className="block leading-[1.6]">Identity</p>
                  </div>
                  <div
                    className="font-medium opacity-90 text-[14px] w-full"
                    data-node-id="165:976"
                  >
                    <p className="block leading-[1.6]">
                      Master poet and calligrapher of the Northern Song dynasty, famed for his versatility and free-spirited style.
                    </p>
                  </div>
                </div>

                {/* Artistic Traits 部分 - 严格按照Figma样式 */}
                <div
                  className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full"
                  data-node-id="165:977"
                >
                  <div
                    className="font-bold opacity-90 text-[15px] w-full"
                    data-node-id="165:978"
                  >
                    <p className="block leading-[1.6]">Artistic Traits</p>
                  </div>
                  <div
                    className="font-medium opacity-90 text-[14px] w-full"
                    data-node-id="165:979"
                  >
                    <p className="block leading-[1.6]">
                      Lyrical, philosophical, blending personal sentiment with natural imagery.
                    </p>
                  </div>
                </div>

                {/* Perspective 部分 - 严格按照Figma样式 */}
                <div
                  className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full"
                  data-node-id="165:980"
                >
                  <div
                    className="font-bold opacity-90 text-[15px] w-full"
                    data-node-id="165:981"
                  >
                    <p className="block leading-[1.6]">Perspective</p>
                  </div>
                  <div
                    className="font-medium opacity-90 text-[14px] w-full"
                    data-node-id="165:982"
                  >
                    <p className="block leading-[1.6]">
                      Romantic and reflective; appreciates artistry, craftsmanship, and the continuity of culture.
                    </p>
                  </div>
                </div>

                {/* 添加更多内容以展示滚动功能 */}
                <div className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full">
                  <div className="font-bold opacity-90 text-[15px] w-full">
                    <p className="block leading-[1.6]">Famous Works</p>
                  </div>
                  <div className="font-medium opacity-90 text-[14px] w-full">
                    <p className="block leading-[1.6]">
                      "Remembering Red Cliff", "Water Melody Prelude", "Song of Divination", countless poems about nature and human emotion.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full">
                  <div className="font-bold opacity-90 text-[15px] w-full">
                    <p className="block leading-[1.6]">Historical Context</p>
                  </div>
                  <div className="font-medium opacity-90 text-[14px] w-full">
                    <p className="block leading-[1.6]">
                      Lived during the Northern Song dynasty (1037-1101), served in various government positions, and is considered one of the greatest poets in Chinese literature.
                    </p>
                  </div>
                </div>

                {/* 底部间距，确保内容不被截断 */}
                <div className="h-8 w-full"></div>
              </div>
            </div>

            {/* 返回按钮 - 固定在顶部 */}
            <button
              onClick={handleSuShiPopupBack}
              className="absolute left-1.5 size-9 top-1 cursor-pointer z-10"
              data-name="返回 1"
              data-node-id="165:968"
            >
              <img alt="返回" className="block max-w-none size-full" src="/src/assets/d23e0c72b637adf4346f1d26038aa38e3d04555c.svg" />
            </button>
          </div>
        </div>
      )}

      {/* Intro Popup - 严格按照Figma设计 */}
      {showIntroPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-[#fffaf4] relative rounded-[20px] w-[306px] h-[538px] overflow-hidden"
            data-name="intro"
            data-node-id="164:934"
          >
            {/* 滚动内容容器 */}
            <div className="h-full overflow-y-auto scrollbar-hide">
              {/* Van Gogh portrait - 严格按照Figma位置和尺寸 */}
              <div
                className="h-[175px] mt-11 mx-[22px] w-[262px]"
                data-node-id="164:935"
              >
                <div
                  className="bg-no-repeat bg-cover bg-[center_30%] h-[175.174px] ml-[5px] rounded-[26px] w-[252.333px]"
                  data-name="Vector"
                  data-node-id="164:936"
                  style={{ backgroundImage: `url('/src/assets/d84d1463db2967ad16c63a138581a4d524675326.png')` }}
                />
              </div>

              {/* 内容区域 - 严格按照Figma位置和间距 */}
              <div
                className="flex flex-col gap-3.5 items-center justify-start px-[17.5px] mt-[25px] w-full"
                data-node-id="164:942"
              >
                {/* 姓名 - 严格按照Figma字体和样式 */}
                <div
                  className="font-bold leading-[0] not-italic opacity-90 text-[#232323] text-[18px] text-center w-full"
                  data-node-id="164:943"
                >
                  <p className="block leading-[1.4]">Vincent van Gogh</p>
                </div>

                {/* 引言 - 严格按照Figma字体和样式 */}
                <div
                  className="font-medium italic leading-[0] not-italic opacity-90 text-[#232323] text-[14px] text-left w-full"
                  data-node-id="164:944"
                >
                  <p className="block leading-[1.45]">
                    "I painted not what I saw, but what I felt in that night of madness."
                  </p>
                </div>

                {/* 标签 - 严格按照Figma颜色和字体 */}
                <div
                  className="font-medium leading-[0] not-italic opacity-90 text-[#0051ae] text-[14px] text-left w-full"
                  data-node-id="164:945"
                >
                  <p className="block leading-[1.6]">
                    #LonelyGenius #PostImpressionist #NightOfTheMind
                  </p>
                </div>

                {/* Identity 部分 - 严格按照Figma样式 */}
                <div
                  className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full"
                  data-node-id="164:946"
                >
                  <div
                    className="font-bold opacity-90 text-[15px] w-full"
                    data-node-id="164:947"
                  >
                    <p className="block leading-[1.6]">Identity</p>
                  </div>
                  <div
                    className="font-medium opacity-90 text-[14px] w-full"
                    data-node-id="164:948"
                  >
                    <p className="block leading-[1.6]">
                      19th-century Dutch painter, creator of The Starry Night.
                    </p>
                  </div>
                </div>

                {/* Artistic Traits 部分 - 严格按照Figma样式 */}
                <div
                  className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full"
                  data-node-id="164:949"
                >
                  <div
                    className="font-bold opacity-90 text-[15px] w-full"
                    data-node-id="164:950"
                  >
                    <p className="block leading-[1.6]">Artistic Traits</p>
                  </div>
                  <div
                    className="font-medium opacity-90 text-[14px] w-full"
                    data-node-id="164:951"
                  >
                    <p className="block leading-[1.6]">
                      Frequently quoted from personal letters; deeply sensitive to the emotional power of color.
                    </p>
                  </div>
                </div>

                {/* Perspective 部分 - 新增内容，按照Figma样式 */}
                <div
                  className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full"
                  data-node-id="164:952"
                >
                  <div
                    className="font-bold opacity-90 text-[15px] w-full"
                    data-node-id="164:953"
                  >
                    <p className="block leading-[1.6]">Perspective</p>
                  </div>
                  <div
                    className="font-medium opacity-90 text-[14px] w-full"
                    data-node-id="164:954"
                  >
                    <p className="block leading-[1.6]">
                      Interprets the swirling sky, cypress trees, and dreamlike village through a lens of self-healing.
                    </p>
                  </div>
                </div>

                {/* 添加更多内容以展示滚动功能 */}
                <div className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full">
                  <div className="font-bold opacity-90 text-[15px] w-full">
                    <p className="block leading-[1.6]">Famous Works</p>
                  </div>
                  <div className="font-medium opacity-90 text-[14px] w-full">
                    <p className="block leading-[1.6]">
                      The Starry Night, Sunflowers, The Potato Eaters, Café Terrace at Night, Self-Portrait with Bandaged Ear.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 items-start justify-start leading-[0] not-italic text-[#232323] text-left w-full">
                  <div className="font-bold opacity-90 text-[15px] w-full">
                    <p className="block leading-[1.6]">Historical Context</p>
                  </div>
                  <div className="font-medium opacity-90 text-[14px] w-full">
                    <p className="block leading-[1.6]">
                      Lived during the Post-Impressionist period (1853-1890), struggled with mental health, and created most of his masterpieces in the final years of his life.
                    </p>
                  </div>
                </div>

                {/* 底部间距，确保内容不被截断 */}
                <div className="h-8 w-full"></div>
              </div>
            </div>

            {/* 返回按钮 - 固定在顶部 */}
            <button
              onClick={handleIntroPopupBack}
              className="absolute left-1.5 size-9 top-1 cursor-pointer z-10"
              data-name="返回 1"
              data-node-id="164:940"
            >
              <img alt="返回" className="block max-w-none size-full" src="/src/assets/d23e0c72b637adf4346f1d26038aa38e3d04555c.svg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveRoomPage;
