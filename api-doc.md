# Curio Mobile Backend Interface Documentation

## Overview
This document defines the JavaScript interface for the Curio Mobile H5 application backend services. The interface provides methods for image processing, AI-powered classification, metadata generation, and real-time conversation management. The system integrates Azure Blob Storage and Azure OpenAI for processing.

**Interface File**: `interface.js`

## Interface Methods Summary

| Method | Description | Return Type |
|--------|-------------|-------------|
| `analyzeImage()` | Upload & classify image | `Promise<AnalysisResult>` |
| `getGallery()` | Get gallery items | `Promise<GalleryData>` |
| `generateConversation()` | Generate AI conversation | `Promise<ConversationResponse>` |
| `composeImage()` | Compose image with background | `Promise<CompositeResult>` |
| `getBackgrounds()` | Get background frames | `Promise<BackgroundData>` |
| `getBackgroundById()` | Get specific background | `Promise<BackgroundFrame>` |
| `getMusicTracks()` | Get music tracks | `Promise<MusicData>` |
| `getRandomMusic()` | Get random music by category | `Promise<MusicTrack>` |
| `getCharacters()` | Get character information | `Promise<CharacterData>` |
| `createConversationStream()` | Create real-time conversation stream | `EventEmitter` |

---

## Interface Definition

### 1. Image Analysis Interface
```javascript
/**
 * Analyzes an uploaded image using AI classification
 * @param {File|string} imageInput - Image file or image URL
 * @param {string} [requestId] - Optional correlation ID
 * @returns {Promise<AnalysisResult>}
 */
async function analyzeImage(imageInput, requestId) {
  // Implementation handles:
  // - Image upload to Azure Blob Storage
  // - AI classification using Azure OpenAI
  // - Metadata generation
  // - Background selection and composition
  // - Gallery update
}
```

**Parameters:**
- `imageInput`: File object (jpg|jpeg|png|webp, ≤5MB) or image URL string
- `requestId`: Optional correlation ID for tracking

**Returns:** `Promise<AnalysisResult>`
```javascript
{
  imageId: "uuid-generated-id",
  imageUrl: "https://storage.blob.core.windows.net/images/uuid.jpg",
  classification: {
    categoryNumber: 1,
    categoryLabel: "Chinese Historical Artifact",
    confidence: 0.95
  },
  metadata: {
    name: "Ming Dynasty Celestial Vase",
    timestamp: "2025/08/13 14:30",
    description: "This porcelain masterpiece showcases the intricate blue-and-white glazework..."
  },
  background: {
    category: "Chinese",
    imageUrl: "https://storage.blob.core.windows.net/backgrounds/chinese-frame-01.jpg",
    boundingBox: {
      x: 556,
      y: 1222,
      width: 376,
      height: 556
    }
  },
  compositeImageUrl: "https://storage.blob.core.windows.net/composites/uuid-composite.jpg",
  requestId: "optional-id"
}
```

**Error Handling:**
```javascript
// Throws specific error types
throw new ImageAnalysisError('INVALID_FILE_FORMAT', 'Unsupported image format');
throw new ImageAnalysisError('FILE_TOO_LARGE', 'File exceeds 5MB limit');
throw new ImageAnalysisError('CLASSIFICATION_FAILED', 'Unable to classify image');
```

---

### 2. Gallery Management Interface
```javascript
/**
 * Retrieves all gallery items for the user
 * @param {Object} [options] - Query options
 * @param {number} [options.limit] - Number of items to return
 * @param {number} [options.offset] - Pagination offset
 * @returns {Promise<GalleryData>}
 */
async function getGallery(options = {}) {
  // Implementation handles gallery item retrieval
}
```

**Returns:** `Promise<GalleryData>`
```javascript
{
  items: [
    {
      imageId: "uuid-1",
      name: "Ming Dynasty Celestial Vase",
      timestamp: "2025/08/13 14:30",
      description: "This porcelain masterpiece...",
      thumbnailUrl: "https://storage.blob.core.windows.net/thumbnails/uuid-1.jpg",
      compositeImageUrl: "https://storage.blob.core.windows.net/composites/uuid-1-composite.jpg",
      categoryNumber: 1,
      categoryLabel: "Chinese Historical Artifact"
    }
  ],
  totalCount: 15
}
```

---

