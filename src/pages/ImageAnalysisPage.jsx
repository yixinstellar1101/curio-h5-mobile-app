import React, { useState, useEffect } from 'react';
import { PAGES } from '../constants/pages';
import { generateCompositeFromAnalysis } from '../utils/imageComposition';
import { analyzeImage } from '../services/interface'; // Use real interface instead of mock
import { useLanguage } from '../context/LanguageContext';
import { texts } from '../constants/texts';

// Asset imports from Figma
const imgBackArrow = "./40807933db102c5ddfe145202e96cb747d9662c5.svg";
const imgAnalysisButton = "./2314863aa5b98c3561bbba15a029ce5d6b01faa6.svg";
const imgViewfinder = "./db6877c52f8f212513e0ebd034674ef3aa25f15a.svg";
// Background assets - 使用与ImageUploadPage一致的背景
const imgHomePage = "./d8253cac2e39f67fcc735a3c279bbb3caac59cc5.png";

// Real API service for image analysis using Azure services
const analyzeImageWithAzure = async (file, language = 'zh', currentLanguage = 'zh') => {
  try {
    console.log('Analyzing image with Azure services...');
    console.log('Language:', language);
    
    // Use the real interface implementation
    const result = await analyzeImage(file, `req-${Date.now()}`, language);
    
    // Transform the result to match the expected format
    return {
      success: true,
      imageUrl: result.imageUrl, // Add the Azure Blob Storage URL here
      analysis: {
        objects: [], // Will be filled based on category
        category: result.background?.category || 'Modern',
        style: result.background?.category || 'Modern', // Use same as category for compatibility
        description: result.metadata.description,
        confidence: result.classification.confidence,
        backgroundImage: result.background?.imageUrl,
        compositeImage: result.compositeImageUrl,
        greenScreenArea: result.background?.boundingBox,
        categoryNumber: result.classification.categoryNumber,
        categoryLabel: result.classification.categoryLabel,
        metadata: result.metadata,
        suggestions: [
          `AI Analysis Complete! Classified as ${result.classification.categoryLabel}.`,
          `Confidence level: ${(result.classification.confidence * 100).toFixed(1)}%`,
          `Background style: ${result.background?.category || 'Modern'}`
        ]
      }
    };
  } catch (error) {
    console.error('Azure image analysis failed:', error);
    
    // Check for content violation errors first
    const errorString = error.message || '';
    const isContentViolation = errorString.includes('内容违规') || 
                              errorString.includes('content violation') ||
                              errorString.includes('rejected') ||
                              errorString.includes('Content filtered') ||
                              (error.code && error.code.includes('content'));
    
    if (isContentViolation) {
      // Content violation - throw specific error for direct rejection
      const contentViolationError = new Error(
        currentLanguage === 'zh' ? 
          '内容违规：Azure OpenAI 认为您上传的图像内容违规' : 
          'Content violation: Azure OpenAI detected policy violation in the uploaded image'
      );
      contentViolationError.code = 'CONTENT_VIOLATION';
      throw contentViolationError;
    }
    
    // Provide user-friendly error messages for other errors
    let errorMessage = currentLanguage === 'zh' ? '图像分析失败，请重试' : 'Image analysis failed, please try again';
    if (error.code === 'UPLOAD_FAILED') {
      errorMessage = currentLanguage === 'zh' ? '图像上传失败，请重试' : 'Image upload failed, please try again';
    } else if (error.code === 'CLASSIFICATION_FAILED') {
      errorMessage = currentLanguage === 'zh' ? '图像分类失败，请重试' : 'Image classification failed, please try again';
    }
    
    throw new Error(errorMessage);
  }
};

