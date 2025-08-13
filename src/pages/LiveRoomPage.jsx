import React, { useState, useEffect, useRef } from 'react';
import StatusBar from '../components/common/StatusBar';
import HomeIndicator from '../components/common/HomeIndicator';
import { PAGES } from '../constants/pages';

/**
 * LiveRoomPage
 * Real-time scrolling AI conversation as per spec.md:
 * - Real-time conversation featuring Lu Xun, Su Shi, Vincent van Gogh
 * - Interface Calls: createConversationStream(), generateConversation()
 * - User interactions: character avatars, voice input, text input, reroll, like
 */
const LiveRoomPage = ({ onNavigate, galleryItem }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStream, setConversationStream] = useState(null);
  const messagesEndRef = useRef(null);
  const autoLoopIntervalRef = useRef(null);

  // Character profiles from spec.md
  const characters = {
    'Lu Xun': {
      name: 'Lu Xun',
      avatar: '📝',
      color: 'bg-red-100 text-red-800',
      openingLine: "The pen is but a scalpel; it cuts through the illness beneath the skin of society.",
      tags: ["#SharpSatirist", "#ModernChineseLiterature", "#SocialCritic"]
    },
    'Su Shi': {
      name: 'Su Shi',
      avatar: '🎨',
      color: 'bg-blue-100 text-blue-800',
      openingLine: "The moonlight upon this artifact would inspire verses flowing like the river beyond my window.",
      tags: ["#SongDynastyPoet", "#Calligrapher", "#FreeSpirit"]
    },
    'Vincent van Gogh': {
      name: 'Vincent van Gogh',
      avatar: '🌟',
      color: 'bg-yellow-100 text-yellow-800',
      openingLine: "I painted not what I saw, but what I felt in that night of madness.",
      tags: ["#LonelyGenius", "#PostImpressionist", "#NightOfTheMind"]
    }
  };

  useEffect(() => {
    initializeConversation();
    return () => {
      if (autoLoopIntervalRef.current) {
        clearInterval(autoLoopIntervalRef.current);
      }
    };
  }, [galleryItem]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeConversation = async () => {
    try {
      setIsLoading(true);
      // Interface Call: createConversationStream(imageId, { autoLoop: true })
      // TODO: Replace with actual interface call
      
      // Mock initial conversation
      const initialMessages = [
        {
          id: '1',
          speaker: 'Lu Xun',
          text: 'This artifact reflects the labor of countless unnamed artisans—do we honor their legacy?',
          timestamp: new Date().toISOString()
        },
        {
          id: '2', 
          speaker: 'Su Shi',
          text: 'The craftsmanship here speaks of patience, like poetry written in porcelain and time.',
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          speaker: 'Vincent van Gogh',
          text: 'I see swirling emotions in these forms—beauty born from struggle and dedication.',
          timestamp: new Date().toISOString()
        }
      ];

      setMessages(initialMessages);
      startAutoLoop();
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      setIsLoading(false);
    }
  };

  const startAutoLoop = () => {
    // Auto-generate conversation every 5 seconds (as per spec)
    autoLoopIntervalRef.current = setInterval(() => {
      generateNewLoop(false);
    }, 5000);
  };

  const generateNewLoop = async (userTriggered = false) => {
    try {
      // Interface Call: generateConversation({ imageId, generateNewLoop: true })
      // TODO: Replace with actual interface call
      
      const newMessages = [
        {
          id: Date.now() + '-1',
          speaker: 'Lu Xun',
          text: getRandomResponse('Lu Xun'),
          timestamp: new Date().toISOString()
        },
        {
          id: Date.now() + '-2',
          speaker: 'Su Shi', 
          text: getRandomResponse('Su Shi'),
          timestamp: new Date().toISOString()
        },
        {
          id: Date.now() + '-3',
          speaker: 'Vincent van Gogh',
          text: getRandomResponse('Vincent van Gogh'),
          timestamp: new Date().toISOString()
        }
      ];

      setMessages(prev => [...prev, ...newMessages]);
    } catch (error) {
      console.error('Failed to generate conversation:', error);
    }
  };

  const getRandomResponse = (character) => {
    const responses = {
      'Lu Xun': [
        'Every artifact carries the weight of its era—what burdens does this one bear?',
        'In this object, I see both beauty and the social conditions that created it.',
        'The hands that made this knew struggle—their story deserves to be told.'
      ],
      'Su Shi': [
        'Like moonlight on water, this piece reflects the spirit of its time.',
        'Poetry and craft unite here—each detail sings with ancient wisdom.',
        'The beauty here transcends its physical form, touching something eternal.'
      ],
      'Vincent van Gogh': [
        'The colors dance like stars in my restless nights—so full of feeling!',
        'I would paint this with thick strokes, capturing not its form but its soul.',
        'This piece understands loneliness and beauty—kindred spirits, perhaps.'
      ]
    };
    
    const characterResponses = responses[character] || [];
    return characterResponses[Math.floor(Math.random() * characterResponses.length)];
  };

  const handleCharacterTap = (characterName) => {
    onNavigate && onNavigate(PAGES.CHARACTER_DETAIL_CARD, { character: characters[characterName] });
  };

  const handleTextInput = () => {
    onNavigate && onNavigate(PAGES.TEXT_INPUT, { returnTo: PAGES.LIVE_ROOM });
  };

  const handleVoiceInput = () => {
    onNavigate && onNavigate(PAGES.VOICE_INPUT, { returnTo: PAGES.LIVE_ROOM });
  };

  const handleReroll = () => {
    generateNewLoop(true);
  };

  const handleLike = () => {
    // Show floating emoji animation
    const emoji = document.createElement('div');
    emoji.innerHTML = '❤️';
    emoji.className = 'fixed text-2xl pointer-events-none animate-bounce z-50';
    emoji.style.left = Math.random() * window.innerWidth + 'px';
    emoji.style.top = Math.random() * window.innerHeight + 'px';
    document.body.appendChild(emoji);
    
    setTimeout(() => {
      document.body.removeChild(emoji);
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 p-4 flex items-center justify-between shadow-lg">
        <button
          onClick={() => onNavigate && onNavigate(PAGES.GALLERY)}
          className="p-2 hover:bg-slate-700 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-semibold">Live Discussion</h1>
          <p className="text-xs text-slate-400">{galleryItem?.name || 'Artifact Analysis'}</p>
        </div>
        <button
          onClick={() => onNavigate && onNavigate(PAGES.VOLUME_SETTINGS)}
          className="p-2 hover:bg-slate-700 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M9 9l3 3m0 0l3-3m-3 3V3" />
          </svg>
        </button>
      </div>

      {/* Character Avatars */}
      <div className="bg-slate-800 p-3 flex justify-center space-x-6">
        {Object.entries(characters).map(([name, character]) => (
          <button
            key={name}
            onClick={() => handleCharacterTap(name)}
            className="flex flex-col items-center space-y-1 hover:scale-105 transition-transform"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${character.color}`}>
              {character.avatar}
            </div>
            <span className="text-xs text-slate-300 truncate max-w-16">{name}</span>
          </button>
        ))}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          </div>
        )}

        {messages.map((message) => {
          const character = characters[message.speaker];
          return (
            <div key={message.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${character?.color || 'bg-gray-500'}`}>
                {character?.avatar || '💬'}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm text-slate-200">{message.speaker}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-100 leading-relaxed">{message.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Controls */}
      <div className="bg-slate-800 p-4 flex items-center justify-between border-t border-slate-700">
        <button
          onTouchStart={handleVoiceInput}
          onMouseDown={handleVoiceInput}
          className="p-3 bg-red-600 hover:bg-red-700 rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        <button
          onClick={handleTextInput}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>

        <button
          onClick={handleReroll}
          className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button
          onClick={handleLike}
          className="p-3 bg-pink-600 hover:bg-pink-700 rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LiveRoomPage;
