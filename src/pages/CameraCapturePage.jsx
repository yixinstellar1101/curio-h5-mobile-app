import React, { useState, useRef, useEffect } from 'react';
import { PAGES } from '../constants/pages';

// Asset imports from Figma
const imgGroup2018781189 = "./a50b78e69bd84e986612b63ceaef3914b979e32f.svg";
const imgBackArrow = "./40807933db102c5ddfe145202e96cb747d9662c5.svg";
const imgWhiteDot = "./3a56d57eec3f941a5df78a985a87aa7235c2181a.svg";
// Background assets - 使用与ImageUploadPage一致的背景
const imgHomePage = "./d8253cac2e39f67fcc735a3c279bbb3caac59cc5.png"; // 与ImageUploadPage一致的背景
const imgRectangle346603543 = "./9b6dc444b0feeb650edd472c766d9b00af5ddbb8.svg"; // 重要的背景覆盖层

// Camera Frame Component - exact Figma design
const CameraFrame = () => {
  return (
    <div className="relative size-full" data-name="kuang">
      <div className="absolute contents inset-0">
        <div className="absolute inset-[-0.74%_-0.84%]">
          <img
            alt=""
            className="block max-w-none size-full"
            src={imgGroup2018781189}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * CameraCapturePage - Camera interface with viewfinder and capture functionality
 * Features:
 * - Real device camera access via getUserMedia API
 * - Live camera preview in viewfinder frame
 * - Capture photo functionality
 * - Back button → ImageUploadPage
 * - Camera flip functionality in bottom-right corner
 */
const CameraCapturePage = ({ onNavigate }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' for back, 'user' for front

  // Initialize camera on component mount and when facingMode changes
  useEffect(() => {
    initializeCamera();
    
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]); // Re-initialize when facingMode changes

  const initializeCamera = async () => {
    try {
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Request camera access with 3:4 aspect ratio
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1080 },  // 3:4 ratio - width
          height: { ideal: 1440 }, // 3:4 ratio - height
          aspectRatio: { ideal: 0.75 }, // 3:4 = 0.75
          facingMode: facingMode // Use current facing mode
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied or unavailable. Please ensure you have granted camera permissions.');
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      // Create canvas to capture frame
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      // Calculate 3:4 aspect ratio dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      // Determine the output size maintaining 3:4 ratio
      let outputWidth, outputHeight;
      const targetAspectRatio = 3 / 4; // 0.75
      const videoAspectRatio = videoWidth / videoHeight;
      
      if (videoAspectRatio > targetAspectRatio) {
        // Video is wider than 3:4, crop width
        outputHeight = videoHeight;
        outputWidth = videoHeight * targetAspectRatio;
      } else {
        // Video is taller than 3:4, crop height  
        outputWidth = videoWidth;
        outputHeight = videoWidth / targetAspectRatio;
      }
      
      // Set canvas dimensions to 3:4 ratio
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      
      // Calculate crop offsets to center the crop
      const cropX = (videoWidth - outputWidth) / 2;
      const cropY = (videoHeight - outputHeight) / 2;

      // Draw cropped video frame to canvas with 3:4 ratio
      context.drawImage(
        video,
        cropX, cropY, outputWidth, outputHeight, // Source rectangle (cropped from video)
        0, 0, outputWidth, outputHeight          // Destination rectangle (full canvas)
      );

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          // Create File object for processing
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          
          // Validate file size (≤ 5MB)
          if (file.size > 5 * 1024 * 1024) {
            alert('Captured image is too large. Please try again.');
            setIsCapturing(false);
            return;
          }

          console.log('Captured photo:', file.name, 'Size:', file.size, 'Type:', file.type);

          // Navigate to CameraCapturingPage with captured image
          onNavigate && onNavigate(PAGES.CAMERA_CAPTURING, { file });
        }
      }, 'image/jpeg', 0.8);

    } catch (error) {
      console.error('Error capturing photo:', error);
      setIsCapturing(false);
      alert('Failed to capture photo. Please try again.');
    }
  };

  // Handle viewfinder click to capture photo
  const handleViewfinderClick = () => {
    handleCapture();
  };

  const handleBack = () => {
    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    // Navigate back to ImageUploadPage
    onNavigate && onNavigate(PAGES.IMAGE_UPLOAD);
  };

  const handleFlipCamera = () => {
    // Toggle between front and back camera
    setFacingMode(prevMode => prevMode === 'environment' ? 'user' : 'environment');
  };

  return (
    <div
      className="bg-center bg-cover bg-no-repeat relative w-full h-full"
      data-name="CameraCapturePage"
      style={{ backgroundImage: `url('${imgHomePage}')` }}
    >
      {/* Camera Preview Video - 3:4 aspect ratio */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          zIndex: 0,
          width: 'auto',
          height: '100%',
          aspectRatio: '3/4', // Force 3:4 aspect ratio
          objectFit: 'cover',
          maxWidth: '100%'
        }}
      />

      {/* Hidden canvas for capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 bg-[#221400] flex items-center justify-center p-4 z-10">
          <div className="text-white text-center">
            <p className="mb-4">{error}</p>
            <button
              onClick={initializeCamera}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        className="absolute left-5 size-[42px] top-[53px] z-20 cursor-pointer hover:scale-110 transition-transform duration-200"
        onClick={handleBack}
        data-name="返回 1"
      >
        <img alt="Back" className="block max-w-none size-full" src={imgBackArrow} />
      </button>

      {/* Camera Frame/Viewfinder - Adjusted for 3:4 aspect ratio with click handler */}
      <div
        className="absolute left-1/2 translate-x-[-50%] translate-y-[-50%] z-10 cursor-pointer"
        data-name="kuang"
        style={{ 
          top: "calc(50% - 41px)",
          width: '280px',  // Adjusted for better 3:4 fit
          height: '373px', // 280 * 4/3 = 373.33, maintaining 3:4 ratio
          aspectRatio: '3/4'
        }}
        onClick={handleViewfinderClick}
      >
        <CameraFrame />
      </div>

      {/* Position in Frame Text */}
      <div
        className="absolute bg-[rgba(0,0,0,0.5)] box-border content-stretch flex flex-col gap-2.5 h-8 items-center justify-center left-1/2 px-[19px] py-[3px] rounded-[20px] translate-x-[-50%] translate-y-[-50%] w-[163px] z-20"
        style={{ top: "calc(50% + 200px)" }}
      >
        <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
          <div className="[grid-area:1_/_1] font-medium h-[22px] ml-0 mt-0 not-italic opacity-90 relative text-[#ffffff] text-[16px] text-left w-[125px]">
            <p className="block leading-[1.6]">Position in frame</p>
          </div>
        </div>
      </div>

      {/* Capture Button */}
      <button
        className="absolute left-[164px] size-[66px] top-[715px] z-20 cursor-pointer hover:scale-110 transition-transform duration-200 disabled:opacity-50"
        onClick={handleCapture}
        disabled={isCapturing || !!error}
        data-name="white dot"
      >
        <div className="absolute inset-[-1.52%_-10.61%_-37.88%_-10.61%]">
          <img
            alt={isCapturing ? "Capturing..." : "Capture"}
            className="block max-w-none size-full"
            src={imgWhiteDot}
          />
        </div>
        {isCapturing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </button>

      {/* Camera Flip Button - Bottom Right (replaced gallery button) */}
      <button
        className="absolute left-[290px] top-[727px] z-20 cursor-pointer hover:scale-110 transition-transform duration-200"
        onClick={handleFlipCamera}
        title={facingMode === 'environment' ? 'Switch to Front Camera' : 'Switch to Back Camera'}
        data-name="flip-camera-bottom"
      >
        <div className="backdrop-blur-[0.778px] backdrop-filter bg-[rgba(0,0,0,0.3)] rounded-[7.778px] size-[42px] flex items-center justify-center">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="text-white"
          >
            <path 
              d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM12 18c-2.76 0-5-2.24-5-5h1.5l-2.5-3-2.5 3H5c0 3.87 3.13 7 7 7s7-3.13 7-7h-1.5l2.5-3 2.5 3H19c0 2.76-2.24 5-5 5z" 
              fill="currentColor"
            />
          </svg>
        </div>
      </button>

      {/* Home Indicator */}
      <div
        className="absolute box-border content-stretch flex flex-col items-center justify-start left-0 p-0 top-[826px] w-[393px] z-20"
      >
        <div
          className="h-[26px] relative shrink-0 w-[375px]"
          data-name="Home Indicator"
        >
          <div className="absolute bottom-2 flex h-[5px] items-center justify-center left-1/2 translate-x-[-50%] w-36">
            <div className="flex-none rotate-[180deg] scale-y-[-100%]">
              <div
                className="bg-[#000000] h-[5px] rounded-[100px] w-36"
                data-name="Home Indicator"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCapturePage;
