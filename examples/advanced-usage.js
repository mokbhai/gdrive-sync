// Advanced usage example for @mokbhaimj/gdrive-sync
import { GDriveSync } from '@mokbhaimj/gdrive-sync';

// Create a new instance with advanced configuration
const sync = new GDriveSync({
  // Enable detailed logging
  enableLogging: true,
  enableCache: true,
  cacheDir: './cache',
  downloadPath: './downloads',

  // Service account credentials
  credentials: {
    type: 'service_account',
    client_email: 'client_email',
    private_key_id: 'private_key_id',
    private_key:
      '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
    project_id: 'project_id',
    client_id: 'client_id',
  },
});

// Set up comprehensive event listeners
sync.on('fileDownloaded', (file) => {
  console.log(`Downloaded: ${file.name} (${file.size} bytes)`);
});

sync.on('fileUploaded', (file) => {
  console.log(`Uploaded: ${file.name} (${file.size} bytes)`);
});

sync.on('syncStarted', () => {
  console.log('Sync process started');
});

sync.on('syncCompleted', (stats) => {
  console.log('Sync completed:', {
    filesProcessed: stats.filesProcessed,
    bytesTransferred: stats.bytesTransferred,
    duration: stats.duration,
  });
});

sync.on('error', (error) => {
  console.error('Sync error:', error.message);
  if (error.code) {
    console.error('Error code:', error.code);
  }
  if (error.details) {
    console.error('Error details:', error.details);
  }
});

// Initialize with error handling
async function initialize() {
  try {
    await sync.initialize();
    console.log('Google Drive Sync initialized successfully');
  } catch (error) {
    console.error('Initialization failed:', error.message);
    process.exit(1);
  }
}

// Start sync with progress tracking
async function startSync() {
  try {
    const startTime = Date.now();
    await sync.sync();
    const duration = (Date.now() - startTime) / 1000;
    console.log(`Sync completed in ${duration} seconds`);
  } catch (error) {
    console.error('Sync failed:', error.message);
    process.exit(1);
  }
}

// Run the example with proper error handling
async function runExample() {
  try {
    await initialize();
    await startSync();
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

runExample();
