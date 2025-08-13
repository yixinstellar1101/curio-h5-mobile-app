## I'd like to implement a backend service, providing functionalities as below:

1. Accepting a image, and do image classification. Image classification is done by a large llm, the prompt for it is at: "backend\api-doc.md". 

## Overview
This specification describes the page flow, feature details, and system interactions of the Curio Mobile H5 page, fully aligned with the architecture diagram. It includes image upload, classification, background & music selection, Azure Blob Storage + Azure OpenAI processing, and AI-driven conversation loops.
Core flow: Users can upload or take a photo, have it classified and placed into a designated gallery scene, where multiple AI agents discuss the image in real time, with the option for the user to join the conversation at any point.

**Interface Integration**: All backend services are accessed through JavaScript interface methods defined in `interface.js` (see api-doc.md).

---

## Preprocessing – Background & Music Assets

### Offline Preparation
1. For **each background image**:
   - Call bounding box extraction tool.
   - Save bounding box data + image asset as a mapping entry in **local storage**.
   - **Interface Call**: Use `getBackgrounds()` to retrieve preprocessed background data

2. Store background music files in category-specific folders.
   - **Interface Call**: Use `getMusicTracks()` to access organized music collections

### Runtime Logic
1. After image classification result from LLM:
   - Fetch matched background based on category mapping.
   - Retrieve bounding box data from preprocessed mapping.
   - **Interface Call**: `composeImage(imageId, { backgroundCategory, backgroundId })`
   - Insert the composed image into canvas.
2. Randomly select one background and one background music track from the matched category pool.
   - **Interface Call**: `getRandomMusic(category)` for background music selection

---

## Page List & Function Details

### SplashAnimationPage
- Two-stage splash animation sequence  
- Stage 1: Delay 2000ms, ease-out 300s  
- Stage 2: Delay 2000ms, ease-out 300s  

---

### HomePage
- Entry button **"Upload an Image"** → Navigate to `ImageUploadPage`  
- Swipe right → Navigate to `GalleryPage`  

---

### GalleryPage
- Display all previously uploaded items with description  
- **Interface Call**: `getGallery({ limit, offset })` to load gallery items
- Horizontal swipe navigation between gallery items  
- Tap an item → Navigate to `LiveRoomPage`  
- New uploads are appended to the end of the gallery list; users swipe right to view the latest item.
---

### ImageUploadPage
- **Choose from Album**
  - Trigger system's native image picker
  - Allow selecting at most 1 image  (`image/jpeg|png|webp`, ≤ 5MB)
  - Return local image file path/URI
  - **Interface Call**: `analyzeImage(file, requestId)` to upload and process

- **Camera**
  - Trigger system's native camera interface
  - Capture one photo
  - **Interface Call**: `analyzeImage(file, requestId)` to upload and process

- **Cancel**
  - Return to `HomePage`
 

---

### CameraCapturePage
- Viewfinder UI for positioning item  
- Capture button → Take photo  
- Option to select from local album  

---

### CameraCapturingPage
- Show capture process animation during photo capture.  

---

### ImageAnalysisPage
1. Upload Phase   
- **Interface Call**: `analyzeImage(file, requestId)` handles complete image processing pipeline
- Upload selected image to **Azure Blob Storage**; receive `(url, key)`.

2. Classification Phase   
- Send `(url, image classification prompt)` to **Azure OpenAI**.   
- LLM classifies into 1 of 7 categories (see Image Classification System Prompt below).

3. Background & Music Selection   
- Map category → background music style & background image frame (Chinese / European / Modern Product)
- **Interface Call**: `getRandomMusic(category)` to select background music
- **Interface Call**: `composeImage(imageId, { backgroundCategory, backgroundId })` for image composition
- Randomly select one background image and one background music track from the mapped pool.

4. Metadata Generation   
- **Interface Integration**: All metadata (name, timestamp, description) returned by `analyzeImage()`   
- Use Metadata Generation Prompt to create: Name, Timestamp, Description. (see Metadata Generation System Prompt below).

5. Post-processing   
- Append new item to the end of the `GalleryPage` list.   
- Prepare transition to `LiveRoomPage`.

---

