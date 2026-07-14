import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

export type ZoomPresetId = 'ultra' | 'wide' | 'tele';

const PRESET_ORDER: ZoomPresetId[] = ['ultra', 'wide', 'tele'];

const PRESET_LABELS: Record<ZoomPresetId, string> = {
  ultra: '.6',
  wide: '1',
  tele: '2x',
};

/** iOS 虚拟多摄 / Android 连续变焦 的归一化 zoom 目标值 */
const PRESET_ZOOM: Record<ZoomPresetId, number> = {
  ultra: 0,
  wide: 0.16,
  tele: 0.38,
};

const ANIMATION_MS = 320;
const PRESET_SNAP_THRESHOLD = 0.06;

function findVirtualCamera(lenses: string[]): string | null {
  return (
    lenses.find((name) =>
      /triple|dual wide|dual camera|dual|三镜头|双摄|双广角/i.test(name),
    ) ?? null
  );
}

function matchPhysicalLens(lenses: string[], preset: ZoomPresetId): string | null {
  const rules: Record<ZoomPresetId, RegExp[]> = {
    ultra: [/ultra.?wide/i, /超广角/i],
    wide: [/wide angle/i, /广角相机/i, /^back camera$/i, /后置相机/i, /wide(?!.*ultra)/i],
    tele: [/telephoto/i, /长焦/i],
  };

  for (const lens of lenses) {
    if (rules[preset].some((pattern) => pattern.test(lens))) {
      return lens;
    }
  }

  if (preset === 'wide') {
    return (
      lenses.find((lens) => !/ultra|tele|超广角|长焦|triple|dual|三|双/i.test(lens)) ??
      lenses[0] ??
      null
    );
  }

  return null;
}

function nearestPreset(zoom: number): ZoomPresetId {
  let best: ZoomPresetId = 'wide';
  let minDistance = Number.POSITIVE_INFINITY;

  for (const preset of PRESET_ORDER) {
    const distance = Math.abs(PRESET_ZOOM[preset] - zoom);
    if (distance < minDistance) {
      minDistance = distance;
      best = preset;
    }
  }

  return best;
}

