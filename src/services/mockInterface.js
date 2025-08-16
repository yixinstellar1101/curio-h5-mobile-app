// Mock API service for Curio Mobile H5 Application
// This file provides mock implementations of all interface methods defined in api-doc.md

import backgroundFrameMappings from '../../background_frames_mappings.json';

// Category to background style mapping as per spec.md
const CATEGORY_MAPPING = {
  1: "Chinese",        // Chinese Historical Artifact
  6: "Chinese",        // Chinese Painting / Calligraphy
  3: "Modern",         // Modern Product (统一修改为Modern)
  2: "European",       // European Historical Artifact
  4: "European",       // Pet
  5: "European",       // Portrait / People
  7: "European"        // European Painting / Calligraphy
};

// Mock image classification categories with detailed metadata
const CLASSIFICATION_CATEGORIES = [
  {
    number: 1,
    label: "Chinese Historical Artifact",
    description: "Ancient Chinese cultural or ceremonial objects. Often made of porcelain, jade, bronze, or lacquer.",
    keywords: ["porcelain", "jade", "bronze", "dragon", "calligraphy", "ceramics", "ancient", "dynasty"]
  },
  {
    number: 2,
    label: "European Historical Artifact",
    description: "Pre-modern European items with historical or aristocratic value.",
    keywords: ["armor", "medieval", "stone", "heraldic", "renaissance", "baroque", "roman", "gothic"]
  },
  {
    number: 3,
    label: "Modern Product",
    description: "Mass-produced or contemporary consumer goods from any culture.",
    keywords: ["electronics", "gadget", "modern", "plastic", "design", "consumer", "technology", "contemporary"]
  },
  {
    number: 4,
    label: "Pet",
    description: "Photographs of domesticated animals, typically taken by pet owners.",
    keywords: ["cat", "dog", "pet", "animal", "fur", "cute", "domestic", "companion"]
  },
  {
    number: 5,
    label: "Portrait / People",
    description: "Photographs, paintings, or drawings that primarily depict a human face or body.",
    keywords: ["person", "face", "portrait", "human", "people", "photo", "painting", "figure"]
  },
  {
    number: 6,
    label: "Chinese Painting / Calligraphy",
    description: "Traditional Chinese ink or brush art on scrolls or paper.",
    keywords: ["ink", "brush", "scroll", "calligraphy", "landscape", "traditional", "chinese art", "painting"]
  },
  {
    number: 7,
    label: "European Painting / Calligraphy",
    description: "Western-style figurative or calligraphic artworks.",
    keywords: ["oil painting", "canvas", "western art", "renaissance", "impressionist", "european art", "classical"]
  }
];

// Mock character information
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

// Helper function to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to generate realistic metadata names
const generateMetadataName = (category) => {
  const names = {
    1: ["Ming Dynasty Celestial Vase", "Tang Sancai Horse", "Han Dynasty Jade Bi", "Qing Blue and White Bowl", "Song Dynasty Celadon Jar"],
    2: ["Roman Ceremonial Helmet", "Medieval Silver Goblet", "Baroque Candleholder", "Renaissance Bronze Medal", "Gothic Stone Carving"],
    3: ["AirPods of Delphi", "Modern Ceramic Mug", "Designer Desk Lamp", "Wireless Headphones", "Contemporary Figurine"],
    4: ["Sir Whiskers, Duke of Purrington", "Golden Retriever Guardian", "Persian Cat Princess", "Hamster of Happiness", "Loyal Companion"],
    5: ["Portrait of the Unknown Scholar", "Lady in Velvet Dreams", "The Contemplative Figure", "Renaissance Portrait Study", "Mysterious Stranger"],
    6: ["Landscape of Distant Mountains", "Bamboo in Morning Mist", "Calligraphy of Ancient Wisdom", "Birds in Autumn Wind", "Ink Wash Meditation"],
    7: ["Portrait of a Noble Lady", "Impressionist Garden Study", "Still Life with Fruits", "Classical Landscape", "European Master's Work"]
  };
  
  const categoryNames = names[category] || names[3];
  return categoryNames[Math.floor(Math.random() * categoryNames.length)];
};