### 3. Conversation Generation Interface
```javascript
/**
 * Generates AI conversation responses from three characters
 * @param {Object} params - Conversation parameters
 * @param {string} params.imageId - UUID of analyzed image
 * @param {Array} [params.conversationHistory] - Previous conversation turns
 * @param {string} [params.userMessage] - User's message
 * @param {boolean} [params.generateNewLoop] - Whether to generate new conversation loop
 * @returns {Promise<ConversationResponse>}
 */
async function generateConversation({
  imageId,
  conversationHistory = [],
  userMessage,
  generateNewLoop = true
}) {
  // Implementation handles AI character response generation
}
```

**Returns:** `Promise<ConversationResponse>`
```javascript
{
  responses: [
    {
      speaker: "Lu Xun",
      text: "The brush strokes reveal society's values—each line a mirror of its time.",
      timestamp: "2025-08-13T14:30:05Z"
    },
    {
      speaker: "Su Shi", 
      text: "Like moonlight on water, this art flows between past and present gracefully.",
      timestamp: "2025-08-13T14:30:06Z"
    },
    {
      speaker: "Vincent van Gogh",
      text: "The colors here whirl like the night sky, speaking softly to the heart's sorrows.",
      timestamp: "2025-08-13T14:30:07Z"
    }
  ],
  conversationId: "conv-uuid"
}
```

### 3.1. Real-time Conversation Stream Interface
```javascript
/**
 * Creates a real-time conversation stream for live room updates
 * @param {string} imageId - UUID of the analyzed image
 * @param {Object} [options] - Stream options
 * @param {boolean} [options.autoLoop] - Enable automatic conversation every 5 seconds
 * @returns {EventEmitter} - Stream for real-time events
 */
function createConversationStream(imageId, options = {}) {
  const stream = new EventEmitter();
  
  // Event types:
  // - 'character_responses': New character messages
  // - 'auto_loop': Automatic conversation loop
  // - 'error': Connection or processing errors
  
  return stream;
}
```

**Stream Events:**
```javascript
// Listen for character responses
stream.on('character_responses', (data) => {
  // data.responses: Array of character messages
  // data.conversationId: Conversation session ID
});

// Listen for auto-generated loops
stream.on('auto_loop', (data) => {
  // data.responses: Array of character messages
  // data.nextLoopIn: Milliseconds until next auto loop
});

// Send user message
stream.emit('user_message', {
  message: "What is the historical significance of this piece?",
  timestamp: new Date().toISOString()
});
```

---

### 4. Image Composition Interface
```javascript
/**
 * Composes uploaded image with selected background frame
 * @param {string} imageId - UUID of the uploaded image
 * @param {Object} params - Composition parameters
 * @param {string} params.backgroundCategory - Background category (Chinese, European, Modern Product)
 * @param {string} params.backgroundId - Specific background frame ID
 * @param {Object} [params.customBoundingBox] - Custom bounding box override
 * @returns {Promise<CompositeResult>}
 */
async function composeImage(imageId, {
  backgroundCategory,
  backgroundId,
  customBoundingBox
}) {
  // Implementation handles image composition with background frames
}
```

**Returns:** `Promise<CompositeResult>`
```javascript
{
  compositeImageUrl: "https://storage.blob.core.windows.net/composites/uuid-composite.jpg",
  originalImageUrl: "https://storage.blob.core.windows.net/images/uuid.jpg",
  backgroundUsed: {
    id: "chinese-frame-01",
    category: "Chinese",
    imageUrl: "https://storage.blob.core.windows.net/backgrounds/chinese-frame-01.jpg"
  },
  boundingBox: {
    x: 556,
    y: 1222,
    width: 376,
    height: 556
  }
}
```

---

### 5. Background Resources Interface
```javascript
/**
 * Retrieves available background frames with bounding box data
 * @param {Object} [options] - Query options
 * @param {string} [options.category] - Filter by category (Chinese, European, Modern Product)
 * @param {number} [options.limit] - Number of results (default: 20)
 * @param {number} [options.offset] - Pagination offset (default: 0)
 * @returns {Promise<BackgroundData>}
 */
async function getBackgrounds(options = {}) {
  // Implementation handles background frame retrieval
}

/**
 * Get specific background frame by ID
 * @param {string} backgroundId - Background frame ID
 * @returns {Promise<BackgroundFrame>}
 */
async function getBackgroundById(backgroundId) {
  // Implementation handles single background frame retrieval
}
```

