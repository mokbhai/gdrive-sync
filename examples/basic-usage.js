// Advanced usage example for @mokbhaimj/gdrive-sync
import { GDriveSync } from '@mokbhaimj/gdrive-sync';

// Create a new instance with advanced configuration
const sync = new GDriveSync({
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

startSync();
