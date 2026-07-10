import * as FileSystem from 'expo-file-system/legacy';

import { API_BASE_URL, buildApiUrl } from '@/constants/config';

export type UploadFieldParams = Record<string, string>;

export async function uploadImageMultipart(
  endpoint: string,
  imageUri: string,
  parameters: UploadFieldParams,
): Promise<FileSystem.FileSystemUploadResult> {
  const url = buildApiUrl(endpoint);
  return FileSystem.uploadAsync(url, imageUri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'image',
    mimeType: 'image/jpeg',
    parameters,
  });
}

export function assertUploadSuccess(result: FileSystem.FileSystemUploadResult): string {
  if (result.status < 200 || result.status >= 300) {
    throw new Error(result.body || `HTTP ${result.status}`);
  }
  return result.body;
}
