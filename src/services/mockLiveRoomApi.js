/**
 * Mock Live Room API Service
 * Simulates real-time conversation generation and streaming for LiveRoom functionality
 */

// Mock character data with personalities
const CHARACTERS = {
  'Lu Xun': {
    name: 'Lu Xun',
    avatar: '/src/assets/0a0aca255a6a424fd8f131455677b58d6309fa99.png',
    personality: 'critical_thinker',
    style: 'sharp, satirical, socially conscious'
  },
  'Su Shi': {
    name: 'Su Shi', 
    avatar: '/src/assets/bb22518de19c944000484ee66f86147664b959a6.png',
    personality: 'poetic_philosopher',
    style: 'elegant, philosophical, nature-loving'
  },
  'Vincent van Gogh': {
    name: 'Vincent van Gogh',
    avatar: '/src/assets/855a8fe22b8b7ac5f293f93e60065e26a3efd17d.png',
    personality: 'passionate_artist',
    style: 'emotional, vivid, deeply feeling'
  }
};

// Mock conversation templates based on image analysis
const CONVERSATION_TEMPLATES = {
  'chinese_artifact': [
    {
      speaker: 'Lu Xun',
      template: 'Who else thinks this belonged to a rich kid showing off at court?'
    },
    {
      speaker: 'Su Shi',
      template: 'Hold on, I just found a 17th-century receipt about this thing!'
    },
    {
      speaker: 'Vincent van Gogh',
      template: 'Unpacking centuries of opinions.'
    }
  ],
  'western_art': [
    {
      speaker: 'Vincent van Gogh',
      template: 'The colors in this piece remind me of my nights in Arles...'
    },
    {
      speaker: 'Lu Xun',
      template: 'Art should serve the people, not just the wealthy collectors.'
    },
    {
      speaker: 'Su Shi',
      template: 'Like capturing moonlight in a brush stroke - timeless beauty.'
    }
  ],
  'modern_object': [
    {
      speaker: 'Lu Xun',
      template: 'This modern creation reflects our changing society.'
    },
    {
      speaker: 'Vincent van Gogh',
      template: 'Even in modernity, I see the eternal struggle of creation.'
    },
    {
      speaker: 'Su Shi',
      template: 'New forms, ancient spirits - poetry continues to evolve.'
    }
  ]
};

// Mock emoji reactions
const REACTION_EMOJIS = [
  '❤️', '👍', '👏', '🎉', '😍', '🤔', '💡', '🔥'
];

/**
 * Mock conversation stream creation
 * Simulates createConversationStream interface call
 */
export const mockCreateConversationStream = async (imageData, options = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Analyze image to determine conversation category
  const category = analyzeImageCategory(imageData);
  
  // Generate initial conversation
  const initialMessages = generateInitialConversation(category);
  
  return {
    success: true,
    streamId: `stream_${Date.now()}`,
    category,
    initialMessages,
    participants: Object.values(CHARACTERS),
    autoLoop: options.autoLoop || true,
    loopInterval: options.loopInterval || 5000
  };
};

/**
 * Mock conversation generation
 * Simulates generateConversation interface call
 */
export const mockGenerateConversation = async (streamId, options = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const category = options.category || 'chinese_artifact';
  const generateNewLoop = options.generateNewLoop || false;
  
  if (generateNewLoop) {
    return generateLoopConversation(category);
  }
  
  return generateContextualConversation(category);
};

/**
 * Mock user message submission
 * Simulates user joining the conversation
 */
export const mockSubmitUserMessage = async (streamId, message, messageType = 'text') => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const userMessage = {
    id: `user_${Date.now()}`,
    speaker: 'User',
    text: message,
    timestamp: new Date().toISOString(),
    type: messageType
  };
  
  // Generate AI responses to user message
  const responses = generateResponsesToUser(message);
  
  return {
    success: true,
    userMessage,
    aiResponses: responses
  };
};

/**
 * Mock emoji reaction
 * Simulates real-time reaction system
 */
export const mockSendReaction = async (messageId, emoji) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    success: true,
    reaction: {
      id: `reaction_${Date.now()}`,
      messageId,
      emoji,
      timestamp: new Date().toISOString()
    }
  };
};

