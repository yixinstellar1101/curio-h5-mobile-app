# Azure Integration Setup Guide

本文档提供了完整的Azure服务集成配置指南，包括Azure Blob Storage和Azure OpenAI的设置。

## 📋 前置条件

1. **Azure订阅账户**
2. **Azure Storage Account（已创建容器）**  
3. **Azure OpenAI服务实例**
4. **管理员权限**用于配置服务

## 🔧 需要提供的信息

### 1. Azure Storage Account 信息

您需要提供以下信息：

```bash
# Storage Account 名称
VITE_AZURE_STORAGE_ACCOUNT_NAME=your_storage_account_name

# Storage Account 访问密钥 (Key1 或 Key2)
VITE_AZURE_STORAGE_ACCOUNT_KEY=your_storage_account_key

# Container 名称 (您已经创建的容器)
VITE_AZURE_STORAGE_CONTAINER_NAME=images
```

**如何获取这些信息：**

1. 登录 [Azure Portal](https://portal.azure.com)
2. 导航到您的 Storage Account
3. 在左侧菜单中选择"访问密钥"
4. 复制"存储账户名称"和"密钥1"的值
5. 在左侧菜单中选择"容器"，确认容器名称

### 2. Azure OpenAI 信息

您需要提供以下信息：

```bash
# OpenAI 服务端点
VITE_AZURE_OPENAI_ENDPOINT=https://your-openai-resource.openai.azure.com

# OpenAI API 密钥
VITE_AZURE_OPENAI_API_KEY=your_openai_api_key

# 部署名称 (GPT-4 Vision 模型部署)
VITE_AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4-vision

# API 版本
VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

**如何获取这些信息：**

1. 登录 [Azure Portal](https://portal.azure.com)
2. 导航到您的 Azure OpenAI 服务
3. 在左侧菜单中选择"密钥和终结点"
4. 复制"终结点"和"密钥1"的值
5. 在左侧菜单中选择"模型部署"，查看GPT-4 Vision部署名称

## ⚙️ 配置步骤

### 步骤 1: 环境变量配置

1. **复制环境变量模板**：
   ```bash
   copy .env.example .env
   ```

2. **编辑 `.env` 文件**，填入您的实际配置：
   ```bash
   # Azure Blob Storage Configuration
   VITE_AZURE_STORAGE_ACCOUNT_NAME=mystorageaccount
   VITE_AZURE_STORAGE_ACCOUNT_KEY=abcdef1234567890...
   VITE_AZURE_STORAGE_CONTAINER_NAME=images
   
   # Azure OpenAI Configuration  
   VITE_AZURE_OPENAI_ENDPOINT=https://myopenai.openai.azure.com
   VITE_AZURE_OPENAI_API_KEY=1234567890abcdef...
   VITE_AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4-vision
   VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview
   
   # Application Configuration
   VITE_APP_ENVIRONMENT=development
   ```

### 步骤 2: 验证配置

1. **重启开发服务器**：
   ```bash
   npm run dev
   ```

2. **检查控制台输出**，确保没有配置错误

3. **测试图片上传功能**：
   - 上传一张测试图片
   - 检查浏览器开发工具的Console面板
   - 确认上传和分类过程成功完成

## 🔐 安全最佳实践

### 1. 访问权限配置

**Azure Storage Account**:
- 容器访问级别建议设为"私有"或"Blob（仅限Blob的匿名读取访问）"
- 启用"安全传输必需"选项

**Azure OpenAI**:
- 使用最小权限原则
- 定期轮换API密钥
- 监控API使用情况

### 2. 网络安全

- 考虑配置Azure Storage和OpenAI的网络访问限制
- 在生产环境中使用HTTPS
- 启用CORS设置允许您的域名访问

### 3. 成本控制

- 设置Azure预算警报
- 监控Storage使用量和API调用次数
- 配置适当的数据生命周期管理策略

## 🧪 测试功能

配置完成后，您可以测试以下功能：

1. **图片上传**：
   - 选择或拍摄图片
   - 确认图片成功上传到Azure Blob Storage
   - 检查返回的URL是否可访问

2. **图片分类**：
   - 上传不同类型的图片
   - 验证AI分类结果的准确性
   - 检查分类置信度

3. **对话生成**：
   - 进入LiveRoom页面
   - 验证AI角色对话生成
   - 确认对话内容相关且合理

## 🐛 故障排除

### 常见错误及解决方案

**1. "Azure Storage credentials not configured"**
- 检查环境变量名称是否正确
- 确认.env文件在项目根目录
- 重启开发服务器

**2. "Upload failed: Forbidden"**
- 检查Storage Account访问密钥是否正确
- 验证容器是否存在且有写入权限
- 确认容器访问级别配置

**3. "Azure OpenAI API error: 401 Unauthorized"**
- 检查API密钥是否正确
- 验证端点URL格式
- 确认OpenAI服务是否启用

**4. "Classification failed"**
- 检查GPT-4 Vision部署是否正常运行
- 验证API版本是否支持vision功能
- 确认配额是否充足

### 调试技巧

1. **启用详细日志**：
   ```javascript
   // 在浏览器Console中启用详细日志
   localStorage.setItem('debug', 'true');
   ```

2. **检查网络请求**：
   - 打开浏览器开发工具
   - 查看Network选项卡
   - 检查API请求和响应

3. **验证环境变量**：
   ```javascript
   // 在浏览器Console中检查环境变量
   console.log('Storage Account:', import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME);
   console.log('OpenAI Endpoint:', import.meta.env.VITE_AZURE_OPENAI_ENDPOINT);
   ```

## 📞 技术支持

如果遇到问题，请提供以下信息：

1. 错误消息的完整文本
2. 浏览器Console日志
3. 网络请求详细信息
4. 环境配置（隐去敏感信息）

## 🚀 生产部署建议

在部署到生产环境时，请考虑：

1. **使用Azure Key Vault**存储敏感信息
2. **配置CDN**优化图片访问速度
3. **启用监控和日志记录**
4. **设置备份和灾难恢复策略**
5. **进行负载测试**验证性能

---

现在您可以开始配置Azure服务了！按照上述步骤填入您的实际配置信息，系统将使用真实的Azure服务进行图片上传和AI分析。
