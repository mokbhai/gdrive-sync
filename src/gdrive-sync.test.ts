import { describe, it, expect } from 'vitest';
import { GDriveSync } from './gdrive-sync.js';

describe('GDriveSync', () => {
  it('should initialize with default options', () => {
    const sync = new GDriveSync();
    expect(sync).toBeInstanceOf(GDriveSync);
  });

  it('should initialize with custom options', () => {
    const sync = new GDriveSync({
      downloadPath: './custom-path',
      maintainStructure: false,
      enableLogging: false,
    });
    expect(sync).toBeInstanceOf(GDriveSync);
  });
});
