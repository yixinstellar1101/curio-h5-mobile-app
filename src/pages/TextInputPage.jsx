import React, { useState, useRef, useEffect } from 'react';
import StatusBar from '../components/common/StatusBar';
import HomeIndicator from '../components/common/HomeIndicator';
import { PAGES } from '../constants/pages';

/**
 * TextInputPage - Chat input interface with software keyboard
 */
const TextInputPage = ({ onSend, placeholder = "Type your message...", characterName = "Character" }) => {
  const [message, setMessage] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Auto focus on mount
    if (textareaRef.current) {
      textareaRef.current.focus();
      setIsKeyboardVisible(true);
    }
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      if (onSend) {
        onSend(message.trim());
      }
      setMessage('');
      // Navigate back to live room or previous page
      window.history.back();
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleTextareaFocus = () => {
    setIsKeyboardVisible(true);
  };

  const handleTextareaBlur = () => {
    // Keep keyboard visible for better UX
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-gray-50">
      <StatusBar />
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <button 
          onClick={handleCancel}
          className="text-blue-600 font-medium"
        >
          Cancel
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Message</h1>
        <button 
          onClick={handleSend}
          disabled={!message.trim()}
          className={`font-medium px-3 py-1 rounded-full ${
            message.trim() 
              ? 'text-white bg-blue-600' 
              : 'text-gray-400 bg-gray-200'
          }`}
        >
          Send
        </button>
      </div>

      {/* Character Context */}
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {characterName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Chatting with</p>
            <p className="font-medium text-gray-900">{characterName}</p>
          </div>
        </div>
      </div>

      {/* Text Input Area */}
      <div className={`flex-1 p-4 transition-all duration-300 ${
        isKeyboardVisible ? 'pb-80' : 'pb-4'
      }`}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={handleTextareaFocus}
            onBlur={handleTextareaBlur}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full h-32 resize-none border-none outline-none text-base leading-relaxed placeholder-gray-500"
            maxLength={500}
          />
          
          {/* Character Counter */}
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-400">
              {message.length}/500
            </span>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                😊
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                📷
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                🎤
              </button>
            </div>
          </div>
        </div>

        {/* Quick Replies */}
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Quick replies:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Tell me more about this artifact",
              "What's the historical context?", 
              "How old is this piece?",
              "What materials were used?",
              "Who created this?",
              "Where was it discovered?"
            ].map((quickReply, index) => (
              <button
                key={index}
                onClick={() => setMessage(quickReply)}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                {quickReply}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Virtual Keyboard Simulation (iOS style) */}
      {isKeyboardVisible && (
        <div className="absolute bottom-0 left-0 right-0 h-80 bg-gray-200 border-t border-gray-300">
          <div className="p-2 grid grid-cols-10 gap-1 h-full">
            {/* First Row */}
            <div className="col-span-10 flex gap-1 mb-1">
              {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(key => (
                <button 
                  key={key} 
                  className="flex-1 bg-white rounded shadow-sm text-center py-3 text-lg font-medium hover:bg-gray-50"
                  onClick={() => setMessage(prev => prev + key.toLowerCase())}
                >
                  {key}
                </button>
              ))}
            </div>
            
            {/* Second Row */}
            <div className="col-span-10 flex gap-1 mb-1">
              <div className="w-4"></div>
              {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map(key => (
                <button 
                  key={key} 
                  className="flex-1 bg-white rounded shadow-sm text-center py-3 text-lg font-medium hover:bg-gray-50"
                  onClick={() => setMessage(prev => prev + key.toLowerCase())}
                >
                  {key}
                </button>
              ))}
              <div className="w-4"></div>
            </div>
            
            {/* Third Row */}
            <div className="col-span-10 flex gap-1 mb-1">
              <button className="flex-1 bg-gray-300 rounded shadow-sm text-center py-3 text-sm font-medium">
                ⇧
              </button>
              {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map(key => (
                <button 
                  key={key} 
                  className="flex-1 bg-white rounded shadow-sm text-center py-3 text-lg font-medium hover:bg-gray-50"
                  onClick={() => setMessage(prev => prev + key.toLowerCase())}
                >
                  {key}
                </button>
              ))}
              <button 
                className="flex-1 bg-gray-300 rounded shadow-sm text-center py-3 text-sm font-medium"
                onClick={() => setMessage(prev => prev.slice(0, -1))}
              >
                ⌫
              </button>
            </div>
            
            {/* Fourth Row */}
            <div className="col-span-10 flex gap-1">
              <button className="w-16 bg-gray-300 rounded shadow-sm text-center py-3 text-sm font-medium">
                123
              </button>
              <button className="w-12 bg-gray-300 rounded shadow-sm text-center py-3 text-sm font-medium">
                🌐
              </button>
              <button 
                className="flex-1 bg-white rounded shadow-sm text-center py-3 text-lg font-medium"
                onClick={() => setMessage(prev => prev + ' ')}
              >
                space
              </button>
              <button 
                className="w-20 bg-blue-600 rounded shadow-sm text-center py-3 text-white font-medium"
                onClick={handleSend}
                disabled={!message.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      
      <HomeIndicator />
    </div>
  );
};

export default TextInputPage;