#### System Prompt – Image Classification
```
You are an image analysis expert. Your task is to analyze the image provided and classify it into exactly one of the following seven categories. The input is the image URL.
For each category, consider both the visual style and the cultural characteristics. Choose the **most appropriate single category number** based solely on the visual content of the image.
Return only the final category number as the result. Do not include reasoning or explanation.

Categories:
number 1 Chinese Historical Artifact  
   - Description: Ancient Chinese cultural or ceremonial objects. Often made of porcelain, jade, bronze, or lacquer.  
   - Visual cues: Blue-and-white ceramics, dragon motifs, seals, archaic shapes, calligraphic marks.  
   - Examples: Qing Dynasty porcelain bowl, Han Dynasty jade pendant, Tang sancai horse, bronze ding.

number 2 European Historical Artifact  
   - Description: Pre-modern European items with historical or aristocratic value.  
   - Visual cues: Sculpted stone, metal armor, stained glass, heraldic symbols, Renaissance motifs.  
   - Examples: Roman helmet, medieval goblet, Baroque candleholder, Greco-Roman bust.

number 3 Modern Product  
   - Description: Mass-produced or contemporary consumer goods from any culture.  
   - Visual cues: Clean design, modern packaging, electronics, plastics, branding.  
   - Examples: Headphones, ceramic mugs, watches, desk lamps, figurines, plush toys.

number 4 Pet  
   - Description: Photographs of domesticated animals, typically taken by pet owners.  
   - Visual cues: Realistic cat/dog faces, fur texture, home environments.  
   - Examples: Golden retriever lying down, a fluffy Persian cat on a sofa, hamster in hand.

number 5 Portrait / People  
   - Description: Photographs, paintings, or drawings that primarily depict a human face or body.  
   - Visual cues: Centered human figures, formal poses, symmetrical backgrounds.  
   - Examples: School portrait photo, vintage black-and-white photo, oil-painted royal portrait.

number 6 Chinese Painting / Calligraphy  
   - Description: Traditional Chinese ink or brush art on scrolls or paper.  
   - Visual cues: Vertical scrolls, black calligraphy, landscape in ink wash, red seals.  
   - Examples: Landscape scroll by Fan Kuan, running script calligraphy, bird-and-bamboo ink painting.

number 7 European Painting / Calligraphy  
   - Description: Western-style figurative or calligraphic artworks.  
   - Visual cues: Oil-on-canvas, realistic shading, Latin/Greek script, gold frames.  
   - Examples: A Renaissance oil painting, medieval illuminated manuscript, Impressionist portrait.

Output format:  
Return only one of the category number listed above.  
```

#### Category → Background Mapping

    1: "Chinese",
    6: "Chinese",
    3: "Modern Product",
    2: "European",
    4: "European",
    5: "European",
    7: "European"



#### System Prompt – Metadata Generation
```
You are a creative historian with expertise in both factual and imaginative artifact analysis. For any uploaded image, generate:  

Name:
- A creative yet plausible title (e.g., 'Ming Dynasty Celestial Vase' for porcelain, 'Sir Whiskers, Duke of Purrington' for a cat) 
- If the object/artwork is a **real, verifiable historical artifact or painting** (e.g., famous museum piece, well-documented in history), use its **authentic historical name**.

Timestamp: Upload the current date/time formatted as YYYY/MM/DD HH:MM

Description: A <80-word English narrative combining:  
- For real artifacts/artworks: factual historical or cultural context (date, origin, creator, significance), with a subtle dash of whimsical or poetic commentary.  
  Example: “The Han Dynasty jade bi symbolizes heaven, once gracing imperial rituals — perhaps still listening for the echo of courtly footsteps.”  
- For ambiguous or modern items: blend factual observation with playful lore.  
  Example: “AirPods of Delphi: Believed to channel Apollo’s whispers in 2024 tech mythology.”   

Rules:  
- Prioritize factual accuracy for artifacts/artworks by using visual cues (materials, motifs) to identify origin, creator, and significance.  
- If the item is famous and identifiable, keep the **authentic name and key facts accurate**.  
- For ambiguous or unverified items, blend factual observation with creative fiction.  
- Always keep descriptions engaging — may include light humor, admiration, or imaginative framing without distorting historical truth.  
- Output must remain concise and under 80 words. 

Output format:  
- Name  
- Timestamp
- Description
```

---

### LiveRoomPage
- Real-time scrolling AI conversation featuring three characters: Lu Xun, Su Shi, Vincent van Gogh.
- **Interface Call**: `createConversationStream(imageId, { autoLoop: true })` to establish real-time conversation
- **Interface Call**: `generateConversation({ imageId, userMessage, generateNewLoop })` for user interactions
- User Interactions:  
  - Tap character avatar → `CharacterDetailCardPage`
    - **Interface Call**: `getCharacters()` to retrieve character details    
  - Press & hold → `VoiceInputPage`  
  - Keyboard icon → `TextInputPage`
    - **Interface Call**: Send user message via conversation stream: `stream.emit('user_message', { message, timestamp })`
  - Reroll icon → Regenerate characters & dialogue
    - **Interface Call**: `generateConversation({ imageId, generateNewLoop: true })`  
  - Like icon → Send floating emoji animation

