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

## Quick Start

```javascript
import { GDriveSync } from '@mokbhaimj/gdrive-sync';

// Create a new instance with credentials
const sync = new GDriveSync({
  credentials: {
    type: 'service_account',
    client_email: 'your-client-email',
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
