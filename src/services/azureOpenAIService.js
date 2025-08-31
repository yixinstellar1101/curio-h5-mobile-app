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
   * @param {string} language - Language for generation ('zh' or 'en')
   * @returns {Promise<{name: string, description: string}>}
   */
  async generateMetadata(imageBase64, classification, language = 'zh') {
    try {
      console.log('=== AZURE OPENAI METADATA GENERATION START ===');
      console.log(`Generating metadata for image with classification: ${classification.categoryLabel}`);
      console.log('Classification details:', classification);
      console.log('Language:', language);

      const metadataPrompt = this.getMetadataGenerationPrompt(language);
      
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
      
      const metadata = this.parseMetadataResponse(metadataText, classification, language);
      
      console.log('=== PARSED METADATA RESULT ===');
      console.log('Generated metadata:', metadata);
      return metadata;

    } catch (error) {
      console.error('Metadata generation error:', error);
      // Fallback to simple metadata if AI generation fails
      return this.getFallbackMetadata(classification, language);
    }
  }

  /**
   * Generate conversation response for AI characters
   * @param {Object} params - Conversation parameters
   * @param {string} params.imageUrl - URL of the image being discussed
   * @param {string} params.imageDescription - Description of the image
   * @param {Object} params.metadata - Generated metadata (name, description) from getMetadataGenerationPrompt
   * @param {Object} params.classification - Classification result for additional context
   * @param {Array} params.characters - Array of character IDs to include
   * @param {Array} params.previousMessages - Previous conversation messages
   * @returns {Promise<Array>} Array of character responses
   */
  async generateConversation(params) {
    // Extract params at the top level so they're available in fallback
    const { imageUrl, description, imageDescription, metadata, classification, characters, previousMessages = [], userMessage, language = 'zh' } = params;
    
    try {
      // 🔥 FORCE REDIRECT TO BACKEND API 🔥
      console.log('🔴 INTERCEPTED: azureOpenAIService.generateConversation called, redirecting to backend API!');
      
      // Import and use backend API instead
      const { backendApiService } = await import('../config/backendEndpoints.js');
      
      try {
        console.log('🚀 Calling backend API from azureOpenAIService redirect...');
        const messages = await backendApiService.generateConversation(params);
        console.log('✅ Backend API returned messages:', messages);
        return messages;
      } catch (error) {
        console.error('❌ Backend API failed, using Azure OpenAI as fallback:', error);
        // Continue with original Azure OpenAI logic below as fallback
      }
      
      // Use description if provided, fallback to imageDescription for backward compatibility
      const finalDescription = description || imageDescription;
      
      console.log('\n🤖 === AZURE OPENAI GENERATE CONVERSATION START ===');
      console.log('📝 Request Parameters:');
      console.log('  • Language:', language);
      console.log('  • USING ENGLISH MODE:', language === 'en' ? '✅ YES' : '❌ NO (Chinese mode)');
      console.log('  • User Message:', userMessage ? `"${userMessage}"` : '❌ None (auto-conversation mode)');
      console.log('  • Image URL:', imageUrl ? '✅ Present' : '❌ Missing');
      console.log('  • Image Description:', finalDescription ? '✅ Present' : '❌ Missing');
      console.log('  • Metadata:', metadata ? `Name: "${metadata.name}", Desc: ${metadata.description?.substring(0, 50)}...` : '❌ Missing');
      console.log('  • Classification:', classification ? `${classification.categoryLabel} (${classification.categoryNumber})` : '❌ Missing');
      console.log('  • Characters:', characters ? characters.join(', ') : '❌ None');
      console.log('  • Previous Messages Count:', previousMessages.length);

      const systemPrompt = this.getSystemPrompt(finalDescription, characters, previousMessages, language, metadata, classification);
      console.log('📋 System Prompt Type:', language === 'en' ? 'ENGLISH PROMPT' : 'CHINESE PROMPT');
      
      // 构建 messages 数组 - 用户消息放在正确的位置
      const apiMessages = [
        {
          role: "system",
          content: systemPrompt
        }
      ];

      // 如果有用户消息，作为独立的 user message 放置
      if (userMessage) {
        console.log('🎯 Adding user message as separate user role');
        apiMessages.push({
          role: "user", 
          content: [
            {
              type: "text",
              text: userMessage
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        });
      } else {
        // 根据语言生成初始对话请求
        const initialPrompt = language === 'en' 
          ? "IMPORTANT: Please have the three scholars discuss this artifact. All responses MUST be in English only. Do not use any Chinese characters." 
          : "请三位文人围绕这件文物进行对话讨论。";
        
        apiMessages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: initialPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        });
      }

      const requestBody = {
        model: this.deploymentName,
        messages: apiMessages,
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

IMPORTANT SAFETY REQUIREMENTS:
- If the image contains inappropriate, explicit, violent, political, or controversial content, respond with "SAFETY_VIOLATION" instead of a category number
- Do not analyze images depicting violence, explicit sexual content, hate speech, illegal activities, or highly sensitive political content
- Focus only on appropriate cultural and historical artifacts, artworks, and objects
- If uncertain about appropriateness, err on the side of caution

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
   * Get conversation generation prompt with balanced complexity
   * @param {string} imageDescription - Description of the image
   * @param {Array} characters - Character IDs
   * @param {Array} previousMessages - Previous messages
   * @param {string} language - Language for prompt
   * @param {Object} metadata - Generated metadata (name, description)
   * @param {Object} classification - Classification result
   * @returns {string} System prompt
   */
  getSystemPrompt(imageDescription, characters, previousMessages, language = 'zh', metadata = null, classification = null) {
    const previousContext = previousMessages.length > 0 ? 
      previousMessages.slice(-6).map(msg => `${msg.character}: ${msg.content}`).join('\n') : '';
    
    console.log('🔍 === SYSTEM PROMPT ROUTING ===');
    console.log('  • Language parameter:', language);
    console.log('  • Is English mode:', language === 'en');
    console.log('  • Will use:', language === 'en' ? 'ENGLISH PROMPT' : 'CHINESE PROMPT');
    
    if (language === 'en') {
      console.log('✅ ROUTING TO ENGLISH PROMPT');
      return this.getEnglishSystemPrompt(imageDescription, previousContext, metadata, classification);
    } else {
      console.log('✅ ROUTING TO CHINESE PROMPT');
      return this.getChineseSystemPrompt(imageDescription, previousContext, metadata, classification);
    }
  }

  getChineseSystemPrompt(imageDescription, previousContext, metadata = null, classification = null) {
    // 构建增强的文物信息部分
    let artifactInfo = `=== 文物信息 ===
${imageDescription}`;
    
    // 如果有元数据信息，添加到文物信息中
    if (metadata) {
      artifactInfo += `

=== AI生成的文物详细信息 ===
**文物名称**：${metadata.name}
**详细描述**：${metadata.description}`;
    }
    
    // 如果有分类信息，添加分类背景
    if (classification) {
      artifactInfo += `

=== 分类信息 ===
**类别**：${classification.categoryLabel} (类别${classification.categoryNumber})
**置信度**：${(classification.confidence * 100).toFixed(1)}%`;
    }

    return `你是模拟三位文人实时对话的AI系统，全程使用中文交流。

=== 重要安全规则 ===
**内容安全要求**：
- 如果图片包含不当、暴力、色情、政治敏感或极端争议内容，必须拒绝分析并回复："抱歉，这类图片不适合讨论，请上传其他文化艺术品。"
- 只讨论正当的文化艺术品、历史文物、日常物品等健康内容
- 严禁涉及暴力、色情、仇恨言论、违法活动或高度敏感政治话题
- 保持讨论内容的文明、健康和教育意义
- 如有疑虑，优先选择拒绝分析

${artifactInfo}

**重要**：You are simulating a real-time livestream discussion between three fixed AI characters: Lu Xun, Su Shi, and Vincent van Gogh.  
This conversation loop is triggered every few seconds OR immediately when the user sends a message. You are discussing the ORIGINAL ARTIFACT ONLY, not any decorative frame, background, or display setting. 

=== 角色档案 ===
**鲁迅**：现代文学奠基人，犀利的社会批评家
- 文风：简洁有力，善用比喻，关注文化与社会问题
- 视角：从历史文物中看社会变迁，用批判眼光分析传统
- **增强指导**：可以结合文物的分类信息和元数据描述，从社会历史角度分析其价值和意义

**苏轼**：北宋文豪，诗词书画俱佳的文人
- 文风：清雅飘逸，富有哲理，自然流畅, 抒情雅致，哲理思辨，美学欣赏视角；含典雅意象。
- 视角：欣赏工艺美学，关注文化传承，感性与理性并重
- **增强指导**：可以引用元数据中的艺术细节，从美学和文化传承角度深入探讨

**梵高**：19世纪荷兰画家，《星夜》创作者
- 文风：情感丰富，敏感细腻，常引用个人书信,以色彩/光线唤起情绪与自我体悟
- 视角：从色彩、线条、情感表达角度观察，重视艺术的治愈力
- **增强指导**：可以结合元数据描述中的视觉元素，从艺术家的情感体验角度分享感悟

=== 最近对话历史 ===
${previousContext}

=== 核心规则 ===

讨论对象仅限“照片中的展品本体”（材质、纹样、工艺、历史、文化、象征、**衍生故事**、人物）

1. **固定输出**：每轮必须产生3个回复，顺序：鲁迅→苏轼→梵高

2. **语言规则**  
- 默认使用中文，保持各自角色风格与用词。  
- 若用户发中文：三人都必须用中文回复。  
- 若用户发英文：  
  • 鲁迅与梵高：用英文作答，保持各自风格。  
  • 苏轼：用中文表达“看不懂英文”，保持文雅诗意。  

3. **用户互动策略**  
- 若用户发言：  
  a) 三位必须直接具体回应用户问题（优先给出事实/理由/结论）。  
  b) 再补一句角色视角的延展或反思。  
  c) 三人都要回应用户，并保持角色间动态对话。  
  d) 必须包含至少一次点名呼应/质疑/拓展他人观点（如“苏轼，我同意你关于釉色的见解”）。  
  e) 必须引用或转述用户关键词，体现“对题”！  
- 若用户沉默：  
  三位基于展品主动展开讨论，保持热度（包括轻微调侃/提出自己的疑问/快知识点/结合现代实事话题）。  

4. **互动规范**  
- 每位角色必须在本轮中明确提及用户或至少一位其他角色的发言。  
- 必须选择 **同意 / 延伸 / 反驳** 其中一人观点，并必须点名（如“梵高，我不同意你的色彩联想”）。  
- 若无前文或用户沉默，则从展品开启新观察。

5. **回复要求**：
   - 长度控制：每个回复10-50字随机长度
   - 表情符号：每句回复都必须加至少一个和回复强相关的emoji
   - 文物聚焦：必须从各自角度谈论结合可见细节（材质/纹样/造型/工艺/时代风格/象征意义）
   - **元数据利用**：优先引用AI生成的文物名称和详细描述中的具体信息，让对话更有深度和专业性
   - **分类意识**：可以结合分类信息（如"中华历史文物"、"现代产品"等）来指导讨论方向和深度
   - 角色一致：保持人物性格（语调、用词、世界观）
   - 表达多样：避免重复开头；每条句式需变化

6. **安全原则**：
   - 严格禁止分析不当图片：暴力、色情、政治敏感、仇恨内容等
   - 如发现不当内容，三位角色统一回复："抱歉，这类图片不适合讨论，建议上传其他文化艺术品。"
   - 不泄露隐私；不输出有害指令；不编造敏感事实
   - 保持讨论的文明、健康和教育价值

  


=== 输出格式 ===
[
  {"speaker": "鲁迅", "text": "回复内容"},
  {"speaker": "苏轼", "text": "回复内容"}, 
  {"speaker": "梵高", "text": "回复内容"}
]

=== 自检清单（在生成前内化，不要输出） ===
- 是否在本轮中明确**同意 / 延伸 / 反驳** 其中一人观点，并点名。
- 是否根据用户语言切换：中文→全员中文；英文→鲁迅&梵高英文，苏轼说看不懂？
- 是否直接回应了用户问题（若有）并引用其关键词？
- 是否各自风格鲜明、句式不雷同？
- 是否聚焦展品本体细节，无跑题与套话？


=== Example (user asks specific question about identity) ===

=== Example (user asks technical question in Chinese) ===
User: "这种工艺是怎么做出来的？"
[
  {"speaker":"Lu Xun","text":"高温还原焰中铁离子变化，千年技艺承载匠人智慧。"},
  {"speaker":"Su Shi","text":"需柴窑烧制七昼夜，火候把控全凭经验，差毫厘谬千里。"},
  {"speaker":"Vincent van Gogh","text":"就像我混合颜料，需要无数次试验才能找到完美配方。"}
]

=== Example (utilizing metadata information) ===
(When metadata shows: Name: "宋代龙泉窑青瓷莲花碗", Description: "精美的宋代龙泉窑青瓷作品...")
User: "这个碗很特别"
[
  {"speaker":"Lu Xun","text":"这'宋代龙泉窑青瓷莲花碗'见证了宋代商品经济繁荣 🏺"},
  {"speaker":"Su Shi","text":"龙泉窑的秘色瓷技艺，正如我诗中'青如玉，明如镜，声如磬' ✨"},
  {"speaker":"Vincent van Gogh","text":"莲花纹样的对称美让我想起向日葵的自然韵律 🌸"}
]

`;
  }

  getEnglishSystemPrompt(imageDescription, previousContext, metadata = null, classification = null) {
    // Build enhanced artifact information section
    let artifactInfo = `=== ARTIFACT INFORMATION ===
${imageDescription}`;
    
    // Add metadata information if available
    if (metadata) {
      artifactInfo += `

=== AI-GENERATED DETAILED ARTIFACT INFORMATION ===
**Artifact Name**: ${metadata.name}
**Detailed Description**: ${metadata.description}`;
    }
    
    // Add classification information if available
    if (classification) {
      artifactInfo += `

=== CLASSIFICATION INFORMATION ===
**Category**: ${classification.categoryLabel} (Category ${classification.categoryNumber})
**Confidence**: ${(classification.confidence * 100).toFixed(1)}%`;
    }

    return `🚨🚨🚨 ABSOLUTE CRITICAL REQUIREMENT 🚨🚨🚨
YOU MUST REPLY ENTIRELY IN ENGLISH. NO CHINESE CHARACTERS ALLOWED AT ALL.

⚡ RULE: If you use ANY Chinese characters, you have COMPLETELY FAILED this task. ⚡

You are an AI system simulating real-time discussions between three scholars conducting conversations ENTIRELY IN ENGLISH.

=== CRITICAL SAFETY REQUIREMENTS ===
**Content Safety Requirements**:
- If the image contains inappropriate, violent, explicit, politically sensitive, or extremely controversial content, REFUSE to analyze and respond: "Sorry, this type of image is not suitable for discussion. Please upload other cultural artifacts."
- Only discuss appropriate cultural artifacts, historical relics, everyday objects, and other healthy content
- Strictly prohibit discussions involving violence, explicit content, hate speech, illegal activities, or highly sensitive political topics
- Maintain civilized, healthy, and educational discussion value
- When in doubt, prioritize refusing to analyze

**MANDATORY LANGUAGE REQUIREMENT**: 
- Every single word MUST be in English
- Zero Chinese characters permitted
- This is ENGLISH-ONLY mode
- Failure to use English = Complete failure
- Length: 15-40 words per reply

${artifactInfo}

=== CHARACTER PROFILES (ALL MUST SPEAK ENGLISH) ===
**Lu Xun**: Pioneer of modern Chinese literature, sharp social critic
- Writing style: Concise and powerful, uses metaphors, focuses on cultural and social issues
- Perspective: Views social changes through historical artifacts, analyzes tradition with critical eyes
- **SPEAKS ONLY IN ENGLISH**
- **Enhanced Guidance**: Can reference classification info and metadata description to analyze social and historical significance

**Su Shi**: Song Dynasty literary giant, master of poetry, calligraphy, and painting
- Writing style: Elegant and philosophical, natural flow, lyrical refinement with aesthetic appreciation
- Perspective: Appreciates craftsmanship and aesthetics, values cultural heritage, balances emotion and reason
- **SPEAKS ONLY IN ENGLISH**
- **Enhanced Guidance**: Can cite artistic details from metadata to discuss aesthetics and cultural heritage

**Vincent van Gogh**: 19th-century Dutch painter, creator of "The Starry Night"
- Writing style: Emotionally rich, sensitive, often references personal letters, evokes emotions through color/light
- Perspective: Observes from color, line, and emotional expression angles, values art's healing power
- **SPEAKS ONLY IN ENGLISH**
- **Enhanced Guidance**: Can connect metadata's visual elements to emotional and artistic experiences

=== RECENT CONVERSATION HISTORY ===
${previousContext}

=== CORE RULES (ALL IN ENGLISH) ===

1. **Fixed Output**: Each round must produce 3 replies in order: Lu Xun → Su Shi → Vincent van Gogh

2. **ABSOLUTE LANGUAGE REQUIREMENT**  
- **ALL CHARACTERS MUST SPEAK ONLY IN ENGLISH**
- **ZERO CHINESE CHARACTERS PERMITTED**
- **THIS IS ENGLISH-ONLY MODE**

3. **User Interaction Strategy**  
- If user speaks: All three must respond in English
- If user remains silent: Continue discussion in English

4. **Reply Requirements**:
   - Length: 10-35 words per reply
   - Language: ENGLISH ONLY
   - Emojis: Include relevant emojis
   - Focus: Discuss the artifact details
   - **Metadata Utilization**: Prioritize referencing the AI-generated artifact name and detailed description for deeper, more professional discussions
   - **Classification Awareness**: Use category information (e.g., "Chinese Historical Artifact", "Modern Product") to guide discussion direction and depth

=== OUTPUT FORMAT (ENGLISH ONLY) ===
[
  {"speaker": "Lu Xun", "text": "English reply content with emoji"},
  {"speaker": "Su Shi", "text": "English reply content with emoji"}, 
  {"speaker": "Vincent van Gogh", "text": "English reply content with emoji"}
]

=== EXAMPLES (ALL IN ENGLISH) ===
[
  {"speaker": "Lu Xun", "text": "This artifact reveals the social values of its era, much like literature reflects society. 📚"},
  {"speaker": "Su Shi", "text": "The craftsmanship here shows remarkable skill, like a poem written in clay and fire. 🏺"}, 
  {"speaker": "Vincent van Gogh", "text": "The colors and textures speak to me deeply, evoking emotions beyond words. 🎨"}
]
   - Artifact focus: Must discuss from their respective angles combining visible details (materials/patterns/form/craftsmanship/period style/symbolic meaning)
   - Character consistency: Maintain personality (tone, vocabulary, worldview)
   - Expression variety: Avoid repetitive openings; vary sentence structures

6. **Safety Principles**: 
   - Strictly prohibit analyzing inappropriate images: violence, explicit content, politically sensitive, hate content, etc.
   - If inappropriate content is detected, all three characters must uniformly respond: "Sorry, this type of image is not suitable for discussion. Please upload other cultural artifacts."
   - No privacy leaks; no harmful instructions; no fabricated sensitive facts
   - Maintain civilized, healthy, and educational discussion value

=== OUTPUT FORMAT ===
[
  {"speaker": "Lu Xun", "text": "reply content"},
  {"speaker": "Su Shi", "text": "reply content"}, 
  {"speaker": "Vincent van Gogh", "text": "reply content"}
]

=== QUALITY CHECKLIST (internalize before generation, do not output) ===
- Did I clearly **agree / extend / refute** one person's viewpoint and name them in this round?
- Did I switch based on user language: Chinese→all Chinese; English→all English, maintaining styles?
- Did I directly respond to user's question (if any) and quote their keywords?
- Are individual styles distinct with varied sentence structures?
- Am I focused on artifact details without going off-topic or using template responses?

=== Example (user asks specific question about identity) ===
User: "Who is behind the Mona Lisa?"
[
  {"speaker":"Lu Xun","text":"You ask about Mona Lisa's identity? Behind this painting is a Florentine merchant's wife. 🎭"},
  {"speaker":"Su Shi","text":"The painted lady is Lisa Gherardini, portrayed by da Vinci for her husband. 🖼️"},
  {"speaker":"Vincent van Gogh","text":"She is Lady Lisa, whose mysterious smile still fascinates me today! 😊"}
]

=== Example (utilizing metadata information in English) ===
(When metadata shows: Name: "Song Dynasty Celadon Lotus Bowl", Description: "Exquisite Song Dynasty Longquan kiln celadon masterpiece...")
User: "This bowl looks amazing"
[
  {"speaker":"Lu Xun","text":"This 'Song Dynasty Celadon Lotus Bowl' embodies China's ceramic golden age perfectly. 🏺"},
  {"speaker":"Su Shi","text":"Longquan kiln's secret glaze mirrors nature's jade-like serenity and eternal beauty. ✨"},
  {"speaker":"Vincent van Gogh","text":"The lotus patterns flow like brushstrokes, creating harmony through repeated motifs! 🌸"}
]

`;
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

      // Check for safety violation first
      const trimmed = (responseText || '').trim();
      if (trimmed.includes('SAFETY_VIOLATION') || trimmed.includes('不适合讨论')) {
        throw new AzureOpenAIError('CONTENT_VIOLATION', 'Image contains inappropriate content and cannot be analyzed');
      }

      // First attempt: numeric only (spec-compliant)
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
      // Check for safety violation responses
      if (responseText.includes('不适合讨论') || responseText.includes('not suitable for discussion')) {
        console.log('🚨 Content safety violation detected in conversation response');
        return [{
          id: `safety-msg-${Date.now()}`,
          character: 'system',
          content: '抱歉，这类图片不适合讨论，请上传其他文化艺术品。',
          timestamp: new Date().toISOString(),
          isAI: true,
          isSafetyMessage: true
        }];
      }

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
        'Vincent van Gogh': 'vincent-van-gogh',
        '鲁迅': 'lu-xun',
        '苏轼': 'su-shi',
        '梵高': 'vincent-van-gogh'
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
  getMetadataGenerationPrompt(language = 'zh') {
    if (language === 'en') {
      return `You are a creative historian with expertise in both factual and imaginative artifact analysis. 

CRITICAL SAFETY REQUIREMENTS:
- If the image contains inappropriate, explicit, violent, political, or controversial content, respond with "CONTENT_VIOLATION" instead of generating metadata
- Only generate metadata for appropriate cultural artifacts, artworks, everyday objects, and other suitable content
- Refuse to process images depicting violence, explicit content, hate speech, illegal activities, or highly sensitive political material

For any appropriate uploaded image, generate:   

Name:
- A creative yet plausible title (e.g., 'Ming Dynasty Celestial Vase' for porcelain, 'Sir Whiskers, Duke of Purrington' for a cat) 
- If the object/artwork is a **real, verifiable historical artifact or painting** (e.g., famous museum piece, well-documented in history), use its **authentic historical name**.

Timestamp: Upload the current date/time formatted as YYYY/MM/DD HH:MM

Description: A <70-word English narrative combining:  
- For real artifacts/artworks: factual historical or cultural context (date, origin, creator, significance), with a subtle dash of whimsical or poetic commentary.  
  Example: "The Han Dynasty jade bi symbolizes heaven, once gracing imperial rituals — perhaps still listening for the echo of courtly footsteps."  
- For ambiguous or modern items: blend factual observation with playful lore.  
  Example: "AirPods of Delphi: Believed to channel Apollo's whispers in 2024 tech mythology."   

Rules:  
- Prioritize factual accuracy for artifacts/artworks by using visual cues (materials, motifs) to identify origin, creator, and significance.  
- If the item is famous and identifiable, keep the **authentic name and key facts accurate**.  
- For ambiguous or unverified items, blend factual observation with creative fiction.  
- Always keep descriptions engaging — may include light humor, admiration, or imaginative framing without distorting historical truth.  
- Output must remain concise and under 70 words. 

Output format (exactly 3 lines, no extra text, must be in English):
Name: <Generated Name>
Timestamp: <YYYY/MM/DD HH:MM>
Description: <Generated description under 70 words>`;
    }

    // Chinese version (default)
    return `你是一位兼具历史学知识与想象力的创意历史学者。

重要安全要求：
- 如果图片包含不当、暴力、色情、政治敏感或极端争议内容，请回复"内容违规"而非生成元数据
- 只为适当的文化艺术品、文物、日常物品等健康内容生成元数据
- 拒绝处理包含暴力、色情、仇恨言论、违法活动或高度敏感政治内容的图片

对于上传的任意适当图像，请生成以下内容：  

Name:  
- 创意但可信的标题（如瓷器 → “明代天青釉花瓶”，猫 → “胡须公爵·普灵顿爵士”）。  
- 如果物品/艺术品是**真实且可考的历史文物或名画**（如博物馆藏品或有明确历史记载的作品），必须使用**真实历史名称**。  

Timestamp: 上传当前日期与时间，格式为 YYYY/MM/DD HH:MM。  

Description: 一段 **100到150字之间的中文叙述**，融合：  
- 若为真实文物/艺术品：提供准确的历史或文化背景（年代、产地、作者、意义），并点缀一丝诗意或想象。  
  例：“汉代玉璧象征苍穹，曾用于帝王祭祀——或许至今仍在聆听宫廷的回响。”  
- 若为模糊或现代物品：结合客观观察与趣味化传说。  
  例：“德尔斐的AirPods：据说能在2024年继续传递阿波罗的低语。”  

规则：  
- 对真实文物/艺术品，要优先保持历史准确性，根据材质、纹样等视觉线索识别其来源、作者与意义。  
- 若物品著名且可辨认，必须保留其**真实名称与关键信息**。  
- 对模糊或无法确认的物品，可以在事实观察基础上适度虚构。  
- 描述必须保持生动吸引，可带轻微幽默、赞叹或诗意，但不能歪曲历史真相。  
- 整体输出需简洁，长度不超过 150 字。  

输出格式（严格 3 行，无额外文字，中文）：  
Name: <生成的标题>  
Timestamp: <YYYY/MM/DD HH:MM>  
Description: <100到150字之间的中文描述>  
`;

  }

  /**
   * Parse metadata response from OpenAI
   * @param {string} responseText - Raw response text
   * @param {Object} classification - Classification result for fallback
   * @returns {Object} Parsed metadata result
   */
  parseMetadataResponse(responseText, classification, language = 'zh') {
    try {
      console.log('=== PARSING METADATA RESPONSE ===');
      console.log('Raw response text:', responseText);
      console.log('Classification for fallback:', classification);
      
      // Check for safety violation first
      if (responseText.includes('CONTENT_VIOLATION') || responseText.includes('内容违规')) {
        console.log('🚨 Content safety violation detected in metadata response');
        throw new AzureOpenAIError('CONTENT_VIOLATION', 'Image contains inappropriate content and metadata cannot be generated');
      }
      
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
          if (wc > 100) finalDesc = finalDesc.split(/\s+/).slice(0,100).join(' ') + '...';
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
        if (wordCount > 100) {
          metadata.description = metadata.description.split(/\s+/).slice(0, 100).join(' ') + '...';
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
      return this.getFallbackMetadata(classification, language);
    }
  }

  /**
   * Get fallback metadata when AI generation fails
   * @param {Object} classification - Classification result
   * @param {string} language - Language for fallback ('zh' or 'en')
   * @returns {Object} Fallback metadata
   */
  getFallbackMetadata(classification, language = 'zh') {
    const fallbackNames = language === 'en' ? {
      1: "Chinese Historical Artifact",
      2: "European Historical Artifact", 
      3: "Modern Design Item",
      4: "Precious Companion",
      5: "Portrait Work",
      6: "Chinese Traditional Art",
      7: "European Classical Art"
    } : {
      1: "中华历史文物",
      2: "欧洲历史文物", 
      3: "现代设计物品",
      4: "珍贵伙伴",
      5: "肖像作品",
      6: "中国传统艺术",
      7: "欧洲古典艺术"
    };

    const fallbackDescriptions = language === 'en' ? {
      1: "A precious Chinese artifact embodying generations of traditional craftsmanship wisdom. This piece witnesses historical changes with exquisite artistry and profound cultural significance, showcasing ancient artisans' extraordinary talent.",
      2: "A fascinating European artifact reflecting historical craftsmanship and artistic sentiment. It carries Western civilization's memory, with every detail telling ancient stories of European artistic tradition and cultural heritage.",
      3: "A contemporary work integrating modern design concepts, balancing functionality and aesthetics. It represents innovative design spirit with clean lines and practical functions, showcasing modern life's fashionable taste.",
      4: "A precious companion bringing joy and warmth through its presence. This adorable being possesses healing power, making life more beautiful and meaningful with both appearance and companionship.",
      5: "A portrait capturing character essence and emotional depth with keen artistic insight. Every expression is carefully depicted, showcasing the artist's profound understanding of humanity and exceptional creative skills.",
      6: "Chinese traditional art displaying eternal ink wash beauty. Intensity variations contain Eastern philosophy's wisdom, with poetic and zen-like qualities flowing through brushstrokes, embodying Chinese artistic charm.",
      7: "European art showcasing classical techniques and cultural themes. Exquisite painting merges with profound heritage, with every light treatment displaying European classical art's superior standards and eternal charm."
    } : {
      1: "一件承载着中华文明深厚底蕴的珍贵文物，凝聚着代代相传的传统工艺智慧。这件文物见证了历史的变迁，其精湛的制作工艺和深邃的文化内涵，展现了古代匠人的卓越才华和审美追求。",
      2: "一件来自欧洲历史长河的迷人文物，反映着那个时代的工艺技巧和艺术情怀。它承载着西方文明的记忆，每一处细节都诉说着古老的故事，体现了欧洲艺术传统的独特魅力与深厚底蕴。",
      3: "一件融合现代设计理念的当代作品，在功能性与美学之间找到完美平衡。它代表着当代设计的创新精神，简洁的线条与实用的功能相得益彰，展现了现代生活的时尚品味与科技美感。",
      4: "一位珍贵的伙伴，用它的陪伴为日常生活带来欢乐与温暖。这个可爱的存在拥有着治愈人心的力量，无论是它的外表还是陪伴的温暖，都让生活变得更加美好而有意义。",
      5: "一幅捕捉人物性格与情感精髓的肖像作品，体现着艺术的敏锐洞察力。画面中的每一个表情和神态都被精心描绘，展现了艺术家对人性的深刻理解和卓越的创作技巧。",
      6: "一件展现水墨技法永恒之美的中国传统艺术作品。墨色的浓淡变化中蕴含着东方哲学的深邃智慧，笔触间流淌着诗意与禅意，体现了中华艺术的独特韵味和精神追求。",
      7: "一件展现古典技法与文化主题的欧洲艺术表达作品。精湛的绘画技巧与深厚的文化底蕴相融合，每一处光影的处理都展现了欧洲古典艺术的高超水准和永恒魅力。"
    };

    const defaultName = language === 'en' ? "Mysterious Item" : "神秘物品";
    const defaultDesc = language === 'en' ? 
      "A fascinating work worthy of contemplation and discussion. Its unique aspects spark curiosity and imagination, with its own story and value waiting to be discovered." :
      "一件值得深思与讨论的迷人作品，它的独特之处激发着我们的好奇心与想象力。无论来自何处，都有着属于自己的故事和价值，等待我们去发现和理解。";

    return {
      name: fallbackNames[classification.categoryNumber] || defaultName,
      description: fallbackDescriptions[classification.categoryNumber] || defaultDesc
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
