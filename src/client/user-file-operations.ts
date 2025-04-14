import { BaserowClient } from "./baserow-client";

/**
 * User file response type
 */
export interface UserFile {
  size: number;
  mime_type: string;
  is_image: boolean;
  image_width: number | null;
  image_height: number | null;
  uploaded_at: string;
  url: string;
  thumbnails: Record<string, any>;
  name: string;
  original_name: string;
}

/**
 * Operations for managing Baserow user files.
 */
export class UserFileOperations {
  constructor(private client: BaserowClient) {}
  
  /**
   * Uploads a file to Baserow by uploading the file contents directly.
   * @param fileOrFormData - The file to upload (File/Blob object) or FormData with 'file' field
   * @returns Information about the uploaded file
   * @throws {BaserowApiError} If file upload fails
   */
  async uploadFile(fileOrFormData: File | Blob | FormData): Promise<UserFile> {
    let body: any;
    
    if (fileOrFormData instanceof FormData) {
      body = fileOrFormData;
    } else {
      // In browser environments
      body = new FormData();
      // @ts-ignore - FormData.append exists in browser environments
      body.append('file', fileOrFormData, fileOrFormData instanceof File ? fileOrFormData.name : 'file');
    }

    return this.client._request<UserFile>(
      "POST",
      "/api/user-files/upload-file/",
      undefined,
      body
    );
  }

  /**
   * Uploads a file to Baserow by downloading it from the provided URL.
   * @param url - The URL to download the file from
   * @returns Information about the uploaded file
   * @throws {BaserowApiError} If file upload fails
   */
  async uploadViaUrl(url: string): Promise<UserFile> {
    return this.client._request<UserFile>(
      "POST",
      "/api/user-files/upload-via-url/",
      undefined,
      { url }
    );
  }
} 