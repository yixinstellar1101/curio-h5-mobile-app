// Backend API endpoints configuration
// Allows switching between different deployed backend bases via environment variable.
// Usage: import { BACKEND_ENDPOINTS } from '../config/backendEndpoints';

const API_BASE = import.meta.env.VITE_BACKEND_API_BASE?.replace(/\/$/, '') || 'http://localhost:8000';

export const BACKEND_API_BASE = API_BASE;

export const BACKEND_ENDPOINTS = {
  health: `${API_BASE}/api/openai/health`,
  classify: `${API_BASE}/api/classification/classify`,
  metadata: `${API_BASE}/api/metadata/generate`,
  conversation: `${API_BASE}/api/openai/conversation`,
  prompts: {
    chineseConversation: `${API_BASE}/api/prompts/conversation/chinese`,
    englishConversation: `${API_BASE}/api/prompts/conversation/english`,
    classification: `${API_BASE}/api/prompts/classification`,
    metadata: (language = 'zh') => `${API_BASE}/api/prompts/metadata/${language}`
  }
};

export class BackendAPIError extends Error {
  constructor(code, message, status = null, originalError = null) {
    super(message);
    this.name = 'BackendAPIError';
    this.code = code;
    this.status = status;
    this.originalError = originalError;
  }
}

async function handleResponse(res, code) {
  if (!res.ok) {
    let detail;
    try { 
      detail = await res.json(); 
      console.error('❌ Backend API Error Details:', {
        status: res.status,
        statusText: res.statusText,
        detail: detail
      });
    } catch { 
      detail = await res.text(); 
      console.error('❌ Backend API Error Text:', detail);
    }
    
    // Check for content violation errors
    const errorMessage = detail?.detail || detail?.message || detail || `Backend request failed (${res.status})`;
    const isContentViolation = typeof errorMessage === 'string' && (
      errorMessage.includes('内容违规') || 
      errorMessage.includes('content violation') ||
      errorMessage.includes('rejected') ||
      errorMessage.includes('Content filtered') ||
      errorMessage.includes('content policy')
    );
    
    if (isContentViolation) {
      throw new BackendAPIError('CONTENT_VIOLATION', '内容违规：Azure OpenAI 认为您上传的图像内容违规', res.status, detail);
    }
    
    throw new BackendAPIError(code, errorMessage, res.status, detail);
  }
  return res.json();
}

export const backendApiService = {
  async classifyImage(imageUrl) {
    const res = await fetch(BACKEND_ENDPOINTS.classify, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl })
    });
    const data = await handleResponse(res, 'CLASSIFICATION_FAILED');
    return data.result; // { categoryNumber, categoryLabel, confidence }
  },

  async generateMetadata(imageUrl, language = 'zh', classification = null) {
    const res = await fetch(BACKEND_ENDPOINTS.metadata, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, language, classification })
    });
    const data = await handleResponse(res, 'METADATA_FAILED');
    return data.metadata; // { name, description, timestamp }
  },

  async generateConversation(params) {
    console.log('🟢 backendApiService.generateConversation called with:', params);
    const {
      imageId, imageUrl, description, characters, userMessage,
      previousMessages = [], language = 'zh', metadata = null, classification = null
    } = params;
    
    // 构建请求体，确保所有必需字段都存在
    const requestBody = {
      image_id: imageId || 'unknown-image-id',
      image_url: imageUrl || '',
      description: description || 'An interesting artifact for discussion',
      characters: characters || ['lu-xun', 'su-shi', 'vincent-van-gogh'],
      user_message: userMessage || null,
      previous_messages: previousMessages || [],
      language: language || 'zh',
      metadata: metadata || null,
      classification: classification || null
    };
    
    console.log('🔍 Sending request to backend with body:', requestBody);
    
    const res = await fetch(BACKEND_ENDPOINTS.conversation, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    const data = await handleResponse(res, 'CONVERSATION_FAILED');
    return data.messages; // array of role messages
  },

  async health() {
    const res = await fetch(BACKEND_ENDPOINTS.health);
    return handleResponse(res, 'HEALTH_FAILED');
  }
};

export default backendApiService;
