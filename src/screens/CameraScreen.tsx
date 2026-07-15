import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnalysisThinkingOverlay } from '@/components/AnalysisThinkingOverlay';
import { CreditsBadge } from '@/components/CreditsBadge';
import { API_BASE_URL, API_MISCONFIGURED, formatApiError } from '@/constants/config';
import { AgentDetailSheet } from '@/components/AgentDetailSheet';
import { AgentModeCarousel } from '@/components/AgentModeCarousel';
import { CameraScanFrame } from '@/components/CameraScanFrame';
import { ZoomSelector } from '@/components/ZoomSelector';
import { FOOD_SCAN_THINKING_STEP_DURATIONS_MS, FOOD_SCAN_THINKING_STEPS } from '@/constants/foodScanThinking';
import {
  agentToCameraMode,
  cameraModeToAgent,
  cameraModes,
  findCameraMode,
  type CameraModeItem,
} from '@/constants/cameraModes';
import { useNativeCameraZoom } from '@/hooks/useNativeCameraZoom';
import { analyzeImageStream } from '@/services/api';
import { track } from '@/services/analytics';
import { useSessionStore } from '@/store/session';
import { colors, lightColors, radius, spacing, typography } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';
import { getCurrentCoordinates } from '@/utils/location';
import { cropCaptureToZoom, getCaptureCropRatio } from '@/utils/captureCrop';
import { hapticLight, hapticMedium } from '@/utils/haptics';

type StackNav = NativeStackNavigationProp<RootStackParamList>;

