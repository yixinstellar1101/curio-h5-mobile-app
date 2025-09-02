/**
 * Azure Blob Storage Service
 * Handles image uploads to Azure Blob Storage via backend API
 */

class AzureBlobService {
  constructor() {
    // Use backend API endpoint for real blob upload
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://curio-backend.kindstone-04fc122c.swedencentral.azurecontainerapps.io';
    console.log('Azure Blob Service initialized with backend:', this.backendUrl);
  }

  /**
   * Upload image file to Azure Blob Storage via backend
   * @param {File} file - Image file to upload
   * @param {Object} options - Upload options (for compatibility)
   * @returns {Promise<{url: string, blobName: string, contentType: string}>}
   */
  async uploadImage(file, options = {}) {
    try {
      console.log('Uploading image to Azure Blob Storage:', file.name);
      
      // Validate file
      this.validateImageFile(file);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Call backend API to upload to Azure Blob
      const response = await fetch(`${this.backendUrl}/api/blob/upload-image`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary for multipart
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.blob_url) {
        throw new Error('Upload failed: No blob URL returned');
      }

      console.log('Image uploaded successfully:', result.blob_url);
      
      // Return in expected format
      return {
        url: result.blob_url,
        blobName: result.blob_name,
        contentType: file.type,
        size: result.size || file.size,
        uploadedAt: new Date().toISOString(),
        container: result.container
      };

    } catch (error) {
      console.error('Azure Blob upload error:', error);
      throw new AzureBlobError('UPLOAD_FAILED', error.message, error);
    }
  }

  /**
   * Test connection to Azure Blob Storage
   * @returns {Promise<boolean>} - Connection status
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.backendUrl}/api/blob/test-blob-connection`);
      const result = await response.json();
      console.log('Azure Blob connection test:', result);
      return result.success;
    } catch (error) {
      console.error('Azure Blob connection test failed:', error);
      return false;
    }
  }

  /**
   * Get blob URL from file (alias for uploadImage for compatibility)
   * @param {File} file - Image file
   * @returns {Promise<string>} - Azure Blob URL
   */
  async getBlobUrl(file) {
    const result = await this.uploadImage(file);
    return result.url;
  }

  /**
   * Delete blob from storage (placeholder - implement if needed)
   * @param {string} blobName - Name of blob to delete
   * @returns {Promise<boolean>}
   */
  async deleteBlob(blobName) {
    console.warn('Delete blob not implemented - add backend endpoint if needed');
    return false;
  }

  /**
   * Check if blob exists (placeholder - implement if needed)
   * @param {string} blobName - Name of blob to check
   * @returns {Promise<boolean>}
   */
  async blobExists(blobName) {
    console.warn('Blob exists check not implemented - add backend endpoint if needed');
    return false;
  }

  /**
   * Generate signed URL for blob access (not needed with public blobs)
   * @param {string} blobName - Name of blob
   * @param {number} expiresIn - URL expiry time in seconds
   * @returns {Promise<string>}
   */
  async generateSasUrl(blobName, expiresIn = 3600) {
    console.warn('SAS URL generation not needed for public blob containers');
    return `${this.backendUrl}/api/blob/${blobName}`;
  }

  /**
   * Validate image file before upload
   * @param {File} file - File to validate
   * @throws {AzureBlobError} If validation fails
   */
  validateImageFile(file) {
    // Check if file exists
    if (!file) {
      throw new AzureBlobError('INVALID_FILE', 'No file provided');
    }

    // Check file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new AzureBlobError('FILE_TOO_LARGE', `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds 10MB limit`);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new AzureBlobError('INVALID_FILE_FORMAT', `Unsupported file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`);
    }
  }

  /**
   * Get file extension from filename
   * @param {string} filename - Original filename
   * @returns {string} File extension without dot
   */
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }
}

// Custom error class for Azure Blob operations
export class AzureBlobError extends Error {
  constructor(code, message, originalError = null) {
    super(message);
    this.name = 'AzureBlobError';
    this.code = code;
    this.originalError = originalError;
  }
}

// Export singleton instance
export const azureBlobService = new AzureBlobService();
export default azureBlobService;
