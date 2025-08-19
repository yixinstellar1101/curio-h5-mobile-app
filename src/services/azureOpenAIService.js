// Azure OpenAI Service
// Handles image classification and AI interactions using Azure OpenAI

class AzureOpenAIService {
  constructor() {
    console.log('=== AZURE OPENAI SERVICE INITIALIZATION ===');
    console.log('Raw environment variables:');
    console.log('VITE_AZURE_OPENAI_ENDPOINT:', import.meta.env.VITE_AZURE_OPENAI_ENDPOINT);
    console.log('VITE_AZURE_OPENAI_API_KEY length:', import.meta.env.VITE_AZURE_OPENAI_API_KEY?.length);
    console.log('VITE_AZURE_OPENAI_DEPLOYMENT_NAME:', import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME);
    console.log('VITE_AZURE_OPENAI_API_VERSION:', import.meta.env.VITE_AZURE_OPENAI_API_VERSION);
    
    // Initialize from environment variables
    this.endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    this.apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
    this.deploymentName = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || 'model-router';
    this.apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2025-01-01-preview';
    
    console.log('Initialized with:');
    console.log('Endpoint:', this.endpoint);
    console.log('API Key length:', this.apiKey?.length);
    console.log('Deployment:', this.deploymentName);
    console.log('API Version:', this.apiVersion);
    
    // Validate required environment variables
    if (!this.endpoint || !this.apiKey) {
      console.error('❌ Azure OpenAI credentials not configured!');
      throw new Error('Azure OpenAI credentials not configured. Please set VITE_AZURE_OPENAI_ENDPOINT and VITE_AZURE_OPENAI_API_KEY');
    }

    // Clean endpoint URL
    this.endpoint = this.endpoint.replace(/\/$/, '');
  }