// Helper function to generate descriptions
const generateDescription = (category, name) => {
  const descriptions = {
    1: `This exquisite Chinese artifact showcases the masterful craftsmanship of ancient dynasties. ${name} represents the pinnacle of traditional Chinese artistry, with intricate details that whisper tales of imperial courts and ceremonial grandeur.`,
    2: `A remarkable European historical piece that embodies the elegance and sophistication of bygone eras. ${name} reflects the artistic achievements of European civilization, crafted with meticulous attention to detail and cultural significance.`,
    3: `${name} represents modern design philosophy, blending functionality with contemporary aesthetics. This piece exemplifies the innovation and creativity of modern manufacturing, designed to enhance daily life with style and efficiency.`,
    4: `Meet ${name}, a beloved companion who brings joy and warmth to every moment. This charming pet captures hearts with natural grace and playful spirit, reminding us of the simple pleasures in life.`,
    5: `${name} captures the essence of humanity in this compelling portrait. The subject's expression tells a story of life, dreams, and experiences, frozen in time through the artist's skillful interpretation.`,
    6: `${name} embodies the philosophical depth of Chinese artistic tradition. Created with ink and brush on silk, this work reflects the harmony between nature and human spirit that defines classical Chinese art.`,
    7: `${name} showcases the technical mastery and emotional depth of European artistic tradition. This work demonstrates the artist's ability to capture both physical beauty and psychological complexity through masterful technique.`
  };
  
  return descriptions[category] || descriptions[3];
};

/**
 * Mock implementation of analyzeImage interface
 * Simulates image analysis, classification, and composite generation
 */
export const analyzeImage = async (imageInput, requestId = null) => {
  console.log('=== MOCK ANALYZE IMAGE START ===');
  console.log('Processing image...');
  
  // Simulate API processing delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
  
  const imageId = generateId();
  
  // Simulate random classification (in real implementation, this would be AI-driven)
  const randomCategory = CLASSIFICATION_CATEGORIES[Math.floor(Math.random() * CLASSIFICATION_CATEGORIES.length)];
  const confidence = 0.85 + Math.random() * 0.14; // 0.85-0.99
  
  console.log('Selected random category:', randomCategory);
  
  // Get background style from category mapping
  const backgroundStyle = CATEGORY_MAPPING[randomCategory.number] || "European";
  console.log('Background style for category', randomCategory.number + ':', backgroundStyle);
  
  // Select random background from the category
  const categoryBackgrounds = Object.entries(backgroundFrameMappings.backgroundFrames)
    .filter(([key, value]) => value.category === backgroundStyle);
  
  console.log('Available backgrounds for', backgroundStyle + ':', categoryBackgrounds.length);
  console.log('Background options:', categoryBackgrounds.map(([key, info]) => key));
  
  if (categoryBackgrounds.length === 0) {
    console.warn('No backgrounds found for category:', backgroundStyle);
    console.log('Available categories in mappings:', 
      [...new Set(Object.values(backgroundFrameMappings.backgroundFrames).map(bg => bg.category))]);
  }
  
  const randomBackgroundEntry = categoryBackgrounds[Math.floor(Math.random() * categoryBackgrounds.length)];
  const [backgroundId, backgroundInfo] = randomBackgroundEntry || [null, null];
  
  console.log('Selected background:', backgroundId, backgroundInfo);
  
  // Generate metadata
  const metadataName = generateMetadataName(randomCategory.number);
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const description = generateDescription(randomCategory.number, metadataName);
  
  // Generate URLs (in real implementation, these would be actual Azure Blob Storage URLs)
  const baseUrl = "https://storage.blob.core.windows.net";
  const imageUrl = `${baseUrl}/images/${imageId}.jpg`;
  const compositeImageUrl = `${baseUrl}/composites/${imageId}-composite.jpg`;
  const backgroundImageUrl = backgroundInfo ? 
    `/src/assets/backgrounds/${backgroundInfo.category}/${backgroundInfo.filename}` :
    `/src/assets/2339a82e4b6020c219c18a48dca73ef3ba006ffe.png`;
  
  const result = {
    imageId,
    imageUrl,
    classification: {
      categoryNumber: randomCategory.number,
      categoryLabel: randomCategory.label,
      confidence: parseFloat(confidence.toFixed(3))
    },
    metadata: {
      name: metadataName,
      timestamp,
      description
    },
    background: {
      category: backgroundStyle,
      imageUrl: backgroundImageUrl,
      boundingBox: backgroundInfo ? backgroundInfo.boundingBox : {
        x: 150, y: 300, width: 200, height: 250
      }
    },
    compositeImageUrl,
    requestId: requestId || generateId()
  };
  
  console.log('=== MOCK ANALYZE IMAGE RESULT ===');
  console.log('Final result:', result);
  console.log('=== MOCK ANALYZE IMAGE END ===');
  
  return result;
};

/**
 * Mock implementation of getGallery interface
 */
