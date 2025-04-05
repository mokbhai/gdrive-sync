export interface LocalFile {
  id: string;
  name: string;
  path: string;
  mimeType: string;
  modifiedTime: string;
}

export interface LocalFolder {
  id: string;
  name: string;
  path: string;
  folders: LocalFolder[];
  files: LocalFile[];
  mimeType: string;
  modifiedTime: string;
}
