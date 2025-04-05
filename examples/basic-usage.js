// Advanced usage example for @mokbhaimj/gdrive-sync
import { GDriveSync } from '@mokbhaimj/gdrive-sync';

// Create a new instance with advanced configuration
const sync = new GDriveSync({
  enableLogging: false,

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

// Add event listeners
sync.on('fileDownloaded', (data) => {
  if (data && data.file && data.filePath) {
    console.log(`Downloaded: ${data.file.name} to ${data.filePath}`);
  } else {
    console.log('File downloaded event received with incomplete data:', data);
  }
});

sync.on('fileVerified', (data) => {
  if (data && data.name && data.size) {
    console.log(`Verified: ${data.name} (${data.size} bytes)`);
  } else {
    console.log('File verified event received with incomplete data:', data);
  }
});

// Add more event listeners for debugging
sync.on('initializing', () => console.log('Initializing...'));
sync.on('initialized', () => console.log('Initialized successfully'));
sync.on('syncStarted', () => console.log('Sync started'));
sync.on('syncCompleted', (data) => console.log('Sync completed'));

// Start sync with progress tracking
async function startSync() {
  try {
    // Initialize first
    await sync.initialize();

    const startTime = Date.now();
    await sync.sync();
    const duration = (Date.now() - startTime) / 1000;
    console.log(`Sync completed in ${duration} seconds`);
  } catch (error) {
    console.error('Sync failed:', error.message);
    process.exit(1);
  }
}

startSync();