export const getGallery = async (options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate mock gallery items
  const totalCount = 15;
  const items = [];
  
  for (let i = offset; i < Math.min(offset + limit, totalCount); i++) {
    const category = CLASSIFICATION_CATEGORIES[i % CLASSIFICATION_CATEGORIES.length];
    const imageId = generateId();
    const metadataName = generateMetadataName(category.number);
    
    items.push({
      imageId,
      name: metadataName,
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
      description: generateDescription(category.number, metadataName).slice(0, 60) + "...",
      thumbnailUrl: `https://storage.blob.core.windows.net/thumbnails/${imageId}.jpg`,
      compositeImageUrl: `https://storage.blob.core.windows.net/composites/${imageId}-composite.jpg`,
      categoryNumber: category.number,
      categoryLabel: category.label
    });
  }
  
  return {
    items,
    totalCount
  };
};

/**
 * Mock implementation of generateConversation interface
 */
export const generateConversation = async ({
  imageId,
  conversationHistory = [],
  userMessage,
  generateNewLoop = true
}) => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const conversationId = generateId();
  const responses = [];
  
  // Generate character responses based on context
  const topics = [
    "artistic technique", "historical significance", "cultural context", 
    "emotional expression", "craftsmanship", "symbolic meaning", "aesthetic beauty"
  ];
  
  const topic = topics[Math.floor(Math.random() * topics.length)];
  
  // Lu Xun's response
  responses.push({
    speaker: "Lu Xun",
    text: `The ${topic} reveals society's values—each detail a mirror of its time and culture.`,
    timestamp: new Date().toISOString()
  });
  
  // Su Shi's response
  responses.push({
    speaker: "Su Shi",
    text: `Like moonlight on water, this art flows between past and present gracefully, speaking of eternal beauty.`,
    timestamp: new Date(Date.now() + 1000).toISOString()
  });
  
  // Vincent van Gogh's response
  responses.push({
    speaker: "Vincent van Gogh",
    text: `The colors here whirl like starlight, each brushstroke singing to the heart's deepest emotions.`,
    timestamp: new Date(Date.now() + 2000).toISOString()
  });
  
  return {
    responses,
    conversationId
  };
};

/**
 * Mock implementation of composeImage interface
 */
export const composeImage = async (imageId, { backgroundCategory, backgroundId, customBoundingBox }) => {
  // Simulate composition processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Find the background info
  const backgroundInfo = backgroundFrameMappings.backgroundFrames[backgroundId];
  
  if (!backgroundInfo) {
    throw new Error(`Background with ID ${backgroundId} not found`);
  }
  
  const compositeImageUrl = `https://storage.blob.core.windows.net/composites/${imageId}-composite.jpg`;
  const originalImageUrl = `https://storage.blob.core.windows.net/images/${imageId}.jpg`;
  
  return {
    compositeImageUrl,
    originalImageUrl,
    backgroundUsed: {
      id: backgroundId,
      category: backgroundInfo.category,
      imageUrl: `/src/assets/backgrounds/${backgroundInfo.category}/${backgroundInfo.filename}`
    },
    boundingBox: customBoundingBox || backgroundInfo.boundingBox
  };
};

/**
 * Mock implementation of getBackgrounds interface
 */
export const getBackgrounds = async (options = {}) => {
  const { category, limit = 20, offset = 0 } = options;
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  let backgrounds = Object.entries(backgroundFrameMappings.backgroundFrames).map(([id, info]) => ({
    id,
    category: info.category,
    name: `${info.category} Frame ${id.split('_').pop()}`,
    imageUrl: `/src/assets/backgrounds/${info.category}/${info.filename}`,
    boundingBox: info.boundingBox,
    tags: [info.category.toLowerCase(), "frame", "traditional"]
  }));
  
  // Filter by category if specified
  if (category) {
    backgrounds = backgrounds.filter(bg => bg.category === category);
  }
  
  // Apply pagination
  const paginatedBackgrounds = backgrounds.slice(offset, offset + limit);
  
  return {
    backgrounds: paginatedBackgrounds,
    totalCount: backgrounds.length,
    categories: backgroundFrameMappings.metadata.categories
  };
};

/**
 * Mock implementation of getBackgroundById interface
 */
export const getBackgroundById = async (backgroundId) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const backgroundInfo = backgroundFrameMappings.backgroundFrames[backgroundId];
  
  if (!backgroundInfo) {
    throw new Error(`Background with ID ${backgroundId} not found`);
  }
  
  return {
    id: backgroundId,
    category: backgroundInfo.category,
    name: `${backgroundInfo.category} Frame ${backgroundId.split('_').pop()}`,
    imageUrl: `/src/assets/backgrounds/${backgroundInfo.category}/${backgroundInfo.filename}`,
    boundingBox: backgroundInfo.boundingBox,
    tags: [backgroundInfo.category.toLowerCase(), "frame", "traditional"],
    createdAt: "2025-08-13T12:00:00Z",
    updatedAt: "2025-08-13T12:00:00Z"
  };
};

/**
 * Mock implementation of getMusicTracks interface
 */
