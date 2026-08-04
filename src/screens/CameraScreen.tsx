import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import * as MediaLibrary from 'expo-media-library/legacy';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import {
  AnalysisThinkingOverlay,
  type ThinkingVariant,
} from '@/components/AnalysisThinkingOverlay';
import { AgentMismatchSheet } from '@/components/AgentMismatchSheet';
import { BirthdayCollectSheet } from '@/components/BirthdayCollectSheet';
import { CreditsBadge } from '@/components/CreditsBadge';
import { API_BASE_URL, API_MISCONFIGURED, AGENT_LABELS, formatApiError } from '@/constants/config';
import { AgentDetailSheet } from '@/components/AgentDetailSheet';
import { AgentModeCarousel } from '@/components/AgentModeCarousel';
import { CameraScanFrame } from '@/components/CameraScanFrame';
import { PalmCameraGuide } from '@/components/PalmCameraGuide';
import { ZoomSelector } from '@/components/ZoomSelector';
import { resolveThinkingPack } from '@/constants/analysisThinking';
import { FOOD_SCAN_THINKING_STEP_DURATIONS_MS, FOOD_SCAN_THINKING_STEPS } from '@/constants/foodScanThinking';
import {
  PALM_READER_THINKING_STEP_DURATIONS_MS,
  PALM_READER_THINKING_STEPS,
} from '@/constants/palmReaderThinking';
import {
  agentToCameraMode,
  cameraModeToAgent,
  cameraModes,
  findCameraMode,
  orderCameraModes,
  type CameraModeItem,
} from '@/constants/cameraModes';
import type { AgentId, AgentMismatchInfo, AnalyzeResponse } from '@/types/insight';
import { useNativeCameraZoom } from '@/hooks/useNativeCameraZoom';
import { analyzeImageStream } from '@/services/api';
import { track } from '@/services/analytics';
import { useFavoriteModesStore } from '@/store/favoriteModes';
import { useSessionStore } from '@/store/session';
import { colors, lightColors, radius, spacing, typography } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';
import { getCurrentCoordinates } from '@/utils/location';
import { cropCaptureToViewport, getCaptureCropRatio } from '@/utils/captureCrop';
import { resolveAnalyzeMismatch } from '@/utils/agentMismatch';
import { hapticLight, hapticMedium, hapticSelection } from '@/utils/haptics';

