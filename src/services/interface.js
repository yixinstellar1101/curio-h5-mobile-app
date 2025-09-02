// Real Interface Implementation for Curio Mobile H5 Application
// This file provides real implementations of all interface methods defined in api-doc.md
// Integrates Azure Blob Storage and Azure OpenAI services

import { azureBlobService, AzureBlobError } from './azureBlobService.js';
// Removed direct Azure OpenAI dependency; now using backend APIs
import { backendApiService, BackendAPIError } from '../config/backendEndpoints.js';
import { getRandomBackgroundByCategory, createCompositeImage } from '../utils/imageComposition.js';
import backgroundFrameMappings from '../../background_frames_mappings.json' with { type: 'json' };
import { v4 as uuidv4 } from 'uuid';

// Category to background style mapping (consistent with mockInterface.js)
const CATEGORY_MAPPING = {
  1: "Chinese",        // Chinese Historical Artifact
  6: "Chinese",        // Chinese Painting / Calligraphy
  3: "Modern",         // Modern Product
  2: "European",       // European Historical Artifact
  4: "European",       // Pet
  5: "European",       // Portrait / People
  7: "European"        // European Painting / Calligraphy
};

// Category labels for reference
const CATEGORY_LABELS = {
  1: "Chinese Historical Artifact",
  2: "European Historical Artifact", 
  3: "Modern Product",
  4: "Pet",
  5: "Portrait / People",
  6: "Chinese Painting / Calligraphy",
  7: "European Painting / Calligraphy"
};

// Character information (consistent with mockInterface.js)
const CHARACTERS = [
  {
    id: "lu-xun",
    name: "Lu Xun",
    description: "Chinese writer and social critic, known for his sharp observations on society and culture.",
    personality: "intellectual, critical, observant",
    speakingStyle: "Direct and thoughtful, often draws connections to social themes"
  },
  {
    id: "su-shi",
    name: "Su Shi",
    description: "Song Dynasty poet and scholar, celebrated for his lyrical and philosophical insights.",
    personality: "poetic, philosophical, graceful",
    speakingStyle: "Elegant and metaphorical, often uses nature imagery"
  },
  {
    id: "vincent-van-gogh",
    name: "Vincent van Gogh",
    description: "Dutch post-impressionist painter, known for his emotional and expressive style.",
    personality: "passionate, emotional, artistic",
    speakingStyle: "Emotional and vivid, focuses on colors and artistic techniques"
  }
];

// Local storage keys
const GALLERY_STORAGE_KEY = 'curio_gallery_items';
const CONVERSATION_STORAGE_KEY = 'curio_conversations';

/**
 * Main image analysis interface - handles complete pipeline
 * @param {File|string} imageInput - Image file or image URL
 * @param {string} requestId - Optional correlation ID
 * @returns {Promise<AnalysisResult>}
 */
