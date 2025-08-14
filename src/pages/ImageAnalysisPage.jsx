import React, { useState, useEffect } from 'react';
import { PAGES } from '../constants/pages';

// Asset imports from Figma
const imgBattery = "/src/assets/c0c091687c62d7337bf318e17f3769ffc34d3a72.svg";
const imgWifi = "/src/assets/94bdfe1a8077b65bf75e0473782ae3df50cd473f.svg";
const imgCellular = "/src/assets/a883d1003c9c8d00c12b4d64e84ed02fcbbf9603.svg";
const imgBackArrow = "/src/assets/40807933db102c5ddfe145202e96cb747d9662c5.svg";
const imgAnalysisButton = "/src/assets/2314863aa5b98c3561bbba15a029ce5d6b01faa6.svg";
const imgViewfinder = "/src/assets/db6877c52f8f212513e0ebd034674ef3aa25f15a.svg";
const imgGallery = "/src/assets/01e1d6ae9f47430674fe0f46b61392a43f9c8519.svg";

// Mock API service for image analysis with background classification
const mockAnalyzeImage = async (file) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Fixed green screen area for European_3_4_02.jpg
  const greenScreenArea = {
    x: 131,
    y: 284,
    width: 124,
    height: 173
  };
  
  // Fixed background for testing
  const backgroundImagePath = '/src/assets/backgrounds/European/European_3_4_02.jpg';
  
  // Create composite image by combining user image with background
  const compositeImageUrl = await createCompositeImage(file, backgroundImagePath, greenScreenArea);
  
  // Background images for different categories (keeping for future use)
  const backgroundImages = {
    'living_room': '/src/assets/d8253cac2e39f67fcc735a3c279bbb3caac59cc5.png',
    'bedroom': '/src/assets/017673e2113e179aebea2a633d379cdd6f0ea88f.png',
    'kitchen': '/src/assets/2339a82e4b6020c219c18a48dca73ef3ba006ffe.png',
    'office': '/src/assets/233979182e2ffd6ce7b63233b59f599effb21afc.png',
    'outdoor': '/src/assets/634950df85405a71f0845dd2168d6a8e09cce66a.png',
    'nature': '/src/assets/5fc9e58748a0fa615330e68c877a6fb860ab55a4.png',
    'art': '/src/assets/59520d231a783bb20cd3d4f98dfaec2de858b210.png',
    'default': '/src/assets/d8253cac2e39f67fcc735a3c279bbb3caac59cc5.png'
  };

  // Simple object detection simulation based on filename or random selection
  const objectCategories = [
    { objects: ['chair', 'table', 'lamp'], category: 'living_room', style: 'Morden', description: "This image shows a modern living room scene with furniture and lighting elements." },
    { objects: ['bed', 'pillow', 'nightstand'], category: 'bedroom', style: 'Morden', description: "This appears to be a bedroom setting with comfortable sleeping arrangements." },
    { objects: ['kitchen', 'stove', 'refrigerator'], category: 'kitchen', style: 'Morden', description: "A kitchen scene with cooking appliances and utensils." },
    { objects: ['desk', 'computer', 'chair'], category: 'office', style: 'Morden', description: "An office workspace with work-related items." },
    { objects: ['tree', 'flower', 'grass'], category: 'nature', style: 'Chinese', description: "A natural outdoor scene with plants and vegetation." },
    { objects: ['building', 'car', 'street'], category: 'outdoor', style: 'Morden', description: "An urban outdoor environment with architectural elements." },
    { objects: ['painting', 'sculpture', 'canvas'], category: 'art', style: 'European', description: "An artistic scene with creative elements." },
    { objects: ['person', 'portrait', 'face'], category: 'portrait', style: 'European', description: "A portrait featuring human subjects." },
    { objects: ['animal', 'cat', 'dog'], category: 'animal', style: 'Chinese', description: "A scene featuring animals or pets." },
  ];

  // Randomly select a category for mock analysis
  const selectedCategory = objectCategories[Math.floor(Math.random() * objectCategories.length)];
  
  // Function to randomly select background from category
  const getRandomBackground = (style) => {
    const backgroundCounts = {
      'Chinese': 4,    // Chinese_3_4_01.jpg to Chinese_3_4_04.jpg
      'European': 6,   // European_3_4_01.jpg to European_3_4_06.jpg  
      'Morden': 6      // Morden_3_4_01.jpg to Morden_3_4_06.jpg
    };
    
    const count = backgroundCounts[style] || 4;
    const randomNum = Math.floor(Math.random() * count) + 1;
    const paddedNum = randomNum.toString().padStart(2, '0');
    
    return `/src/assets/backgrounds/${style}/${style}_3_4_${paddedNum}.jpg`;
  };

  const backgroundUrl = getRandomBackground(selectedCategory.style);

  // Mock analysis results with background classification
  return {
    success: true,
    analysis: {
      objects: selectedCategory.objects,
      category: selectedCategory.category,
      style: selectedCategory.style,
      description: selectedCategory.description,
      confidence: 0.85 + Math.random() * 0.14, // Random confidence between 0.85-0.99
      backgroundImage: backgroundUrl,
      compositeImage: compositeImageUrl, // Add composite image URL
      greenScreenArea: greenScreenArea, // Add green screen area info
      suggestions: [
        `Great composition! The AI has detected a ${selectedCategory.category} scene.`,
        `This image has been categorized as ${selectedCategory.style} style.`,
        "The image has been composited with an artistic background."
      ],
      metadata: {
        dimensions: file.name ? "Auto-detected" : "1920x1080",
        size: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : "2.4 MB",
        format: file.type ? file.type.split('/')[1].toUpperCase() : "JPEG",
        source: 'album'
      }
    }
  };
};