**getBackgrounds() Returns:** `Promise<BackgroundData>`
```javascript
{
  backgrounds: [
    {
      id: "chinese-frame-01",
      category: "Chinese",
      name: "Traditional Chinese Scroll Frame",
      imageUrl: "https://storage.blob.core.windows.net/backgrounds/chinese-frame-01.jpg",
      boundingBox: {
        x: 556,
        y: 1222,
        width: 376,
        height: 556
      },
      tags: ["traditional", "scroll", "calligraphy"]
    }
  ],
  totalCount: 45,
  categories: {
    "Chinese": 15,
    "European": 18, 
    "Modern Product": 12
  }
}
```

**getBackgroundById() Returns:** `Promise<BackgroundFrame>`
```javascript
{
  id: "chinese-frame-01",
  category: "Chinese",
  name: "Traditional Chinese Scroll Frame",
  imageUrl: "https://storage.blob.core.windows.net/backgrounds/chinese-frame-01.jpg",
  boundingBox: {
    x: 556,
    y: 1222,
    width: 376,
    height: 556
  },
  tags: ["traditional", "scroll", "calligraphy"],
  createdAt: "2025-08-13T12:00:00Z",
  updatedAt: "2025-08-13T12:00:00Z"
}
```

---

### 6. Music Resources Interface
```javascript
/**
 * Retrieves background music tracks organized by category
 * @param {Object} [options] - Query options
 * @param {string} [options.category] - Filter by category (Chinese, European, Modern Product)
 * @param {string} [options.duration] - Filter by duration (short, medium, long)
 * @returns {Promise<MusicData>}
 */
async function getMusicTracks(options = {}) {
  // Implementation handles music track retrieval
}

/**
 * Returns randomly selected music track for given category
 * @param {string} category - Music category (Chinese, European, Modern Product)
 * @returns {Promise<MusicTrack>}
 */
async function getRandomMusic(category) {
  // Implementation handles random music selection
}
```

**getMusicTracks() Returns:** `Promise<MusicData>`
```javascript
{
  tracks: [
    {
      id: "chinese-ambient-01",
      category: "Chinese",
      name: "Ancient Echoes",
      audioUrl: "https://storage.blob.core.windows.net/music/chinese-ambient-01.mp3",
      duration: 180,
      volume: 0.6,
      loop: true,
      tags: ["ambient", "traditional", "peaceful"]
    }
  ],
  totalCount: 21,
  categories: {
    "Chinese": 7,
    "European": 8,
    "Modern Product": 6
  }
}
```

**getRandomMusic() Returns:** `Promise<MusicTrack>`
```javascript
{
  id: "chinese-ambient-01",
  category: "Chinese", 
  name: "Ancient Echoes",
  audioUrl: "https://storage.blob.core.windows.net/music/chinese-ambient-01.mp3",
  duration: 180,
  volume: 0.6,
  loop: true
}
```

---

### 7. Character Information Interface
```javascript
/**
 * Returns information about available AI characters
 * @returns {Promise<CharacterData>}
 */
async function getCharacters() {
  // Implementation handles character information retrieval
}
```

**Returns:** `Promise<CharacterData>`
```javascript
{
  characters: [
    {
      id: "lu-xun",
      name: "Lu Xun",
      openingLine: "The pen is but a scalpel; it cuts through the illness beneath the skin of society.",
      tags: ["#SharpSatirist", "#ModernChineseLiterature", "#SocialCritic"],
      identity: "Pioneer of modern Chinese literature, known for sharp social commentary and reformist spirit.",
      artisticTraits: "Concise, metaphor-rich prose with a tone of irony and compassion.",
      perspective: "Analyzes cultural artifacts as reflections of social conditions, drawing parallels between history and present-day struggles.",
      avatarUrl: "https://storage.blob.core.windows.net/avatars/lu-xun.jpg"
    },
    {
      id: "su-shi",
      name: "Su Shi",
      openingLine: "The moonlight upon this artifact would inspire verses flowing like the river beyond my window.",
      tags: ["#SongDynastyPoet", "#Calligrapher", "#FreeSpirit"],
      identity: "Master poet and calligrapher of the Northern Song dynasty, famed for versatility and free-spirited style.",
      artisticTraits: "Lyrical, philosophical, blending personal sentiment with natural imagery.",
      perspective: "Romantic and reflective; appreciates artistry, craftsmanship, and the continuity of culture.",
      avatarUrl: "https://storage.blob.core.windows.net/avatars/su-shi.jpg"
    },
    {
      id: "vincent-van-gogh",
      name: "Vincent van Gogh", 
      openingLine: "I painted not what I saw, but what I felt in that night of madness.",
      tags: ["#LonelyGenius", "#PostImpressionist", "#NightOfTheMind"],
      identity: "19th-century Dutch painter, creator of The Starry Night.",
      artisticTraits: "Frequently quoted from personal letters; deeply sensitive to the emotional power of color.",
      perspective: "Interprets the swirling sky, cypress trees, and dreamlike village through a lens of self-healing.",
      avatarUrl: "https://storage.blob.core.windows.net/avatars/vincent-van-gogh.jpg"
    }
  ]
}
```