export async function analyzeImage(imageInput, requestId = null, language = 'zh') {
  console.log('=== Starting Real Image Analysis ===');
  console.log('Request ID:', requestId);
  console.log('Language:', language);
  
  try {
    const imageId = uuidv4();
  let imageUrl;

    // Step 1: Handle image input (upload if File, use URL if string)
    if (imageInput instanceof File) {
      console.log('Uploading image to Azure Blob Storage...');
      const uploadResult = await azureBlobService.uploadImage(imageInput, {
        folder: 'uploaded-images',
        customName: imageId
      });
      imageUrl = uploadResult.url;
      
      console.log('Image uploaded successfully');
    } else if (typeof imageInput === 'string') {
      imageUrl = imageInput;
      console.log('Using provided image URL:', imageUrl);
      if (!(imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
        throw new Error('Invalid image URL: must be a valid HTTP/HTTPS URL');
      }
    } else {
      throw new Error('Invalid image input: must be File object or URL string');
    }

    // Step 2: Classify image via backend API
    console.log('Classifying image via backend API...');
    const classification = await backendApiService.classifyImage(imageUrl);
    
  // Step 3: Generate metadata via backend API
  console.log('Generating metadata via backend API...');
  const aiMetadata = await backendApiService.generateMetadata(imageUrl, language, classification);
    
    console.log('=== AI METADATA RECEIVED IN INTERFACE ===');
    console.log('AI Metadata:', aiMetadata);
    console.log('AI Metadata name:', aiMetadata.name);
    console.log('AI Metadata description:', aiMetadata.description);
    console.log('AI Metadata type check:', typeof aiMetadata, Object.keys(aiMetadata || {}));
    
    const metadata = {
      name: aiMetadata.name,
      timestamp: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      description: aiMetadata.description
    };
    
    console.log('=== FINAL METADATA OBJECT ===');
    console.log('Final metadata:', metadata);

    // Step 4: Select background based on category
    console.log('Selecting background for category:', classification.categoryNumber);
    const backgroundStyle = CATEGORY_MAPPING[classification.categoryNumber] || 'Modern';
    const backgroundData = getRandomBackgroundByCategory(backgroundStyle);
    
    if (!backgroundData) {
      console.warn(`No background found for category ${backgroundStyle}, using default`);
    }

    // Step 5: Create composite image with background frame
    console.log('Creating composite image with background frame...');
    let compositeImageUrl = imageUrl; // Fallback to original image
    
    if (backgroundData && backgroundData.backgroundPath && backgroundData.frameArea) {
      try {
        console.log('Compositing image:', {
          userImage: imageUrl,
          background: backgroundData.backgroundPath,
          frameArea: backgroundData.frameArea
        });
        
        // Create composite image with background frame
        compositeImageUrl = await createCompositeImage(
          imageUrl,
          backgroundData.backgroundPath,
          backgroundData.frameArea
        );
        
        console.log('✅ Composite image created successfully:', compositeImageUrl.substring(0, 50) + '...');
      } catch (error) {
        console.error('❌ Failed to create composite image:', error);
        // Keep using original image URL as fallback
        compositeImageUrl = imageUrl;
      }
    } else {
      console.log('⚠️ No background data available, using original image');
    }

    // Step 6: Create result object
    const analysisResult = {
      imageId,
      imageUrl,
      classification: {
        categoryNumber: classification.categoryNumber,
        categoryLabel: classification.categoryLabel,
        confidence: classification.confidence
      },
      metadata,
      background: backgroundData ? {
        category: backgroundStyle,
        imageUrl: backgroundData.backgroundPath,
        boundingBox: backgroundData.frameArea
      } : null,
      compositeImageUrl,
      requestId
    };
    
    console.log('=== ANALYSIS RESULT CREATED ===');
    console.log('Analysis result structure:', analysisResult);
    console.log('Analysis result metadata:', analysisResult.metadata);
    console.log('Analysis result classification:', analysisResult.classification);

    // Step 7: Save to gallery
    await saveToGallery(analysisResult);
    
    console.log('=== Image Analysis Complete ===');
    console.log('Result:', analysisResult);
    
    return analysisResult;

  } catch (error) {
    console.error('Image analysis failed:', error);
    
    // Check for content violation errors first
    const isContentViolation = error.code === 'CONTENT_VIOLATION' || 
                               (error.message && (
                                 error.message.includes('内容违规') ||
                                 error.message.includes('content violation') ||
                                 error.message.includes('Content filtered')
                               ));
    
    if (isContentViolation) {
      throw new ImageAnalysisError('CONTENT_VIOLATION', error.message, error);
    }
    
    // Provide specific error messages based on error type
    if (error instanceof AzureBlobError) {
      throw new ImageAnalysisError('UPLOAD_FAILED', `Image upload failed: ${error.message}`, error);
    } else if (error instanceof BackendAPIError) {
      const code = error.code === 'CLASSIFICATION_FAILED' ? 'CLASSIFICATION_FAILED' : 'ANALYSIS_FAILED';
      throw new ImageAnalysisError(code, `Backend API failed: ${error.message}`, error);
    } else {
      throw new ImageAnalysisError('ANALYSIS_FAILED', `Image analysis failed: ${error.message}`, error);
    }
  }
}

/**
 * Get gallery items from local storage
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of items to return
 * @param {number} options.offset - Pagination offset
 * @returns {Promise<GalleryData>}
 */
export async function getGallery(options = {}) {
  try {
    const { limit = 50, offset = 0 } = options;
    
    // Get items from local storage
    const storedItems = localStorage.getItem(GALLERY_STORAGE_KEY);
    const allItems = storedItems ? JSON.parse(storedItems) : [];
    
    // Apply pagination
    const items = allItems.slice(offset, offset + limit);
    
    return {
      items,
      totalCount: allItems.length,
      hasMore: offset + items.length < allItems.length
    };
  } catch (error) {
    console.error('Get gallery failed:', error);
    return { items: [], totalCount: 0, hasMore: false };
  }
}

/**
 * Generate AI conversation about an image
 * @param {Object} params - Conversation parameters  
 * @param {string} params.imageId - ID of the image
 * @param {string} params.imageUrl - URL of the image
 * @param {string} params.description - Description of the image
 * @param {Array} params.characters - Character IDs to include
 * @returns {Promise<ConversationResponse>}
 */
export async function generateConversation(params) {
  try {
    console.log('🎯 === GENERATE CONVERSATION START (Using Backend API) ===');
    console.log('🔍 Parameters:', params);
    
    const { 
      imageId, 
      imageUrl, 
      description, 
      characters = ['lu-xun', 'su-shi', 'vincent-van-gogh'],
      userMessage,
      previousMessages: providedPreviousMessages,
      language = 'zh' // Default to Chinese if not specified
    } = params;
    
    console.log('🔍 Interface.js DEBUG - Received language parameter:', language);
    console.log('🔍 Interface.js DEBUG - Will pass language to backend API:', language);
    
    // Get previous messages for context (if any)
    let previousMessages = providedPreviousMessages || getConversationHistory(imageId);
    
    // Generate conversation via backend API
    console.log('🚀 Calling backendApiService.generateConversation...');
    const messages = await backendApiService.generateConversation({
      imageId,
      imageUrl,
      description,
      characters,
      previousMessages: previousMessages.slice(-5),
      userMessage,
      language
    });
    
    console.log('✅ Backend API returned messages:', messages);
    
    // Save conversation to storage
    saveConversationMessages(imageId, messages);
    
    return {
      conversationId: imageId,
      messages,
      characters: CHARACTERS.filter(char => characters.includes(char.id))
    };
    
  } catch (error) {
    console.error('Generate conversation failed:', error);
    if (error instanceof BackendAPIError) {
      throw new ConversationError(error.code || 'GENERATION_FAILED', error.message, error);
    }
    throw new ConversationError('GENERATION_FAILED', error.message, error);
  }
}

/**
 * Create real-time conversation stream
 * @param {string} imageId - Image ID
 * @param {Object} options - Stream options
 * @returns {EventEmitter} Conversation stream
 */
export function createConversationStream(imageId, options = {}) {
  console.log('Creating real conversation stream for image:', imageId);
  
  // Use a simple EventEmitter-like pattern
  const stream = {
    listeners: {},
    
    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    },
    
    emit(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(callback => callback(data));
      }
    },
    
    close() {
      this.listeners = {};
    }
  };
  
  // Simulate periodic conversation updates (replace with real WebSocket/SSE later)
  const interval = setInterval(async () => {
    try {
      // Get gallery item
      const gallery = await getGallery();
      const item = gallery.items.find(item => item.imageId === imageId);
      
      if (item) {
        const conversation = await generateConversation({
          imageId,
          imageUrl: item.imageUrl,
          description: item.metadata.description,
          characters: ['lu-xun', 'su-shi', 'vincent-van-gogh']
        });
        
        // Emit new messages
        stream.emit('messages', conversation.messages);
      }
    } catch (error) {
      stream.emit('error', error);
    }
  }, 10000); // Generate new messages every 10 seconds
  
  // Add cleanup method
  stream.close = () => {
    clearInterval(interval);
    stream.listeners = {};
  };
  
  return stream;
}

