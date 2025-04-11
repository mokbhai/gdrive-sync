/**
 * Google Drive Sync Package
 * A powerful Node.js package for automated Google Drive synchronization
 */

import { type GDriveCredentials, type GDriveFile } from './type/gDrive';
import { type LocalFile, type LocalFolder } from './type/localFile';
import Logger from './service/logger';
import { google } from 'googleapis';
import ValidateCred from './service/validateCred';
import { CacheService } from './service/cache';
import * as fsPromises from 'fs/promises';
import DriveService from './service/driveService';
import path from 'path';

export interface GDriveSyncOptions {
  /** The path to save downloaded files */
  downloadPath?: string;
  /** Whether to enable logging */
  enableLogging?: boolean;
  /** Whether to enable caching */
  enableCache?: boolean;
  /** Cache directory */
  cacheDir?: string;
  /** Google Drive credentials */
  credentials?: GDriveCredentials;
}

export class GDriveSync {
  private options: GDriveSyncOptions;
  private credentials: GDriveCredentials | null = null;
  private eventListeners: { [key: string]: Function[] } = {};
  private driveClient: any;
  private driveService!: DriveService;
  private logger: Logger;
  private downloadPath: string;
  private cacheService: CacheService | null = null;

  constructor(options: GDriveSyncOptions = {}) {
    // Initialize logger first
    this.logger = new Logger(options.enableLogging ?? true);

    // Set download path with default value
    this.downloadPath = options.downloadPath || './mokbhaimj-gdrive-sync';

    this.options = {
      downloadPath: this.downloadPath,
      enableLogging: options.enableLogging ?? true,
      enableCache: options.enableCache ?? true,
      cacheDir: options.cacheDir || './',
      credentials: options.credentials,
    };

    // If credentials are provided in options, set them
    if (options.credentials) {
      this.setCredentials(options.credentials);
    }

    // Bind the emit function to this instance
    this.emit = this.emit.bind(this);
  }

  /**
   * Set Google Drive credentials
   * @param credentials Google Drive API credentials
   * @throws Error if credentials are invalid
   */
  private setCredentials(credentials: GDriveCredentials): void {
    const validateCred = new ValidateCred(credentials);
    const validation = validateCred.validateCredentials(credentials);
    if (!validation.isValid) {
      this.logger.error(
        `Invalid credentials:\n${validation.errors.join('\n')}`
      );
      throw new Error(`Invalid credentials:\n${validation.errors.join('\n')}`);
    }

    this.credentials = credentials;
    this.logger.log('Google Drive credentials set successfully');
  }

  /**
   * Initialize the Google Drive sync and test the connection
   */
  public async initialize(): Promise<void> {
    if (this.driveClient) {
      this.logger.log('Google Drive Sync already initialized');
      this.emit('alreadyInitialized', {});
      return;
    }

    this.logger.log('Initializing Google Drive Sync...');
    this.emit('initializing', {});

    if (this.options.enableCache) {
      this.cacheService = new CacheService(this.options.cacheDir || './');
      await this.cacheService.loadCache();

      this.logger.log('Cache loaded successfully');
      this.emit('cacheLoaded', {});
    }

    // Create download directory if it doesn't exist
    await fsPromises.mkdir(this.downloadPath, {
      recursive: true,
    });
    this.logger.log('Download directory created successfully');
    this.emit('directoryCreated', { path: this.downloadPath });

    // Check if credentials are set, and if not, throw an error
    if (!this.credentials) {
      this.logger.error('No credentials found.', this.emit);
      throw new Error('No credentials found. Please set credentials first.');
    }

    // Set up Google Drive API with the provided credentials
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          type: this.credentials.type,
          project_id: this.credentials.project_id,
          private_key_id: this.credentials.private_key_id,
          private_key: this.credentials.private_key,
          client_email: this.credentials.client_email,
          client_id: this.credentials.client_id,
        },
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });

      // Create Drive client
      const drive = google.drive({ version: 'v3', auth });
      this.driveClient = drive;

      this.driveService = new DriveService(
        this.driveClient,
        this.logger,
        this.cacheService,
        this.emit
      );
      const testConnection = await this.driveService.testConnection();
      if (!testConnection) {
        this.logger.error('Failed to initialize Google Drive API', this.emit);
        throw new Error('Failed to initialize Google Drive API');
      }

      this.logger.log('Google Drive Sync initialized successfully');
      this.emit('initialized', {});
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to initialize Google Drive API: ${errorMessage}`,
        this.emit
      );
      throw new Error(`Failed to initialize Google Drive API: ${errorMessage}`);
    }
  }

  /**
   * Start syncing files from Google Drive
   */
  public async sync(): Promise<void> {
    try {
      if (!this.driveClient || !this.driveService) {
        this.logger.warn('Google Drive Sync not initialized');
        this.emit('notInitialized', {});
        await this.initialize();
      }

      this.logger.log('Starting Google Drive sync...');
      this.emit('syncStarted', {});

      const folders = await this.driveService.listFolders();
      const topLevelFolders = new Set<GDriveFile>();
      const localFoldersStructure: LocalFolder[] = [];

      // this.emit('rootFoldersFound', {
      //   count: rootFolders.length,
      //   folders: rootFolders,
      // });

      for (const folder of folders) {
        if (!folder.parents || folder.parents.length === 0) {
          topLevelFolders.add(folder);
          continue;
        }
        let currentFolder = folder;
        while (true) {
          const parent = folders.find(
            (f) => f.id === currentFolder.parents?.[0]
          );
          if (!parent) {
            topLevelFolders.add(currentFolder);
            break;
          }
          currentFolder = parent;
        }
      }

      // Process top-level folders
      for (const folder of topLevelFolders) {
        try {
          const fullPath = path.join(this.downloadPath, folder.name);
          await fsPromises.mkdir(fullPath, { recursive: true });

          this.logger.log(`Downloading Folder: ${folder.name} at ${fullPath}`);

          const folderStructure =
            await this.driveService.downloadFilesAndFolder(folder.id, fullPath);
          localFoldersStructure.push(folderStructure);
        } catch (error: unknown) {
          this.logger.error(
            `Error processing top-level folder ${folder.name}: ${error}`
          );
          this.emit('folderError', { folder, error });
        }
      }

      await fsPromises.writeFile(
        path.join(this.downloadPath, 'localFoldersStructure.json'),
        JSON.stringify(localFoldersStructure, null, 2)
      );
      // Save cache after sync is complete
      await this.cacheService?.saveCache();

      this.logger.log('Google Drive sync completed successfully');
      this.emit('syncCompleted', { structure: localFoldersStructure });
    } catch (error: unknown) {
      this.logger.error(
        `Failed to sync with Google Drive: ${error}`,
        this.emit
      );
      throw error;
    }
  }

  /**
   * Add an event listener
   * @param event Event name
   * @param callback Callback function
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
    this.logger.log(`Added event listener for ${event}`);
  }

  /**
   * Remove an event listener
   * @param event Event name
   * @param callback Callback function
   */
  off(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      return;
    }
    this.eventListeners[event] = this.eventListeners[event].filter(
      (cb) => cb !== callback
    );
    this.logger.log(`Removed event listener for ${event}`);
  }

  /**
   * Emit an event
   * @param event Event name
   * @param data Event data
   */
  private emit(event: string, data: any): void {
    if (!this.eventListeners[event]) {
      return;
    }
    this.eventListeners[event].forEach((callback) => callback(data));
    this.logger.log(`Emitted event: ${event}`);
  }
}
