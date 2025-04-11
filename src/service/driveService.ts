import { google } from 'googleapis';
import { rateLimiter, sleep } from './rateLimiter';
import Logger from './logger';
import type { GDriveFile } from '../type/gDrive';
import path from 'path';
import type { LocalFolder } from '../type/localFile';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import type { CacheService } from './cache';

interface RetryQueueItem {
  fileId: string;
  filePath: string;
  retryCount: number;
}

class DriveService {
  private driveClient: any;
  private logger: Logger;
  private MAX_RETRIES = 3;
  private INITIAL_RETRY_DELAY = 1000;
  private cacheService: CacheService | null = null;
  private queue: RetryQueueItem[] = [];
  private isProcessing: boolean = false;
  private emit: any;

  constructor(
    driveClient: any,
    logger: Logger,
    cacheService: CacheService | null,
    emit: any
  ) {
    this.driveClient = driveClient;
    this.logger = logger;
    this.cacheService = cacheService;
    this.emit = emit;
  }

  private async queueAdd(item: RetryQueueItem) {
    this.queue.push(item);
    if (!this.isProcessing) {
      await this.process();
    }
  }

  private async process() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    while (this.queue.length > 0) {
      const item = this.queue[0];
      if (!item) {
        this.logger.warn('No item in queue');
        break;
      }
      try {
        await this.downloadFileWithRetry(
          item.fileId,
          item.filePath,
          item.retryCount
        );
        this.queue.shift(); // Remove successful item
      } catch (error) {
        if (item.retryCount < this.MAX_RETRIES) {
          // Move to end of queue for retry
          this.queue.push({
            ...item,
            retryCount: item.retryCount + 1,
          });
          this.queue.shift();
        } else {
          // Max retries reached, remove from queue
          this.queue.shift();
          this.logger.error(
            `Failed to download file after ${this.MAX_RETRIES} attempts: ${item.filePath}`
          );
        }
      }
    }
    this.isProcessing = false;
  }

  /**
   * Test the connection to the Google Drive API
   * @returns A boolean indicating if the connection is successful
   * @throws Error if there is an error testing the connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await rateLimiter.acquire();
      await this.driveClient.files.list({
        pageSize: 1,
        fields: 'files(id, name, mimeType)',
      });

      this.emit('connectionTested', { success: true });
      return true;
    } catch (error) {
      this.logger.error(`Error testing connection: ${error}`);
      this.emit('connectionError', { error });
      throw error;
    }
  }

  /**
   * List all folders in the user's Google Drive
   * @returns An array of GDriveFile objects representing the folders
   * @throws Error if there is an error listing the folders
   */
  async listFolders(): Promise<GDriveFile[]> {
    try {
      await rateLimiter.acquire();

      let allFolders: GDriveFile[] = [];
      let nextPageToken: string | undefined = undefined;

      do {
        const response: any = await this.driveClient.files.list({
          q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
          fields:
            'nextPageToken, files(id, name, mimeType, parents, modifiedTime)',
          spaces: 'drive',
          pageToken: nextPageToken,
        });

        const folders = (response.data.files || []).map((file: GDriveFile) => ({
          id: file.id || '',
          name: file.name || '',
          mimeType: file.mimeType || '',
          parents: file.parents,
          modifiedTime: file.modifiedTime,
        })) as GDriveFile[];

        allFolders = [...allFolders, ...folders];
        nextPageToken = response.data.nextPageToken;

        // If we have a next page token, wait a bit before making the next request
        if (nextPageToken) {
          await sleep(100);
        }
      } while (nextPageToken);

      this.logger.log(`Found ${allFolders.length} folders in drive`);
      this.emit('foldersListed', {
        count: allFolders.length,
        folders: allFolders,
      });

      return allFolders;
    } catch (error) {
      this.logger.error(`Error listing files: ${error}`, this.emit);
      throw error;
    }
  }

  /**
   * List all files in a folder
   * @param folderId The ID of the folder to list files from
   * @param folderPath The path to the folder
   * @returns An array of GDriveFile objects representing the files
   * @throws Error if there is an error listing the files
   */
  async listFiles(folderId: string, folderPath: string): Promise<GDriveFile[]> {
    try {
      await rateLimiter.acquire();

      let allFiles: GDriveFile[] = [];
      let nextPageToken: string | undefined = undefined;

      do {
        const response: any = await this.driveClient.files.list({
          q: `'${folderId}' in parents and trashed = false`,
          fields:
            'nextPageToken, files(id, name, mimeType, parents, modifiedTime)',
          spaces: 'drive',
          pageToken: nextPageToken,
        });

        const files = (response.data.files || []).map((file: GDriveFile) => ({
          id: file.id || '',
          name: file.name || '',
          mimeType: file.mimeType || '',
          parents: file.parents,
          path: folderPath,
          modifiedTime: file.modifiedTime,
        })) as GDriveFile[];

        allFiles = [...allFiles, ...files];
        nextPageToken = response.data.nextPageToken;

        // If we have a next page token, wait a bit before making the next request
        if (nextPageToken) {
          await sleep(100);
        }
      } while (nextPageToken);

      this.logger.log(`Found ${allFiles.length} files in ${folderPath}`);
      this.emit('filesListed', {
        folderId,
        folderPath,
        count: allFiles.length,
        files: allFiles,
      });

      return allFiles;
    } catch (error) {
      this.logger.error(`Error listing files: ${error}`, this.emit);
      throw error;
    }
  }

  /**
   * Download files and folders from Google Drive
   * @param folderId The ID of the folder to download
   * @param folderPath The path to the folder
   * @returns A LocalFolder object representing the folder and its contents
   * @throws Error if there is an error downloading the files and folders
   */
  async downloadFilesAndFolder(
    folderId: string,
    folderPath: string
  ): Promise<LocalFolder> {
    try {
      this.emit('folderDownloadStarted', { folderId, folderPath });

      const files = await this.listFiles(folderId, folderPath);
      const folder: LocalFolder = {
        name: path.basename(folderPath),
        id: folderId,
        path: folderPath,
        mimeType: 'application/vnd.google-apps.folder',
        folders: [],
        files: [],
        modifiedTime: new Date().toISOString(),
      };

      // Process files in parallel with controlled concurrency
      const CONCURRENT_DOWNLOADS = 5; // Number of concurrent downloads
      const fileChunks = [];

      // Split files into chunks for parallel processing
      for (let i = 0; i < files.length; i += CONCURRENT_DOWNLOADS) {
        fileChunks.push(files.slice(i, i + CONCURRENT_DOWNLOADS));
      }

      // Process each chunk in parallel
      for (const chunk of fileChunks) {
        await Promise.all(
          chunk.map(async (file: GDriveFile) => {
            try {
              if (file.mimeType !== 'application/vnd.google-apps.folder') {
                const filePath = path.join(folderPath, file.name);
                this.emit('fileDownloadStarted', { file, filePath });

                await this.downloadFile(file.id, filePath);

                folder.files.push({
                  name: file.name,
                  id: file.id,
                  path: filePath,
                  mimeType: file.mimeType,
                  modifiedTime: file.modifiedTime || '',
                });

                this.emit('fileDownloaded', { file, filePath });
              } else {
                const subFolderPath = path.join(folderPath, file.name);
                const subFolder = await this.downloadFilesAndFolder(
                  file.id,
                  subFolderPath
                );
                folder.folders.push(subFolder);
              }
            } catch (error) {
              this.logger.error(
                `Error processing file/folder ${file.name}: ${error}`,
                this.emit
              );
            }
          })
        );
      }

      this.emit('folderDownloaded', {
        folderId,
        folderPath,
        structure: folder,
      });
      return folder;
    } catch (error) {
      this.logger.error(
        `Error processing folder ${folderPath}: ${error}`,
        this.emit
      );
      this.emit('folderDownloadError', { folderId, folderPath, error });
      throw error;
    }
  }

  async downloadFileWithRetry(
    fileId: string,
    filePath: string,
    retryCount: number = 0
  ): Promise<void> {
    try {
      await rateLimiter.acquire();
      const response = await this.driveClient.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
        let error: Error | null = null;
        let isFinished = false;

        // Handle stream errors
        response.data.on('error', (err: Error) => {
          error = err;
          if (!isFinished) {
            writer.end();
            reject(err);
          }
        });

        // Handle write errors
        writer.on('error', (err: Error) => {
          error = err;
          if (!isFinished) {
            writer.end();
            reject(err);
          }
        });

        // Handle successful completion
        writer.on('finish', () => {
          isFinished = true;
          if (!error) {
            resolve();
          }
        });

        // Handle stream end
        response.data.on('end', () => {
          if (!isFinished) {
            writer.end();
          }
        });

        // Pipe the data with error handling
        response.data.pipe(writer);
      });
    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        this.logger.error(
          `Retrying download of ${filePath} after ${delay}ms (attempt ${
            retryCount + 1
          }/${this.MAX_RETRIES})`
        );
        this.emit('fileRetry', { fileId, filePath, retryCount, delay });
        await sleep(delay);
        return this.downloadFileWithRetry(fileId, filePath, retryCount + 1);
      }
      this.emit('fileRetryFailed', { fileId, filePath, retryCount, error });
      throw error;
    }
  }

  async downloadFile(fileId: string, filePath: string): Promise<void> {
    let tempFilePath = `${filePath}.tmp`;
    try {
      // First, get the file metadata to verify it exists and get its size
      await rateLimiter.acquire();
      const metadata = await this.driveClient.files.get({
        fileId,
        fields: 'size, name, mimeType, modifiedTime',
      });

      if (!metadata.data) {
        this.emit('fileNotFound', { fileId });
        throw new Error(`File ${fileId} not found`);
      }

      // Check if file needs to be updated using cache
      const needsUpdate = await this.cacheService?.needsUpdate(
        fileId,
        metadata.data.modifiedTime || '',
        parseInt(metadata.data.size || '0', 10)
      );

      if (!needsUpdate) {
        this.logger.warn(
          `File ${metadata.data.name} is up to date, skipping download`
        );
        this.emit('fileSkipped', {
          fileId,
          name: metadata.data.name,
          reason: 'up-to-date',
        });
        return;
      }

      // Create the directory if it doesn't exist
      await fsPromises.mkdir(path.dirname(filePath), { recursive: true });

      // Download to a temporary file first
      await this.downloadFileWithRetry(fileId, tempFilePath);

      // Verify the downloaded file
      const stats = await fsPromises.stat(tempFilePath);
      const downloadedSize = stats.size;
      const expectedSize = parseInt(metadata.data.size || '0', 10);

      if (downloadedSize === 0) {
        this.logger.warn(`Downloaded file is empty: ${filePath}`);
        this.emit('fileEmpty', { fileId, filePath });
        throw new Error(`Downloaded file is empty: ${filePath}`);
      }

      if (expectedSize > 0 && downloadedSize !== expectedSize) {
        this.logger.warn(
          `File size mismatch for ${filePath}. Expected: ${expectedSize}, Got: ${downloadedSize}`
        );
        this.emit('fileSizeMismatch', {
          fileId,
          filePath,
          expectedSize,
          actualSize: downloadedSize,
        });
        throw new Error(
          `File size mismatch for ${filePath}. Expected: ${expectedSize}, Got: ${downloadedSize}`
        );
      }

      // If verification passes, move the temporary file to the final location
      await fsPromises.rename(tempFilePath, filePath);
      tempFilePath = ''; // Clear the temp path to prevent deletion

      // Update cache
      this.cacheService?.set(
        fileId,
        metadata.data.modifiedTime || '',
        downloadedSize
      );

      this.logger.log(
        `Successfully downloaded ${metadata.data.name} (${downloadedSize} bytes)`
      );
      this.emit('fileVerified', {
        fileId,
        name: metadata.data.name,
        size: downloadedSize,
      });
    } catch (error) {
      // Clean up temporary file if it exists
      if (
        tempFilePath &&
        (await fsPromises
          .access(tempFilePath)
          .then(() => true)
          .catch(() => false))
      ) {
        await fsPromises.unlink(tempFilePath).catch(() => {});
      }

      // Add to retry queue if initial attempt fails
      await this.queueAdd({
        fileId,
        filePath,
        retryCount: 0,
      });
      this.logger.error(
        `Error downloading file ${filePath}: ${error}`,
        this.emit
      );
      this.emit('fileDownloadError', { fileId, filePath, error });
      throw error;
    }
  }
}

export default DriveService;
