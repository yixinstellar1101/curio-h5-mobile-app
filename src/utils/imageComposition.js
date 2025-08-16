import backgroundFrameMappings from '../../background_frames_mappings.json';

/**
 * 根据分类随机选择背景图片
 * @param {string} category - 图片分类 (Chinese, European, Modern)
 * @returns {Object} - 包含背景图片路径和绿幕区域信息的对象
 */
export const getRandomBackgroundByCategory = (category) => {
  console.log('=== SELECTING BACKGROUND BY CATEGORY ===');
  console.log('Input category:', category);
  
  // 规范化分类名称 
  let normalizedCategory = category;
  // 注意：文件夹名仍然是Morden，但我们的分类统一使用Modern
  if (category === 'Modern') {
    // 文件夹路径使用Morden，但内部处理使用Modern
    normalizedCategory = 'Modern';
  }
  
  console.log('Normalized category:', normalizedCategory);
  
  // 从映射文件中获取对应分类的背景
  const categoryBackgrounds = Object.entries(backgroundFrameMappings.backgroundFrames)
    .filter(([key, value]) => value.category === normalizedCategory);
  
  console.log('Available backgrounds for category:', categoryBackgrounds.length);
  
  if (categoryBackgrounds.length === 0) {
    console.log('No backgrounds found for category, using European fallback');
    // 如果没有找到对应分类，默认使用European
    const fallbackBackgrounds = Object.entries(backgroundFrameMappings.backgroundFrames)
      .filter(([key, value]) => value.category === 'European');
    
    if (fallbackBackgrounds.length > 0) {
      const randomIndex = Math.floor(Math.random() * fallbackBackgrounds.length);
      const [backgroundId, backgroundInfo] = fallbackBackgrounds[randomIndex];
      
      const result = {
        backgroundPath: `/src/assets/backgrounds/${getActualFolderName(backgroundInfo.category)}/${backgroundInfo.filename}`,
        frameArea: backgroundInfo.boundingBox,
        backgroundId
      };
      console.log('Selected fallback background:', result);
      return result;
    }
    
    // 最终回退 - 使用一个测试坐标
    console.log('Using final fallback with test coordinates');
    return {
      backgroundPath: '/src/assets/2339a82e4b6020c219c18a48dca73ef3ba006ffe.png',
      frameArea: { x: 100, y: 300, width: 200, height: 250 },
      backgroundId: 'fallback'
    };
  }
  
  // 随机选择一个背景
  const randomIndex = Math.floor(Math.random() * categoryBackgrounds.length);
  const [backgroundId, backgroundInfo] = categoryBackgrounds[randomIndex];
  
  const result = {
    backgroundPath: `/src/assets/backgrounds/${getActualFolderName(backgroundInfo.category)}/${backgroundInfo.filename}`,
    frameArea: backgroundInfo.boundingBox, // 使用原始坐标，将在createCompositeImage中进行缩放
    backgroundId
  };
  
  console.log('Selected background:', result);
  console.log('=== BACKGROUND SELECTION COMPLETE ===');
  return result;
};

/**
 * 获取实际的文件夹名称（处理Modern->Morden的映射）
 */
const getActualFolderName = (category) => {
  if (category === 'Modern') {
    return 'Morden'; // 文件夹名仍然是Morden
  }
  return category;
};

/**
 * 创建合成图片，将用户图片填充到背景的绿幕区域
 * @param {string} userImageSrc - 用户图片URL
 * @param {string} backgroundSrc - 背景图片URL
 * @param {Object} frameArea - 绿幕区域 {x, y, width, height} (基于原始背景图片尺寸)
 * @returns {Promise<string>} - 返回合成图片的data URL
 */
