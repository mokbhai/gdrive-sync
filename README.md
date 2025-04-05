# @mokbhaimj/gdrive-sync

A powerful Node.js package for automated Google Drive synchronization with advanced features. Downloads and maintains folder structure from Google Drive, scheduled downloads, and comprehensive logging. Perfect for automated backup solutions and content management systems.

## Features

- 📁 Full folder structure synchronization
- 🔄 Automated sync with scheduling support
- 📝 Comprehensive logging system
- 🚀 Event-driven architecture
- ⚡ Intelligent caching
- 🔒 Secure credential management
- 📊 Progress tracking and statistics

## Installation

```bash
npm install @mokbhaimj/gdrive-sync
```

## Setting Up Google Drive Service Account

To use this package, you'll need to create a Google Drive service account and obtain credentials. Here's how:

1. **Create a Google Cloud Project**

   - Go to [Google Cloud Console](https://console.cloud.google.com/projectselector/iam-admin/serviceaccounts/create?walkthrough_id=iam--create-service-account#step_index=1)
   - Click "Create Project" or select an existing project
   - Give your project a name and click "Create"

2. **Enable the Google Drive API**

   - In your project, go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

3. **Create a Service Account**

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the service account details:
     - Name: Choose a descriptive name
     - ID: Will be auto-generated
     - Description: Optional
   - Click "Create and Continue"
   - For "Role", select "Project" > "Editor"
   - Click "Continue" and then "Done"

4. **Generate Service Account Key**

   - Find your service account in the list
   - Click on the service account email
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Click "Create"
   - The key file will be downloaded automatically

5. **Share Google Drive Folder**

   - Open Google Drive
   - Right-click the folder you want to sync
   - Click "Share"
   - Add your service account email (found in the JSON file under `client_email`)
   - Give "Editor" or "Viewer" access
   - Click "Share"

6. **Use the Credentials**
   - The downloaded JSON file contains your credentials
   - Use these credentials in your code as shown in the examples below
   - Keep this file secure and never commit it to version control

## Quick Start

```javascript
import { GDriveSync } from '@mokbhaimj/gdrive-sync';

// Create a new instance with credentials
const sync = new GDriveSync({
  credentials: {
    type: 'service_account',
    client_email: 'your-service-account@project.iam.gserviceaccount.com',
    private_key_id: 'your-private-key-id',
    privateKey: 'your-private-key',
    project_id: 'your-project-id',
    client_id: 'your-client-id',
  },
});

// Set up event listeners
sync.on('fileDownloaded', (file) => {
  console.log(`Downloaded file: ${file.name}`);
});

sync.on('error', (error) => {
  console.error('Sync error:', error.message);
});

// Initialize and start sync
async function start() {
  await sync.initialize();
  await sync.sync();
}

start();
```

## Advanced Usage

```typescript
import { GDriveSync } from '@mokbhaimj/gdrive-sync';

const sync = new GDriveSync({
  // Enable detailed logging and caching
  enableLogging: true,
  enableCache: true,
  cacheDir: './cache',
  downloadPath: './downloads',

  // Service account credentials
  credentials: {
    // ... your credentials
  },
});

// Comprehensive event listeners
sync.on('fileDownloaded', (file) => {
  console.log(`Downloaded: ${file.name} (${file.size} bytes)`);
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
```

## Configuration Options

| Option          | Type    | Default                   | Description                              |
| --------------- | ------- | ------------------------- | ---------------------------------------- |
| `downloadPath`  | string  | './mokbhaimj-gdrive-sync' | Path to save downloaded files            |
| `enableLogging` | boolean | true                      | Enable/disable logging                   |
| `enableCache`   | boolean | true                      | Enable/disable caching                   |
| `cacheDir`      | string  | './'                      | Directory for cache storage              |
| `credentials`   | object  | required                  | Google Drive service account credentials |

## Events

| Event            | Description                           | Payload                                                                  |
| ---------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| `fileDownloaded` | Triggered when a file is downloaded   | `{ name: string, size: number }`                                         |
| `syncStarted`    | Triggered when sync process starts    | -                                                                        |
| `syncCompleted`  | Triggered when sync process completes | `{ filesProcessed: number, bytesTransferred: number, duration: number }` |
| `error`          | Triggered when an error occurs        | `{ message: string, code?: string, details?: any }`                      |

## Error Handling

The package includes comprehensive error handling with detailed error messages and codes. Always wrap sync operations in try-catch blocks:

```javascript
try {
  await sync.initialize();
  await sync.sync();
} catch (error) {
  console.error('Fatal error:', error.message);
  if (error.code) {
    console.error('Error code:', error.code);
  }
  if (error.details) {
    console.error('Error details:', error.details);
  }
}
```

## License

MIT

## Author

Mokshit Jain
