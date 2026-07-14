import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/** 与 useNativeCameraZoom 中 PRESET_ZOOM 保持一致 */
const ZOOM_WIDE = 0.16;
const ZOOM_TELE = 0.38;

/** 根据拍照时的归一化 zoom，计算中心裁剪比例（1 = 不裁，0.5 ≈ 2x） */
export function getCaptureCropRatio(zoom: number): number {
  if (zoom <= ZOOM_WIDE + 0.01) return 1;

  if (zoom <= ZOOM_TELE) {
    const t = (zoom - ZOOM_WIDE) / (ZOOM_TELE - ZOOM_WIDE);
    return 1 - t * 0.5;
  }

  const t = (zoom - ZOOM_TELE) / (1 - ZOOM_TELE);
  return Math.max(0.25, 0.5 * (1 - t * 0.5));
}

export async function cropCaptureToZoom(
  uri: string,
  width: number,
  height: number,
  cropRatio: number,
): Promise<string> {
  if (cropRatio >= 0.99 || width <= 0 || height <= 0) return uri;

  const cropWidth = Math.round(width * cropRatio);
  const cropHeight = Math.round(height * cropRatio);
  const originX = Math.round((width - cropWidth) / 2);
  const originY = Math.round((height - cropHeight) / 2);

  const result = await manipulateAsync(
    uri,
    [
      {
        crop: {
          originX,
          originY,
          width: cropWidth,
          height: cropHeight,
        },
      },
    ],
    { compress: 0.85, format: SaveFormat.JPEG },
  );

  return result.uri;
}
