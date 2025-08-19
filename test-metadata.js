// Test Azure OpenAI metadata generation directly
import fs from 'fs';
import path from 'path';

// Load environment variables manually
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const endpoint = envVars.VITE_AZURE_OPENAI_ENDPOINT?.replace(/\/$/, '');
const apiKey = envVars.VITE_AZURE_OPENAI_API_KEY;
const deploymentName = envVars.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';
const apiVersion = envVars.VITE_AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

console.log('Testing Azure OpenAI metadata generation...');
console.log('Endpoint:', endpoint);
console.log('API Key length:', apiKey?.length);
console.log('Deployment:', deploymentName);

const metadataPrompt = `You are a creative historian with expertise in both factual and imaginative artifact analysis. For any uploaded image, generate:  

Name:
- A creative yet plausible title (e.g., 'Ming Dynasty Celestial Vase' for porcelain, 'Sir Whiskers, Duke of Purrington' for a cat) 
- If the object/artwork is a **real, verifiable historical artifact or painting** (e.g., famous museum piece, well-documented in history), use its **authentic historical name**.

Timestamp: Upload the current date/time formatted as YYYY/MM/DD HH:MM

Description: A <80-word English narrative combining:  
- For real artifacts/artworks: factual historical or cultural context (date, origin, creator, significance), with a subtle dash of whimsical or poetic commentary.  
  Example: "The Han Dynasty jade bi symbolizes heaven, once gracing imperial rituals — perhaps still listening for the echo of courtly footsteps."  
- For ambiguous or modern items: blend factual observation with playful lore.  
  Example: "AirPods of Delphi: Believed to channel Apollo's whispers in 2024 tech mythology."   

Rules:  
- Prioritize factual accuracy for artifacts/artworks by using visual cues (materials, motifs) to identify origin, creator, and significance.  
- If the item is famous and identifiable, keep the **authentic name and key facts accurate**.  
- For ambiguous or unverified items, blend factual observation with creative fiction.  
- Always keep descriptions engaging — may include light humor, admiration, or imaginative framing without distorting historical truth.  
- Output must remain concise and under 80 words. 

Output format (exactly 3 lines, no extra text):
Name: <Generated Name>
Timestamp: <YYYY/MM/DD HH:MM>
Description: <Generated description under 80 words>`;

// Test with a simple text prompt (no image)
const requestBody = {
  messages: [
    {
      role: "system",
      content: metadataPrompt
    },
    {
      role: "user", 
      content: "This image has been classified as: Modern Product (Category 3) with 95.0% confidence. Please generate an appropriate name and description following the metadata generation guidelines. The image shows a low-poly 3D cow figure."
    }
  ],
  max_tokens: 300,
  temperature: 0.7
};

const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;

try {
  console.log('Making request to:', url);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify(requestBody)
  });

  console.log('Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    process.exit(1);
  }

  const data = await response.json();
  console.log('Response received:', data);
  
  if (data.choices && data.choices.length > 0) {
    const content = data.choices[0].message.content;
    console.log('\n=== RAW METADATA RESPONSE ===');
    console.log(content);
    
    // Test parsing
    console.log('\n=== TESTING PARSING ===');
    if (content.includes('Name:') && content.includes('Description:')) {
      const nameMatch = content.match(/Name:\s*(.*)/);
      const tsMatch = content.match(/Timestamp:\s*(.*)/);
      const descMatch = content.match(/Description:\s*([\s\S]*)/);
      
      if (nameMatch && descMatch) {
        const name = nameMatch[1].trim();
        const timestamp = tsMatch ? tsMatch[1].trim() : null;
        const description = descMatch[1].trim().replace(/\n+/g, ' ').trim();
        
        console.log('Parsed name:', name);
        console.log('Parsed timestamp:', timestamp);
        console.log('Parsed description:', description);
        console.log('✓ Parsing successful!');
      } else {
        console.log('❌ Parsing failed - could not extract name or description');
      }
    } else {
      console.log('❌ Response does not contain expected Name: and Description: format');
    }
  } else {
    console.log('❌ No choices in response');
  }

} catch (error) {
  console.error('Request failed:', error);
  process.exit(1);
}
