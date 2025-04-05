export interface GDriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  modifiedTime?: string;
}

export interface GDriveCredentials {
  /** Type */
  type: string;
  /** Service Account Email */
  client_email: string;
  /** Service Account Private Key */
  private_key_id: string;
  /** Service Account Private Key */
  private_key: string;
  /** Project ID */
  project_id: string;
  /** Client ID */
  client_id: string;
}
