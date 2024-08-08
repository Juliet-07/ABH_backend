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

  async uploadFileToBlobStorage(file: Express.Multer.File): Promise<string> {
    try {
      console.log(file);

      const maxFileSize = 70 * 1024 * 1024; // 70MB in bytes
      if (file.size > maxFileSize) {
        throw new BadRequestException('File size exceeds the maximum allowed limit (70MB).');
      }

      const validateFileType = (file: Express.Multer.File): boolean => {
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
        const extension = file.originalname.split('.').pop()?.toLowerCase();

        return extension ? allowedExtensions.includes(extension) : false;
      };

      if (!validateFileType(file)) {
        throw new BadRequestException('Unsupported file type. Only JPEG, PNG, and PDF files are allowed.');
      }

      const blobName = `${uuidv4()}_${Date.now()}_${file.originalname}`;
      const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      // Set Content-Type header based on file type
      const options = {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      };

      // Upload the file
      await blockBlobClient.upload(file.buffer, file.buffer.length, options);

      // Return the Blob URL
      return blockBlobClient.url;
    } catch (error) {
      console.error('Error uploading file to Azure Blob Storage:', error);
      throw error;
    }
  }

  async uploadDocumentToBlobStorage(file: Express.Multer.File): Promise<string> {
    try {
      console.log(file);

      const maxFileSize = 70 * 1024 * 1024; // 70MB in bytes
      if (file.size > maxFileSize) {
        throw new BadRequestException('File size exceeds the maximum allowed limit (70MB).');
      }

      const validateFileType = (file: Express.Multer.File): boolean => {
        const allowedExtensions = ['pdf'];
        const extension = file.originalname.split('.').pop()?.toLowerCase();

        return extension ? allowedExtensions.includes(extension) : false;
      };

      if (!validateFileType(file)) {
        throw new BadRequestException('Unsupported file type. Only JPEG, PNG, and PDF files are allowed.');
      }

      const blobName = `${uuidv4()}_${Date.now()}_${file.originalname}`;
      const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      // Set Content-Type header based on file type
      const options = {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      };

      // Upload the file
      await blockBlobClient.upload(file.buffer, file.buffer.length, options);

      // Return the Blob URL
      return blockBlobClient.url;
    } catch (error) {
      console.error('Error uploading file to Azure Blob Storage:', error);
      throw error;
    }
  }

  async uploadMultipleToBlobStorage(files: Express.Multer.File[]): Promise<string[]> {
    try {
      // Prepare an array of promises for uploading files
      const uploadPromises = files.map(async (file) => {
        const maxFileSize = 70 * 1024 * 1024; // 70MB in bytes
        if (file.size > maxFileSize) {
          throw new BadRequestException('File size exceeds the maximum allowed limit (70MB).');
        }

        const validateFileType = (file: Express.Multer.File): boolean => {
          const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
          const extension = file.originalname.split('.').pop()?.toLowerCase();

          return extension ? allowedExtensions.includes(extension) : false;
        };

        if (!validateFileType(file)) {
          throw new BadRequestException('Unsupported file type. Only JPEG, PNG, and PDF files are allowed.');
        }

        const blobName = `${uuidv4()}_${Date.now()}_${file.originalname}`;
        const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(blobName);

        // Set Content-Type header based on file type
        const options = {
          blobHTTPHeaders: { blobContentType: file.mimetype },
        };

        // Upload the file
        await blockBlobClient.upload(file.buffer, file.buffer.length, options);

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