---

## Classification System

### Categories
The AI classification system categorizes images into 7 distinct categories:

1. **Chinese Historical Artifact** - Ancient Chinese cultural objects (porcelain, jade, bronze)
2. **European Historical Artifact** - Pre-modern European items (armor, goblets, sculptures)  
3. **Modern Product** - Contemporary consumer goods (electronics, household items)
4. **Pet** - Photographs of domesticated animals
5. **Portrait / People** - Human photographs, paintings, drawings
6. **Chinese Painting / Calligraphy** - Traditional Chinese ink art, scrolls
7. **European Painting / Calligraphy** - Western-style artworks, oil paintings

### Background Mapping
Categories map to background themes:
- **Chinese**: Categories 1, 6 → Chinese traditional backgrounds
- **European**: Categories 2, 4, 5, 7 → European classical backgrounds  
- **Modern Product**: Category 3 → Contemporary/minimalist backgrounds

---

## Data Flow Architecture

### 1. Image Upload & Processing Flow
```
Client Upload → Backend API → Azure Blob Storage
                     ↓
               Azure OpenAI (Classification)
                     ↓
               Category → Background Mapping
                     ↓
               Bounding Box Retrieval (Local Storage)
                     ↓
               Image Composition (Compositor Script)
                     ↓
               Metadata Generation → Gallery Update
```

### 2. Live Room Conversation Flow  
```
User Input/Auto Timer (5s) → ConversationManager
                                    ↓
                            Azure OpenAI (Character Prompt)
                                    ↓
                            3 Character Responses Generated
                                    ↓
                            WebSocket Broadcast → Client UI
```

### 3. Background & Music Preprocessing Flow
```
Background Images → Bounding Box Extraction Tool
                           ↓
                   Local Storage Mapping
                           ↓
                   Category-based Organization
                           
Music Files → Category Organization → Random Selection Pool
```

### 3. Storage Structure
```
Azure Blob Storage:
├── /images/           # Original uploaded images
├── /backgrounds/      # Background frames 
├── /composites/       # Final composed images  
├── /thumbnails/       # Gallery thumbnails
├── /music/           # Background music tracks
│   ├── /chinese/     # Chinese traditional music
│   ├── /european/    # European classical music
│   └── /modern/      # Modern/contemporary tracks
└── /avatars/         # Character profile images

Local Storage:
├── /mappings/        # Background bounding box mappings
│   ├── chinese_frames.json
│   ├── european_frames.json
│   └── modern_frames.json
└── /cache/          # Temporary processing files
```

### 4. Real-time Communication
```
WebSocket Connections:
- /ws/conversation/{imageId} - Live room chat
- /ws/gallery/updates - Gallery item notifications  
- /ws/processing/status - Upload processing status

Auto-generated Conversations:
- Triggered every 5 seconds OR user input
- ConversationManager maintains session state
- Character responses maintain conversation context
```

---

## Error Handling

### Error Types and Classes
```javascript
// Base error class for all interface errors
class CurioInterfaceError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Specific error classes
class ImageAnalysisError extends CurioInterfaceError {}
class ConversationError extends CurioInterfaceError {}
class CompositionError extends CurioInterfaceError {}
class BackgroundError extends CurioInterfaceError {}
class MusicError extends CurioInterfaceError {}
class StreamError extends CurioInterfaceError {}
```