// Function to create composite image by inserting user image into green screen area
const createCompositeImage = async (userImageFile, backgroundImagePath, greenArea) => {
  try {
    // Create a canvas for image composition
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Load background image
    const backgroundImg = new Image();
    backgroundImg.crossOrigin = 'anonymous';
    
    // Load user image
    const userImg = new Image();
    const userImageUrl = URL.createObjectURL(userImageFile);
    
    return new Promise((resolve, reject) => {
      let imagesLoaded = 0;
      
      const checkIfBothLoaded = () => {
        imagesLoaded++;
        if (imagesLoaded === 2) {
          try {
            // Set canvas size to background image size
            canvas.width = backgroundImg.width;
            canvas.height = backgroundImg.height;
            
            // Draw background image
            ctx.drawImage(backgroundImg, 0, 0);
            
            // Draw user image stretched to fill green area exactly (may distort aspect ratio)
            // This ensures complete coverage of green area without any green showing through
            ctx.drawImage(
              userImg, 
              greenArea.x, 
              greenArea.y, 
              greenArea.width, 
              greenArea.height
            );
            
            // Convert canvas to blob and create URL
            canvas.toBlob((blob) => {
              const compositeUrl = URL.createObjectURL(blob);
              console.log('Created composite image:', compositeUrl);
              resolve(compositeUrl);
            }, 'image/jpeg', 0.9);
            
            // Clean up user image URL
            URL.revokeObjectURL(userImageUrl);
            
          } catch (error) {
            console.error('Error creating composite image:', error);
            reject(error);
          }
        }
      };
      
      backgroundImg.onload = checkIfBothLoaded;
      backgroundImg.onerror = (error) => {
        console.error('Error loading background image:', error);
        reject(error);
      };
      
      userImg.onload = checkIfBothLoaded;
      userImg.onerror = (error) => {
        console.error('Error loading user image:', error);
        reject(error);
      };
      
      // Start loading images
      backgroundImg.src = backgroundImagePath;
      userImg.src = userImageUrl;
    });
    
  } catch (error) {
    console.error('Error in createCompositeImage:', error);
    return null;
  }
};// Loading Spinner Component - exact Figma design
const AnalysisSpinner = () => {
  return (
    <div
      className="absolute h-[116px] left-[140px] top-[291px] w-[114px] animate-spin"
      data-name="Component 23"
    >
      <div className="absolute bg-[rgba(173,173,173,0.4)] bottom-[69.16%] left-[45.59%] right-[45.59%] rounded-[20px] top-0" />
      <div className="absolute flex inset-[11.53%_60.44%_60.44%_11.53%] items-center justify-center">
        <div className="flex-none h-[70px] rotate-[315deg] w-5">
          <div className="bg-[rgba(173,173,173,0.2)] rounded-[20px] size-full" />
        </div>
      </div>
      <div className="absolute flex inset-[11.53%_11.53%_60.44%_60.44%] items-center justify-center">
        <div className="flex-none h-[70px] rotate-[45deg] w-5">
          <div className="bg-[rgba(173,173,173,0.6)] rounded-[20px] size-full" />
        </div>
      </div>
      <div className="absolute bottom-[45.59%] flex items-center justify-center left-[69.16%] right-0 top-[45.59%]">
        <div className="flex-none h-[70px] rotate-[90deg] w-5">
          <div className="bg-[rgba(173,173,173,0.8)] rounded-[20px] size-full" />
        </div>
      </div>
      <div className="absolute bg-[#adadad] bottom-0 left-[45.59%] right-[45.59%] rounded-[20px] top-[69.16%]" />
      <div className="absolute flex inset-[60.44%_11.53%_11.53%_60.44%] items-center justify-center">
        <div className="flex-none h-[70px] rotate-[315deg] w-5">
          <div className="bg-[#adadad] rounded-[20px] size-full" />
        </div>
      </div>
      <div className="absolute flex inset-[60.44%_60.44%_11.53%_11.53%] items-center justify-center">
        <div className="flex-none h-[70px] rotate-[45deg] w-5">
          <div className="bg-[rgba(173,173,173,0)] rounded-[20px] size-full" />
        </div>
      </div>
      <div className="absolute bottom-[45.59%] flex items-center justify-center left-0 right-[69.16%] top-[45.59%]">
        <div className="flex-none h-[70px] rotate-[90deg] w-5">
          <div className="bg-[rgba(173,173,173,0.1)] rounded-[20px] size-full" />
        </div>
      </div>
    </div>
  );
};