export const createCompositeImage = async (userImageSrc, backgroundSrc, frameArea) => {
  return new Promise((resolve, reject) => {
    console.log('=== COMPOSITE IMAGE CREATION START ===');
    console.log('User image source:', userImageSrc);
    console.log('Background source:', backgroundSrc);
    console.log('Frame area (original coords):', frameArea);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置画布尺寸为手机屏幕尺寸
    const canvasWidth = 393;
    const canvasHeight = 852;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    console.log('Canvas created:', canvas.width, 'x', canvas.height);
    
    const backgroundImg = new Image();
    const userImg = new Image();
    
    let imagesLoaded = 0;
    
    const processComposition = () => {
      imagesLoaded++;
      console.log(`Image loaded (${imagesLoaded}/2)`);
      
      if (imagesLoaded === 2) {
        try {
          console.log('=== STARTING COMPOSITION ===');
          console.log('Background dimensions:', backgroundImg.width, 'x', backgroundImg.height);
          console.log('User image dimensions:', userImg.width, 'x', userImg.height);
          
          // 清除画布
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // 1. 绘制背景图片，缩放到画布尺寸
          ctx.drawImage(backgroundImg, 0, 0, canvasWidth, canvasHeight);
          console.log('✓ Background image drawn');
          
          // 2. 计算缩放后的绿幕区域坐标
          // 背景图片从原始尺寸缩放到画布尺寸，绿幕坐标也需要相应缩放
          const scaleX = canvasWidth / backgroundImg.width;
          const scaleY = canvasHeight / backgroundImg.height;
          
          const scaledFrameArea = {
            x: Math.round(frameArea.x * scaleX),
            y: Math.round(frameArea.y * scaleY),
            width: Math.round(frameArea.width * scaleX),
            height: Math.round(frameArea.height * scaleY)
          };
          
          console.log('Scaling factors:', { scaleX, scaleY });
          console.log('Scaled frame area:', scaledFrameArea);
          
          // 3. 在缩放后的绿幕区域绘制用户图片
          const { x, y, width, height } = scaledFrameArea;
          
          // 确保坐标在画布范围内
          const clampedX = Math.max(0, Math.min(x, canvasWidth - width));
          const clampedY = Math.max(0, Math.min(y, canvasHeight - height));
          const clampedWidth = Math.min(width, canvasWidth - clampedX);
          const clampedHeight = Math.min(height, canvasHeight - clampedY);
          
          console.log('Clamped frame area:', { 
            x: clampedX, 
            y: clampedY, 
            width: clampedWidth, 
            height: clampedHeight 
          });
          
          // 直接拉伸用户图片到绿幕区域（可能改变宽高比，但确保完全填充）
          ctx.drawImage(userImg, clampedX, clampedY, clampedWidth, clampedHeight);
          console.log('✓ User image drawn in scaled frame area');
          
          // 4. 生成合成图片
          const dataURL = canvas.toDataURL('image/jpeg', 0.9);
          console.log('✓ Composite image created, data URL length:', dataURL.length);
          console.log('=== COMPOSITE IMAGE CREATION SUCCESS ===');
          
          resolve(dataURL);
        } catch (error) {
          console.error('❌ Error during composition:', error);
          reject(error);
        }
      }
    };
    
    // 背景图片加载处理
    backgroundImg.onload = () => {
      console.log('✓ Background image loaded successfully');
      processComposition();
    };
    
    backgroundImg.onerror = (error) => {
      console.error('❌ Failed to load background image:', error);
      console.error('Background src:', backgroundSrc);
      reject(new Error('Failed to load background image'));
    };
    
    // 用户图片加载处理
    userImg.onload = () => {
      console.log('✓ User image loaded successfully');
      processComposition();
    };
    
    userImg.onerror = (error) => {
      console.error('❌ Failed to load user image:', error);
      console.error('User image src:', userImageSrc);
      reject(new Error('Failed to load user image'));
    };
    
    // 根据图片类型设置crossOrigin
    if (backgroundSrc.startsWith('http')) {
      backgroundImg.crossOrigin = 'anonymous';
    }
    
    if (userImageSrc.startsWith('http')) {
      userImg.crossOrigin = 'anonymous';
    }
    
    // 开始加载图片
    console.log('Loading background image...');
    backgroundImg.src = backgroundSrc;
    
    console.log('Loading user image...');
    userImg.src = userImageSrc;
  });
};