  /**
   * Classify image using Azure OpenAI Vision
   * @param {string} imageInput - Base64 data URL or HTTP/HTTPS URL of the image to classify
   * @param {string} requestId - Optional request ID for tracking
   * @returns {Promise<{categoryNumber: number, categoryLabel: string, confidence: number}>}
   */
  async classifyImage(imageInput, requestId = null) {
    try {
      console.log('=== AZURE OPENAI CLASSIFICATION START ===');
      console.log(`Classifying image${requestId ? ` (${requestId})` : ''}`);
      console.log('OpenAI endpoint:', this.endpoint);
      console.log('Image input type:', typeof imageInput);
      console.log('Image input length:', imageInput?.length);

      const classificationPrompt = this.getImageClassificationPrompt();
      
      // Prepare image content based on input type
      let imageContent;
      if (imageInput.startsWith('data:image/')) {
        // Base64 data URL
        imageContent = {
          type: "image_url",
          image_url: {
            url: imageInput
          }
        };
      } else if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
        // HTTP/HTTPS URL
        imageContent = {
          type: "image_url",
          image_url: {
            url: imageInput
          }
        };
      } else {
        throw new Error('Invalid image input: must be a base64 data URL or HTTP/HTTPS URL');
      }
      
      const requestBody = {
        model: this.deploymentName,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: classificationPrompt
              },
              imageContent
            ]
          }
        ],
        max_tokens: 8192,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null,
        stream: false
      };

      const response = await this.makeOpenAIRequest(requestBody);
      
      console.log('Azure OpenAI response received');
      console.log('Response status:', response?.choices?.length || 0, 'choices');
      
      if (!response.choices || response.choices.length === 0) {
        throw new Error('No classification response received');
      }

      const classificationText = response.choices[0].message.content;
      console.log('Raw classification response:', classificationText);
      
      const classification = this.parseClassificationResponse(classificationText);
      
      console.log('=== CLASSIFICATION SUCCESS ===');
      console.log('Final classification result:', classification);
      return classification;

    } catch (error) {
      console.error('Image classification error:', error);
      throw new AzureOpenAIError('CLASSIFICATION_FAILED', error.message, error);
    }
  }

  /**
   * Generate metadata (name and description) for an image
   * @param {string} imageBase64 - Base64 encoded image or image URL
   * @param {Object} classification - Classification result
   * @returns {Promise<{name: string, description: string}>}
   */
  async generateMetadata(imageBase64, classification) {
    try {
      console.log('=== AZURE OPENAI METADATA GENERATION START ===');
      console.log(`Generating metadata for image with classification: ${classification.categoryLabel}`);
      console.log('Classification details:', classification);

      const metadataPrompt = this.getMetadataGenerationPrompt();
      
      const requestBody = {
        model: this.deploymentName,
        messages: [
          {
            role: "system",
            content: metadataPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `This image has been classified as: ${classification.categoryLabel} (Category ${classification.categoryNumber}) with ${(classification.confidence * 100).toFixed(1)}% confidence. Please generate an appropriate name and description following the metadata generation guidelines.`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 8192,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null,
        stream: false
      };

      const response = await this.makeOpenAIRequest(requestBody);
      
      if (!response.choices || response.choices.length === 0) {
        throw new Error('No metadata response received');
      }

      const metadataText = response.choices[0].message.content;
      console.log('=== RAW METADATA RESPONSE ===');
      console.log('Response text:', metadataText);
      console.log('Response length:', metadataText ? metadataText.length : 'null');
      
      const metadata = this.parseMetadataResponse(metadataText, classification);
      
      console.log('=== PARSED METADATA RESULT ===');
      console.log('Generated metadata:', metadata);
      return metadata;

    } catch (error) {
      console.error('Metadata generation error:', error);
      // Fallback to simple metadata if AI generation fails
      return this.getFallbackMetadata(classification);
    }
  }

  /**
   * Generate conversation response for AI characters
   * @param {Object} params - Conversation parameters
   * @param {string} params.imageUrl - URL of the image being discussed
   * @param {string} params.imageDescription - Description of the image
   * @param {Array} params.characters - Array of character IDs to include
   * @param {Array} params.previousMessages - Previous conversation messages
   * @returns {Promise<Array>} Array of character responses
   */
  async generateConversation(params) {
    try {
      const { imageUrl, imageDescription, characters, previousMessages = [], userMessage } = params;
      
      console.log('\n🤖 === AZURE OPENAI GENERATE CONVERSATION START ===');
      console.log('📝 Request Parameters:');
      console.log('  • User Message:', userMessage ? `"${userMessage}"` : '❌ None (auto-conversation mode)');
      console.log('  • Has Chinese Characters:', userMessage ? /[\u4e00-\u9fff]/.test(userMessage) : false);
      console.log('  • Image URL:', imageUrl ? '✅ Present' : '❌ Missing');
      console.log('  • Image Description:', imageDescription ? '✅ Present' : '❌ Missing');
      console.log('  • Characters:', characters ? characters.join(', ') : '❌ None');
      console.log('  • Previous Messages Count:', previousMessages.length);
      
      if (userMessage) {
        console.log('🎯 CRITICAL: AI must respond to user message directly, not give template responses');
      }

      const conversationPrompt = this.getConversationPrompt(imageDescription, characters, previousMessages, userMessage);
      
      console.log('Generated conversation prompt preview:');
      console.log(conversationPrompt.substring(conversationPrompt.length - 200));

      const requestBody = {
        model: this.deploymentName,
        messages: [
          {
            role: "system",
            content: conversationPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please generate a natural conversation about this image between the specified characters."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 8192,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null,
        stream: false
      };

      console.log('Request body prepared, making API call...');

      const response = await this.makeOpenAIRequest(requestBody);
      console.log('API response received:', response?.choices?.length, 'choices');
      
      if (!response.choices || response.choices.length === 0) {
        throw new Error('No conversation response received');
      }

      const conversationText = response.choices[0].message.content;
      console.log('📄 Raw conversation text:', conversationText?.substring(0, 200) + '...');
      
      const messages = this.parseConversationResponse(conversationText, characters);
      
      console.log('✅ === AZURE OPENAI GENERATE CONVERSATION SUCCESS ===');
      console.log('📊 Generated messages count:', messages.length);
      console.log('📝 Messages preview:');
      messages.forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.character}: ${msg.content.substring(0, 80)}${msg.content.length > 80 ? '...' : ''}`);
      });
      
      // Validate response quality when user has sent a message
      if (userMessage) {
        console.log('🔍 VALIDATING USER RESPONSE QUALITY:');
        const templatePhrases = [
          '你问的问题很有深度', '这个观点很有意思', '你说得对', '很好的想法',
          '确实如此', '非常赞同', '说得很对', '有道理', '不错的观察'
        ];
        
        let hasTemplateResponse = false;
        messages.forEach(msg => {
          const hasTemplate = templatePhrases.some(phrase => msg.content.includes(phrase));
          if (hasTemplate) {
            console.warn(`⚠️  TEMPLATE RESPONSE DETECTED from ${msg.character}: ${msg.content}`);
            hasTemplateResponse = true;
          }
        });
        
        if (!hasTemplateResponse) {
          console.log('✅ No template responses detected - responses appear genuine');
        } else {
          console.error('❌ CRITICAL: AI gave template response instead of addressing user message!');
        }
        
        // Check if responses actually address the user message
        const responsesWithUserRef = messages.filter(msg => {
          const lowerContent = msg.content.toLowerCase();
          const lowerUser = userMessage.toLowerCase();
          return lowerContent.includes(lowerUser.substring(0, Math.min(5, lowerUser.length))) ||
                 msg.content.length > 25; // At least substantial content
        });
        
        console.log(`🎯 Responses with user reference: ${responsesWithUserRef.length}/${messages.length}`);
        if (responsesWithUserRef.length === 0) {
          console.error('❌ CRITICAL: No responses addressed the user message!');
        }
      }
      
      return messages;

    } catch (error) {
      console.error('=== AZURE OPENAI GENERATE CONVERSATION FAILED ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      throw new AzureOpenAIError('CONVERSATION_FAILED', error.message, error);
    }
  }

  /**
   * Make request to Azure OpenAI API
   * @param {Object} requestBody - Request payload
   * @returns {Promise<Object>} API response
   */
  async makeOpenAIRequest(requestBody) {
    console.log('=== MAKING AZURE OPENAI REQUEST ===');
    console.log('Endpoint:', this.endpoint);
    console.log('Deployment:', this.deploymentName);
    console.log('API Version:', this.apiVersion);
    
    const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`;
    console.log('Full URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Azure OpenAI API Error Response:', errorText);
        throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Azure OpenAI API Success - received response');
      return result;
      
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }
  }

  /**
   * Get image classification prompt
   * @returns {string} Classification prompt
   */
  getImageClassificationPrompt() {
   // Updated to exactly follow spec in spec.md (System Prompt – Image Classification)
   return `You are an image analysis expert. Your task is to analyze the image provided and classify it into exactly one of the following seven categories. The input is the image URL.
For each category, consider both the visual style and the cultural characteristics. Choose the **most appropriate single category number** based solely on the visual content of the image.
Return only the final category number as the result. Do not include reasoning or explanation.

Categories:
number 1 Chinese Historical Artifact  
  - Description: Ancient Chinese cultural or ceremonial objects. Often made of porcelain, jade, bronze, or lacquer. Includes Song, Ming, Qing dynasty ceramics with traditional glazes. ANY celadon item (especially with lotus motifs) is DEFINITELY Chinese Historical Artifact.
  - Visual cues: Blue-and-white ceramics, celadon glazes (especially jade-green color), dragon motifs, lotus patterns, seals, archaic shapes, calligraphic marks, traditional pottery forms.  
  - Examples: Qing Dynasty porcelain bowl, Song celadon lotus cup, Han Dynasty jade pendant, Tang sancai horse, bronze ding, Ming blue-and-white vase.
  - CRITICAL: Celadon (青瓷) with lotus motifs is ALWAYS Chinese, never Korean. Secret color porcelain (秘色瓷) is Chinese imperial ceramic.
  - IMPORTANT: If you see celadon glaze (jade-green color) and/or lotus patterns, classify as Chinese Historical Artifact, NOT Modern Product or any other category.

number 2 European Historical Artifact  
  - Description: Pre-modern European items with historical or aristocratic value.  
  - Visual cues: Sculpted stone, metal armor, stained glass, heraldic symbols, Renaissance motifs.  
  - Examples: Roman helmet, medieval goblet, Baroque candleholder, Greco-Roman bust.

number 3 Modern Product  
  - Description: Mass-produced or contemporary consumer goods from any culture. NEVER use this for celadon ceramics or items with traditional Chinese motifs.
  - Visual cues: Clean modern design, contemporary packaging, electronics, plastics, modern branding, machine-made appearance.  
  - Examples: Headphones, modern ceramic coffee mugs, watches, desk lamps, plastic figurines, plush toys.
  - EXCLUSIONS: Do NOT classify celadon ceramics, lotus-patterned items, or traditional Chinese pottery forms here.

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
Return only one of the category number listed above.`;
  }

  /**
   * Get conversation generation prompt using spec.md Character System Prompt
   * @param {string} imageDescription - Description of the image
   * @param {Array} characters - Character IDs
   * @param {Array} previousMessages - Previous messages
   * @returns {string} Conversation prompt
   */
  getConversationPrompt(imageDescription, characters, previousMessages, userMessage) {
    const previousContext = previousMessages.length > 0 ? 
      previousMessages.map(msg => `${msg.character}: ${msg.content}`).join('\n') : '';
    
    // Enhanced user input handling with language detection
    let userInput = '';
    let languageNote = '';
    if (userMessage) {
      userInput = `User: ${userMessage}`;
      const hasChineseChars = /[\u4e00-\u9fff]/.test(userMessage);
      if (hasChineseChars) {
        languageNote = '\n\n🇨🇳 **CRITICAL LANGUAGE RULE**: User wrote in CHINESE - Every single character MUST respond in CHINESE ONLY! No English allowed!';
      } else {
        languageNote = '\n\n🇺🇸 **CRITICAL LANGUAGE RULE**: User wrote in ENGLISH - Every single character MUST respond in ENGLISH ONLY! No Chinese allowed!';
      }
    } else if (previousMessages.length > 0) {
      // Check if recent conversation was in Chinese
      const recentChinese = previousMessages.slice(-5).some(msg => 
        msg.content && /[\u4e00-\u9fff]/.test(msg.content)
      );
      
      // Also check for user messages in recent history
      const recentUserChinese = previousMessages.slice(-5).some(msg => 
        msg.character === 'You' && msg.content && /[\u4e00-\u9fff]/.test(msg.content)
      );
      
      if (recentChinese || recentUserChinese) {
        languageNote = '\n\n🇨🇳 **CONTEXT LANGUAGE RULE**: Recent conversation included Chinese - continue in Chinese for consistency! ALL responses must be in Chinese!';
        console.log('🔍 Language context detected: Recent Chinese messages found, continuing in Chinese');
      } else {
        console.log('🔍 Language context: No recent Chinese detected, using English');
      }
    }
    
    // Use the exact System Prompt from spec.md
    return `You are simulating a real-time livestream discussion between three fixed AI characters: Lu Xun, Su Shi, and Vincent van Gogh.  
This conversation loop is triggered every few seconds OR immediately when the user sends a message.  
Each loop must output EXACTLY three short replies—one per character—in this fixed order: Lu Xun, Su Shi, Vincent van Gogh.

=== CRITICAL: FOCUS ONLY ON THE ARTIFACT ===
**IMPORTANT**: You are discussing the ORIGINAL ARTIFACT ONLY, not any decorative frame, background, or display setting. 
Focus exclusively on the ceramic piece, its glaze, patterns, craftsmanship, and cultural significance.
DO NOT mention frames, gold decorations, display cases, or background elements.

=== Artifact Context ===
Description:
${imageDescription}

Image URL:
[Current artifact being discussed - focus only on the ceramic piece itself]${languageNote}

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
${previousContext}

Current User Message (empty if silent):
${userInput}

=== Rules ===
${languageNote}

1. Each loop produces exactly 3 replies, one per character in fixed order.
2. **🚨 CRITICAL LANGUAGE MATCHING RULE - HIGHEST PRIORITY**:
   - If user writes in Chinese (any Chinese characters), ALL characters MUST respond in Chinese ONLY
   - If user writes in English, ALL characters MUST respond in English ONLY  
   - If user is silent, use English as default
   - **NO MIXED LANGUAGES**: Never mix Chinese and English in the same response session
   - **IMMEDIATE LANGUAGE SWITCH**: When detecting Chinese input, respond instantly in fluent Chinese
   - **LANGUAGE PERSISTENCE**: Once user uses Chinese, maintain Chinese in follow-up automatic conversations
   - **CONTEXT AWARENESS**: If recent conversation history contains Chinese, continue in Chinese even in auto-generated messages
3. If user has spoken:
   - **MANDATORY USER RESPONSE**: All characters MUST directly address the user's specific message content - this is not optional
   - **QUOTE USER EXACT WORDS**: Characters must reference specific phrases from the user's message
   - **ANSWER THE QUESTION FIRST**: If user asks "谁做的/who made", "什么时候/when", "什么人/what person", give DIRECT factual answer first, then add commentary
   - **FACTUAL QUESTIONS PRIORITY**: For "谁做的"(who made) questions, provide specific maker/artist/craftsperson information if known, or historical period/culture
   - **NO DESCRIPTION INSTEAD OF ANSWERS**: Don't describe appearance when user asks about maker - answer the "who" question directly
   - **NO GENERIC RESPONSES**: Absolutely no template phrases or generic statements when user has spoken
   - **DEEP ENGAGEMENT**: Don't just acknowledge - actually discuss, analyze, and build upon the user's exact words
   - **USER-CENTERED DIALOGUE**: The entire response must revolve around what the user said, not general artifact discussion
   - **FORBIDDEN PHRASES**: Never use template responses like "你问的问题很有深度", "这个观点很有意思" etc. 
   - **SPECIFIC CONTENT**: When user asks "什么人" or other questions, give specific historical facts and expert knowledge
   - **BUILD ON USER INPUT**: Take what user said and expand with expertise, not generic acknowledgment
   - Create a strong sense of dialogue and conversation flow with the user.
   - Show that characters are actively listening and responding to user input.
4. If user is silent:
   - Characters initiate talk themselves, referencing the artifact.
   - Keep the chat lively: banter, quick facts, questions.
5. Each reply:
   - ≤ 25 words (≤ 20 Chinese characters to account for language density).
   - **PERSONAL ANALYSIS**: Each character must provide their unique perspective based on their expertise
   - **VISUAL DETAILS**: Reference specific visual elements you observe in the artifact (color, texture, pattern, shape)
   - **CULTURAL INSIGHT**: Connect the artifact to historical, artistic, or cultural knowledge
   - **FRESH LANGUAGE**: Use varied sentence structures and vocabulary in each response
   - Stay in persona (tone, vocabulary, worldview).
   - When responding to user, show direct engagement with their message.
6. Interaction Enhancements:
   - You may compliment the artifact, praise another character, or express admiration.
   - You may also rebut, question, or gently challenge another character's statement.
   - Explicitly name at least one character you are responding to when building on or disagreeing.
   - When user speaks, prioritize responding to them over character-to-character dialogue.
   - If no prior turn exists in this loop and the user is silent, start with a fresh observation.
7. Conversational Flow:
   - Characters should feel like they're having a real conversation with the user.
   - **ABSOLUTE BAN ON TEMPLATE PHRASES**: NEVER use generic responses like "你问的问题很有深度", "这个观点很有意思", "你说得对", "很好的想法", "确实如此", "非常赞同", "说得很对", etc.
   - **SPECIFIC ENGAGEMENT**: When user asks a question, provide specific factual answers with expertise
   - **BUILD ON USER INPUT**: Take exact words from user message and respond with specific knowledge
   - **DIRECT ANSWERS FIRST**: If user asks "什么人" or "who", give specific names and historical context immediately
   - Use meaningful phrases like "You mean the [specific thing]," "That refers to [specific fact]," "Based on what you're asking about [topic]"
   - Reference the user's previous messages when relevant.
   - Ask follow-up questions to the user to maintain engagement.
8. Safety: no private data, no harmful instructions.

=== Output Format (strict JSON array, no extra text) ===
[
  {"speaker": "Lu Xun", "text": "<one sentence ≤ 20 words>"},
  {"speaker": "Su Shi", "text": "<one sentence ≤ 20 words>"},
  {"speaker": "Vincent van Gogh", "text": "<one sentence ≤ 20 words>"}
]

=== Examples ===

=== Example (user asks question in English) ===
User: "What period is this from?"
[
  {"speaker":"Lu Xun","text":"You ask wisely—this Song Dynasty piece reflects an era where art masked social tensions."},
  {"speaker":"Su Shi","text":"Indeed, as you wonder about time, this celadon speaks of my own Northern Song period."},
  {"speaker":"Vincent van Gogh","text":"The age matters less than how it moves your soul—do you feel its ancient whispers?"}
]

=== Example (user asks specific question about identity) ===
User: "蒙娜丽莎背后是什么人呢"
[
  {"speaker":"Lu Xun","text":"你问蒙娜丽莎身份？这幅画背后是佛罗伦萨商人之妻。"},
  {"speaker":"Su Shi","text":"画中人名叫丽莎·盖拉尔迪尼，达·芬奇为其夫君所绘。"},
  {"speaker":"Vincent van Gogh","text":"她就是丽莎夫人，那神秘微笑至今仍令我着迷！"}
]

=== Example (user asks "who made this" in Chinese) ===
User: "这个帽子是谁做的"
[
  {"speaker":"Lu Xun","text":"你问制作者？这类现代帽子通常是工厂批量生产的。"},
  {"speaker":"Su Shi","text":"制帽工艺虽简，但设计者巧思可见，应是当代设计师所创。"},
  {"speaker":"Vincent van Gogh","text":"谁做不重要，重要的是这绿色给人带来的愉悦感受！"}
]

=== Example (user speaks Chinese with opinion about Chinese artifact) ===
User: "这个是中国文物！这个不是高丽青瓷是中国的秘色莲花瓷碗"
[
  {"speaker":"Lu Xun","text":"此碗釉色温润如玉，确是越窑秘色瓷，工艺精湛非高丽可比。"},
  {"speaker":"Su Shi","text":"莲瓣纹饰雅致，青翠欲滴，正是我朝官窑之绝品。"},
  {"speaker":"Vincent van Gogh","text":"这青绿色泽让我想起春日新叶，充满生命力的东方美学。"}
]

=== Example (user speaks Chinese about beauty) ===
User: "这个青瓷的颜色真的很美"
[
  {"speaker":"Lu Xun","text":"这翠色中透着深沉，如国人性格——内敛却有力量。"},
  {"speaker":"Su Shi","text":"色如春水初生，又似远山含黛，天然去雕饰。"},
  {"speaker":"Vincent van Gogh","text":"这种绿让我着迷，比我调色板上任何颜料都要纯净。"}
]

=== Example (user asks technical question in Chinese) ===
User: "这种工艺是怎么做出来的？"
[
  {"speaker":"Lu Xun","text":"高温还原焰中铁离子变化，千年技艺承载匠人智慧。"},
  {"speaker":"Su Shi","text":"需柴窑烧制七昼夜，火候把控全凭经验，差毫厘谬千里。"},
  {"speaker":"Vincent van Gogh","text":"就像我混合颜料，需要无数次试验才能找到完美配方。"}
]

=== Example (user silent) ===
[
  {"speaker":"Lu Xun","text":"Its elegance hides the labor of nameless hands—do we still honor such craftsmanship?"},
  {"speaker":"Su Shi","text":"The glaze's hue recalls dawn over the Yangtze; have you seen such light in porcelain before?"},
  {"speaker":"Vincent van Gogh","text":"The colors here whirl like the night sky, speaking softly to the heart's hidden sorrows."}
]`;
  }

  /**
   * Parse classification response from OpenAI
   * @param {string} responseText - Raw response text
   * @returns {Object} Parsed classification result
   */
  parseClassificationResponse(responseText) {
    try {
      const CATEGORY_LABELS = {
        1: "Chinese Historical Artifact",
        2: "European Historical Artifact",
        3: "Modern Product",
        4: "Pet",
        5: "Portrait / People",
        6: "Chinese Painting / Calligraphy",
        7: "European Painting / Calligraphy"
      };

      // First attempt: numeric only (spec-compliant)
      const trimmed = (responseText || '').trim();
      if (/^[1-7]$/.test(trimmed)) {
        const num = parseInt(trimmed, 10);
        return {
          categoryNumber: num,
          categoryLabel: CATEGORY_LABELS[num],
          confidence: 0.9
        };
      }

      // Second attempt: JSON format (legacy)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const classification = JSON.parse(jsonMatch[0]);
        if (classification.categoryNumber >= 1 && classification.categoryNumber <= 7) {
          // If label missing, map
            if (!classification.categoryLabel) {
              classification.categoryLabel = CATEGORY_LABELS[classification.categoryNumber];
            }
            if (typeof classification.confidence !== 'number') classification.confidence = 0.85;
            return classification;
        }
      }

      throw new Error('Unrecognized classification response format');

    } catch (error) {
      console.error('Failed to parse classification response:', responseText);
      // Fallback classification
      return {
        categoryNumber: 3,
        categoryLabel: "Modern Product",
        confidence: 0.5
      };
    }
  }

  /**
   * Parse conversation response from OpenAI
   * @param {string} responseText - Raw response text
   * @param {Array} characters - Expected character IDs
   * @returns {Array} Parsed conversation messages
   */
  parseConversationResponse(responseText, characters) {
    try {
      // Try to extract JSON array from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in conversation response');
      }

      const messages = JSON.parse(jsonMatch[0]);
      
      // Generate unique timestamp for this batch
      const baseTimestamp = Date.now();
      
      // Character name mapping from API responses to internal IDs
      const nameToIdMap = {
        'Lu Xun': 'lu-xun',
        'Su Shi': 'su-shi', 
        'Vincent van Gogh': 'vincent-van-gogh'
      };
      
      // Validate and clean messages - API returns speaker/text fields
      return messages.map((msg, index) => ({
        id: `msg-${baseTimestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        character: nameToIdMap[msg.speaker] || msg.speaker || msg.character || characters[index % characters.length],
        content: msg.text || msg.message || msg.content || 'Interesting observation about this artifact.',
        timestamp: new Date().toISOString(),
        isAI: true
      }));

    } catch (error) {
      console.error('Failed to parse conversation response:', responseText);
      console.error('Raw response text:', responseText);
      
      // Fallback conversation focused on artifact discussion
      const baseTimestamp = Date.now();
      return [
        {
          id: `msg-${baseTimestamp}-0-${Math.random().toString(36).substr(2, 9)}`,
          character: 'lu-xun',
          content: '这件物品体现了现代设计的简约美学。',
          timestamp: new Date().toISOString(),
          isAI: true
        },
        {
          id: `msg-${baseTimestamp}-1-${Math.random().toString(36).substr(2, 9)}`,
          character: 'su-shi',
          content: '物品形态虽简，却蕴含深意。',
          timestamp: new Date().toISOString(),
          isAI: true
        },
        {
          id: `msg-${baseTimestamp}-2-${Math.random().toString(36).substr(2, 9)}`,
          character: 'vincent-van-gogh',
          content: 'The geometric forms create visual harmony.',
          timestamp: new Date().toISOString(),
          isAI: true
        }
      ];
    }
  }

  /**
   * Get metadata generation prompt based on spec.md requirements
   * @returns {string} Metadata generation prompt
   */
  getMetadataGenerationPrompt() {
    // Updated to spec.md (System Prompt – Metadata Generation)
    return `You are a creative historian with expertise in both factual and imaginative artifact analysis. For any uploaded image, generate:  

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

Output format (exactly 3 lines, no extra text):
Name: <Generated Name>\nTimestamp: <YYYY/MM/DD HH:MM>\nDescription: <Generated description under 80 words>`;
  }

  /**
   * Parse metadata response from OpenAI
   * @param {string} responseText - Raw response text
   * @param {Object} classification - Classification result for fallback
   * @returns {Object} Parsed metadata result
   */
  parseMetadataResponse(responseText, classification) {
    try {
      console.log('=== PARSING METADATA RESPONSE ===');
      console.log('Raw response text:', responseText);
      console.log('Classification for fallback:', classification);
      
      // 1. Attempt spec 3-line format parsing
      if (responseText.includes('Name:') && responseText.includes('Description:')) {
        const nameMatch = responseText.match(/Name:\s*(.*)/);
        const tsMatch = responseText.match(/Timestamp:\s*(.*)/);
        const descMatch = responseText.match(/Description:\s*([\s\S]*)/);
        if (nameMatch && descMatch) {
          const name = nameMatch[1].trim();
          const timestamp = tsMatch ? tsMatch[1].trim() : null;
          const description = descMatch[1].trim();
          let finalDesc = description.replace(/\n+/g, ' ').trim();
          const wc = finalDesc.split(/\s+/).length;
          if (wc > 80) finalDesc = finalDesc.split(/\s+/).slice(0,80).join(' ') + '...';
          const result = { name, description: finalDesc, timestamp };
          console.log('Parsed line-based metadata result:', result);
          return { name: result.name, description: result.description };
        }
      }

      // 2. Attempt JSON format (legacy)
      const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
      console.log('JSON match found (legacy format):', !!jsonMatch);
      if (jsonMatch) {
        console.log('Extracted JSON string:', jsonMatch[0]);
        const metadata = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON object:', metadata);
        if (!metadata.name || !metadata.description) {
          throw new Error('Invalid metadata format - missing name or description');
        }
        const wordCount = metadata.description.split(/\s+/).length;
        if (wordCount > 80) {
          metadata.description = metadata.description.split(/\s+/).slice(0, 80).join(' ') + '...';
        }
        const result = { name: metadata.name, description: metadata.description };
        console.log('=== METADATA PARSING SUCCESS (JSON) ===');
        console.log('Final metadata result:', result);
        return result;
      }

      throw new Error('No recognizable metadata format');

    } catch (error) {
      console.error('Failed to parse metadata response:', responseText);
      console.error('Parse error:', error);
      console.log('=== FALLING BACK TO MOCK METADATA ===');
      // Fallback to simple metadata
      return this.getFallbackMetadata(classification);
    }
  }

  /**
   * Get fallback metadata when AI generation fails
   * @param {Object} classification - Classification result
   * @returns {Object} Fallback metadata
   */
  getFallbackMetadata(classification) {
    const fallbackNames = {
      1: "Chinese Historical Artifact",
      2: "European Historical Artifact", 
      3: "Modern Design Object",
      4: "Beloved Companion",
      5: "Portrait Study",
      6: "Traditional Chinese Art",
      7: "European Classical Art"
    };

    const fallbackDescriptions = {
      1: "An intriguing piece that speaks to China's rich cultural heritage, crafted with traditional techniques passed down through generations.",
      2: "A fascinating artifact from Europe's storied past, reflecting the craftsmanship and artistic sensibilities of its era.",
      3: "A contemporary creation that embodies modern design principles, bridging functionality with aesthetic appeal.",
      4: "A cherished companion whose presence brings joy and warmth to daily life.",
      5: "A portrait that captures the essence of human character and emotion with artistic sensitivity.",
      6: "Traditional Chinese artwork that demonstrates the timeless beauty of ink and brush techniques.",
      7: "European artistic expression that showcases classical techniques and cultural themes."
    };

    return {
      name: fallbackNames[classification.categoryNumber] || "Intriguing Object",
      description: fallbackDescriptions[classification.categoryNumber] || "A fascinating subject worthy of contemplation and discussion."
    };
  }
}

// Custom error class for Azure OpenAI operations
export class AzureOpenAIError extends Error {
  constructor(code, message, originalError = null) {
    super(message);
    this.name = 'AzureOpenAIError';
    this.code = code;
    this.originalError = originalError;
  }
}

// Export singleton instance
export const azureOpenAIService = new AzureOpenAIService();
export default azureOpenAIService;