### Common Error Codes
```javascript
// Image Analysis Errors
throw new ImageAnalysisError('INVALID_FILE_FORMAT', 'Unsupported image format');
throw new ImageAnalysisError('FILE_TOO_LARGE', 'File exceeds 5MB limit');
throw new ImageAnalysisError('AZURE_STORAGE_ERROR', 'Blob storage unavailable');
throw new ImageAnalysisError('AZURE_OPENAI_ERROR', 'AI service unavailable');
throw new ImageAnalysisError('CLASSIFICATION_FAILED', 'Unable to determine category');

// Conversation Errors
throw new ConversationError('CONVERSATION_TIMEOUT', 'Character response generation timed out');
throw new ConversationError('INVALID_IMAGE_ID', 'Image not found for conversation context');
throw new ConversationError('CHARACTER_UNAVAILABLE', 'One or more characters are unavailable');

// Composition Errors
throw new CompositionError('COMPOSITION_FAILED', 'Image composition processing error');
throw new CompositionError('BACKGROUND_NOT_FOUND', 'Requested background frame not available');
throw new CompositionError('BOUNDING_BOX_ERROR', 'Invalid or missing bounding box data');

// Stream Errors
throw new StreamError('STREAM_CONNECTION_FAILED', 'Real-time connection error');
throw new StreamError('STREAM_TIMEOUT', 'Stream connection timed out');

// Resource Errors
throw new BackgroundError('BACKGROUND_LOAD_FAILED', 'Failed to load background resources');
throw new MusicError('MUSIC_NOT_FOUND', 'Background music track unavailable');
```

### Error Handling Best Practices
```javascript
// Comprehensive error handling wrapper
async function safeInterfaceCall(asyncFunction, fallbackValue = null) {
  try {
    return await asyncFunction();
  } catch (error) {
    console.error(`Interface call failed: ${error.code}`, error.message);
    
    // Log error details for debugging
    if (error.details) {
      console.error('Error details:', error.details);
    }
    
    // Return fallback value or re-throw based on error type
    if (error instanceof ImageAnalysisError && error.code === 'CLASSIFICATION_FAILED') {
      // Provide default classification
      return {
        classification: { categoryNumber: 3, categoryLabel: 'Modern Product', confidence: 0.5 },
        ...fallbackValue
      };
    }
    
    throw error; // Re-throw if no fallback handling
  }
}
```

---

## Interface Configuration

### Environment Setup
```javascript
// interface-config.js
export const INTERFACE_CONFIG = {
  // Development environment
  development: {
    azureStorage: {
      accountName: 'curiodevstorageacct',
      containers: {
        images: 'images',
        backgrounds: 'backgrounds', 
        composites: 'composites',
        thumbnails: 'thumbnails',
        music: 'music',
        avatars: 'avatars'
      }
    },
    azureOpenAI: {
      endpoint: 'https://curio-openai-dev.openai.azure.com/',
      apiVersion: '2024-02-15-preview',
      model: 'gpt-4-vision-preview'
    },
    conversation: {
      autoLoopInterval: 5000, // 5 seconds
      maxResponseLength: 20, // words
      contextHistoryLimit: 10, // conversation turns
      streamTimeout: 30000 // 30 seconds
    }
  },
  
  // Production environment
  production: {
    azureStorage: {
      accountName: 'curioprodstorageacct',
      containers: { /* same as dev */ }
    },
    azureOpenAI: {
      endpoint: 'https://curio-openai-prod.openai.azure.com/',
      apiVersion: '2024-02-15-preview',
      model: 'gpt-4-vision-preview'
    },
    conversation: {
      autoLoopInterval: 5000,
      maxResponseLength: 20,
      contextHistoryLimit: 10,
      streamTimeout: 30000
    }
  }
};
```

### Rate Limiting & Performance
```javascript
// Rate limiting configuration
export const RATE_LIMITS = {
  development: {
    imageAnalysis: 100, // per minute
    conversationGeneration: 200, // per minute
    streamConnections: 50 // concurrent
  },
  production: {
    imageAnalysis: 1000, // per hour per user
    conversationGeneration: 2000, // per hour per user  
    streamConnections: 500 // concurrent per server
  }
};

// Performance optimization settings
export const PERFORMANCE_CONFIG = {
  imageProcessing: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    thumbnailSize: { width: 300, height: 300 },
    compressionQuality: 0.8
  },
  caching: {
    backgroundFramesCache: 3600, // 1 hour in seconds
    musicTracksCache: 7200, // 2 hours
    characterDataCache: 86400 // 24 hours
  }
};
```

---

## Usage Examples

### Basic Image Analysis
```javascript
import { analyzeImage } from './interface.js';

// Analyze image file
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

try {
  const result = await analyzeImage(file);
  console.log('Classification:', result.classification.categoryLabel);
  console.log('Composite Image:', result.compositeImageUrl);
} catch (error) {
  console.error('Analysis failed:', error.message);
}
```

