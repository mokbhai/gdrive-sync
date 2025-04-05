/**
 * Example demonstrating how to use event listeners with GDriveSync
 */

import { GDriveSync } from '../src/gdrive-sync';
import { GDriveCredentials } from '../src/type/gDrive';

// Replace with your actual Google Drive credentials
const credentials: GDriveCredentials = {
  type: 'service_account',
  project_id: 'your-project-id',
  private_key_id: 'your-private-key-id',
  private_key: 'your-private-key',
  client_email: 'your-client-email',
  client_id: 'your-client-id',
};

async function main() {
  // Create a new instance of GDriveSync
  const gdriveSync = new GDriveSync({
    downloadPath: './downloaded-files',
    enableLogging: true,
    enableCache: true,
    credentials,
  });

  // Register event listeners for GDriveSync events
  gdriveSync.on('initializing', () => {
    console.log('🚀 Initializing Google Drive Sync...');
  });

  gdriveSync.on('initialized', () => {
    console.log('✅ Google Drive Sync initialized successfully');
  });

  gdriveSync.on('cacheLoaded', () => {
    console.log('📦 Cache loaded successfully');
  });

  gdriveSync.on('directoryCreated', (data) => {
    console.log(`📁 Created directory: ${data.path}`);
  });

  gdriveSync.on('syncStarted', () => {
    console.log('🔄 Starting sync process...');
  });

  gdriveSync.on('foldersFound', (data) => {
    console.log(`📂 Found ${data.count} root folders to sync`);
  });

  gdriveSync.on('folderDownloadStarted', (data) => {
    console.log(`⏳ Downloading folder: ${data.folder.name}`);
  });

  gdriveSync.on('folderDownloaded', (data) => {
    console.log(`✅ Downloaded folder: ${data.folder.name}`);
  });

  gdriveSync.on('folderError', (data) => {
    console.error(
      `❌ Error downloading folder ${data.folder.name}:`,
      data.error
    );
  });

  gdriveSync.on('syncCompleted', (data) => {
    console.log('🎉 Sync completed successfully!');
    console.log(`📊 Downloaded ${data.structure.length} folders`);
  });

  gdriveSync.on('error', (data) => {
    console.error('❌ Error:', data.message);
  });

  gdriveSync.on('syncError', (data) => {
    console.error('❌ Sync error:', data.error);
  });

  // Register event listeners for DriveService events
  gdriveSync.on('connectionTested', (data) => {
    console.log(`🔌 Connection test ${data.success ? 'successful' : 'failed'}`);
  });

  gdriveSync.on('connectionError', (data) => {
    console.error('🔌 Connection error:', data.error);
  });

  gdriveSync.on('foldersListed', (data) => {
    console.log(`📂 Listed ${data.count} folders in Google Drive`);
  });

  gdriveSync.on('filesListed', (data) => {
    console.log(`📄 Listed ${data.count} files in folder: ${data.folderPath}`);
  });

  gdriveSync.on('fileDownloadStarted', (data) => {
    console.log(`⏳ Downloading file: ${data.file.name}`);
  });

  gdriveSync.on('fileDownloaded', (data) => {
    console.log(`✅ Downloaded file: ${data.file.name}`);
  });

  gdriveSync.on('subFolderDownloadStarted', (data) => {
    console.log(`⏳ Downloading subfolder: ${data.folder.name}`);
  });

  gdriveSync.on('subFolderDownloaded', (data) => {
    console.log(`✅ Downloaded subfolder: ${data.folder.name}`);
  });

  gdriveSync.on('fileProcessingError', (data) => {
    console.error(`❌ Error processing file ${data.file.name}:`, data.error);
  });

  gdriveSync.on('fileRetry', (data) => {
    console.log(
      `🔄 Retrying download of file (attempt ${data.retryCount + 1})`
    );
  });

  gdriveSync.on('fileNotFound', (data) => {
    console.error(`❌ File not found: ${data.fileId}`);
  });

  gdriveSync.on('fileSkipped', (data) => {
    console.log(`⏭️ Skipped file: ${data.name} (${data.reason})`);
  });

  gdriveSync.on('fileEmpty', (data) => {
    console.warn(`⚠️ Downloaded file is empty: ${data.filePath}`);
  });

  gdriveSync.on('fileSizeMismatch', (data) => {
    console.warn(
      `⚠️ File size mismatch: ${data.filePath} (Expected: ${data.expectedSize}, Got: ${data.actualSize})`
    );
  });

  gdriveSync.on('fileVerified', (data) => {
    console.log(`✅ Verified file: ${data.name} (${data.size} bytes)`);
  });

  try {
    // Initialize and start syncing
    await gdriveSync.initialize();
    await gdriveSync.sync();
  } catch (error) {
    console.error('Failed to sync:', error);
  }
}

main().catch(console.error);