// Helper Functions

/**
 * Save analysis result to gallery
 * @param {Object} analysisResult - Analysis result to save
 */
async function saveToGallery(analysisResult) {
  try {
    const storedItems = localStorage.getItem(GALLERY_STORAGE_KEY);
    const items = storedItems ? JSON.parse(storedItems) : [];
    
    // Add new item to beginning of array (most recent first)
    items.unshift({
      ...analysisResult,
      createdAt: new Date().toISOString()
    });
    
    // Keep only last 100 items to avoid storage overflow
    const limitedItems = items.slice(0, 100);
    
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(limitedItems));
    console.log('Saved to gallery:', analysisResult.imageId);
  } catch (error) {
    console.error('Failed to save to gallery:', error);
  }
}

/**
 * Generate metadata name based on category
 * @param {number} categoryNumber - Category number (1-7)
 * @returns {string} Generated name
 */
function generateMetadataName(categoryNumber) {
  const names = {
    1: ["Ming Dynasty Vase", "Tang Sancai Horse", "Han Dynasty Jade", "Qing Blue Bowl", "Song Celadon Jar"],
    2: ["Roman Helmet", "Medieval Goblet", "Baroque Candleholder", "Renaissance Medal", "Gothic Carving"],
    3: ["Modern Design Item", "Contemporary Object", "Designer Piece", "Tech Gadget", "Modern Artifact"],
    4: ["Beloved Pet", "Furry Friend", "Animal Companion", "Pet Portrait", "Cute Companion"],
    5: ["Portrait Study", "Human Figure", "Person Portrait", "Character Study", "Individual Portrait"],
    6: ["Chinese Landscape", "Ink Painting", "Calligraphy Work", "Traditional Art", "Brush Painting"],
    7: ["European Painting", "Western Art", "Classical Work", "Art Study", "Traditional Painting"]
  };
  
  const categoryNames = names[categoryNumber] || names[3];
  return categoryNames[Math.floor(Math.random() * categoryNames.length)];
}

