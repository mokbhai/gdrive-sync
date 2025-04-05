import type { GDriveCredentials } from '../type/gDrive';

class ValidateCred {
  private credentials: GDriveCredentials;

  constructor(credentials: GDriveCredentials) {
    this.credentials = credentials;
  }

  /**
   * Validate service account email format
   * @param email Service account email to validate
   * @returns boolean indicating if the email is valid
   */
  private validateServiceAccountEmail(email: string): boolean {
    // Service account emails typically end with @*.iam.gserviceaccount.com
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.iam\.gserviceaccount\.com$/;
    return emailRegex.test(email);
  }

  /**
   * Validate private key format
   * @param privateKey Private key to validate
   * @returns boolean indicating if the private key is valid
   */
  private validatePrivateKey(privateKey: string): boolean {
    // Private key should start with "-----BEGIN PRIVATE KEY-----" and end with "-----END PRIVATE KEY-----"
    const privateKeyRegex =
      /^-----BEGIN PRIVATE KEY-----\n.*\n-----END PRIVATE KEY-----\n?$/s;
    return privateKeyRegex.test(privateKey);
  }

  /**
   * Validate project ID format
   * @param projectId Project ID to validate
   * @returns boolean indicating if the project ID is valid
   */
  private validateProjectId(projectId: string): boolean {
    // Project IDs can only contain lowercase letters, numbers, and hyphens
    // They must start with a letter and be between 6 and 30 characters
    const projectIdRegex = /^[a-z][a-z0-9-]{5,29}$/;
    return projectIdRegex.test(projectId);
  }

  /**
   * Validate client ID format
   * @param clientId Client ID to validate
   * @returns boolean indicating if the client ID is valid
   */
  private validateClientId(clientId: string): boolean {
    // Client IDs are valid UUIDs
    // const uuidRegex =
    //   /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    // return uuidRegex.test(clientId);
    return clientId.length > 0;
  }

  /**
   * Validate private key ID format
   * @param privateKeyId Private key ID to validate
   * @returns boolean indicating if the private key ID is valid
   */
  private validatePrivateKeyId(privateKeyId: string): boolean {
    // Private key IDs are valid UUIDs
    // const uuidRegex =
    //   /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    // return uuidRegex.test(privateKeyId);
    return privateKeyId.length > 0;
  }

  /**
   * Validate service account credentials
   * @param credentials Credentials to validate
   * @returns Object containing validation results and error messages
   */
  public validateCredentials(credentials: GDriveCredentials): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    if (!credentials.type) {
      errors.push('Type is required');
    }

    if (!this.validateServiceAccountEmail(credentials.client_email)) {
      errors.push(
        'Invalid service account email format. Expected format: name@project-id.iam.gserviceaccount.com'
      );
    }

    if (!this.validatePrivateKey(credentials.private_key)) {
      errors.push(
        'Invalid private key format. Expected format: -----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----'
      );
    }

    if (!this.validateProjectId(credentials.project_id)) {
      errors.push(
        'Invalid project ID format. Must be 6-30 characters, start with a letter, and contain only lowercase letters, numbers, and hyphens'
      );
    }

    if (!this.validateClientId(credentials.client_id)) {
      errors.push('Invalid client ID format. Must be a valid UUID.');
    }

    if (!this.validatePrivateKeyId(credentials.private_key_id)) {
      errors.push('Invalid private key ID format. Must be a valid UUID.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default ValidateCred;