/**
 * ImageAnalysisPage - Analyzes captured photo and shows results
 */
const ImageAnalysisPage = ({ onNavigate, data }) => {
  const [analysisState, setAnalysisState] = useState('analyzing');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const { file } = data || {};

  useEffect(() => {
    if (file) {
      performAnalysis();
    }
  }, [file]);

  const performAnalysis = async () => {
    try {
      setAnalysisState('analyzing');
      
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await mockAnalyzeImage(file);
      
      clearInterval(progressTimer);
      setProgress(100);
      
      setTimeout(() => {
        setAnalysisResult(result);
        setAnalysisState('complete');
      }, 500);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisState('error');
    }
  };

  const handleBack = () => {
    // Clean up created object URL to prevent memory leaks
    if (data?.imageUrl && data?.source === 'album') {
      URL.revokeObjectURL(data.imageUrl);
    }
    // Go back to image upload page for album selection, camera capture for camera
    const targetPage = data?.source === 'album' ? PAGES.IMAGE_UPLOAD : PAGES.CAMERA_CAPTURE;
    onNavigate && onNavigate(targetPage);
  };

  const handleRetake = () => {
    // Clean up created object URL to prevent memory leaks
    if (data?.imageUrl && data?.source === 'album') {
      URL.revokeObjectURL(data.imageUrl);
    }
    // Go back to appropriate source page
    const targetPage = data?.source === 'album' ? PAGES.IMAGE_UPLOAD : PAGES.CAMERA_CAPTURE;
    onNavigate && onNavigate(targetPage);
  };

  const handleContinue = () => {
    // Create complete data package for Gallery including background composition
    const galleryData = {
      analysis: analysisResult,
      originalImage: file,
      imageUrl: data?.imageUrl || URL.createObjectURL(file),
      backgroundImage: analysisResult?.analysis?.backgroundImage,
      compositeImage: analysisResult?.analysis?.compositeImage, // Add composite image
      category: analysisResult?.analysis?.category || 'default',
      style: analysisResult?.analysis?.style || 'European',
      objects: analysisResult?.analysis?.objects || [],
      source: data?.source || 'camera', // Track if from album or camera
      timestamp: new Date().toISOString(),
      composition: {
        // Data for background composition/merging
        shouldCompose: true,
        backgroundUrl: analysisResult?.analysis?.backgroundImage,
        compositeUrl: analysisResult?.analysis?.compositeImage,
        greenScreenArea: analysisResult?.analysis?.greenScreenArea,
        category: analysisResult?.analysis?.category,
        style: analysisResult?.analysis?.style
      }
    };
    
    console.log('Navigating to Gallery with composite data:', galleryData);
    onNavigate && onNavigate(PAGES.GALLERY, galleryData);
  };

  const handleGallery = () => {
    onNavigate && onNavigate(PAGES.GALLERY);
  };

  return (
    <div className="bg-[#221400] relative size-full" data-name="ImageAnalysisPage">
      {/* Status Bar */}
      <div className="absolute box-border content-stretch flex flex-col items-start justify-start left-1/2 p-0 top-0 translate-x-[-50%] w-[393px] z-20">
        <div className="h-11 relative shrink-0 w-full">
          <div className="absolute h-[22px] left-[26px] top-[15px] w-[54px]">
            <div className="absolute font-semibold leading-[0] left-0 not-italic right-0 text-[#ffffff] text-[17px] text-center" style={{ top: "calc(50% - 11px)" }}>
              <p className="block leading-[22px]">12:15</p>
            </div>
          </div>
          <div className="absolute h-[13px] right-[26.34px] top-[19.33px] w-[27.328px]">
            <img alt="" className="block max-w-none size-full" src={imgBattery} />
          </div>
          <div className="absolute h-3 right-[61px] top-5 w-[17px]">
            <img alt="" className="block max-w-none size-full" src={imgWifi} />
          </div>
          <div className="absolute h-3 right-[85.4px] top-5 w-[19.2px]">
            <img alt="" className="block max-w-none size-full" src={imgCellular} />
          </div>
        </div>
      </div>

      {/* Back Button */}
      <button className="absolute left-5 size-[42px] top-[53px] z-20 cursor-pointer hover:scale-110 transition-transform duration-200" onClick={handleBack}>
        <img alt="Back" className="block max-w-none size-full" src={imgBackArrow} />
      </button>

      {/* Viewfinder Frame */}
      <div className="absolute h-[336px] left-[47px] top-[217px] w-[299px] z-10">
        <div className="absolute inset-[-0.74%_-0.84%]">
          <img alt="" className="block max-w-none size-full" src={imgViewfinder} />
        </div>
        {file && analysisState !== 'analyzing' && (
          <div className="absolute inset-4 rounded-lg overflow-hidden bg-black/50">
            <img 
              src={data?.imageUrl || URL.createObjectURL(file)} 
              alt="Selected" 
              className="w-full h-full object-cover opacity-80" 
            />
          </div>
        )}
      </div>

      {/* Analysis Loading State */}
      {analysisState === 'analyzing' && (
        <>
          <AnalysisSpinner />
          <div className="absolute bg-[rgba(0,0,0,0.5)] box-border content-stretch flex flex-col gap-2.5 h-8 items-center justify-center left-1/2 px-[19px] py-[3px] rounded-[20px] translate-x-[-50%] translate-y-[-50%] w-[179px] z-20" style={{ top: "calc(50% + 47px)" }}>
            <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 w-full">
              <div className="[grid-area:1_/_1] font-medium h-[22px] ml-0 mt-0 not-italic opacity-90 relative text-[#ffffff] text-[16px] text-left w-[141px]">
                <p className="block leading-[1.6]">Analyzing picture...</p>
              </div>
            </div>
          </div>
          <div className="absolute left-1/2 translate-x-[-50%] w-48 h-1 bg-gray-600 rounded-full overflow-hidden z-20" style={{ top: "calc(50% + 90px)" }}>
            <div className="h-full bg-white transition-all duration-200 ease-out rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </>
      )}

      {/* Analysis Complete State */}
      {analysisState === 'complete' && analysisResult && (
        <div className="absolute left-1/2 translate-x-[-50%] translate-y-[-50%] w-80 bg-black/80 backdrop-blur-sm rounded-2xl p-6 z-30" style={{ top: "calc(50% + 100px)" }}>
          <h3 className="text-white text-lg font-semibold mb-3">Analysis Complete</h3>
          <div className="text-white/80 text-sm space-y-2">
            <p><strong>Objects detected:</strong> {analysisResult.analysis.objects.join(', ')}</p>
            <p><strong>Category:</strong> {analysisResult.analysis.category?.replace('_', ' ')}</p>
            <p><strong>Description:</strong> {analysisResult.analysis.description}</p>
            <p><strong>Confidence:</strong> {Math.round(analysisResult.analysis.confidence * 100)}%</p>
            {data?.source === 'album' && <p><strong>Source:</strong> Photo Album</p>}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleRetake} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
              {data?.source === 'album' ? 'Choose Again' : 'Retake'}
            </button>
            <button onClick={handleContinue} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
              Continue to Gallery
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {analysisState === 'error' && (
        <div className="absolute left-1/2 translate-x-[-50%] translate-y-[-50%] w-80 bg-red-900/80 backdrop-blur-sm rounded-2xl p-6 z-30" style={{ top: "calc(50% + 100px)" }}>
          <h3 className="text-white text-lg font-semibold mb-3">Analysis Failed</h3>
          <p className="text-white/80 text-sm mb-4">Unable to analyze the image. Please try again.</p>
          <div className="flex gap-3">
            <button onClick={performAnalysis} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
              Retry
            </button>
            <button onClick={handleRetake} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
              Retake
            </button>
          </div>
        </div>
      )}

      {/* Analysis Button */}
      <div className="absolute left-[164px] size-[66px] top-[715px] z-20">
        <div className="absolute inset-[-1.52%_-10.61%_-37.88%_-10.61%]">
          <img alt="Analysis" className="block max-w-none size-full" src={imgAnalysisButton} />
        </div>
      </div>

      {/* Gallery Button */}
      <button className="absolute left-[290px] top-[727px] z-20 cursor-pointer hover:scale-110 transition-transform duration-200" onClick={handleGallery}>
        <div className="backdrop-blur-[0.778px] backdrop-filter bg-[rgba(0,0,0,0.3)] rounded-[7.778px] size-[42px]">
          <div className="absolute contents inset-[20.37%_18.52%]">
            <div className="absolute inset-[20.37%_18.52%]">
              <img alt="Gallery" className="block max-w-none size-full" src={imgGallery} />
            </div>
          </div>
        </div>
      </button>

      {/* Home Indicator */}
      <div className="absolute box-border content-stretch flex flex-col items-center justify-start left-0 p-0 top-[826px] w-[393px] z-20">
        <div className="h-[26px] relative shrink-0 w-[375px]">
          <div className="absolute bottom-2 flex h-[5px] items-center justify-center left-1/2 translate-x-[-50%] w-36">
            <div className="flex-none rotate-[180deg] scale-y-[-100%]">
              <div className="bg-[#000000] h-[5px] rounded-[100px] w-36" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysisPage;