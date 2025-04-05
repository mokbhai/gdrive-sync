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

| Event                   | Description                                   | Payload                                                        |
| ----------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| `initializing`          | Triggered when initialization starts          | `{}`                                                           |
| `initialized`           | Triggered when initialization completes       | `{}`                                                           |
| `alreadyInitialized`    | Triggered when already initialized            | `{}`                                                           |
| `cacheLoaded`           | Triggered when cache is loaded                | `{}`                                                           |
| `directoryCreated`      | Triggered when download directory is created  | `{ path: string }`                                             |
| `notInitialized`        | Triggered when sync is attempted without init | `{}`                                                           |
| `syncStarted`           | Triggered when sync process starts            | `{}`                                                           |
| `foldersFound`          | Triggered when root folders are found         | `{ count: number, folders: GDriveFile[] }`                     |
| `folderDownloadStarted` | Triggered when a folder download starts       | `{ folder: GDriveFile, path: string }`                         |
| `folderDownloaded`      | Triggered when a folder is downloaded         | `{ folder: GDriveFile, path: string, structure: LocalFolder }` |
| `folderError`           | Triggered when a folder download fails        | `{ folder: GDriveFile, error: any }`                           |
| `syncCompleted`         | Triggered when sync process completes         | `{ structure: LocalFolder[] }`                                 |
| `error`                 | Triggered when a general error occurs         | `{ message: string }`                                          |
| `syncError`             | Triggered when sync process fails             | `{ error: any }`                                               |

### DriveService Events

| Event                      | Description                                 | Payload                                                                          |
| -------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------- |
| `connectionTested`         | Triggered when connection test completes    | `{ success: boolean }`                                                           |
| `connectionError`          | Triggered when connection test fails        | `{ error: any }`                                                                 |
| `foldersListed`            | Triggered when folders are listed           | `{ count: number, folders: GDriveFile[] }`                                       |
| `listFoldersError`         | Triggered when listing folders fails        | `{ error: any }`                                                                 |
| `filesListed`              | Triggered when files in a folder are listed | `{ folderId: string, folderPath: string, count: number, files: GDriveFile[] }`   |
| `listFilesError`           | Triggered when listing files fails          | `{ folderId: string, folderPath: string, error: any }`                           |
| `fileDownloadStarted`      | Triggered when a file download starts       | `{ file: GDriveFile, filePath: string }`                                         |
| `fileDownloaded`           | Triggered when a file is downloaded         | `{ file: GDriveFile, filePath: string }`                                         |
| `subFolderDownloadStarted` | Triggered when a subfolder download starts  | `{ folder: GDriveFile, path: string }`                                           |
| `subFolderDownloaded`      | Triggered when a subfolder is downloaded    | `{ folder: GDriveFile, path: string, structure: LocalFolder }`                   |
| `fileProcessingError`      | Triggered when processing a file fails      | `{ file: GDriveFile, error: any }`                                               |
| `folderDownloadError`      | Triggered when downloading a folder fails   | `{ folderId: string, folderPath: string, error: any }`                           |
| `fileRetry`                | Triggered when a file download is retried   | `{ fileId: string, filePath: string, retryCount: number, delay: number }`        |
| `fileRetryFailed`          | Triggered when a file download retry fails  | `{ fileId: string, filePath: string, retryCount: number, error: any }`           |
| `fileNotFound`             | Triggered when a file is not found          | `{ fileId: string }`                                                             |
| `fileSkipped`              | Triggered when a file is skipped            | `{ fileId: string, name: string, reason: string }`                               |
| `fileEmpty`                | Triggered when a downloaded file is empty   | `{ fileId: string, filePath: string }`                                           |
| `fileSizeMismatch`         | Triggered when file size doesn't match      | `{ fileId: string, filePath: string, expectedSize: number, actualSize: number }` |
| `fileVerified`             | Triggered when a file is verified           | `{ fileId: string, name: string, size: number }`                                 |
| `fileDownloadError`        | Triggered when a file download fails        | `{ fileId: string, filePath: string, error: any }`                               |

### Example: Using Events

```typescript
import { GDriveSync } from '@mokbhaimj/gdrive-sync';

const sync = new GDriveSync({
  // ... configuration options
});

// Register event listeners
sync.on('initializing', () => {
  console.log('🚀 Initializing Google Drive Sync...');
});

sync.on('initialized', () => {
  console.log('✅ Google Drive Sync initialized successfully');
});

sync.on('syncStarted', () => {
  console.log('🔄 Starting sync process...');
});

sync.on('foldersFound', (data) => {
  console.log(`📂 Found ${data.count} root folders to sync`);
});

sync.on('folderDownloadStarted', (data) => {
  console.log(`⏳ Downloading folder: ${data.folder.name}`);
});

sync.on('folderDownloaded', (data) => {
  console.log(`✅ Downloaded folder: ${data.folder.name}`);
});

sync.on('syncCompleted', (data) => {
  console.log('🎉 Sync completed successfully!');
  console.log(`📊 Downloaded ${data.structure.length} folders`);
});

sync.on('error', (data) => {
  console.error('❌ Error:', data.message);
});

// Initialize and start syncing
async function start() {
  try {
    await sync.initialize();
    await sync.sync();
  } catch (error) {
    console.error('Failed to sync:', error);
  }
}

start();
```

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
