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
  if (!result.body?.trim()) {
    throw new Error(
      `后端返回空响应 (HTTP ${result.status})。若接口为 SSE 流式，Expo 可能无法正确读取，请改用 /v1/analyze。`,
    );
  }
  return result.body;
}
