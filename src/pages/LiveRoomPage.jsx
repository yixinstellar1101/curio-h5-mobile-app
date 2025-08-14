import React, { useState, useEffect, useRef } from 'react';
import { PAGES } from '../constants/pages';
import { 
  mockCreateConversationStream, 
  mockGenerateConversation, 
  mockSubmitUserMessage,
  mockSendReaction,
  CHARACTERS,
  REACTION_EMOJIS 
} from '../services/mockLiveRoomApi';

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
  const { image, analysis } = data || {};
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [conversationStream, setConversationStream] = useState(null);
  
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
      }, 4000);
      
    }, Math.random() * 1000 + 1000); // 1-2s intervals for faster feel
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
      style={{ backgroundImage: `url(${imgBackground})` }}
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
                className="w-16 h-16 rounded-full border-2 border-white shadow-lg"
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
      <div className="absolute bottom-20 left-4 right-4 h-64 pointer-events-none">
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
                      className="w-8 h-8 rounded-full flex-shrink-0"
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
            <span className="text-[#e5e0dc] text-[13px] font-['Avenir_LT_Std:55_Roman',sans-serif] h-4 leading-[0]">
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
    </div>
  );
};

export default LiveRoomPage;
