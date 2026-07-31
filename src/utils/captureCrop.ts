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

/** 将全画幅照片裁成与预览视口一致的「所见即所拍」（cover + 可选数字变焦） */
export function computeViewportCrop(
  imageWidth: number,
  imageHeight: number,
  viewAspect: number,
  zoomCropRatio: number,
): { originX: number; originY: number; width: number; height: number } | null {
  if (imageWidth <= 0 || imageHeight <= 0 || viewAspect <= 0) return null;

  const imgAspect = imageWidth / imageHeight;
  let coverW: number;
  let coverH: number;
  let originX: number;
  let originY: number;

  // CameraView 通常以 cover 填满预览：居中裁出与视口同宽高比的区域
  if (imgAspect > viewAspect) {
    coverH = imageHeight;
    coverW = imageHeight * viewAspect;
    originX = (imageWidth - coverW) / 2;
    originY = 0;
  } else {
    coverW = imageWidth;
    coverH = imageWidth / viewAspect;
    originX = 0;
    originY = (imageHeight - coverH) / 2;
  }

  const ratio = Math.min(1, Math.max(0.25, zoomCropRatio));
  const cropW = coverW * ratio;
  const cropH = coverH * ratio;
  originX += (coverW - cropW) / 2;
  originY += (coverH - cropH) / 2;

  const width = Math.max(1, Math.round(cropW));
  const height = Math.max(1, Math.round(cropH));
  const ox = Math.max(0, Math.min(imageWidth - width, Math.round(originX)));
  const oy = Math.max(0, Math.min(imageHeight - height, Math.round(originY)));

  if (width >= imageWidth - 1 && height >= imageHeight - 1 && ratio >= 0.99) {
    return null;
  }

  return { originX: ox, originY: oy, width, height };
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

/** 按预览视口宽高比 + zoom 裁切，使成片与取景所见一致 */
export async function cropCaptureToViewport(
  uri: string,
  width: number,
  height: number,
  viewAspect: number,
  zoomCropRatio: number,
): Promise<string> {
  const crop = computeViewportCrop(width, height, viewAspect, zoomCropRatio);
  if (!crop) {
    return cropCaptureToZoom(uri, width, height, zoomCropRatio);
  }

  const result = await manipulateAsync(
    uri,
    [{ crop }],
    { compress: 0.85, format: SaveFormat.JPEG },
  );

  return result.uri;
}