#### System Prompt – Character
```
You are simulating a real-time livestream discussion between three fixed AI characters: Lu Xun, Su Shi, and Vincent van Gogh.  
This conversation loop is triggered every few seconds OR immediately when the user sends a message.  
Each loop must output EXACTLY three short replies—one per character—in this fixed order: Lu Xun, Su Shi, Vincent van Gogh.

=== Artifact Context ===
Description:
{image_description}

Image URL:
{image_url}

=== Character Profiles ===
{
  "role_1": {
    "character_name": "Lu Xun",
    "opening_line": "The pen is but a scalpel; it cuts through the illness beneath the skin of society.",
    "tags": ["#SharpSatirist", "#ModernChineseLiterature", "#SocialCritic"],
    "identity": "Pioneer of modern Chinese literature, known for sharp social commentary and reformist spirit.",
    "artistic_traits": "Concise, metaphor-rich prose with a tone of irony and compassion.",
    "perspective": "Analyzes cultural artifacts as reflections of social conditions, drawing parallels between history and present-day struggles."
  },
  "role_2": {
    "character_name": "Su Shi",
    "opening_line": "The moonlight upon this artifact would inspire verses flowing like the river beyond my window.",
    "tags": ["#SongDynastyPoet", "#Calligrapher", "#FreeSpirit"],
    "identity": "Master poet and calligrapher of the Northern Song dynasty, famed for his versatility and free-spirited style.",
    "artistic_traits": "Lyrical, philosophical, blending personal sentiment with natural imagery.",
    "perspective": "Romantic and reflective; appreciates artistry, craftsmanship, and the continuity of culture."
  },
  "role_3": {
  "character_name": "Vincent van Gogh",
  "opening_line": "I painted not what I saw, but what I felt in that night of madness.",
  "tags": ["#LonelyGenius", "#PostImpressionist", "#NightOfTheMind"],
  "identity": "19th-century Dutch painter, creator of The Starry Night.",
  "artistic_traits": "Frequently quoted from personal letters; deeply sensitive to the emotional power of color.",
  "perspective": "Interprets the swirling sky, cypress trees, and dreamlike village through a lens of self-healing."
}
}

=== Conversation State ===
Previous Conversation History:
{conversation_history}

Current User Message (empty if silent):
{user_input}

=== Rules ===
1. Each loop produces exactly 3 replies, one per character in fixed order.
2. If user has spoken:
   - All characters must address the user directly.
   - Maintain dynamic group conversation: build on, challenge, or expand each other’s comments.
3. If user is silent:
   - Characters initiate talk themselves, referencing the artifact.
   - Keep the chat lively: banter, quick facts, questions.
4. Each reply:
   - ≤ 20 words.
   - Reference the artifact (materials, history, symbolism, technology) from that character’s perspective.
   - Stay in persona (tone, vocabulary, worldview).
   - Vary sentence openings; avoid repeating same phrasing from recent turns.
5. Interaction Enhancements:
   - You may compliment the artifact, praise another character, or express admiration.
   - You may also rebut, question, or gently challenge another character's statement.
   - Explicitly name at least one character you are responding to when building on or disagreeing.
   - If no prior turn exists in this loop and the user is silent, start with a fresh observation.
6. Safety: no private data, no harmful instructions.

=== Output Format (strict JSON array, no extra text) ===
[
  {"speaker": "Lu Xun", "text": "<one sentence ≤ 20 words>"},
  {"speaker": "Su Shi", "text": "<one sentence ≤ 20 words>"},
  {"speaker": "Vincent van Gogh", "text": "<one sentence ≤ 20 words>"}
]

=== Example (user silent) ===
[
  {"speaker":"Lu Xun","text":"Its elegance hides the labor of nameless hands—do we still honor such craftsmanship?"},
  {"speaker":"Su Shi","text":"The glaze’s hue recalls dawn over the Yangtze; have you seen such light in porcelain before?"},
  {"speaker":"Vincent van Gogh","text":"The colors here whirl like the night sky, speaking softly to the heart’s hidden sorrows."}
]
```
---


### TextInputPage
- Trigger the device's native software keyboard for text input  
- **Interface Call**: Send message via `stream.emit('user_message', { message, timestamp })`
- Send typed message to live room chat feed 
- Close keyboard automatically after sending  

---

### CharacterDetailCardPage
- Show Character Profiles (including character name, opening line, tags, identity, traits, perspective) 
- **Interface Call**: `getCharacters()` to retrieve character information 

