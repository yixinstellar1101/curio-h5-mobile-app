import React, { useState, useEffect } from 'react';
import { 
  SplashAnimationPage, 
  HomePage,
  ImageUploadPage,
  CameraCapturePage,
  CameraCapturingPage,
  ImageAnalysisPage,
  GalleryPage
} from './pages';
import { PAGES } from './constants/pages';

function App() {
  const [currentPage, setCurrentPage] = useState('splash');
  const [pageData, setPageData] = useState(null);

  // Start opening sequence on component mount
  useEffect(() => {
    // Start with splash animation
    setCurrentPage('splash');
    
    // After the splash animation completes (about 4 seconds total), go to home
    const timer = setTimeout(() => {
      setCurrentPage('home');
    }, 4200);
    
    return () => clearTimeout(timer);
  }, []);

  const handleNavigateToHome = () => {
    setCurrentPage('home');
  };

  const handleNavigate = (page, data = null) => {
    if (data) {
      setPageData(data);
    }
    
    switch (page) {
      case PAGES.HOME:
        setCurrentPage('home');
        break;
      case PAGES.IMAGE_UPLOAD:
        setCurrentPage('imageUpload');
        break;
      case PAGES.CAMERA_CAPTURE:
        setCurrentPage('cameraCapture');
        break;
      case PAGES.CAMERA_CAPTURING:
        setCurrentPage('cameraCapturing');
        break;
      case PAGES.IMAGE_ANALYSIS:
        setCurrentPage('imageAnalysis');
        break;
      case PAGES.VOLUME_SETTINGS:
        setCurrentPage('volumeSettings');
        break;
      case PAGES.GALLERY:
        setCurrentPage('gallery');
        break;
      case PAGES.LIVE_ROOM:
        setCurrentPage('liveRoom');
        break;
      default:
        setCurrentPage('home');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="relative w-[393px] h-[852px] overflow-hidden">
        {currentPage === 'splash' && (
          <SplashAnimationPage onNavigate={handleNavigateToHome} />
        )}
        
        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} />
        )}
        
        {currentPage === 'imageUpload' && (
          <ImageUploadPage onNavigate={handleNavigate} />
        )}
        
        {currentPage === 'cameraCapture' && (
          <CameraCapturePage onNavigate={handleNavigate} data={pageData} />
        )}
        
        {currentPage === 'cameraCapturing' && (
          <CameraCapturingPage onNavigate={handleNavigate} data={pageData} />
        )}
        
        {currentPage === 'imageAnalysis' && (
          <ImageAnalysisPage onNavigate={handleNavigate} data={pageData} />
        )}
        
        {currentPage === 'gallery' && (
          <GalleryPage onNavigate={handleNavigate} data={pageData} />
        )}
      </div>
    </div>
  );
}

export default App;
