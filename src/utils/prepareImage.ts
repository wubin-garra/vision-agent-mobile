import * as ImageManipulator from 'expo-image-manipulator';

/** 压缩后再上传，降低超时与流量问题 */
export async function prepareImageForUpload(imageUri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 1280 } }],
    { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}