/** 前后摄切换：双向弧形箭头 */
function FlipCameraIcon({ color = '#FFFFFF', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19.5 8.2A7.2 7.2 0 0 0 6.6 6.55"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
      <Path
        d="M19.5 4.4v3.8h-3.8"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.5 15.8a7.2 7.2 0 0 0 12.9 1.65"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
      <Path
        d="M4.5 19.6v-3.8h3.8"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 镜头名胶囊固定宽，避免切换时跳动 */
const MODE_PILL_WIDTH = 176;
const MODE_PILL_SIDE = 32;

type StackNav = NativeStackNavigationProp<RootStackParamList>;

export function CameraScreen() {
  const navigation = useNavigation<StackNav>();
  const cameraRef = useRef<CameraView>(null);
  const previewSizeRef = useRef({ width: 0, height: 0 });
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
  const [birthdaySheetVisible, setBirthdaySheetVisible] = useState(false);
  const [pendingAnalyze, setPendingAnalyze] = useState<{
    uri: string;
    source: 'camera' | 'gallery';
  } | null>(null);
  const [mismatchInfo, setMismatchInfo] = useState<AgentMismatchInfo | null>(null);
  const [mismatchVisible, setMismatchVisible] = useState(false);
  const [analyzeNotice, setAnalyzeNotice] = useState<string | null>(null);
  const pendingInsightRef = useRef<AnalyzeResponse | null>(null);
  const { selectedAgent, setSelectedAgent, birthday, setBirthday } = useSessionStore();
  const favoriteIds = useFavoriteModesStore((s) => s.favoriteIds);
  const hydrateFavorites = useFavoriteModesStore((s) => s.hydrate);
  const isFavorite = useFavoriteModesStore((s) => s.isFavorite);
  const toggleFavorite = useFavoriteModesStore((s) => s.toggleFavorite);
  const activeMode = findCameraMode(agentToCameraMode(selectedAgent));
  const orderedModes = useMemo(
    () => orderCameraModes(cameraModes, favoriteIds),
    [favoriteIds],
  );
  const activeFavorited = isFavorite(activeMode.id);
  const canFavorite = activeMode.id !== 'auto';
  const isPalmReaderMode = selectedAgent === 'palm_reader';
  const thinkingVariant = resolveThinkingVariant(selectedAgent);

  useEffect(() => {
    void hydrateFavorites();
  }, [hydrateFavorites]);

  /** 预览系统相册最新一张（与常见相机产品一致） */
  const refreshGalleryThumb = useCallback(async () => {
    try {
      const current = await MediaLibrary.getPermissionsAsync();
      let permission = current;
      if (permission.status === 'undetermined') {
        permission = await MediaLibrary.requestPermissionsAsync();
      }
      const allowed =
        permission.status === 'granted' ||
        permission.accessPrivileges === 'limited';
      if (!allowed) return;

      const { assets } = await MediaLibrary.getAssetsAsync({
        first: 1,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });
      const asset = assets[0];
      if (!asset) return;

      const info = await MediaLibrary.getAssetInfoAsync(asset);
      const uri = info.localUri ?? asset.uri;
      if (uri) setLastPhoto(uri);
    } catch {
      // 无权限或空相册时保持占位，不打断拍照
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshGalleryThumb();
    }, [refreshGalleryThumb]),
  );

  // 分析中本地推进思考步骤，填满上传→返回结果之间的等待感
  useEffect(() => {
    if (!analyzing) return;

    const { steps, durations } = resolveThinkingSchedule(thinkingVariant);

    let stepIndex = 0;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const showStep = (index: number) => {
      const step = steps[index];
      setThinkingStep(step);
      if (step && !thinkingStepsRef.current.includes(step)) {
        thinkingStepsRef.current = [...thinkingStepsRef.current, step];
        setThinkingSteps(thinkingStepsRef.current);
      }
    };

    const scheduleNext = () => {
      if (cancelled) return;
      showStep(stepIndex);

      const duration = durations[stepIndex] ?? 0;
      if (duration <= 0 || stepIndex >= steps.length - 1) return;

      timeoutId = setTimeout(() => {
        stepIndex = Math.min(stepIndex + 1, steps.length - 1);
        scheduleNext();
      }, duration);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [analyzing, thinkingVariant]);

  const navigateToInsight = (result: AnalyzeResponse, uri: string) => {
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
  };

  const clearAnalyzeUi = () => {
    setAnalyzing(false);
    setStatus('');
    setAnalyzeStage('');
    setThinkingStep(undefined);
    thinkingStepsRef.current = [];
    setThinkingSteps([]);
    setPreviewUri(null);
    setPendingAnalyze(null);
    setAnalyzeNotice(null);
  };

  const runAnalyze = async (
    uri: string,
    source: 'camera' | 'gallery',
    birthdayOverride?: string | null,
  ) => {
    if (API_MISCONFIGURED) {
      Alert.alert('未配置 API', formatApiError(new Error('misconfigured')));
      return;
    }

    const mode = selectedAgent ?? 'auto';
    const startedAt = Date.now();
    track('analyze_start', { agent: mode, source });

    setMismatchVisible(false);
    setMismatchInfo(null);
    pendingInsightRef.current = null;
    setPreviewUri(uri);
    setLastPhoto(uri);
    setAnalyzing(true);
    setAnalyzeNotice(
      mode !== 'auto'
        ? `上传后会确认是否适合「${AGENT_LABELS[mode] ?? mode}」`
        : null,
    );
    setStatus(statusForStage('uploading', thinkingVariant));
    setAnalyzeStage('uploading');
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
            setStatus(statusForStage(stage, thinkingVariant));
            if (stage === 'captioning' && mode !== 'auto') {
              setAnalyzeNotice(
                `正在核对照片是否对题「${AGENT_LABELS[mode] ?? mode}」…`,
              );
            }
            if (stage === 'mismatch') {
              setAnalyzeNotice('这张照片和当前镜头不太对题，正在调整解读方式…');
            }
          },
          onThinking: () => {
            // 步骤节奏由客户端 durationsMs 控制
          },
          onMismatch: (info) => {
            setMismatchInfo(info);
            setAnalyzeNotice(info.message);
            setAnalyzeStage('mismatch');
            setStatus('换一张照片可能更合适');
          },
          onPartial: (partial) => setStatus(`${partial.title} · ${partial.category}`),
        },
        {
          agentOverride: selectedAgent ?? undefined,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
          birthday: birthdayOverride ?? undefined,
        },
      );

      if (!result) throw new Error('分析失败');

      const mismatch = resolveAnalyzeMismatch({
        requestedMode: mode,
        resultAgentId: result.agent_id,
        serverMismatch: result.agent_mismatch,
        insight: result.insight,
      });

      track('analyze_success', {
        agent: result.agent_id,
        requested_agent: mode,
        source,
        duration_ms: Date.now() - startedAt,
        has_location: Boolean(coordinates),
        has_birthday: Boolean(birthdayOverride),
        agent_mismatch: Boolean(mismatch),
      });

      if (mismatch) {
        track('analyze_agent_mismatch', {
          requested: mismatch.requested_agent,
          actual: mismatch.suggested_agent,
          reason: mismatch.reason,
          source,
        });
        pendingInsightRef.current = result;
        setMismatchInfo(mismatch);
        setAnalyzing(false);
        setAnalyzeNotice(null);
        setStatus('');
        setAnalyzeStage('');
        setMismatchVisible(true);
        return;
      }

      navigateToInsight(result, uri);
      clearAnalyzeUi();
    } catch (error) {
      track('analyze_fail', {
        agent: mode,
        source,
        duration_ms: Date.now() - startedAt,
        error: error instanceof Error ? error.message : 'unknown',
      });
      Alert.alert('分析失败', formatApiError(error));
      clearAnalyzeUi();
    }
  };

  const beginAnalyze = async (uri: string, source: 'camera' | 'gallery') => {
    if (selectedAgent === 'palm_reader') {
      setPreviewUri(uri);
      setLastPhoto(uri);
      setPendingAnalyze({ uri, source });
      setBirthdaySheetVisible(true);
      return;
    }
    await runAnalyze(uri, source);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || analyzing || birthdaySheetVisible || mismatchVisible) return;
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
      const { width: viewW, height: viewH } = previewSizeRef.current;
      const viewAspect = viewW > 0 && viewH > 0 ? viewW / viewH : 0;
      // 按取景视口裁切：底部控制栏不再遮挡「所见」，成片与预览一致
      const uri = await cropCaptureToViewport(
        photo.uri,
        photo.width ?? 0,
        photo.height ?? 0,
        viewAspect,
        cropRatio,
      );

      await beginAnalyze(uri, 'camera');
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
      await beginAnalyze(result.assets[0].uri, 'gallery');
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

  const onToggleFavorite = () => {
    if (!canFavorite || analyzing) return;
    hapticSelection();
    toggleFavorite(activeMode.id);
    track('camera_mode_favorite_toggle', {
      mode_id: activeMode.id,
      favorited: !activeFavorited,
    });
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
      {/* 上：可视取景区（相机只渲染在这里，不被底部控件遮挡） */}
      <View
        style={styles.previewViewport}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          previewSizeRef.current = { width, height };
        }}
      >
        {!analyzing && !birthdaySheetVisible && !mismatchVisible ? (
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

        {!analyzing && !birthdaySheetVisible && !mismatchVisible ? (
          isPalmReaderMode ? <PalmCameraGuide /> : <CameraScanFrame />
        ) : null}

        <SafeAreaView style={styles.previewOverlay} edges={['top']} pointerEvents="box-none">
          <View style={styles.topBar} pointerEvents="box-none">
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

          {showPrompt ? (
            <View style={styles.promptBannerWrap} pointerEvents="box-none">
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
          ) : null}

          <View style={styles.spacer} pointerEvents="none" />

          <View style={styles.previewFooter}>
            <ZoomSelector
              presets={zoomPresets}
              onSelect={applyPreset}
              disabled={analyzing}
            />
          </View>
        </SafeAreaView>
      </View>

      {/* 下：镜头选择与快门（独立控制区，不叠在取景画面上） */}
      <View style={styles.bottomChrome}>
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

          <View style={[styles.modePill, analyzing && styles.modePillDisabled]}>
            <TouchableOpacity
              style={styles.modePillSide}
              onPress={onToggleFavorite}
              disabled={analyzing || !canFavorite}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={activeFavorited ? '取消收藏镜头' : '收藏镜头'}
            >
              <Text
                style={[
                  styles.modePillFavIcon,
                  activeFavorited && styles.modePillFavIconActive,
                  !canFavorite && styles.modePillFavIconDisabled,
                ]}
              >
                {activeFavorited ? '🏷️' : '🔖'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.modePillText} numberOfLines={1}>
              {activeMode.label}
            </Text>
            <TouchableOpacity
              style={styles.modePillSide}
              onPress={openDetail}
              disabled={analyzing}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="镜头说明"
            >
              <View style={styles.modeInfoBtn}>
                <Text style={styles.modeInfoText}>i</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.flipBtn, analyzing && styles.flipBtnDisabled]}
            onPress={() => {
              hapticLight();
              setFacing((current) => (current === 'back' ? 'front' : 'back'));
              resetZoom();
            }}
            disabled={analyzing}
            accessibilityRole="button"
            accessibilityLabel="切换前后摄像头"
          >
            <FlipCameraIcon />
          </TouchableOpacity>
        </View>

        {analyzing && status ? (
          <View style={styles.statusBar}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ) : null}

        <AgentModeCarousel
          modes={orderedModes}
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

      <AgentDetailSheet
        visible={detailVisible}
        mode={activeMode}
        onClose={() => setDetailVisible(false)}
        onTry={() => setDetailVisible(false)}
      />

      <BirthdayCollectSheet
        visible={birthdaySheetVisible}
        initialBirthday={birthday}
        onConfirm={(value) => {
          setBirthday(value);
          setBirthdaySheetVisible(false);
          if (pendingAnalyze) {
            void runAnalyze(pendingAnalyze.uri, pendingAnalyze.source, value);
          }
        }}
        onSkip={() => {
          setBirthdaySheetVisible(false);
          if (pendingAnalyze) {
            void runAnalyze(pendingAnalyze.uri, pendingAnalyze.source, null);
          }
        }}
      />

      <AgentMismatchSheet
        visible={mismatchVisible}
        mismatch={mismatchInfo}
        onRetake={() => {
          track('analyze_mismatch_retake', {
            requested: mismatchInfo?.requested_agent,
            suggested: mismatchInfo?.suggested_agent,
          });
          setMismatchVisible(false);
          setMismatchInfo(null);
          pendingInsightRef.current = null;
          setPreviewUri(null);
          setPendingAnalyze(null);
          setAnalyzeNotice(null);
        }}
        onContinue={() => {
          const pending = pendingInsightRef.current;
          const uri = previewUri ?? lastPhoto;
          track('analyze_mismatch_continue', {
            requested: mismatchInfo?.requested_agent,
            suggested: mismatchInfo?.suggested_agent,
          });
          setMismatchVisible(false);
          setMismatchInfo(null);
          if (pending && uri) {
            navigateToInsight(pending, uri);
          }
          pendingInsightRef.current = null;
          clearAnalyzeUi();
        }}
        onClose={() => {
          setMismatchVisible(false);
          setMismatchInfo(null);
          pendingInsightRef.current = null;
          clearAnalyzeUi();
        }}
      />

      {/* 所有镜头分析时都展示等待浮层，避免只剩快门转圈 */}
      {analyzing ? (
        <AnalysisThinkingOverlay
          imageUri={previewUri}
          stage={analyzeStage}
          thinkingStep={thinkingStep}
          variant={thinkingVariant}
          notice={analyzeNotice}
        />
      ) : null}
    </View>
  );
}