/**
 * Get conversation history for an image
 * @param {string} imageId - Image ID
 * @returns {Array} Previous messages
 */
function getConversationHistory(imageId) {
  try {
    const stored = localStorage.getItem(CONVERSATION_STORAGE_KEY);
    const conversations = stored ? JSON.parse(stored) : {};
    return conversations[imageId] || [];
  } catch (error) {
    console.error('Failed to get conversation history:', error);
    return [];
  }
}

/**
 * Save conversation messages
 * @param {string} imageId - Image ID
 * @param {Array} messages - Messages to save
 */
function saveConversationMessages(imageId, messages) {
  try {
    const stored = localStorage.getItem(CONVERSATION_STORAGE_KEY);
    const conversations = stored ? JSON.parse(stored) : {};
    
    if (!conversations[imageId]) {
      conversations[imageId] = [];
    }
    
    conversations[imageId].push(...messages);
    
    // Keep only last 50 messages per conversation
    conversations[imageId] = conversations[imageId].slice(-50);
    
    localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save conversation messages:', error);
  }
}

// Additional interface methods (can be implemented as needed)

export async function composeImage(imageId, options) {
  // TODO: Implement real image composition
  console.log('Image composition not yet implemented');
  return null;
}

export async function getBackgrounds() {
  return backgroundFrameMappings;
}

export async function getBackgroundById(backgroundId) {
  // Find background by ID in mappings
  for (const [category, backgrounds] of Object.entries(backgroundFrameMappings)) {
    const background = backgrounds.find(bg => bg.id === backgroundId);
    if (background) {
      return { ...background, category };
    }
  }
  return null;
}

export async function getMusicTracks() {
  // TODO: Implement music track retrieval
  return {};
}

export async function getRandomMusic(category) {
  // TODO: Implement random music selection
  return null;
}

export async function getCharacters() {
  return CHARACTERS;
}

// Error Classes

export class ImageAnalysisError extends Error {
  constructor(code, message, originalError = null) {
    super(message);
    this.name = 'ImageAnalysisError';
    this.code = code;
    this.originalError = originalError;
  }
}

export class ConversationError extends Error {
  constructor(code, message, originalError = null) {
    super(message);
    this.name = 'ConversationError';
    this.code = code;
    this.originalError = originalError;
  }
}

// Export default for convenience
export default {
  analyzeImage,
  getGallery,
  generateConversation,
  createConversationStream,
  composeImage,
  getBackgrounds,
  getBackgroundById,
  getMusicTracks,
  getRandomMusic,
  getCharacters
};