### Real-time Conversation
```javascript
import { createConversationStream, generateConversation } from './interface.js';

// Create conversation stream with auto-loop
const stream = createConversationStream('image-uuid-123', { autoLoop: true });

// Listen for character responses
stream.on('character_responses', (data) => {
  data.responses.forEach(response => {
    displayMessage(response.speaker, response.text);
  });
});

// Listen for auto-generated conversations
stream.on('auto_loop', (data) => {
  console.log('Next loop in:', data.nextLoopIn, 'ms');
});

// Send user message
stream.emit('user_message', {
  message: "What makes this artifact historically significant?",
  timestamp: new Date().toISOString()
});

// Generate manual conversation
const conversation = await generateConversation({
  imageId: 'image-uuid-123',
  userMessage: "Tell me about the craftsmanship",
  generateNewLoop: true
});
```

### Gallery and Background Management
```javascript
import { getGallery, getBackgrounds, composeImage } from './interface.js';

// Load gallery items
const gallery = await getGallery({ limit: 10 });
gallery.items.forEach(item => {
  displayGalleryItem(item);
});

// Get backgrounds for specific category
const backgrounds = await getBackgrounds({ category: 'Chinese' });
const randomBackground = backgrounds.backgrounds[
  Math.floor(Math.random() * backgrounds.backgrounds.length)
];

// Compose image with selected background
const composite = await composeImage('image-uuid-123', {
  backgroundCategory: 'Chinese',
  backgroundId: randomBackground.id
});
```

### Music Integration
```javascript
import { getRandomMusic, getMusicTracks } from './interface.js';

// Get random music for category
const music = await getRandomMusic('Chinese');
playBackgroundMusic(music.audioUrl, {
  volume: music.volume,
  loop: music.loop
});

// Browse all music tracks
const allMusic = await getMusicTracks();
const chineseMusic = allMusic.tracks.filter(track => track.category === 'Chinese');
```

### Error Handling Pattern
```javascript
import { analyzeImage, ImageAnalysisError } from './interface.js';

try {
  const result = await analyzeImage(imageFile);
  // Handle success
} catch (error) {
  if (error instanceof ImageAnalysisError) {
    switch (error.code) {
      case 'INVALID_FILE_FORMAT':
        showError('Please upload a valid image file (JPG, PNG, WEBP)');
        break;
      case 'FILE_TOO_LARGE':
        showError('Image must be smaller than 5MB');
        break;
      case 'CLASSIFICATION_FAILED':
        showError('Unable to classify this image. Please try another one.');
        break;
      default:
        showError('An unexpected error occurred');
    }
  } else {
    showError('Network error. Please check your connection.');
  }
}
```

---

## Technical Specifications

### Image Processing Requirements
- **Supported Formats**: JPG, JPEG, PNG, WEBP
- **Maximum File Size**: 5MB per upload
- **Image Composition**: Uses nodejs compositor script for background overlay
- **Bounding Box**: Automatically extracted during background preprocessing
- **Quality Settings**: 
  - Original: Full resolution preserved
  - Thumbnail: 300x300 pixels for gallery display
  - Composite: Background resolution maintained

### Background Frame System
- **Preprocessing Required**: All background images must have bounding box data extracted offline
- **Storage Format**: JSON mapping files in local storage
- **Categories**: 
  - Chinese (15 frames)
  - European (18 frames) 
  - Modern Product (12 frames)
- **Selection Logic**: Random selection from category-matched pool

### AI Classification System
- **Model**: Azure OpenAI (GPT-4 Vision)
- **Response Format**: Single category number (1-7)
- **Processing Time**: ~2-5 seconds per image
- **Confidence Threshold**: Minimum 0.7 for reliable classification
- **Fallback**: Default to category 3 (Modern Product) if classification fails

### Character Conversation Engine
- **Auto-Loop Interval**: 5 seconds (configurable)
- **Response Limit**: 20 words maximum per character
- **Character Order**: Fixed (Lu Xun → Su Shi → Vincent van Gogh)
- **Context Memory**: Maintains last 10 conversation turns
- **WebSocket Timeout**: 30 seconds for idle connections

---

## System Prompts Reference

### Image Classification Prompt
The system uses a specialized prompt to classify images into exactly one of 7 categories based on visual characteristics, cultural context, and artistic style. The AI returns only the category number (1-7) without additional explanation.

### Metadata Generation Prompt  
Creates creative yet historically-informed titles, timestamps, and descriptions for artifacts, blending factual context with engaging storytelling.

### Character Conversation Prompt
Orchestrates real-time discussions between Lu Xun, Su Shi, and Vincent van Gogh, with each character maintaining distinct personality, vocabulary, and perspective while discussing uploaded artifacts.