/**
 * 根据分析结果生成合成图片
 * @param {Object} analysisResult - 图片分析结果
 * @param {string} userImageSrc - 用户原始图片URL
 * @returns {Promise<Object>} - 返回包含合成图片和背景信息的对象
 */
export const generateCompositeFromAnalysis = async (analysisResult, userImageSrc) => {
  try {
    console.log('=== GENERATING COMPOSITE FROM ANALYSIS ===');
    console.log('Analysis result:', analysisResult);
    console.log('User image source:', userImageSrc);
    
    // 从分析结果中获取分类
    const category = analysisResult.category || analysisResult.style || 'European';
    console.log('Using category:', category);
    
    // 获取随机背景
    const backgroundInfo = getRandomBackgroundByCategory(category);
    console.log('Selected background info:', backgroundInfo);
    
    // 创建合成图片
    console.log('Creating composite image...');
    const compositeImageUrl = await createCompositeImage(
      userImageSrc, 
      backgroundInfo.backgroundPath, 
      backgroundInfo.frameArea
    );
    
    const result = {
      compositeImage: compositeImageUrl,
      backgroundPath: backgroundInfo.backgroundPath,
      frameArea: backgroundInfo.frameArea,
      backgroundId: backgroundInfo.backgroundId,
      category
    };
    
    console.log('✓ Composite generation complete:', result);
    console.log('=== COMPOSITE FROM ANALYSIS SUCCESS ===');
    
    return result;
  } catch (error) {
    console.error('❌ Error generating composite image:', error);
    throw error;
  }
};

/**
 * 为已有的gallery项目创建合成图片（如果还没有）
 * @param {Object} galleryItem - gallery项目
 * @returns {Promise<Object>} - 返回更新后的gallery项目
 */
export const ensureCompositeImage = async (galleryItem) => {
  console.log('=== ENSURING COMPOSITE IMAGE ===');
  console.log('Gallery item:', galleryItem);
  
  // 如果已经有合成图片，直接返回
  if (galleryItem.compositeImage || (galleryItem.analysis && galleryItem.analysis.compositeImage)) {
    console.log('✓ Gallery item already has composite image, skipping generation');
    return galleryItem;
  }
  
  try {
    // 获取用户原始图片
    let userImageSrc = galleryItem.originalImage || galleryItem.imageUrl;
    console.log('Initial user image source:', userImageSrc);
    
    // 如果是File对象，创建URL
    if (galleryItem.originalImage instanceof File) {
      userImageSrc = URL.createObjectURL(galleryItem.originalImage);
      console.log('Created object URL for File:', userImageSrc);
    }
    
    if (!userImageSrc) {
      throw new Error('No user image found');
    }
    
    console.log('Final user image source:', userImageSrc);
    
    // 获取分析结果中的分类信息
    const analysisData = galleryItem.analysis?.analysis || {};
    const category = galleryItem.category || galleryItem.style || analysisData.category || analysisData.style || 'European';
    
    console.log('Using category for background selection:', category);
    console.log('Analysis data available:', analysisData);
    
    // 生成合成图片
    console.log('Generating composite...');
    const compositeInfo = await generateCompositeFromAnalysis({ category }, userImageSrc);
    
    console.log('Generated composite info:', compositeInfo);
    
    // 更新gallery项目
    const updatedItem = {
      ...galleryItem,
      compositeImage: compositeInfo.compositeImage,
      backgroundImage: compositeInfo.backgroundPath,
      backgroundId: compositeInfo.backgroundId,
      frameArea: compositeInfo.frameArea
    };
    
    console.log('✓ Updated gallery item with composite');
    console.log('=== COMPOSITE IMAGE ENSURED SUCCESSFULLY ===');
    return updatedItem;
  } catch (error) {
    console.error('❌ Error ensuring composite image:', error);
    console.error('Gallery item that failed:', galleryItem);
    // 返回原始项目，不阻断流程
    return galleryItem;
  }
};