export const getMusicTracks = async (options = {}) => {
  const { category, duration } = options;
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const musicTracks = [
    // Chinese music
    { id: "chinese-ambient-01", category: "Chinese", name: "Ancient Echoes", duration: 180, tags: ["ambient", "traditional", "peaceful"] },
    { id: "chinese-classical-01", category: "Chinese", name: "Jade Garden", duration: 240, tags: ["classical", "meditative", "serene"] },
    { id: "chinese-folk-01", category: "Chinese", name: "Mountain Stream", duration: 200, tags: ["folk", "nature", "flowing"] },
    
    // European music
    { id: "european-classical-01", category: "European", name: "Chamber Elegance", duration: 300, tags: ["classical", "sophisticated", "elegant"] },
    { id: "european-baroque-01", category: "European", name: "Courtly Dance", duration: 180, tags: ["baroque", "festive", "regal"] },
    { id: "european-romantic-01", category: "European", name: "Moonlight Sonata", duration: 360, tags: ["romantic", "emotional", "dramatic"] },
    
    // Modern music
    { id: "modern-ambient-01", category: "Modern", name: "Digital Dreams", duration: 240, tags: ["ambient", "electronic", "modern"] },
    { id: "modern-lofi-01", category: "Modern", name: "Urban Chill", duration: 180, tags: ["lofi", "relaxing", "contemporary"] },
    { id: "modern-minimal-01", category: "Modern", name: "Clean Lines", duration: 200, tags: ["minimal", "focus", "productivity"] }
  ];
  
  let filteredTracks = musicTracks;
  
  if (category) {
    filteredTracks = musicTracks.filter(track => track.category === category);
  }
  
  if (duration) {
    const durationRanges = {
      short: [0, 180],
      medium: [181, 300],
      long: [301, Infinity]
    };
    const [min, max] = durationRanges[duration] || [0, Infinity];
    filteredTracks = filteredTracks.filter(track => track.duration >= min && track.duration <= max);
  }
  
  // Add full URLs and audio properties
  const tracks = filteredTracks.map(track => ({
    ...track,
    audioUrl: `https://storage.blob.core.windows.net/music/${track.id}.mp3`,
    volume: 0.6,
    loop: true
  }));
  
  return {
    tracks,
    totalCount: tracks.length,
    categories: {
      "Chinese": musicTracks.filter(t => t.category === "Chinese").length,
      "European": musicTracks.filter(t => t.category === "European").length,
      "Modern": musicTracks.filter(t => t.category === "Modern").length
    }
  };
};

/**
 * Mock implementation of getRandomMusic interface
 */
export const getRandomMusic = async (category) => {
  const musicData = await getMusicTracks({ category });
  
  if (musicData.tracks.length === 0) {
    throw new Error(`No music tracks found for category: ${category}`);
  }
  
  const randomTrack = musicData.tracks[Math.floor(Math.random() * musicData.tracks.length)];
  return randomTrack;
};

/**
 * Mock implementation of getCharacters interface
 */
export const getCharacters = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    characters: CHARACTERS
  };
};

/**
 * Mock implementation of createConversationStream interface
 */
export const createConversationStream = (imageId, options = {}) => {
  const { autoLoop = false } = options;
  
  // In a real implementation, this would create a WebSocket or EventSource connection
  // For now, we'll return a simple EventEmitter-like object
  const events = {};
  const stream = {
    on: (event, callback) => {
      if (!events[event]) events[event] = [];
      events[event].push(callback);
    },
    emit: (event, data) => {
      if (events[event]) {
        events[event].forEach(callback => callback(data));
      }
    },
    off: (event, callback) => {
      if (events[event]) {
        const index = events[event].indexOf(callback);
        if (index > -1) events[event].splice(index, 1);
      }
    }
  };
  
  // Simulate auto-loop if enabled
  if (autoLoop) {
    const autoLoopInterval = setInterval(async () => {
      try {
        const conversation = await generateConversation({
          imageId,
          generateNewLoop: true
        });
        
        stream.emit('auto_loop', {
          responses: conversation.responses,
          nextLoopIn: 5000 // 5 seconds
        });
      } catch (error) {
        stream.emit('error', error);
      }
    }, 5000);
    
    // Add method to stop auto-loop
    stream.stopAutoLoop = () => clearInterval(autoLoopInterval);
  }
  
  return stream;
};

// Custom error class for image analysis errors
export class ImageAnalysisError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ImageAnalysisError';
    this.code = code;
  }
}

// Export all mock implementations
export default {
  analyzeImage,
  getGallery,
  generateConversation,
  composeImage,
  getBackgrounds,
  getBackgroundById,
  getMusicTracks,
  getRandomMusic,
  getCharacters,
  createConversationStream,
  ImageAnalysisError
};