// Loading Spinner Component - exact Figma design
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
  const [compositeInfo, setCompositeInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { file } = data || {};
  const { currentLanguage } = useLanguage();
  const t = texts;

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

      const result = await analyzeImageWithAzure(file, currentLanguage, currentLanguage);
      
      clearInterval(progressTimer);
      setProgress(100);
      
      setTimeout(async () => {
        setAnalysisResult(result);
        
        // Generate composite image after analysis completes
        try {
          console.log('Starting composite image generation...');
          const userImageUrl = data?.imageUrl || URL.createObjectURL(file);
          console.log('User image URL:', userImageUrl);
          console.log('Analysis result:', result.analysis);
          
          const composite = await generateCompositeFromAnalysis(result.analysis, userImageUrl);
          setCompositeInfo(composite);
          console.log('Composite image generated successfully:', composite);
        } catch (error) {
          console.error('Failed to generate composite image:', error);
          // Continue without composite image
        }
        
        setAnalysisState('complete');
      }, 500);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      
      // Set user-friendly error message based on error type
      let message = t.imageAnalysis.analysisFailed[currentLanguage];
      
      // Check for content violation errors
      const errorString = error.message || '';
      const isContentViolation = errorString.includes('内容违规') || 
                                errorString.includes('content violation') ||
                                errorString.includes('rejected') ||
                                errorString.includes('Content filtered') ||
                                (error.code && error.code.includes('content'));
      
      if (isContentViolation) {
        // Content violation - direct rejection with user-friendly message
        message = currentLanguage === 'zh' ? 
          'Azure OpenAI 认为您上传的图像内容违规，请重新上传其他图片' : 
          'The uploaded image content violates Azure OpenAI policies. Please upload a different image.';
      } else if (error.code === 'UPLOAD_FAILED') {
        message = t.imageAnalysis.uploadFailedError[currentLanguage];
      } else if (error.code === 'CLASSIFICATION_FAILED') {
        message = t.imageAnalysis.classificationFailedError[currentLanguage];
      }
      
      setErrorMessage(message);
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
      imageUrl: analysisResult?.imageUrl || data?.imageUrl || URL.createObjectURL(file), // Use Azure Blob Storage URL from analysis result
      backgroundImage: compositeInfo?.backgroundPath || analysisResult?.analysis?.backgroundImage,
      compositeImage: compositeInfo?.compositeImage || analysisResult?.analysis?.compositeImage, // Use generated composite image
      category: analysisResult?.analysis?.category || 'default',
      style: analysisResult?.analysis?.style || 'European',
      objects: analysisResult?.analysis?.objects || [],
      source: data?.source || 'camera', // Track if from album or camera
      timestamp: new Date().toISOString(),
      backgroundId: compositeInfo?.backgroundId, // Store background ID for reference
      frameArea: compositeInfo?.frameArea, // Store frame area for reference
      composition: {
        // Data for background composition/merging
        shouldCompose: true,
        backgroundUrl: compositeInfo?.backgroundPath || analysisResult?.analysis?.backgroundImage,
        compositeUrl: compositeInfo?.compositeImage || analysisResult?.analysis?.compositeImage,
        greenScreenArea: compositeInfo?.frameArea || analysisResult?.analysis?.greenScreenArea,
        category: analysisResult?.analysis?.category,
        style: analysisResult?.analysis?.style
      }
    };
    
    console.log('Navigating to Gallery with composite data:', galleryData);
    onNavigate && onNavigate(PAGES.GALLERY, galleryData);
  };

  return (
    <div
      className="bg-center bg-cover bg-no-repeat relative w-full h-full"
      data-name="ImageAnalysisPage"
      style={{ backgroundImage: `url('${imgHomePage}')` }}
    >
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
            <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-center relative shrink-0 w-full">
              <div className="[grid-area:1_/_1] font-medium h-[22px] ml-0 mt-0 not-italic opacity-90 relative text-[#ffffff] text-[16px] text-center w-[141px]">
                <p className="block leading-[1.6] text-center">{t.imageAnalysis.analyzing[currentLanguage]}</p>
              </div>
            </div>
          </div>
          <div className="absolute left-1/2 translate-x-[-50%] w-48 h-1 bg-gray-600 rounded-full overflow-hidden z-20" style={{ top: "calc(50% + 90px)" }}>
            <div className="h-full bg-white transition-all duration-200 ease-out rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </>
      )}

      {/* Analysis Complete State - Simplified with buttons only */}
      {analysisState === 'complete' && analysisResult && (
        <div className="absolute left-1/2 translate-x-[-50%] top-[600px] w-80 z-30">
          <div className="flex gap-3">
            <button onClick={handleRetake} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors font-medium">
              {data?.source === 'album' ? t.imageAnalysis.chooseAgain[currentLanguage] : t.imageAnalysis.retake[currentLanguage]}
            </button>
            <button onClick={handleContinue} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-medium">
              {t.imageAnalysis.continueToGallery[currentLanguage]}
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {analysisState === 'error' && (
        <div className="absolute left-1/2 translate-x-[-50%] translate-y-[-50%] w-80 bg-red-900/80 backdrop-blur-sm rounded-2xl p-6 z-30" style={{ top: "calc(50% + 100px)" }}>
          <h3 className="text-white text-lg font-semibold mb-3">{t.imageAnalysis.analysisFailed[currentLanguage]}</h3>
          <p className="text-white/80 text-sm mb-4">{errorMessage}</p>
          <div className="flex gap-3">
            <button onClick={performAnalysis} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
              {t.imageAnalysis.retry[currentLanguage]}
            </button>
            <button onClick={handleRetake} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
              {data?.source === 'album' ? t.imageAnalysis.chooseAgain[currentLanguage] : t.imageAnalysis.retake[currentLanguage]}
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
    </div>
  );
};

export default ImageAnalysisPage;
