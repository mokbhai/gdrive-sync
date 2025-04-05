import * as fs from 'fs/promises';
import * as path from 'path';

interface CacheEntry {
  fileId: string;
  modifiedTime: string;
  size: number;
}

export class CacheService {
  private cacheFile: string;
  private cache: Map<string, CacheEntry>;

  constructor(cacheDir: string) {
    this.cacheFile = path.join(cacheDir, '.mokbhaimj-gdrive-sync-cache.json');
    this.cache = new Map();
  }

  async loadCache(): Promise<void> {
    try {
      const data = await fs.readFile(this.cacheFile, 'utf-8');
      const entries = JSON.parse(data);
      this.cache = new Map(Object.entries(entries));
    } catch (error) {
      // Cache file doesn't exist or is invalid, start with empty cache
      this.cache = new Map();
    }
  }

  async saveCache(): Promise<void> {
    const entries = Object.fromEntries(this.cache);
    await fs.writeFile(this.cacheFile, JSON.stringify(entries, null, 2));
  }

  get(fileId: string): CacheEntry | undefined {
    return this.cache.get(fileId);
  }

  set(fileId: string, modifiedTime: string, size: number): void {
    this.cache.set(fileId, { fileId, modifiedTime, size });
  }

  async needsUpdate(
    fileId: string,
    modifiedTime: string,
    size: number
  ): Promise<boolean> {
    const entry = this.get(fileId);
    if (!entry) return true;

    return entry.modifiedTime !== modifiedTime || entry.size !== size;
  }
}
