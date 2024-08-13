import { BadRequestException, Injectable } from '@nestjs/common';
import {
  StorageSharedKeyCredential,
  BlobServiceClient,
  ContainerClient,
  BlockBlobClient,
} from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;

  constructor(private readonly configService: ConfigService) {
    const accountName = this.configService.get<string>('AZURE_ACCT_NAME');
    const accountKey = this.configService.get<string>('AZURE_ACCT_KEY');
    const containerName = this.configService.get<string>('AZURE_CONTAINER_NAME');

    if (!accountName || !accountKey || !containerName) {
      throw new Error('Missing required Azure Blob Storage configuration');
    }

    this.blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new StorageSharedKeyCredential(accountName, accountKey)
    );

    this.containerClient = this.blobServiceClient.getContainerClient(containerName);
  }

  async uploadFileToBlobStorage(fileBuffer: Buffer, fileName: string, mimetype: string): Promise<string> {
    try {
      const validateFileType = (fileName: string): boolean => {
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        const extension = fileName.split('.').pop()?.toLowerCase();
        return extension ? allowedExtensions.includes(extension) : false;
      };

      if (!validateFileType(fileName)) {
        throw new BadRequestException('Unsupported file type. Only JPEG and PNG files are allowed.');
      }

      const blobName = `${uuidv4()}_${Date.now()}_${fileName}`;
      const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      // Set Content-Type header based on file type
      const options = {
        blobHTTPHeaders: { blobContentType: mimetype },
      };

      // Upload the file
      await blockBlobClient.uploadData(fileBuffer, options);

      // Return the Blob URL
      return blockBlobClient.url;
    } catch (error) {
      console.error('Error uploading file to Azure Blob Storage:', error);
      throw error;
    }
  }

  async uploadDocumentToBlobStorage(fileBuffer: Buffer, fileName: string, mimetype: string): Promise<string> {
    try {
      const validateFileType = (fileName: string): boolean => {
        const allowedExtensions = ['pdf'];
        const extension = fileName.split('.').pop()?.toLowerCase();
        return extension ? allowedExtensions.includes(extension) : false;
      };

      if (!validateFileType(fileName)) {
        throw new BadRequestException('Unsupported file type. Only JPEG and PNG files are allowed.');
      }

      const blobName = `${uuidv4()}_${Date.now()}_${fileName}`;
      const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      // Set Content-Type header based on file type
      const options = {
        blobHTTPHeaders: { blobContentType: mimetype },
      };

      // Upload the file
      await blockBlobClient.uploadData(fileBuffer, options);

      // Return the Blob URL
      return blockBlobClient.url;
    } catch (error) {
      console.error('Error uploading file to Azure Blob Storage:', error);
      throw error;
    }
  }

  async uploadMultipleToBlobStorage(fileBuffers: Buffer[], fileNames: string[], mimetypes: string[]): Promise<string[]> {
    try {
      if (fileBuffers.length !== fileNames.length || fileBuffers.length !== mimetypes.length) {
        throw new BadRequestException('Mismatch between number of files, names, and MIME types.');
      }
  
      const maxFileSize = 70 * 1024 * 1024; // 70MB in bytes
  
      // Prepare an array of promises for uploading files
      const uploadPromises = fileBuffers.map(async (buffer, index) => {
        const fileName = fileNames[index];
        const mimetype = mimetypes[index];
  
        // Check file size
        if (buffer.length > maxFileSize) {
          throw new BadRequestException('File size exceeds the maximum allowed limit (70MB).');
        }
  
        // Validate file type
        const validateFileType = (fileName: string): boolean => {
          const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
          const extension = fileName.split('.').pop()?.toLowerCase();
          return extension ? allowedExtensions.includes(extension) : false;
        };
  
        if (!validateFileType(fileName)) {
          throw new BadRequestException('Unsupported file type. Only JPEG, PNG, and PDF files are allowed.');
        }
  
        // Generate a unique name for the blob
        const blobName = `${uuidv4()}_${Date.now()}_${fileName}`;
        const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(blobName);
  
        // Set Content-Type header based on file type
        const options = {
          blobHTTPHeaders: { blobContentType: mimetype },
        };
  
        // Upload the file
        await blockBlobClient.uploadData(buffer, options);
  
        // Return the Blob URL
        return blockBlobClient.url;
      });
  
      // Wait for all uploads to complete and return URLs
      const uploadedUrls = await Promise.all(uploadPromises);
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading files to Azure Blob Storage:', error);
      throw error;
    }
  }
  

}