// Helper functions
function analyzeImageCategory(imageData) {
  // Mock image analysis - in real implementation this would use AI
  const categories = ['chinese_artifact', 'western_art', 'modern_object'];
  return categories[Math.floor(Math.random() * categories.length)];
}

function generateInitialConversation(category) {
  const templates = CONVERSATION_TEMPLATES[category] || CONVERSATION_TEMPLATES.chinese_artifact;
  
  return templates.map((template, index) => ({
    id: `init_${Date.now()}_${index}`,
    speaker: template.speaker,
    text: template.template,
    timestamp: new Date(Date.now() - (templates.length - index) * 2000).toISOString(),
    avatar: CHARACTERS[template.speaker]?.avatar
  }));
}

function generateLoopConversation(category) {
  const speakers = Object.keys(CHARACTERS);
  const numMessages = Math.floor(Math.random() * 3) + 2; // 2-4 messages
  
  const messages = [];
  for (let i = 0; i < numMessages; i++) {
    const speaker = speakers[Math.floor(Math.random() * speakers.length)];
    messages.push({
      id: `loop_${Date.now()}_${i}`,
      speaker,
      text: generateContextualResponse(speaker, category),
      timestamp: new Date(Date.now() + i * 1000).toISOString(),
      avatar: CHARACTERS[speaker]?.avatar
    });
  }
  
  return { messages };
}

function generateContextualConversation(category) {
  const responses = [
    "This piece tells a story of its era...",
    "The craftsmanship here is extraordinary.",
    "I wonder about the hands that created this.",
    "Such artistry transcends time itself.",
    "Every detail speaks of dedication."
  ];
  
  const speaker = Object.keys(CHARACTERS)[Math.floor(Math.random() * Object.keys(CHARACTERS).length)];
  
  return {
    messages: [{
      id: `contextual_${Date.now()}`,
      speaker,
      text: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString(),
      avatar: CHARACTERS[speaker]?.avatar
    }]
  };
}

function generateContextualResponse(speaker, category) {
  const responses = {
    'Lu Xun': [
      "This artifact reflects the social conditions of its time.",
      "Who had the privilege to own such beauty?",
      "Art should speak to the common people, not just elites.",
      "Every object carries the weight of its society."
    ],
    'Su Shi': [
      "Like poetry written in stone and time.",
      "The moon would shine differently on this piece.",
      "Beauty flows like a river through the ages.",
      "In this craft, I see the harmony of heaven and earth."
    ],
    'Vincent van Gogh': [
      "The colors dance with emotions I recognize.",
      "Such passion in every stroke and curve!",
      "This speaks to the loneliness of creation.",
      "I would paint this under starlight."
    ]
  };
  
  const speakerResponses = responses[speaker] || responses['Su Shi'];
  return speakerResponses[Math.floor(Math.random() * speakerResponses.length)];
}

function generateResponsesToUser(userMessage) {
  const numResponses = Math.floor(Math.random() * 2) + 1; // 1-2 responses
  const speakers = Object.keys(CHARACTERS);
  const responses = [];
  
  for (let i = 0; i < numResponses; i++) {
    const speaker = speakers[Math.floor(Math.random() * speakers.length)];
    responses.push({
      id: `response_${Date.now()}_${i}`,
      speaker,
      text: generateResponseToUser(speaker, userMessage),
      timestamp: new Date(Date.now() + (i + 1) * 2000).toISOString(),
      avatar: CHARACTERS[speaker]?.avatar
    });
  }
  
  return responses;
}

function generateResponseToUser(speaker, userMessage) {
  const responses = {
    'Lu Xun': [
      `Your perspective reminds me of the common people's wisdom.`,
      `That's an astute observation about society.`,
      `You speak truth that many prefer to ignore.`
    ],
    'Su Shi': [
      `Your words flow like poetry, my friend.`,
      `Such insight deserves to be written in verse.`,
      `You see beauty where others see mere objects.`
    ],
    'Vincent van Gogh': [
      `Your passion reminds me of my own struggles.`,
      `I feel the emotion in your words deeply.`,
      `You understand the artist's heart.`
    ]
  };
  
  const speakerResponses = responses[speaker] || responses['Su Shi'];
  return speakerResponses[Math.floor(Math.random() * speakerResponses.length)];
}

export { CHARACTERS, REACTION_EMOJIS };
