// Azure Services Test Utility
// Use this in browser console to test Azure services configuration

export const testAzureServices = {
  
  // Test Azure Blob Storage configuration
  async testBlobStorage() {
    console.log('🧪 Testing Azure Blob Storage Configuration...');
    
    try {
      const { azureBlobService } = await import('./src/services/azureBlobService.js');
      
      console.log('✅ Storage Account:', azureBlobService.accountName);
      console.log('✅ Container:', azureBlobService.containerName);
      console.log('✅ Storage URL:', azureBlobService.getStorageAccountUrl());
      
      // Test container access (without uploading)
      const containerExists = await azureBlobService.containerClient.exists();
      console.log('✅ Container exists:', containerExists);
      
      return {
        success: true,
        message: 'Azure Blob Storage configuration is valid!',
        details: {
          accountName: azureBlobService.accountName,
          containerName: azureBlobService.containerName,
          containerExists
        }
      };
      
    } catch (error) {
      console.error('❌ Azure Blob Storage test failed:', error);
      return {
        success: false,
        message: 'Azure Blob Storage configuration error',
        error: error.message
      };
    }
  },

  // Test Azure OpenAI configuration  
  async testOpenAI() {
    console.log('🧪 Testing Azure OpenAI Configuration...');
    
    try {
      const { azureOpenAIService } = await import('./src/services/azureOpenAIService.js');
      
      console.log('✅ OpenAI Endpoint:', azureOpenAIService.endpoint);
      console.log('✅ Deployment Name:', azureOpenAIService.deploymentName);
      console.log('✅ API Version:', azureOpenAIService.apiVersion);
      
      // Test with a simple non-vision request to validate credentials
      const testRequest = {
        messages: [{ role: "user", content: "Hello, respond with 'OK' if you can receive this." }],
        max_tokens: 10,
        temperature: 0
      };
      
      console.log('🔄 Testing API connectivity...');
      const response = await azureOpenAIService.makeOpenAIRequest(testRequest);
      
      if (response.choices && response.choices.length > 0) {
        console.log('✅ API Response:', response.choices[0].message.content);
        return {
          success: true,
          message: 'Azure OpenAI configuration is valid!',
          details: {
            endpoint: azureOpenAIService.endpoint,
            deploymentName: azureOpenAIService.deploymentName,
            responseReceived: true
          }
        };
      } else {
        throw new Error('No response from API');
      }
      
    } catch (error) {
      console.error('❌ Azure OpenAI test failed:', error);
      return {
        success: false,
        message: 'Azure OpenAI configuration error',
        error: error.message
      };
    }
  },

  // Test complete image analysis pipeline
  async testImageAnalysis(imageUrl = 'https://example.com/test-image.jpg') {
    console.log('🧪 Testing Complete Image Analysis Pipeline...');
    console.log('🖼️ Test Image URL:', imageUrl);
    
    try {
      const { analyzeImage } = await import('./src/services/interface.js');
      
      console.log('🔄 Running image analysis...');
      const result = await analyzeImage(imageUrl, 'test-' + Date.now());
      
      console.log('✅ Analysis Result:', result);
      return {
        success: true,
        message: 'Image analysis pipeline working correctly!',
        result
      };
      
    } catch (error) {
      console.error('❌ Image analysis test failed:', error);
      return {
        success: false,
        message: 'Image analysis pipeline error',
        error: error.message
      };
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Running Complete Azure Services Test Suite...\n');
    
    const results = {
      blobStorage: await this.testBlobStorage(),
      openAI: await this.testOpenAI(),
      // Skip image analysis test as it requires valid image URL
    };
    
    console.log('\n📊 Test Results Summary:');
    console.log('=====================================');
    
    Object.entries(results).forEach(([testName, result]) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${testName}: ${result.message}`);
      if (!result.success) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    const allPassed = Object.values(results).every(r => r.success);
    
    if (allPassed) {
      console.log('\n🎉 All tests passed! Your Azure services are configured correctly.');
      console.log('You can now use real image upload and AI classification features.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check your configuration in the .env file.');
      console.log('See AZURE_SETUP_GUIDE.md for detailed setup instructions.');
    }
    
    return results;
  }
};

// Auto-export for browser console usage
if (typeof window !== 'undefined') {
  window.testAzureServices = testAzureServices;
  console.log('🔧 Azure test utilities loaded!');
  console.log('Run testAzureServices.runAllTests() to test your configuration.');
}
