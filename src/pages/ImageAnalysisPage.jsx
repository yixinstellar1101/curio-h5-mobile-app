import React, { useState, useEffect } from 'react';
import StatusBar from '../components/common/StatusBar';
import HomeIndicator from '../components/common/HomeIndicator';
import { PAGES } from '../constants/pages';

/**
 * ImageAnalysisPage - Complete image processing pipeline
 * 1. Upload Phase: Upload to Azure Blob Storage
 * 2. Classification Phase: Azure OpenAI classification  
 * 3. Background & Music Selection: Map category to resources
 * 4. Metadata Generation: Create name, timestamp, description
 * 5. Post-processing: Append to gallery, prepare transition
 */
const ImageAnalysisPage = ({ onNavigate, file, source }) => {
  const [currentPhase, setCurrentPhase] = useState('upload');
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Phase states: upload, classification, background, metadata, complete
  const phases = {
    upload: { name: 'Uploading to Storage', duration: 2000 },
    classification: { name: 'AI Classification', duration: 3000 },
    background: { name: 'Background Selection', duration: 1500 },
    metadata: { name: 'Generating Metadata', duration: 2000 },
    complete: { name: 'Complete', duration: 500 }
  };

  useEffect(() => {
    if (file) {
      startAnalysis();
    }
  }, [file]);

  const startAnalysis = async () => {
    try {
      // Phase 1: Upload Phase
      await simulatePhase('upload');
      
      // Phase 2: Classification Phase  
      await simulatePhase('classification');
      const category = await performClassification();
      
      // Phase 3: Background & Music Selection
      await simulatePhase('background');
      const backgroundMusic = await selectBackgroundMusic(category);
      
      // Phase 4: Metadata Generation
      await simulatePhase('metadata');
      const metadata = await generateMetadata(category);
      
      // Phase 5: Complete
      setCurrentPhase('complete');
      setAnalysisResult({
        category,
        backgroundMusic,
        metadata,
        imageUrl: URL.createObjectURL(file)
      });
      
      setTimeout(() => {
        // Navigate to LiveRoomPage with analysis result
        onNavigate && onNavigate(PAGES.LIVE_ROOM, { 
          item: {
            ...metadata,
            category,
            imageUrl: URL.createObjectURL(file)
          }
        });
      }, 1500);
      
    } catch (err) {
      setError(err.message);
    }
  };

  const simulatePhase = (phaseName) => {
    return new Promise((resolve) => {
      setCurrentPhase(phaseName);
      setProgress(0);
      
      const duration = phases[phaseName].duration;
      const interval = duration / 100;
      
      let currentProgress = 0;
      const progressTimer = setInterval(() => {
        currentProgress += 1;
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(progressTimer);
          resolve();
        }
      }, interval);
    });
  };

  const performClassification = async () => {
    // Interface Call: analyzeImage(file, requestId) 
    // Mock classification based on spec.md categories
    const categories = [
      { id: 1, name: 'Chinese Historical Artifact', mapping: 'Chinese' },
      { id: 2, name: 'European Historical Artifact', mapping: 'European' },
      { id: 3, name: 'Modern Product', mapping: 'Modern Product' },
      { id: 4, name: 'Pet', mapping: 'European' },
      { id: 5, name: 'Portrait / People', mapping: 'European' },
      { id: 6, name: 'Chinese Painting / Calligraphy', mapping: 'Chinese' },
      { id: 7, name: 'European Painting / Calligraphy', mapping: 'European' }
    ];
    
    // Simulate AI classification
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    return randomCategory;
  };

  const selectBackgroundMusic = async (category) => {
    // Interface Call: getRandomMusic(category.mapping)
    const musicByCategory = {
      'Chinese': ['Traditional Chinese Melody', 'Guqin Harmony', 'Dynasty Echoes'],
      'European': ['Classical Symphony', 'Baroque Chamber', 'Renaissance Lute'],
      'Modern Product': ['Ambient Electronic', 'Minimalist Piano', 'Contemporary Jazz']
    };
    
    const tracks = musicByCategory[category.mapping] || musicByCategory['European'];
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    
    return {
      category: category.mapping,
      selectedTrack: randomTrack,
      backgroundImage: getBackgroundImage(category.mapping)
    };
  };

  const getBackgroundImage = (categoryMapping) => {
    const backgrounds = {
      'Chinese': './src/assets/d8253cac2e39f67fcc735a3c279bbb3caac59cc5.png',
      'European': './src/assets/2339a82e4b6020c219c18a48dca73ef3ba006ffe.png', 
      'Modern Product': './src/assets/cc8c0a6205dd7253e86ab080322dec689122ecb2.png'
    };
    
    return backgrounds[categoryMapping] || backgrounds['European'];
  };

  const generateMetadata = async (category) => {
    // Metadata Generation based on spec.md prompt
    const currentDate = new Date();
    const timestamp = currentDate.toISOString().slice(0, 16).replace('T', ' ');
    
    const sampleNames = {
      1: ['Ming Dynasty Celestial Vase', 'Qing Dynasty Porcelain Bowl', 'Han Jade Pendant'],
      2: ['Roman Bronze Helmet', 'Medieval Silver Goblet', 'Baroque Candleholder'], 
      3: ['AirPods of Delphi', 'Modern Minimalist Mug', 'Contemporary Art Piece'],
      4: ['Sir Whiskers, Duke of Purrington', 'Golden Retriever Portrait', 'Aristocratic Cat'],
      5: ['Victorian Portrait Study', 'Renaissance Noble', 'Classical Figure'],
      6: ['Landscape Scroll Painting', 'Calligraphy Masterwork', 'Ink Wash Mountains'],
      7: ['European Oil Portrait', 'Impressionist Study', 'Classical Composition']
    };
    
    const sampleDescriptions = {
      1: 'This exquisite piece embodies the refined aesthetics of Chinese imperial craftsmanship, with intricate patterns that whisper tales of ancient dynasties.',
      2: 'A testament to European artisanal excellence, this artifact carries the weight of history and the elegance of classical civilization.',
      3: 'In the realm of modern design, this piece bridges contemporary innovation with timeless aesthetic principles.',
      4: 'This beloved companion represents the enduring bond between humans and their cherished animal friends.',
      5: 'A capturing of human essence through artistic vision, preserving a moment of dignity and grace.',
      6: 'Traditional Chinese artistry flows through ink and brush, capturing the harmony between nature and spirit.',
      7: 'European artistic tradition manifests in this work, showcasing mastery of light, form, and emotional expression.'
    };
    
    const names = sampleNames[category.id] || sampleNames[3];
    const descriptions = sampleDescriptions[category.id] || sampleDescriptions[3];
    
    return {
      name: names[Math.floor(Math.random() * names.length)],
      timestamp,
      description: descriptions
    };
  };

  if (error) {
    return (
      <div className="absolute inset-0 w-full h-full bg-red-900 flex flex-col items-center justify-center p-8">
        <StatusBar />
        
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Analysis Failed</h2>
          <p className="text-red-200 mb-6">{error}</p>
          
          <div className="space-y-3">
            <button 
              onClick={() => file && startAnalysis()}
              className="block w-full bg-white text-red-900 font-semibold py-3 px-6 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => onNavigate && onNavigate(PAGES.IMAGE_UPLOAD)}
              className="block w-full border-2 border-white text-white font-semibold py-3 px-6 rounded-2xl hover:bg-white/10 transition-colors"
            >
              Upload Different Image
            </button>
          </div>
        </div>
        
        <HomeIndicator />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <StatusBar />
      
      {/* Analysis Progress */}
      <div className="flex flex-col items-center justify-center h-full p-8">
        
        {/* Current Phase Indicator */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">
            {currentPhase === 'upload' && '☁️'}
            {currentPhase === 'classification' && '🤖'}
            {currentPhase === 'background' && '🎨'}
            {currentPhase === 'metadata' && '📝'}
            {currentPhase === 'complete' && '✅'}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {phases[currentPhase]?.name}
          </h2>
          
          {currentPhase !== 'complete' && (
            <p className="text-gray-300">
              Analyzing your image with AI...
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {currentPhase !== 'complete' && (
          <div className="w-full max-w-sm mb-8">
            <div className="bg-white/20 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-white text-sm">{progress}%</p>
          </div>
        )}

        {/* Preview Image */}
        {file && (
          <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-xl mb-8">
            <img 
              src={URL.createObjectURL(file)} 
              alt="Analyzing..." 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Phase Details */}
        <div className="text-center text-gray-300 text-sm max-w-md">
          {currentPhase === 'upload' && (
            <p>Securely uploading your image to our cloud storage...</p>
          )}
          {currentPhase === 'classification' && (
            <p>Our AI is examining your image and classifying it into one of 7 categories...</p>
          )}
          {currentPhase === 'background' && (
            <p>Selecting the perfect background and music to complement your item...</p>
          )}
          {currentPhase === 'metadata' && (
            <p>Creating a beautiful title and description for your artifact...</p>
          )}
          {currentPhase === 'complete' && analysisResult && (
            <div className="text-center">
              <p className="text-xl font-semibold text-white mb-2">
                Analysis Complete!
              </p>
              <p className="text-lg text-blue-200 mb-1">
                {analysisResult.metadata.name}
              </p>
              <p className="text-sm text-gray-400">
                Category: {analysisResult.category.name}
              </p>
            </div>
          )}
        </div>

        {/* Phase Progress Dots */}
        <div className="flex space-x-3 mt-12">
          {Object.keys(phases).map((phase, index) => (
            <div 
              key={phase}
              className={`w-3 h-3 rounded-full transition-colors ${
                phase === currentPhase 
                  ? 'bg-white' 
                  : Object.keys(phases).indexOf(currentPhase) > index
                  ? 'bg-green-400'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
      
      <HomeIndicator />
    </div>
  );
};

export default ImageAnalysisPage;
