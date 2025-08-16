import React, { useState, useRef, useEffect } from 'react';

const TextInputBar = ({ onSendMessage, onClose, placeholder = "Type here" }) => {
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef(null);

  // 自动聚焦到输入框
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSend = () => {
    if (inputValue.trim() && !isComposing) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      onClose && onClose(); // 发送后关闭输入框
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // 处理中文输入法
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm">
      {/* 文本输入区域 */}
      <div className="flex items-center gap-3 px-5 py-4">
        {/* 输入框 */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={placeholder}
            className="w-full bg-black/30 backdrop-blur-[1px] text-white placeholder-[#e5e0dc]/70 px-4 py-3 rounded-full border-none outline-none text-[13px] font-['Avenir_LT_Std:55_Roman',sans-serif]"
            data-node-id="2:2299"
          />
        </div>
        
        {/* 发送按钮 */}
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isComposing}
          className={`w-[38px] h-[38px] rounded-full flex items-center justify-center backdrop-blur-[1px] bg-black/30 transition-opacity ${
            inputValue.trim() && !isComposing
              ? 'opacity-100 hover:bg-black/40 active:scale-95'
              : 'opacity-50 cursor-not-allowed'
          }`}
          title="发送消息"
        >
          <div className="w-[22px] h-[22px] flex items-center justify-center">
            {/* 上箭头发送图标 */}
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path 
                d="M8 3L8 13M8 3L4 7M8 3L12 7" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="w-[38px] h-[38px] rounded-full flex items-center justify-center backdrop-blur-[1px] bg-black/30 hover:bg-black/40 active:scale-95"
          title="关闭"
        >
          <div className="w-[22px] h-[22px] flex items-center justify-center">
            {/* X 关闭图标 */}
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path 
                d="M12 4L4 12M4 4L12 12" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Home Indicator */}
      <div className="flex justify-center pb-2">
        <div className="w-32 h-1 bg-white/30 rounded-full"></div>
      </div>
    </div>
  );
};

export default TextInputBar;
