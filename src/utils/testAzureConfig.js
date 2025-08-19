// Test Azure OpenAI Configuration
// Quick test to verify the updated endpoint and API key

import { azureOpenAIService } from '../services/azureOpenAIService.js';

console.log('🧪 Testing Updated Azure OpenAI Configuration');
console.log('==============================================');

// Test configuration
console.log('✅ Service Configuration:');
console.log('Endpoint:', azureOpenAIService.endpoint);
console.log('Deployment:', azureOpenAIService.deploymentName);
console.log('API Version:', azureOpenAIService.apiVersion);
console.log('API Key Length:', azureOpenAIService.apiKey?.length);

// Test a simple classification (you can test this manually)
const testClassification = async () => {
  console.log('\n🚀 Ready to test classification...');
  console.log('Upload an image in the app to test the new configuration!');
  
  // Check if the URL construction is correct
  const testUrl = `${azureOpenAIService.endpoint}/openai/deployments/${azureOpenAIService.deploymentName}/chat/completions?api-version=${azureOpenAIService.apiVersion}`;
  console.log('\n🔗 Expected API URL:');
  console.log(testUrl);
  
  // Verify this matches your expected endpoint
  const expectedUrl = 'https://kai-aoai-swe.openai.azure.com/openai/deployments/model-router/chat/completions?api-version=2025-01-01-preview';
  console.log('\n✨ Should match:');
  console.log(expectedUrl);
  console.log('\n✅ URLs match:', testUrl === expectedUrl ? 'YES' : 'NO');
};

// Run the test
testClassification();

export default testClassification;