function animateValue(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  onDone?: () => void,
) {
  const start = Date.now();
  let frame = 0;

  const tick = () => {
    const progress = Math.min(1, (Date.now() - start) / duration);
    const eased = 1 - (1 - progress) ** 3;
    onUpdate(from + (to - from) * eased);
    if (progress < 1) {
      frame = requestAnimationFrame(tick);
    } else {
      onDone?.();
    }
  };

  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

export function useNativeCameraZoom(facing: 'front' | 'back') {
  const [availableLenses, setAvailableLenses] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<ZoomPresetId>('wide');
  const [zoom, setZoom] = useState(PRESET_ZOOM.wide);
  const [selectedLens, setSelectedLens] = useState<string | undefined>(undefined);

  const zoomRef = useRef(PRESET_ZOOM.wide);
  const activePresetRef = useRef<ZoomPresetId>('wide');
  const targetPresetRef = useRef<ZoomPresetId>('wide');
  const cancelAnimRef = useRef<(() => void) | null>(null);
  const animGenerationRef = useRef(0);
  const pinchBaseRef = useRef(PRESET_ZOOM.wide);
  const isPinchingRef = useRef(false);

  const virtualLens = useMemo(
    () => (Platform.OS === 'ios' ? findVirtualCamera(availableLenses) : null),
    [availableLenses],
  );

  const syncActivePreset = useCallback((preset: ZoomPresetId) => {
    activePresetRef.current = preset;
    targetPresetRef.current = preset;
    setActivePreset(preset);
  }, []);

  const setZoomImmediate = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    zoomRef.current = clamped;
    setZoom(clamped);
  }, []);

  const applyLensForPreset = useCallback(
    (preset: ZoomPresetId) => {
      if (facing === 'front') {
        setSelectedLens(undefined);
        return PRESET_ZOOM[preset];
      }

      if (Platform.OS === 'ios' && virtualLens) {
        setSelectedLens(virtualLens);
        return PRESET_ZOOM[preset];
      }

      if (Platform.OS === 'ios' && availableLenses.length > 0) {
        const lens = matchPhysicalLens(availableLenses, preset);
        if (lens) {
          setSelectedLens(lens);
          return 0;
        }
      }

      setSelectedLens(undefined);
      return PRESET_ZOOM[preset];
    },
    [availableLenses, facing, virtualLens],
  );

  const animateZoomTo = useCallback(
    (target: number, generation: number, onDone?: () => void) => {
      cancelAnimRef.current?.();
      const from = zoomRef.current;
      cancelAnimRef.current = animateValue(from, target, ANIMATION_MS, setZoomImmediate, () => {
        cancelAnimRef.current = null;
        if (animGenerationRef.current !== generation) {
          return;
        }
        setZoomImmediate(target);
        onDone?.();
      });
    },
    [setZoomImmediate],
  );

  const applyPreset = useCallback(
    (preset: ZoomPresetId) => {
      const generation = ++animGenerationRef.current;
      const wasSamePreset = activePresetRef.current === preset;
      syncActivePreset(preset);

      const targetZoom = applyLensForPreset(preset);

      if (wasSamePreset && Math.abs(zoomRef.current - targetZoom) < 0.01) {
        setZoomImmediate(targetZoom);
        return;
      }

      animateZoomTo(targetZoom, generation, () => {
        if (animGenerationRef.current !== generation) {
          return;
        }
        setZoomImmediate(targetZoom);
        syncActivePreset(targetPresetRef.current);
      });
    },
    [animateZoomTo, applyLensForPreset, setZoomImmediate, syncActivePreset],
  );

  const resetZoom = useCallback(() => {
    animGenerationRef.current += 1;
    cancelAnimRef.current?.();
    cancelAnimRef.current = null;
    isPinchingRef.current = false;

    syncActivePreset('wide');
    const targetZoom = applyLensForPreset('wide');
    setZoomImmediate(targetZoom);
    pinchBaseRef.current = targetZoom;
  }, [applyLensForPreset, setZoomImmediate, syncActivePreset]);

  const onAvailableLensesChanged = useCallback(
    ({ lenses }: { lenses: string[] }) => {
      setAvailableLenses(lenses);
      if (facing === 'back' && Platform.OS === 'ios') {
        const virtual = findVirtualCamera(lenses);
        if (virtual) {
          setSelectedLens(virtual);
        }
      }
    },
    [facing],
  );

  const onPinchBegin = useCallback(() => {
    isPinchingRef.current = true;
    animGenerationRef.current += 1;
    cancelAnimRef.current?.();
    cancelAnimRef.current = null;
    pinchBaseRef.current = zoomRef.current;
  }, []);

  const onPinchUpdate = useCallback(
    (scale: number) => {
      const delta = (scale - 1) * 0.35;
      setZoomImmediate(pinchBaseRef.current + delta);
    },
    [setZoomImmediate],
  );

  const onPinchEnd = useCallback(() => {
    isPinchingRef.current = false;
    pinchBaseRef.current = zoomRef.current;

    const snapped = nearestPreset(zoomRef.current);
    const distance = Math.abs(PRESET_ZOOM[snapped] - zoomRef.current);
    if (distance <= PRESET_SNAP_THRESHOLD) {
      applyPreset(snapped);
      return;
    }
    syncActivePreset(snapped);
  }, [applyPreset, syncActivePreset]);

  /** 拍照前立即锁定当前预设的变焦与镜头，避免预览 2x 但成片仍是 1x */
  const prepareForCapture = useCallback(async () => {
    cancelAnimRef.current?.();
    animGenerationRef.current += 1;
    isPinchingRef.current = false;

    const preset = targetPresetRef.current;
    syncActivePreset(preset);
    const targetZoom = applyLensForPreset(preset);
    setZoomImmediate(targetZoom);
    pinchBaseRef.current = targetZoom;

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });

    const isTele = preset === 'tele';
    const lensDelay =
      facing === 'back'
        ? Platform.OS === 'ios'
          ? isTele
            ? 280
            : 200
          : isTele
            ? 180
            : 120
        : 80;
    await new Promise((resolve) => setTimeout(resolve, lensDelay));

    return { preset, zoom: zoomRef.current };
  }, [applyLensForPreset, facing, setZoomImmediate, syncActivePreset]);

  useEffect(() => {
    resetZoom();
  }, [facing, resetZoom]);

  useEffect(
    () => () => {
      cancelAnimRef.current?.();
    },
    [],
  );

  const presets = PRESET_ORDER.map((id) => ({
    id,
    label: PRESET_LABELS[id],
    active: activePreset === id,
  }));

  return {
    zoom,
    selectedLens,
    presets,
    availableLenses,
    applyPreset,
    resetZoom,
    prepareForCapture,
    onAvailableLensesChanged,
    onPinchBegin,
    onPinchUpdate,
    onPinchEnd,
  };
};
