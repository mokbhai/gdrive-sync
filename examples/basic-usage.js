// Basic usage example for @mokbhai/gdrive-sync
import { GDriveSync } from '@mokbhaimj/gdrive-sync';

// Create a new instance with credentials
const sync = new GDriveSync({
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

// Set up event listeners
sync.on('fileDownloaded', (file) => {
  console.log(`Downloaded file: ${file.name}`);
});

sync.on('error', (error) => {
  console.error('Sync error:', error.message);
});

// Initialize the sync
async function initialize() {
  try {
    await sync.initialize();
    console.log('Google Drive Sync initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google Drive Sync:', error);
  }
}

// Start syncing files
async function startSync() {
  try {
    await sync.sync();
    console.log('Google Drive sync completed successfully');
  } catch (error) {
    console.error('Failed to sync with Google Drive:', error);
  }
}

// Run the example
async function runExample() {
  await initialize();
  await startSync();
}

runExample();