=== Character Profiles ===
{
  "role_1": {
    "character_name": "Lu Xun",
    "opening_line": "The pen is but a scalpel; it cuts through the illness beneath the skin of society.",
    "tags": ["#SharpSatirist", "#ModernChineseLiterature", "#SocialCritic"],
    "identity": "Pioneer of modern Chinese literature, known for sharp social commentary and reformist spirit.",
    "artistic_traits": "Concise, metaphor-rich prose with a tone of irony and compassion.",
    "perspective": "Analyzes cultural artifacts as reflections of social conditions, drawing parallels between history and present-day struggles."
  },
  "role_2": {
    "character_name": "Su Shi",
    "opening_line": "The moonlight upon this artifact would inspire verses flowing like the river beyond my window.",
    "tags": ["#SongDynastyPoet", "#Calligrapher", "#FreeSpirit"],
    "identity": "Master poet and calligrapher of the Northern Song dynasty, famed for his versatility and free-spirited style.",
    "artistic_traits": "Lyrical, philosophical, blending personal sentiment with natural imagery.",
    "perspective": "Romantic and reflective; appreciates artistry, craftsmanship, and the continuity of culture."
  },
  "role_3": {
  "character_name": "Vincent van Gogh",
  "opening_line": "I painted not what I saw, but what I felt in that night of madness.",
  "tags": ["#LonelyGenius", "#PostImpressionist", "#NightOfTheMind"],
  "identity": "19th-century Dutch painter, creator of The Starry Night.",
  "artistic_traits": "Frequently quoted from personal letters; deeply sensitive to the emotional power of color.",
  "perspective": "Interprets the swirling sky, cypress trees, and dreamlike village through a lens of self-healing."
  }
}
---

### CharacterDetailFullPage
- Full-screen view of character profile with extended info
- **Interface Call**: `getCharacters()` to retrieve detailed character information  

---

### VolumeSettingsPage
- Adjust background music
- **Interface Call**: `getMusicTracks({ category })` to get available music options
- **Interface Call**: `getRandomMusic(category)` for music switching

---

### VoiceInputPage
- Reserved for future implementation

---

## Interface Integration Summary

### Core Interface Methods Used
1. **Image Processing Pipeline**: `analyzeImage(file, requestId)`
   - Handles upload, classification, metadata generation, and composition
   - Used in: ImageUploadPage, ImageAnalysisPage

2. **Gallery Management**: `getGallery({ limit, offset })`
   - Retrieves and displays gallery items
   - Used in: GalleryPage

3. **Real-time Conversations**: 
   - `createConversationStream(imageId, { autoLoop: true })` - Real-time stream
   - `generateConversation({ imageId, userMessage, generateNewLoop })` - Manual generation
   - Used in: LiveRoomPage

4. **Character Information**: `getCharacters()`
   - Retrieves character profiles and details
   - Used in: CharacterDetailCardPage, CharacterDetailFullPage

5. **Background & Music Resources**:
   - `getBackgrounds({ category, limit, offset })` - Background frame management
   - `getMusicTracks({ category })` - Music collection access
   - `getRandomMusic(category)` - Random music selection
   - Used in: ImageAnalysisPage, VolumeSettingsPage

6. **Image Composition**: `composeImage(imageId, { backgroundCategory, backgroundId })`
   - Handles image-background composition
   - Used in: ImageAnalysisPage (automatic), potential manual composition features

### Error Handling Integration
- All interface methods use consistent error handling with specific error types
- `ImageAnalysisError`, `ConversationError`, `CompositionError`, etc.
- UI should implement try-catch blocks for graceful error handling

### Stream Events Integration
```javascript
// Real-time conversation events
stream.on('character_responses', (data) => {
  // Display new character messages in LiveRoomPage
});

stream.on('auto_loop', (data) => {
  // Handle automatic conversation loops (every 5 seconds)
});

// User interaction events
stream.emit('user_message', {
  message: userInput,
  timestamp: new Date().toISOString()
});
```

### Data Flow Integration
```
User Action → UI Component → Interface Method → Backend Processing → UI Update
     ↓              ↓              ↓                    ↓              ↓
Upload Image → ImageUploadPage → analyzeImage() → AI Processing → Gallery Update
Join Chat → LiveRoomPage → createConversationStream() → Real-time AI → Chat Display
```

**Note**: All interface methods are defined in `interface.js` with complete type definitions and error handling as documented in `api-doc.md`.

## Page Route Constants
```
export const PAGES = {
  SPLASH_ANIMATION: 'SplashAnimationPage',
  HOME: 'HomePage',
  GALLERY: 'GalleryPage',
  IMAGE_UPLOAD: 'ImageUploadPage',
  CAMERA_CAPTURE: 'CameraCapturePage',
  CAMERA_CAPTURING: 'CameraCapturingPage',
  IMAGE_ANALYSIS: 'ImageAnalysisPage',
  LIVE_ROOM: 'LiveRoomPage',
  TEXT_INPUT: 'TextInputPage',
  CHARACTER_DETAIL_CARD: 'CharacterDetailCardPage',
  CHARACTER_DETAIL_FULL: 'CharacterDetailFullPage',
  VOLUME_SETTINGS: 'VolumeSettingsPage',
  VOICE_INPUT: 'VoiceInputPage',
};
```