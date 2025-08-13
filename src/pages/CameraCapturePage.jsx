import React, { useState, useRef, useEffect } from 'react';
import { PAGES } from '../constants/pages';

// Asset imports from Figma
const imgGroup2018781189 = "/src/assets/a50b78e69bd84e986612b63ceaef3914b979e32f.svg";
const imgBattery = "/src/assets/c0c091687c62d7337bf318e17f3769ffc34d3a72.svg";
const imgWifi = "/src/assets/94bdfe1a8077b65bf75e0473782ae3df50cd473f.svg";
const imgCellular = "/src/assets/a883d1003c9c8d00c12b4d64e84ed02fcbbf9603.svg";
const imgBackArrow = "/src/assets/40807933db102c5ddfe145202e96cb747d9662c5.svg";
const imgWhiteDot = "/src/assets/3a56d57eec3f941a5df78a985a87aa7235c2181a.svg";
const imgGallery = "/src/assets/01e1d6ae9f47430674fe0f46b61392a43f9c8519.svg";

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
 * - Gallery button → GalleryPage
 */
const CameraCapturePage = ({ onNavigate }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();
    
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment' // Use back camera if available
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

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0);

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

          // TODO: Interface Call - analyzeImage(file, requestId)
          // Simulate processing delay
          setTimeout(() => {
            setIsCapturing(false);
            // Navigate to ImageAnalysisPage after successful capture
            onNavigate && onNavigate(PAGES.IMAGE_ANALYSIS);
          }, 1000);
        }
      }, 'image/jpeg', 0.8);

    } catch (error) {
      console.error('Error capturing photo:', error);
      setIsCapturing(false);
      alert('Failed to capture photo. Please try again.');
    }
  };

  const handleBack = () => {
    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    // Navigate back to ImageUploadPage
    onNavigate && onNavigate(PAGES.IMAGE_UPLOAD);
  };

  const handleGallery = () => {
    // Navigate to GalleryPage
    onNavigate && onNavigate(PAGES.GALLERY);
  };

  return (
    <div
      className="bg-[#221400] relative size-full"
      data-name="CameraCapturePage"
    >
      {/* Camera Preview Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
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

      {/* Status Bar */}
      <div
        className="absolute box-border content-stretch flex flex-col items-start justify-start left-1/2 p-0 top-0 translate-x-[-50%] w-[393px] z-20"
        data-name="Status bar V2"
      >
        <div
          className="h-11 relative shrink-0 w-full"
          data-name="Status Bar"
        >
          <div
            className="absolute h-[22px] left-[26px] top-[15px] w-[54px]"
            data-name="Time"
          >
            <div
              className="absolute font-semibold leading-[0] left-0 not-italic right-0 text-[#ffffff] text-[17px] text-center"
              style={{ top: "calc(50% - 11px)" }}
            >
              <p className="block leading-[22px]">12:15</p>
            </div>
          </div>
          <div
            className="absolute h-[13px] right-[26.34px] top-[19.33px] w-[27.328px]"
            data-name="Battery"
          >
            <img alt="" className="block max-w-none size-full" src={imgBattery} />
          </div>
          <div
            className="absolute h-3 right-[61px] top-5 w-[17px]"
            data-name="Wifi"
          >
            <img alt="" className="block max-w-none size-full" src={imgWifi} />
          </div>
          <div
            className="absolute h-3 right-[85.4px] top-5 w-[19.2px]"
            data-name="Cellular Connection"
          >
            <img alt="" className="block max-w-none size-full" src={imgCellular} />
          </div>
        </div>
      </div>

      {/* Back Button */}
      <button
        className="absolute left-5 size-[42px] top-[53px] z-20 cursor-pointer hover:scale-110 transition-transform duration-200"
        onClick={handleBack}
        data-name="返回 1"
      >
        <img alt="Back" className="block max-w-none size-full" src={imgBackArrow} />
      </button>

      {/* Camera Frame/Viewfinder - Exact Figma positioning */}
      <div
        className="absolute h-[336px] left-1/2 translate-x-[-50%] translate-y-[-50%] w-[299px] z-10"
        data-name="kuang"
        style={{ top: "calc(50% - 41px)" }}
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

      {/* Gallery Button */}
      <button
        className="absolute left-[290px] top-[727px] z-20 cursor-pointer hover:scale-110 transition-transform duration-200"
        onClick={handleGallery}
      >
        <div className="backdrop-blur-[0.778px] backdrop-filter bg-[rgba(0,0,0,0.3)] rounded-[7.778px] size-[42px]">
          <div className="absolute contents inset-[20.37%_18.52%]">
            <div className="absolute inset-[20.37%_18.52%]">
              <img
                alt="Gallery"
                className="block max-w-none size-full"
                src={imgGallery}
              />
            </div>
          </div>
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
