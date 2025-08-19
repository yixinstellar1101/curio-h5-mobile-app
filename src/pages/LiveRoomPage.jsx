import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PAGES } from '../constants/pages';
import { musicManager } from '../utils/musicManager';
import { 
  createConversationStream, 
  generateConversation
} from '../services/interface';
import { 
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
    originalImage, // Changed from image to originalImage to match GalleryPage data
    analysis, 
    backgroundImage, 
    imageUrl, 
    category, 
    style, 
    objects,
    backgroundId // 添加backgroundId以保持音乐一致性
  } = data || {};
  
  // Create image object for compatibility with existing code
  const image = useMemo(() => ({
    imageId: `live-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate a unique imageId
    imageUrl: imageUrl,
    compositeImageUrl: imageUrl,
    originalImage,
    metadata: analysis ? {
      name: analysis.name,
      description: analysis.description,
      timestamp: analysis.timestamp
    } : {}
  }), [imageUrl, originalImage, analysis]);
  
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

  // Character ID to display name mapping
  const characterIdToName = {
    'lu-xun': 'Lu Xun',
    'su-shi': 'Su Shi', 
    'vincent-van-gogh': 'Vincent van Gogh',
    'You': 'You'
  };

  // Helper function to get character display name
  const getCharacterName = (message) => {
    if (message.speaker) return message.speaker;
    if (message.character) return characterIdToName[message.character] || message.character;
    return 'Unknown';
  };

  // Helper function to get character avatar
  const getCharacterAvatar = (message) => {
    const displayName = getCharacterName(message);
    return characterAvatars[displayName];
  };

  // Get background image - use the same background as GalleryPage
  const backgroundImageSrc = useMemo(() => {
    console.log('=== BACKGROUND IMAGE PROCESSING ===');
    console.log('Received backgroundImage prop:', backgroundImage ? 'Present' : 'Missing');
    console.log('BackgroundImage type:', typeof backgroundImage);
    console.log('BackgroundImage starts with data:', backgroundImage?.startsWith('data:'));
    console.log('BackgroundImage preview:', backgroundImage?.substring(0, 100) + '...');
    
    // Use the background image passed from GalleryPage
    if (backgroundImage) {
      console.log('Using background image from GalleryPage (composite)');
      return backgroundImage;
    }
    
    // Fallback to default background
    console.log('Using default background fallback');
    return imgBackground;
  }, [backgroundImage]);

  useEffect(() => {
    initializeConversation();
    startContinuousEmojis();
    return () => {
      if (autoLoopIntervalRef.current) {
        clearTimeout(autoLoopIntervalRef.current);
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
      
      // Wait random 3-5 seconds before showing next message
      const randomDelay = Math.random() * 2000 + 3000; // 3000ms-5000ms 随机间隔
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
      console.log('=== INITIALIZING CONVERSATION ===');
      console.log('Data passed to LiveRoomPage:', {
        image,
        analysis,
        imageUrl,
        category,
        style
      });
      
      if (!image || !image.imageId) {
        console.error('Missing required image data:', image);
        throw new Error('Missing required image data');
      }
      
      setIsLoading(true);
      
      // Create conversation stream with real interface
      const stream = createConversationStream(image.imageId, {
        autoLoop: true,
        loopInterval: 8000
      });
      
      setConversationStream(stream);
      
      // Generate initial conversation using the real interface
      console.log('=== STARTING INITIAL CONVERSATION GENERATION ===');
      
      // 确保AI只看到原始文物，不是合成的背景图
      let apiImageUrl = imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
      
      console.log('🖼️  Initial Image Processing:');
      console.log('  - imageUrl type:', typeof imageUrl, imageUrl);
      console.log('  - image.originalImage type:', typeof image?.originalImage, image?.originalImage);
      
      // 如果有原始图像数据，需要转换为可用的URL
      if (image.originalImage && image.originalImage instanceof File) {
        console.log('Converting original image File to base64 for AI analysis');
        try {
          const reader = new FileReader();
          apiImageUrl = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(image.originalImage);
          });
        } catch (error) {
          console.error('Failed to convert original image File:', error);
          apiImageUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
        }
      } else if (imageUrl && typeof imageUrl === 'string' && !imageUrl.startsWith('blob:')) {
        console.log('Using provided imageUrl for AI analysis');
        apiImageUrl = imageUrl;
      } else if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('blob:')) {
        console.log('Converting blob URL to base64 for AI analysis of original artifact only');
        // 这里应该转换原始blob URL，而不是使用合成的背景图
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          apiImageUrl = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Failed to convert blob to base64:', error);
          // 使用样本图片作为最后的fallback
          apiImageUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
        }
      }
      
      // 确保 apiImageUrl 是有效字符串
      if (!apiImageUrl || typeof apiImageUrl !== 'string' || 
          (!apiImageUrl.startsWith('http') && !apiImageUrl.startsWith('data:'))) {
        console.log('⚠️ apiImageUrl validation failed in initializeConversation, using fallback');
        apiImageUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
      }
      
      console.log('🔍 Final apiImageUrl for initializeConversation:', typeof apiImageUrl, apiImageUrl?.substring(0, 50) + '...');
      
      console.log('Image data:', {
        imageId: image.imageId,
        originalImageUrl: imageUrl,
        apiImageUrl: apiImageUrl?.substring(0, 100) + '...',
        description: image.metadata?.description || 'An interesting artifact for discussion'
      });
      
      const initialConversation = await generateConversation({
        imageId: image.imageId,
        imageUrl: apiImageUrl, // Use the processed API-compatible URL
        description: image.metadata?.description || 'An interesting artifact for discussion',
        characters: ['lu-xun', 'su-shi', 'vincent-van-gogh']
      });
      
      console.log('Initial conversation result:', initialConversation);
      
      if (initialConversation.messages && initialConversation.messages.length > 0) {
        console.log('Generated initial conversation:', initialConversation.messages);
        addMessagesToQueue(initialConversation.messages);
      } else {
        console.warn('No messages received from generateConversation, using fallback');
      }
      
      // Start the auto-loop for continuous conversation
      startAutoLoop();
      
      setIsLoading(false);
    } catch (error) {
      console.error('=== FAILED TO INITIALIZE CONVERSATION ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setIsLoading(false);
      
      // Fallback: add some default messages
      const baseTimestamp = Date.now();
      const fallbackMessages = [
        {
          id: `msg-${baseTimestamp}-1-${Math.random().toString(36).substr(2, 9)}`,
          character: 'lu-xun',
          content: 'This artifact speaks to the depths of human creativity and cultural expression.',
          timestamp: new Date().toISOString(),
          isAI: true
        },
        {
          id: `msg-${baseTimestamp}-2-${Math.random().toString(36).substr(2, 9)}`,
          character: 'su-shi',
          content: 'Indeed, like moonlight on water, it reflects the beauty of its time.',
          timestamp: new Date().toISOString(),
          isAI: true
        },
        {
          id: `msg-${baseTimestamp}-3-${Math.random().toString(36).substr(2, 9)}`,
          character: 'vincent-van-gogh',
          content: 'The colors and forms here stir something profound in my artistic soul.',
          timestamp: new Date().toISOString(),
          isAI: true
        }
      ];
      
      addMessagesToQueue(fallbackMessages);
    }
  };

  const startAutoLoop = () => {
    const scheduleNextLoop = () => {
      // Random interval between 3-5 seconds (3000-5000ms)
      const randomInterval = Math.random() * 2000 + 3000;
      
      autoLoopIntervalRef.current = setTimeout(async () => {
        try {
          console.log('Generating new conversation loop...');
          
          // 确保AI只分析原始文物，不是合成背景
          let apiImageUrl = imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
          
          console.log('🔄 Auto-loop Image Processing:');
          console.log('  - imageUrl type:', typeof imageUrl);
          console.log('  - image.originalImage type:', typeof image?.originalImage);
          
          if (image.originalImage && image.originalImage instanceof File) {
            console.log('Converting original image File to base64 for auto-loop');
            try {
              const reader = new FileReader();
              apiImageUrl = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(image.originalImage);
              });
            } catch (error) {
              console.error('Failed to convert original image File in auto-loop:', error);
              apiImageUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
            }
          } else if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('blob:')) {
            // 转换原始blob URL而不是使用合成背景
            try {
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              const reader = new FileReader();
              apiImageUrl = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            } catch (error) {
              console.error('Failed to convert blob:', error);
              apiImageUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
            }
          }
          
          // 确保 apiImageUrl 是有效字符串
          if (!apiImageUrl || typeof apiImageUrl !== 'string' || 
              (!apiImageUrl.startsWith('http') && !apiImageUrl.startsWith('data:'))) {
            console.log('⚠️ apiImageUrl validation failed in auto-loop, using fallback');
            apiImageUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
          }
          
          console.log('🔍 Final apiImageUrl for auto-loop:', typeof apiImageUrl);
          
          const result = await generateConversation({
            imageId: image.imageId,
            imageUrl: apiImageUrl,
            description: image.metadata?.description || 'An interesting artifact for discussion',
            characters: ['lu-xun', 'su-shi', 'vincent-van-gogh'],
            previousMessages: messages.slice(-5) // 传递最近5条消息作为上下文，包含用户消息
          });
          
          if (result.messages && result.messages.length > 0) {
            console.log('Generated new messages:', result.messages);
            // 使用队列逐条显示新消息
            addMessagesToQueue(result.messages);
          }
        } catch (error) {
          console.error('Auto-loop generation failed:', error);
          
          // Fallback: generate some variety messages
          const baseTimestamp = Date.now();
          const fallbackMessages = [
            {
              id: `msg-${baseTimestamp}-fallback-${Math.random().toString(36).substr(2, 9)}`,
              character: ['lu-xun', 'su-shi', 'vincent-van-gogh'][Math.floor(Math.random() * 3)],
              content: [
                'The artistry here continues to fascinate me with each viewing.',
                'Such craftsmanship deserves our continued admiration.',
                'Every detail reveals new layers of meaning and beauty.'
              ][Math.floor(Math.random() * 3)],
              timestamp: new Date().toISOString(),
              isAI: true
            }
          ];
          
          addMessagesToQueue(fallbackMessages);
        }
        
        // Schedule next loop with random interval
        scheduleNextLoop();
      }, randomInterval);
    };
    
    // Start the first loop
    scheduleNextLoop();
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
    if (!messageText.trim()) return;

    console.log('=== USER MESSAGE SENT ===');
    console.log('Message:', messageText);

    try {
      // 立即添加用户消息到对话中
      const userMessage = {
        id: `user-msg-${Date.now()}`,
        character: 'You',
        content: messageText,
        timestamp: new Date().toISOString(),
        isAI: false,
        isUser: true
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // 滚动到用户消息
      setTimeout(() => {
        forceScrollToBottom();
      }, 100);

      // 暂时停止自动对话循环，让AI专注回应用户
      if (autoLoopIntervalRef.current) {
        clearTimeout(autoLoopIntervalRef.current);
      }
      
      // 确保AI分析原始文物，不是合成背景
      let apiImageUrl = imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
      
      console.log('🖼️  Image URL Processing:');
      console.log('  - Initial imageUrl:', typeof imageUrl, imageUrl);
      console.log('  - Initial apiImageUrl:', typeof apiImageUrl, apiImageUrl);
      console.log('  - image.originalImage:', typeof image?.originalImage, image?.originalImage);
      
      if (image.originalImage && image.originalImage instanceof File) {
        console.log('Converting original image File to base64 for handleSendMessage');
        try {
          const reader = new FileReader();
          apiImageUrl = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(image.originalImage);
          });
        } catch (error) {
          console.error('Failed to convert original image File in handleSendMessage:', error);
          apiImageUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
        }
      } else if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('blob:')) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          apiImageUrl = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Failed to convert blob:', error);
          apiImageUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
        }
      }
      
      // 确保 apiImageUrl 是字符串
      console.log('🔍 Final URL Validation:');
      console.log('  - apiImageUrl type:', typeof apiImageUrl);
      console.log('  - apiImageUrl value:', apiImageUrl);
      
      if (!apiImageUrl || typeof apiImageUrl !== 'string' || 
          (!apiImageUrl.startsWith('http') && !apiImageUrl.startsWith('data:'))) {
        console.log('⚠️  apiImageUrl failed validation, using fallback');
        apiImageUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
      } else {
        console.log('✅ apiImageUrl passed validation');
      }
      
      // 生成AI角色的回复（包含用户消息的上下文）
      console.log('=== CALLING GENERATE CONVERSATION ===');
      console.log('Parameters being sent to AI:', {
        imageId: image.imageId,
        imageUrl: apiImageUrl?.substring(0, 50) + '...',
        description: image.metadata?.description,
        characters: ['lu-xun', 'su-shi', 'vincent-van-gogh'],
        userMessage: messageText,
        previousMessagesCount: messages.slice(-8).length
      });
      
      const result = await generateConversation({
        imageId: image.imageId,
        imageUrl: apiImageUrl,
        description: image.metadata?.description || 'An interesting artifact for discussion',
        characters: ['lu-xun', 'su-shi', 'vincent-van-gogh'],
        userMessage: messageText, // 传递用户消息
        previousMessages: messages.slice(-8) // 传递最近8条消息作为上下文
      });
      
      console.log('=== AI GENERATION RESULT ===');
      console.log('Full result object:', result);
      console.log('Result has messages:', !!result?.messages);
      console.log('Messages count:', result?.messages?.length);
      console.log('First message:', result?.messages?.[0]);
      
      if (result && result.messages && result.messages.length > 0) {
        console.log('✅ SUCCESS: Generated AI responses to user message:', result.messages);
        
        // 快速响应用户消息，特别是中文消息
        const isChineseMessage = /[\u4e00-\u9fff]/.test(messageText);
        const responseDelay = isChineseMessage ? 200 : 800;
        
        setTimeout(() => {
          addMessagesToQueue(result.messages);
        }, responseDelay);
        
        // 在AI回应后重启自动对话循环
        setTimeout(() => {
          startAutoLoop();
        }, 5000);
        
      } else {
        console.log('❌ FAILED: No AI response generated, using fallback messages');
        console.log('Result was:', result);
        // 只有在AI完全失败时才使用fallback
        throw new Error('AI generation failed, using fallback');
      }
      
    } catch (error) {
      console.error('Failed to send user message:', error);
      
      // Fallback: add more engaging acknowledgment messages that match user's language and ANSWER their question
      const baseTimestamp = Date.now();
      const isChineseMessage = /[\u4e00-\u9fff]/.test(messageText);
      
      // Try to extract and respond to the user's question/comment
      const userQuestion = messageText.toLowerCase();
      let fallbackContent;
      
      if (isChineseMessage) {
        if (messageText.includes('什么人') || messageText.includes('背后') || messageText.includes('是什么')) {
          fallbackContent = {
            luXun: '你问的问题很有深度，这件文物背后承载着深厚的历史文化。',
            suShi: '如你所询，此物工艺精湛，必出自名门巧匠之手。',
            vanGogh: '你的提问让我思考，每件艺术品背后都有故事。'
          };
        } else {
          fallbackContent = {
            luXun: '从你的话中感受到对文物的深切关注，这正是我们需要的文化自觉。',
            suShi: '观君之言，知音难得，此物之美需有心人方能领略。',
            vanGogh: '我虽不懂中文深意，但从你的语调感受到了对美的真诚。'
          };
        }
      } else {
        if (userQuestion.includes('what') || userQuestion.includes('who') || userQuestion.includes('how')) {
          fallbackContent = {
            luXun: `Your question about "${messageText.substring(0, 15)}..." touches on deep cultural significance.`,
            suShi: 'Your inquiry reveals the thoughtful observer - this piece has layers of meaning.',
            vanGogh: 'You ask the right questions! Art speaks when we truly listen.'
          };
        } else {
          fallbackContent = {
            luXun: `Your perspective on "${messageText.substring(0, 15)}..." reveals deep cultural insight.`,
            suShi: 'Your observation opens new pathways of understanding this ancient craft.',
            vanGogh: 'You see what I see—the soul speaking through form and color!'
          };
        }
      }
      
      const fallbackResponses = [
        {
          id: `response-${baseTimestamp}-1`,
          character: 'lu-xun',
          content: fallbackContent.luXun,
          timestamp: new Date().toISOString(),
          isAI: true
        },
        {
          id: `response-${baseTimestamp}-2`, 
          character: 'su-shi',
          content: fallbackContent.suShi,
          timestamp: new Date().toISOString(),
          isAI: true
        },
        {
          id: `response-${baseTimestamp}-3`,
          character: 'vincent-van-gogh',
          content: fallbackContent.vanGogh,
          timestamp: new Date().toISOString(),
          isAI: true
        }
      ];
      
      setTimeout(() => {
        addMessagesToQueue(fallbackResponses);
      }, 1000);
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
      
      // Use the same image URL logic as other functions
      let apiImageUrl = imageUrl;
      
      if (imageUrl && imageUrl.startsWith('blob:')) {
        apiImageUrl = backgroundImage;
      }
      
      if (!apiImageUrl || (!apiImageUrl.startsWith('http') && !apiImageUrl.startsWith('data:'))) {
        apiImageUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
      }
      
      const result = await generateConversation({
        streamId: conversationStream.streamId,
        imageUrl: apiImageUrl,
        category: conversationStream.category,
        generateNewLoop: true
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
    
    // Reaction sent successfully (UI only for now)
    console.log('Reaction sent:', '❤️');
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
              {messages.map((message, index) => {
                const characterName = getCharacterName(message);
                const isUserMessage = characterName === 'You';
                
                return (
                <div key={message.id} className="mb-3 animate-fade-in">
                  <div className={`inline-flex items-center gap-3 ${
                    isUserMessage ? 'flex-row-reverse' : ''
                  }`}>
                    {isUserMessage ? (
                      // 用户消息：没有头像，使用不同的样式
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">You</span>
                      </div>
                    ) : (
                      <img 
                        src={getCharacterAvatar(message)}
                        alt={characterName}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className={`rounded-2xl px-3 py-2 max-w-xs ${
                      isUserMessage
                        ? 'bg-blue-600/80 backdrop-blur-md' 
                        : 'bg-white/10 backdrop-blur-md'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-xs">
                          {characterName}
                        </span>
                        <span className="text-white/60 text-xs">
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-white text-sm leading-5">
                        {message.content || message.text}
                      </p>
                    </div>
                  </div>
                </div>
                );
              })}
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
