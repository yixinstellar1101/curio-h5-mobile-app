import React, { useState, useEffect } from 'react';
import StatusBar from '../components/common/StatusBar';
import HomeIndicator from '../components/common/HomeIndicator';
import { PAGES } from '../constants/pages';

/**
 * GalleryPage
 * Display all previously uploaded items as per spec.md:
 * - Interface Call: getGallery({ limit, offset }) to load gallery items
 * - Horizontal swipe navigation between gallery items
 * - Tap an item → Navigate to LiveRoomPage
 * - New uploads appended to end; swipe right to view latest
 */
const GalleryPage = ({ onNavigate }) => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGalleryItems();
  }, []);

  const loadGalleryItems = async () => {
    try {
      setLoading(true);
      // Interface Call: getGallery({ limit, offset })
      // TODO: Replace with actual interface call
      const mockData = [
        {
          id: '1',
          name: 'Ming Dynasty Vase',
          timestamp: '2024/12/20 14:30',
          description: 'An elegant blue and white porcelain vase from the Ming Dynasty, featuring intricate dragon motifs.',
          imageUrl: '/api/placeholder/300/400',
          category: 'Chinese Historical Artifact'
        },
        {
          id: '2', 
          name: 'Golden Retriever Portrait',
          timestamp: '2024/12/20 15:45',
          description: 'A beautiful golden retriever sitting in afternoon sunlight, showing the loyal companionship of our furry friends.',
          imageUrl: '/api/placeholder/300/400',
          category: 'Pet'
        },
        {
          id: '3',
          name: 'Modern Ceramic Mug',
          timestamp: '2024/12/20 16:20',
          description: 'A contemporary minimalist ceramic mug with clean lines and subtle texture, perfect for morning coffee.',
          imageUrl: '/api/placeholder/300/400',
          category: 'Modern Product'
        }
      ];
      
      setGalleryItems(mockData);
      setError(null);
    } catch (err) {
      setError('Failed to load gallery items');
      console.error('Gallery loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction) => {
    if (direction === 'left' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'right' && currentIndex < galleryItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleItemTap = (item) => {
    // Navigate to LiveRoomPage for this item
    onNavigate && onNavigate(PAGES.LIVE_ROOM, { galleryItem: item });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={loadGalleryItems}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (galleryItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">📸</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Items Yet</h2>
          <p className="text-gray-600 mb-6">Start by uploading your first image</p>
          <button
            onClick={() => onNavigate && onNavigate(PAGES.HOME)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const currentItem = galleryItems[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate && onNavigate(PAGES.HOME)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Gallery</h1>
        <div className="text-sm text-gray-500">
          {currentIndex + 1} / {galleryItems.length}
        </div>
      </div>

      {/* Main Gallery Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div 
          className="max-w-sm w-full bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105"
          onClick={() => handleItemTap(currentItem)}
        >
          {/* Image */}
          <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
            <div className="text-gray-400 text-6xl">🖼️</div>
            {/* TODO: Replace with actual image */}
          </div>
          
          {/* Item Details */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{currentItem.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{currentItem.timestamp}</p>
            <p className="text-gray-600 text-sm leading-relaxed">{currentItem.description}</p>
            <div className="mt-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {currentItem.category}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Hints */}
        <div className="flex items-center justify-center space-x-8 mt-8">
          <button
            onClick={() => handleSwipe('left')}
            disabled={currentIndex === 0}
            className={`p-3 rounded-full ${
              currentIndex === 0 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center">
            <p className="text-gray-500 text-sm">Tap to enter live room</p>
          </div>

          <button
            onClick={() => handleSwipe('right')}
            disabled={currentIndex === galleryItems.length - 1}
            className={`p-3 rounded-full ${
              currentIndex === galleryItems.length - 1 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex space-x-2 mt-6">
          {galleryItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;