function resolveThinkingVariant(agent: AgentId | null): ThinkingVariant {
  if (agent === 'food_scan') return 'food_scan';
  if (agent === 'palm_reader') return 'palm_reader';
  if (agent === 'food_explorer') return 'snack';
  if (agent === 'menu_translator') return 'menu_translator';
  return 'general';
}

function resolveThinkingSchedule(variant: ThinkingVariant): {
  steps: string[];
  durations: number[];
} {
  if (variant === 'palm_reader') {
    return {
      steps: PALM_READER_THINKING_STEPS,
      durations: PALM_READER_THINKING_STEP_DURATIONS_MS,
    };
  }
  if (variant === 'food_scan') {
    return {
      steps: FOOD_SCAN_THINKING_STEPS,
      durations: FOOD_SCAN_THINKING_STEP_DURATIONS_MS,
    };
  }
  const pack = resolveThinkingPack(variant);
  return { steps: pack.steps, durations: pack.durationsMs };
}

function statusForStage(stage: string, variant: ThinkingVariant): string {
  const pack =
    variant === 'food_scan' || variant === 'palm_reader'
      ? null
      : resolveThinkingPack(variant);
  const phrases = pack?.stagePhrases[stage] ?? pack?.stagePhrases.default;
  if (phrases?.[0]) return phrases[0];

  if (stage === 'mismatch') return '这张照片和当前镜头不太对题…';
  if (variant === 'palm_reader') {
    if (stage === 'uploading') return '正在上传掌心照片…';
    if (stage === 'captioning') return '正在核对是否为掌心…';
    if (stage === 'analyzing') return '正在生成手相洞察…';
  }
  if (variant === 'food_scan') {
    if (stage === 'uploading') return '正在上传餐食照片…';
    if (stage === 'captioning') return '正在核对是否为餐食…';
    if (stage === 'analyzing') return '正在生成营养报告…';
  }
  if (stage === 'uploading') return '正在上传图片…';
  if (stage === 'routing') return '正在选择智能体…';
  if (stage === 'captioning') return '正在分析图像…';
  if (stage === 'analyzing') return '正在生成洞察…';
  return '正在分析…';
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: lightColors.tabBarDark,
  },
  /** 上半：真实取景，占满控制区以外的全部高度 */
  previewViewport: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  frozenPreview: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
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
  previewOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-start',
  },
  previewFooter: {
    paddingBottom: spacing.sm,
    alignItems: 'center',
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
  /** 下半：镜头选择 / 快门，与 Tab 同色衔接，不盖住取景 */
  bottomChrome: {
    flexShrink: 0,
    backgroundColor: lightColors.tabBarDark,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: 4,
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
    width: MODE_PILL_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 45, 48, 0.88)',
    borderRadius: radius.full,
    marginHorizontal: spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  modePillDisabled: { opacity: 0.65 },
  modePillSide: {
    width: MODE_PILL_SIDE,
    height: MODE_PILL_SIDE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modePillFavIcon: {
    fontSize: 16,
    opacity: 0.75,
  },
  modePillFavIconActive: {
    opacity: 1,
  },
  modePillFavIconDisabled: {
    opacity: 0.28,
  },
  modePillText: {
    flex: 1,
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
  flipBtnDisabled: {
    opacity: 0.45,
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
    paddingTop: 2,
    paddingBottom: 2,
  },
  shutterOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3.5,
    borderColor: colors.shutterRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterDisabled: { opacity: 0.5 },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
