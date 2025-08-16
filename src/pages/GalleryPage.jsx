import React, { useState, useRef, useEffect } from 'react';
import { PAGES } from '../constants/pages';
import { getRandomBackgroundByCategory, createCompositeImage, ensureCompositeImage } from '../utils/imageComposition';
import { musicManager } from '../utils/musicManager';

// Asset imports from Figma
const imgStatusBattery = "/src/assets/c0c091687c62d7337bf318e17f3769ffc34d3a72.svg";
const imgStatusWifi = "/src/assets/94bdfe1a8077b65bf75e0473782ae3df50cd473f.svg";
const imgStatusCellular = "/src/assets/a883d1003c9c8d00c12b4d64e84ed02fcbbf9603.svg";
const imgBackground = "/src/assets/2339a82e4b6020c219c18a48dca73ef3ba006ffe.png";
const imgHomePage = "/src/assets/d8253cac2e39f67fcc735a3c279bbb3caac59cc5.png"; // HomePage背景图片

const GalleryPage = ({ galleryItems = [], currentIndex = 0, onIndexChange, onNavigate }) => {
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [processedItems, setProcessedItems] = useState(galleryItems);
  const [isProcessingComposite, setIsProcessingComposite] = useState(false);
  const containerRef = useRef(null);
  
  // 处理合成图片生成
  useEffect(() => {
    const processGalleryItems = async () => {
      if (galleryItems.length === 0) return;
      
      setIsProcessingComposite(true);
      try {
        const processedItemsArray = await Promise.all(
          galleryItems.map(async (item) => {
            // 如果已经有合成图片，跳过处理
            if (item.compositeImage || (item.analysis && item.analysis.compositeImage)) {
              return item;
            }
            
            try {
              return await ensureCompositeImage(item);
            } catch (error) {
              console.error('Error processing gallery item:', error);
              return item; // 保留原始项目
            }
          })
        );
        
        setProcessedItems(processedItemsArray);
      } catch (error) {
        console.error('Error processing gallery items:', error);
        setProcessedItems(galleryItems); // 使用原始数据
      } finally {
        setIsProcessingComposite(false);
      }
    };
    
    processGalleryItems();
  }, [galleryItems]);
  
  // 音乐播放控制 - 当前项目或索引改变时重新播放音乐
  useEffect(() => {
    const playBackgroundMusic = async () => {
      if (processedItems.length === 0) return;
      
      const currentItem = processedItems[currentIndex] || {};
      const musicCategory = currentItem.style || currentItem.category || 'European';
      const backgroundId = currentItem.backgroundId || `${musicCategory}_${currentIndex}`;
      
      console.log('=== GALLERY MUSIC CONTROL ===');
      console.log('Current item full data:', currentItem);
      console.log('Music category determination:', {
        style: currentItem.style,
        category: currentItem.category,
        fallback: 'European',
        selected: musicCategory
      });
      console.log('Playing music for:', { musicCategory, backgroundId, currentIndex });
      console.log('Background info:', {
        backgroundImage: currentItem.backgroundImage,
        backgroundId: currentItem.backgroundId
      });
      
      try {
        // 先停止当前播放的音乐，然后播放新的音乐
        console.log('Stopping previous music before starting new one');
        await musicManager.stop();
        
        // 增加延迟确保停止完成并避免多音乐播放
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 播放新的背景音乐
        console.log('Starting new music');
        await musicManager.playMusic(musicCategory, backgroundId, true);
      } catch (error) {
        console.error('Failed to play background music:', error);
      }
    };
    
    // 只有当有处理过的项目时才播放音乐
    if (processedItems.length > 0) {
      playBackgroundMusic();
    }
  }, [processedItems, currentIndex]);
  
  // 组件卸载时清理音乐
  useEffect(() => {
    return () => {
      console.log('GalleryPage unmounting, stopping music completely');
      // 使用stop()而不是pause()来完全清理音乐
      musicManager.stop().catch(error => {
        console.error('Error stopping music on unmount:', error);
      });
    };
  }, []);
  
  // Get current gallery item or default (使用处理后的items)
  const currentItem = processedItems[currentIndex] || {};
  
  // Extract data from the current gallery item
  const { 
    analysis, 
    originalImage, 
    imageUrl, 
    backgroundImage,
    compositeImage, // Add composite image from analysis
    category,
    style,
    objects = [],
    source,
    timestamp,
    composition
  } = currentItem;
  
  console.log('GalleryPage received items:', galleryItems); // Debug log
  console.log('Current index:', currentIndex); // Debug log
  console.log('Processed items:', processedItems); // Debug log
  console.log('Current processed item:', currentItem); // Debug log
  
  // Get metadata from analysis results or use defaults for demo
  const getMetadata = () => {
    // If no current item, return default
    if (!currentItem || Object.keys(currentItem).length === 0) {
      return {
        title: "Gallery Item",
        timestamp: new Date().toLocaleString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        description: "No description available."
      };
    }

    if (analysis?.analysis) {
      // Use actual analysis data if available
      const analysisData = analysis.analysis;
      return {
        title: `The ${category ? category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Enigmatic'} Scene`, 
        timestamp: timestamp ? new Date(timestamp).toLocaleString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }) : new Date().toLocaleString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        description: `${analysisData.description} Enhanced with ${style || 'European'} artistic styling and composite background.`
      };
    }
    
    // Default metadata for demo showing the expected structure
    return {
      title: "The Enigmatic Scene",
      timestamp: new Date().toLocaleString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }), 
      description: `A beautifully captured moment enhanced with AI analysis and ${style || 'classic'} artistic background composition.`
    };
  };

  const metadata = getMetadata();
  
  // Background image selection - 优先使用合成图片作为背景
  const getBackgroundImage = () => {
    // 第一优先级：使用合成图片作为背景
    if (currentItem.compositeImage) {
      console.log('Using compositeImage as background:', currentItem.compositeImage);
      return currentItem.compositeImage;
    }
    
    // 第二优先级：使用分析结果中的合成图片
    if (analysis?.analysis?.compositeImage) {
      console.log('Using analysis.analysis.compositeImage as background:', analysis.analysis.compositeImage);
      return analysis.analysis.compositeImage;
    }
    
    // 第三优先级：使用背景图片路径（非合成）
    if (currentItem.backgroundImage) {
      console.log('Using backgroundImage from item:', currentItem.backgroundImage);
      return currentItem.backgroundImage;
    }
    
    // 第四优先级：使用分析数据中的背景图片
    if (analysis?.analysis?.backgroundImage) {
      console.log('Using analysis.analysis.backgroundImage:', analysis.analysis.backgroundImage);
      return analysis.analysis.backgroundImage;
    }
    
    // 第五优先级：根据分类动态生成背景（实时生成，不推荐但保留作为后备）
    if (category || style) {
      const targetCategory = category || style;
      console.log('Generating background for category:', targetCategory);
      
      try {
        const backgroundInfo = getRandomBackgroundByCategory(targetCategory);
        console.log('Generated background info:', backgroundInfo);
        return backgroundInfo.backgroundPath;
      } catch (error) {
        console.error('Error generating background:', error);
      }
    }
    
    // 最终回退到默认背景
    console.log('Using default background fallback');
    return imgBackground;
  };

  const backgroundImageSrc = getBackgroundImage();
  
  // Handle image click to show popup (now for background click)
  const handleImageClick = () => {
    setShowPopup(true);
  };

  // Handle popup actions
  const handleEnterLiveRoom = async () => {
    console.log('Entering LiveRoom, stopping GalleryPage music');
    
    // 在导航前停止音乐，避免与LiveRoom音乐冲突
    try {
      await musicManager.stop();
    } catch (error) {
      console.error('Error stopping music before entering LiveRoom:', error);
    }
    
    setShowPopup(false);
    onNavigate && onNavigate(PAGES.LIVE_ROOM, { 
      originalImage, 
      imageUrl, 
      analysis,
      backgroundImage: backgroundImageSrc, // Use the same background as current GalleryPage
      category,
      style,
      objects,
      backgroundId: currentItem.backgroundId // 传递backgroundId以保持音乐一致性
    });
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // If no gallery items, show empty state
  if (processedItems.length === 0) {
    return (
      <div 
        className="relative w-[393px] h-[852px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url('${imgHomePage}')` }}
      >
        <div className="text-center px-[40px]">
          <div className="text-white text-[24px] font-bold mb-[16px]">
            No Gallery Items
          </div>
          <div className="text-white/70 text-[16px] mb-[24px]">
            Take a photo or upload an image to start building your gallery.
          </div>
          <button
            onClick={() => onNavigate && onNavigate(PAGES.HOME)}
            className="bg-white text-black px-[24px] py-[12px] rounded-[12px] font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Handle swipe gestures for gallery navigation
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    // Optional: Add visual feedback during drag
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;
    const threshold = 100; // Minimum swipe distance
    
    // Right swipe (swipe left to right) - go to previous item or back to Home
    if (deltaX > threshold) {
      if (currentIndex > 0) {
        // Navigate to previous gallery item
        onIndexChange && onIndexChange(currentIndex - 1);
      } else {
        // At first item, go back to HomePage
        onNavigate && onNavigate(PAGES.HOME);
      }
    }
    // Left swipe (swipe right to left) - go to next item
    else if (deltaX < -threshold) {
      if (currentIndex < processedItems.length - 1) {
        // Navigate to next gallery item
        onIndexChange && onIndexChange(currentIndex + 1);
      }
      // At last item, no action (or could go back to analysis/capture)
    }
    
    setIsDragging(false);
    setStartX(0);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-[393px] h-[852px] bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImageSrc})`
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Status bar */}
      <div className="absolute flex items-center justify-between w-full px-[24px] top-[12px]">
        <div className="text-white text-[15px] font-semibold leading-[20px] font-sf-pro">
          12:15
        </div>
        <div className="flex items-center gap-[5px]">
          <img className="w-[17px] h-[10px]" src={imgStatusCellular} alt="Cellular" />
          <img className="w-[15px] h-[11px]" src={imgStatusWifi} alt="WiFi" />
          <img className="w-[24px] h-[11px]" src={imgStatusBattery} alt="Battery" />
        </div>
      </div>

      {/* Gallery navigation indicator */}
      {processedItems.length > 1 && (
        <div className="absolute top-[50px] left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center gap-[8px] bg-black/30 px-[12px] py-[6px] rounded-[20px] backdrop-blur-sm">
            <span className="text-white text-[14px] font-medium">
              {currentIndex + 1} / {processedItems.length}
            </span>
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {isProcessingComposite && (
        <div className="absolute top-[90px] left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center gap-[8px] bg-blue-600/80 px-[12px] py-[6px] rounded-[20px] backdrop-blur-sm">
            <div className="w-[16px] h-[16px] border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-[14px] font-medium">
              Processing...
            </span>
          </div>
        </div>
      )}

      {/* Interactive area in the center for popup trigger */}
      <div 
        className="absolute left-[50%] top-[200px] transform -translate-x-1/2 w-[200px] h-[250px] cursor-pointer z-10"
        onClick={handleImageClick}
        style={{
          // Optional: Add a subtle visual hint (can be removed if not desired)
          // backgroundColor: 'rgba(255, 255, 255, 0.05)',
          // border: '1px solid rgba(255, 255, 255, 0.2)',
          // borderRadius: '8px'
        }}
      >
        {/* This is an invisible clickable area */}
      </div>

      {/* Text content - following Figma design exactly */}
      <div className="absolute left-0 right-0 bottom-[90px] flex flex-col items-center gap-2 px-[24px]">
        {/* Title */}
        <h1 className="text-white text-[28px] font-bold leading-[34px] font-sf-pro text-center">
          {metadata.title}
        </h1>
        
        {/* Timestamp */}
        <div className="text-white/70 text-[16px] font-normal leading-[21px] font-sf-pro text-center">
          {metadata.timestamp}
        </div>
        
        {/* Description */}
        <div className="text-white/90 text-[16px] font-normal leading-[24px] font-sf-pro text-center max-w-[345px]">
          {metadata.description}
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="absolute bottom-[8px] left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] bg-white rounded-[2.5px]" />

      {/* Popup Modal */}
      {showPopup && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[16px] p-[24px] mx-[32px] max-w-[329px] w-full">
            {/* Modal Header */}
            <div className="text-center mb-[20px]">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[8px]">
                Enter Live Room
              </h3>
              <p className="text-[16px] text-gray-600 leading-[24px]">
                Would you like to enter the live room and start a conversation about this image?
              </p>
            </div>
            
            {/* Modal Buttons */}
            <div className="flex gap-[12px]">
              <button
                onClick={handleClosePopup}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-[12px] px-[20px] rounded-[12px] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEnterLiveRoom}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-[12px] px-[20px] rounded-[12px] font-medium transition-colors"
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;