export function CameraScreen() {
  const navigation = useNavigation<StackNav>();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const [status, setStatus] = useState('');
  const [analyzeStage, setAnalyzeStage] = useState('');
  const [thinkingStep, setThinkingStep] = useState<string | undefined>();
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const thinkingStepsRef = useRef<string[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const {
    zoom,
    selectedLens,
    presets: zoomPresets,
    applyPreset,
    resetZoom,
    prepareForCapture,
    onAvailableLensesChanged,
    onPinchBegin,
    onPinchUpdate,
    onPinchEnd,
  } = useNativeCameraZoom(facing);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(true);
  const [detailVisible, setDetailVisible] = useState(false);
  const { selectedAgent, setSelectedAgent } = useSessionStore();
  const activeMode = findCameraMode(agentToCameraMode(selectedAgent));
  const isFoodScanMode = selectedAgent === 'food_scan';

  useEffect(() => {
    if (!analyzing || !isFoodScanMode) return;

    let stepIndex = 0;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const showStep = (index: number) => {
      const step = FOOD_SCAN_THINKING_STEPS[index];
      setThinkingStep(step);
      if (!thinkingStepsRef.current.includes(step)) {
        thinkingStepsRef.current = [...thinkingStepsRef.current, step];
        setThinkingSteps(thinkingStepsRef.current);
      }
    };

    const scheduleNext = () => {
      if (cancelled) return;
      showStep(stepIndex);

      const duration = FOOD_SCAN_THINKING_STEP_DURATIONS_MS[stepIndex] ?? 0;
      if (duration <= 0 || stepIndex >= FOOD_SCAN_THINKING_STEPS.length - 1) return;

      timeoutId = setTimeout(() => {
        stepIndex = Math.min(stepIndex + 1, FOOD_SCAN_THINKING_STEPS.length - 1);
        scheduleNext();
      }, duration);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [analyzing, isFoodScanMode]);

  const runAnalyze = async (uri: string, source: 'camera' | 'gallery') => {
    if (API_MISCONFIGURED) {
      Alert.alert('未配置 API', formatApiError(new Error('misconfigured')));
      return;
    }

    const mode = selectedAgent ?? 'auto';
    const startedAt = Date.now();
    track('analyze_start', { agent: mode, source });

    setPreviewUri(uri);
    setLastPhoto(uri);
    setAnalyzing(true);
    setStatus('正在理解画面…');
    setAnalyzeStage('captioning');
    setThinkingStep(undefined);
    thinkingStepsRef.current = [];
    setThinkingSteps([]);
    try {
      const coordinates = await getCurrentCoordinates();
      const result = await analyzeImageStream(
        uri,
        {
          onStatus: (stage) => {
            setAnalyzeStage(stage);
            if (stage === 'routing') setStatus('正在选择智能体…');
            if (stage === 'analyzing') setStatus('正在生成营养报告…');
            if (stage === 'captioning') setStatus('正在分析图像…');
          },
          onThinking: () => {
            // 步骤节奏由客户端 FOOD_SCAN_THINKING_STEP_DURATIONS_MS 控制
          },
          onPartial: (partial) => setStatus(`${partial.title} · ${partial.category}`),
        },
        {
          agentOverride: selectedAgent ?? undefined,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
        },
      );

      if (!result) throw new Error('分析失败');

      track('analyze_success', {
        agent: result.agent_id,
        source,
        duration_ms: Date.now() - startedAt,
        has_location: Boolean(coordinates),
      });

      navigation.navigate('Insight', {
        memoryId: result.memory_id,
        imageUri: uri,
        insight: result.insight,
        followupChips: result.followup_chips,
        agentId: result.agent_id,
        entryMode: 'fresh',
        thinkingSteps:
          thinkingStepsRef.current.length > 0 ? thinkingStepsRef.current : undefined,
      });
    } catch (error) {
      track('analyze_fail', {
        agent: mode,
        source,
        duration_ms: Date.now() - startedAt,
        error: error instanceof Error ? error.message : 'unknown',
      });
      Alert.alert('分析失败', formatApiError(error));
    } finally {
      setAnalyzing(false);
      setStatus('');
      setAnalyzeStage('');
      setThinkingStep(undefined);
      thinkingStepsRef.current = [];
      setThinkingSteps([]);
      setPreviewUri(null);
    }
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || analyzing) return;
    hapticMedium();
    try {
      const { zoom: captureZoom } = await prepareForCapture();
      await new Promise((resolve) => setTimeout(resolve, Platform.OS === 'ios' ? 60 : 40));

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        shutterSound: false,
        skipProcessing: false,
      });

      if (!photo?.uri) return;

      const cropRatio = facing === 'back' ? getCaptureCropRatio(captureZoom) : 1;
      const uri = await cropCaptureToZoom(
        photo.uri,
        photo.width ?? 0,
        photo.height ?? 0,
        cropRatio,
      );

      await runAnalyze(uri, 'camera');
    } catch (error) {
      Alert.alert('拍照失败', error instanceof Error ? error.message : '请稍后重试');
    }
  };

  const pickFromGallery = async () => {
    hapticLight();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await runAnalyze(result.assets[0].uri, 'gallery');
    }
  };

  const selectMode = (mode: CameraModeItem) => {
    const agent = cameraModeToAgent(mode.id);
    setSelectedAgent(agent);
    track('camera_mode_select', {
      mode_id: mode.id,
      agent: agent ?? 'auto',
    });
  };

  const openDetail = () => {
    hapticLight();
    setDetailVisible(true);
  };

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .enabled(!analyzing && facing === 'back')
        .onBegin(onPinchBegin)
        .onUpdate((event) => onPinchUpdate(event.scale))
        .onEnd(onPinchEnd)
        .onFinalize(onPinchEnd),
    [analyzing, facing, onPinchBegin, onPinchEnd, onPinchUpdate],
  );

  const handleCameraReady = async () => {
    try {
      const lenses = await cameraRef.current?.getAvailableLensesAsync();
      if (lenses?.length) {
        onAvailableLensesChanged({ lenses });
      }
    } catch {
      // 部分 Android 设备不支持镜头枚举
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.permissionText}>需要相机权限来「看见并理解」世界</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>授权相机</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      {!analyzing ? (
        <GestureDetector gesture={pinchGesture}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            zoom={zoom}
            selectedLens={selectedLens}
            onCameraReady={handleCameraReady}
            onAvailableLensesChanged={onAvailableLensesChanged}
          />
        </GestureDetector>
      ) : previewUri ? (
        <Image
          source={{ uri: previewUri }}
          style={styles.frozenPreview}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.frozenPreview} />
      )}

      {/* Chance 风格四角扫描框 */}
      <CameraScanFrame />

      <SafeAreaView style={styles.overlay} edges={['top']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <CreditsBadge variant="dark" />
          <View style={styles.topActions}>
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            {__DEV__ ? (
              <Text style={styles.apiHint} numberOfLines={1}>
                {API_BASE_URL.replace(/^https?:\/\//, '')}
              </Text>
            ) : null}
          </View>
        </View>

        {/* 模式说明 — 顶部居中 */}
        {showPrompt && (
          <View style={styles.promptBannerWrap}>
            <View style={styles.promptBanner}>
              <Text style={styles.promptBannerText} numberOfLines={2}>
                {activeMode.prompt}
              </Text>
              <TouchableOpacity
                style={styles.promptClose}
                onPress={() => {
                  hapticLight();
                  setShowPrompt(false);
                }}
                hitSlop={8}
              >
                <Text style={styles.promptCloseText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.spacer} />

        {/* Zoom — 浮在取景器上，Chance 同款 */}
        <ZoomSelector
          presets={zoomPresets}
          onSelect={applyPreset}
          disabled={analyzing}
        />

        {/* 底部控制区 — 背景延伸至 Tab 栏，无缝隙 */}
        <View style={styles.bottomPanel}>
          <View style={styles.controlBar}>
            <TouchableOpacity onPress={pickFromGallery} disabled={analyzing}>
              {lastPhoto ? (
                <Image source={{ uri: lastPhoto }} style={styles.galleryThumb} />
              ) : (
                <View style={styles.galleryPlaceholder}>
                  <Text style={styles.galleryPlaceholderText}>图</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modePill, analyzing && styles.modePillDisabled]}
              onPress={openDetail}
              disabled={analyzing}
              activeOpacity={0.85}
            >
              <Text style={styles.modePillIcon}>🔖</Text>
              <Text style={styles.modePillText} numberOfLines={1}>
                {activeMode.label}
              </Text>
              <View style={styles.modeInfoBtn}>
                <Text style={styles.modeInfoText}>i</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.flipBtn}
              onPress={() => {
                hapticLight();
                setFacing((current) => (current === 'back' ? 'front' : 'back'));
                resetZoom();
              }}
              disabled={analyzing}
            >
              <Text style={styles.flipIcon}>↻</Text>
            </TouchableOpacity>
          </View>

          {analyzing && status ? (
            <View style={styles.statusBar}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          ) : null}

          <AgentModeCarousel
            modes={cameraModes}
            selectedId={activeMode.id}
            onSelect={selectMode}
            disabled={analyzing}
          />

          <View style={styles.captureRow}>
            <Pressable
              style={[styles.shutterOuter, analyzing && styles.shutterDisabled]}
              onPress={capturePhoto}
              disabled={analyzing}
            >
              <View style={styles.shutterInner}>
                {analyzing ? (
                  <ActivityIndicator color={colors.accent} size="small" />
                ) : (
                  <Text style={styles.shutterIcon}>✦</Text>
                )}
              </View>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <AgentDetailSheet
        visible={detailVisible}
        mode={activeMode}
        onClose={() => setDetailVisible(false)}
        onTry={() => setDetailVisible(false)}
      />

      {analyzing && isFoodScanMode ? (
        <AnalysisThinkingOverlay
          imageUri={previewUri}
          stage={analyzeStage}
          thinkingStep={thinkingStep}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: lightColors.tabBarDark },
  frozenPreview: {
    ...StyleSheet.absoluteFill,
    backgroundColor: lightColors.tabBarDark,
  },
  center: {
    flex: 1,
    backgroundColor: colors.cameraBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  permissionText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liveBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  apiHint: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    maxWidth: 100,
  },

  promptBannerWrap: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  promptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 300,
    backgroundColor: colors.overlay,
    borderRadius: radius.full,
    paddingVertical: 10,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    gap: spacing.xs,
  },
  promptBannerText: {
    flex: 1,
    ...typography.caption,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  promptClose: {
    padding: 2,
  },
  promptCloseText: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 18,
  },
  spacer: { flex: 1 },
  bottomPanel: {
    backgroundColor: lightColors.tabBarDark,
    paddingTop: 6,
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  galleryThumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  galleryPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryPlaceholderText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  modePill: {
    flexShrink: 1,
    maxWidth: 168,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45, 45, 48, 0.88)',
    borderRadius: radius.full,
    marginHorizontal: spacing.sm,
    paddingVertical: 11,
    paddingHorizontal: 12,
    gap: 6,
  },
  modePillDisabled: { opacity: 0.65 },
  modePillIcon: {
    fontSize: 16,
  },
  modePillText: {
    flexShrink: 1,
    ...typography.subtitle,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  modeInfoBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeInfoText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '700',
    fontStyle: 'italic',
    lineHeight: 14,
  },
  flipBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(45, 45, 48, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipIcon: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  statusBar: {
    alignSelf: 'center',
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.text,
  },
  captureRow: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.shutterRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterDisabled: { opacity: 0.5 },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterIcon: {
    fontSize: 22,
    color: colors.accent,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  primaryBtnText: {
    ...typography.subtitle,
    color: colors.text,
  },
});
