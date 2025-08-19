# ⚠️ Azure Blob Storage 实现说明

## 当前状态

由于浏览器环境的限制，当前的 Azure Blob Storage 实现使用了**模拟上传**的方式。这是因为：

1. **浏览器安全限制**：直接从浏览器上传到 Azure Storage 需要 SAS 令牌
2. **Azure SDK 限制**：Azure SDK 在浏览器中有兼容性问题（需要 Node.js Buffer 等）
3. **安全考虑**：不应在前端直接暴露 Storage Account Key

## 解决方案选项

### 选项 1: 后端 API（推荐）

创建一个后端服务来处理文件上传：

```javascript
// 后端 API 端点
POST /api/upload-image
Content-Type: multipart/form-data

// 返回结果
{
  "url": "https://curio.blob.core.windows.net/background/image-uuid.jpg",
  "blobName": "image-uuid.jpg"
}
```

### 选项 2: Azure Functions

使用 Azure Functions 作为无服务器上传端点：

```javascript
// Azure Function
module.exports = async function (context, req) {
    // 处理文件上传逻辑
    // 返回 blob URL
};
```

### 选项 3: SAS 令牌生成服务

创建一个后端服务生成 SAS 令牌：

```javascript
// 获取上传 SAS 令牌
GET /api/generate-upload-sas?filename=image.jpg

// 返回
{
  "uploadUrl": "https://curio.blob.core.windows.net/background/image.jpg?sv=...&sig=...",
  "blobUrl": "https://curio.blob.core.windows.net/background/image.jpg"
}
```

## 当前功能状态

✅ **图片分类**：正常工作，使用 Azure OpenAI  
⚠️ **图片上传**：使用本地模拟，生成本地 blob URL  
✅ **背景选择**：正常工作  
✅ **对话生成**：正常工作，使用 Azure OpenAI  

## 测试当前功能

尽管图片上传是模拟的，您仍然可以测试：

1. **上传图片** - 会创建本地 blob URL
2. **AI 分类** - 会调用真实的 Azure OpenAI
3. **背景合成** - 会使用选定的背景
4. **对话生成** - 会生成真实的 AI 对话

## 实现真实上传的步骤

如果您想实现真实的 Azure Blob 上传，建议：

1. **创建后端 API**（Node.js/Python/C# 等）
2. **在后端使用 Azure SDK**
3. **前端调用后端 API**
4. **返回真实的 Azure blob URL**

### 示例后端代码（Node.js）

```javascript
const { BlobServiceClient } = require('@azure/storage-blob');
const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    const containerClient = blobServiceClient.getContainerClient('background');
    const blobName = `${Date.now()}-${req.file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });
    
    res.json({
      url: blockBlobClient.url,
      blobName: blobName
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

然后在前端修改 `azureBlobService.js` 调用这个 API：

```javascript
async uploadImage(file, options = {}) {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}
```

## 总结

当前实现可以让您测试完整的应用功能，包括真实的 AI 分类和对话生成。图片上传虽然是模拟的，但不影响其他功能的正常使用。
