import React, { useState, useRef, useEffect } from 'react';
import { PAGES } from '../constants/pages';

// Asset imports from Figma - 使用ES6 import语法确保正确的路径解析
import imgGroup2018781189 from "../assets/a50b78e69bd84e986612b63ceaef3914b979e32f.svg";
import imgBackArrow from "../assets/40807933db102c5ddfe145202e96cb747d9662c5.svg";
import imgWhiteDot from "../assets/3a56d57eec3f941a5df78a985a87aa7235c2181a.svg";
import imgHomePage from "../assets/d8253cac2e39f67fcc735a3c279bbb3caac59cc5.png";
import imgRectangle346603543 from "../assets/9b6dc444b0feeb650edd472c766d9b00af5ddbb8.svg";

// Camera Switch Icon Component (Inline SVG matching LiveRoom reroll style)
const CameraSwitchIcon = () => (
  <div className="backdrop-blur-[1px] bg-black/30 flex items-center justify-center rounded-full size-full">
    <div className="w-[22px] h-[22px]">
      <svg
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        overflow="visible"
        style={{ display: 'block' }}
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block max-w-none size-full"
        aria-label="Switch Camera"
        role="img"
      >
        <g>
          <path
            d="M12.3922 17.7096C10.2008 18.1543 7.8375 17.5377 6.15957 15.8619C3.65879 13.3633 3.48906 9.46172 5.64609 6.79336V8.05879C5.64609 8.43477 5.95547 8.74199 6.33145 8.74199C6.70957 8.74199 7.01465 8.43477 7.0168 8.05879V5.32168C7.0168 5.11543 6.94805 4.9457 6.81055 4.84258C6.67305 4.70508 6.50117 4.63633 6.33145 4.63633H3.59219C3.21406 4.63633 2.90898 4.94355 2.90684 5.32168C2.90684 5.69766 3.21621 6.00703 3.59219 6.00703H4.55039C1.98086 9.18887 2.22148 13.8424 5.16699 16.8201C7.2209 18.874 10.0633 19.5916 12.7016 19.0438C12.8047 19.0094 12.9422 18.9406 13.0109 18.8719C13.2838 18.599 13.2838 18.1865 13.0109 17.9137C12.8713 17.7096 12.5984 17.6408 12.3922 17.7096ZM18.4207 16.0338H17.4969C19.9977 12.8176 19.7914 8.16191 16.8115 5.18633C14.893 3.26992 12.2891 2.51582 9.79043 2.85742C9.61855 2.85742 9.48105 2.92617 9.3457 3.06367C9.07285 3.33652 9.07285 3.74687 9.3457 4.02187C9.51758 4.19375 9.75605 4.26035 9.99668 4.19375C12.0506 3.88652 14.2441 4.53535 15.8189 6.11016C18.3197 8.60879 18.4895 12.5104 16.3324 15.1787V13.9133C16.3324 13.5373 16.023 13.2279 15.6471 13.2279C15.2689 13.2279 14.9639 13.5352 14.9617 13.9133V16.6504C14.9617 16.8566 15.0305 17.0264 15.168 17.1295C15.3055 17.267 15.4773 17.3357 15.6471 17.3357H18.3863C18.7645 17.3357 19.0695 17.0285 19.0717 16.6504C19.0717 16.2723 18.7967 16.0338 18.4207 16.0338Z"
            fill="#E4E4E4"
          />
        </g>
      </svg>
    </div>
  </div>
);

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
  
  // 检测设备类型，电脑端默认使用前置摄像头
  const getDefaultFacingMode = () => {
    const isDesktop = !navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i);
    return isDesktop ? 'user' : 'environment'; // 电脑端默认前置，移动端默认后置
  };
  
  const [facingMode, setFacingMode] = useState(getDefaultFacingMode());

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

      // 如果是前置摄像头，需要水平翻转画布
      if (facingMode === 'user') {
        context.save();
        context.scale(-1, 1); // 水平翻转
        context.translate(-outputWidth, 0); // 调整位置
      }

      // Draw cropped video frame to canvas with 3:4 ratio
      context.drawImage(
        video,
        cropX, cropY, outputWidth, outputHeight, // Source rectangle (cropped from video)
        0, 0, outputWidth, outputHeight          // Destination rectangle (full canvas)
      );

      // 恢复canvas状态
      if (facingMode === 'user') {
        context.restore();
      }

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
          maxWidth: '100%',
          transform: facingMode === 'user' 
            ? 'translate(-50%, -50%) scaleX(-1)' // 前置摄像头水平翻转
            : 'translate(-50%, -50%)'
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

      {/* Camera Flip Button - Bottom Right (Matching LiveRoom style) */}
      <button
        className="absolute left-[290px] top-[727px] z-20 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200 size-[38px]"
        onClick={handleFlipCamera}
        title={facingMode === 'environment' ? 'Switch to Front Camera' : 'Switch to Back Camera'}
        data-name="flip-camera-bottom"
      >
        <CameraSwitchIcon />
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
