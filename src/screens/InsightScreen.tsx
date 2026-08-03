import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FoodScanInsightSections } from '@/components/FoodScanInsightSections';
import { FoodScanFollowUpAnswer } from '@/components/FoodScanFollowUpAnswer';
import { FoodScanThinkingSheet } from '@/components/FoodScanThinkingSheet';
import { FullImageViewer } from '@/components/FullImageViewer';
import { ChipRow, InsightCard, InsightSection, TagList } from '@/components/InsightCard';
import { InsightInputBar, type InsightInputBarHandle } from '@/components/InsightInputBar';
import { MenuTranslatorInsightSections } from '@/components/MenuTranslatorInsightSections';
import { MedLabelInsightSections } from '@/components/MedLabelInsightSections';
import { PalmReaderInsightSections } from '@/components/PalmReaderInsightSections';
import { PalmReaderThinkingSheet } from '@/components/PalmReaderThinkingSheet';
import { SharePosterCard, type PosterData } from '@/components/SharePosterCard';
import { SnackInsightSections } from '@/components/SnackInsightSections';
import {
  TravelInsightSections,
  hasTravelStructuredFields,
  isTravelAgent,
} from '@/components/TravelInsightSections';
import { getAgentTheme } from '@/constants/agentThemes';
import { AGENT_LABELS } from '@/constants/config';
import { useKeyboardInset } from '@/hooks/useKeyboardInset';
import { buildPosterData, followUp, getMemory, mapFollowUpsToQA, requestSharePoster } from '@/services/api';
import { track } from '@/services/analytics';
import type { StructuredFollowUpAnswer } from '@/types/insight';
import type { RootStackParamList } from '@/types/navigation';

import { colors, lightColors, radius, spacing, typography } from '@/theme';
import { hapticLight } from '@/utils/haptics';
import { ensureLocationForNearby, looksLikeNearbyQuery } from '@/utils/location';

type Props = NativeStackScreenProps<RootStackParamList, 'Insight'>;

interface QAItem {
  question: string;
  answer: string;
  structuredAnswer?: StructuredFollowUpAnswer;
}

export function InsightScreen({ navigation, route }: Props) {
  const { memoryId, imageUri, insight, followupChips, agentId, entryMode = 'fresh', thinkingSteps } =
    route.params;
  const posterRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);
  const inputBarRef = useRef<InsightInputBarHandle>(null);
  const didInitialScrollRef = useRef(false);
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [chips, setChips] = useState(followupChips);
  const [loading, setLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [posterData, setPosterData] = useState<PosterData>(() => buildPosterData(insight));
  const [inputBarHeight, setInputBarHeight] = useState(80);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [thinkingVisible, setThinkingVisible] = useState(false);
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const keyboardInset = useKeyboardInset();
  const followupSourceRef = useRef<'chip' | 'input'>('input');

  useEffect(() => {
    track('insight_view', {
      memory_id: memoryId,
      agent: agentId,
      entry_mode: entryMode,
    });
  }, [memoryId, agentId, entryMode]);

  const scrollToEnd = (animated = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated });
    });
  };

  const scrollToBottom = () => {
    Keyboard.dismiss();
    scrollToEnd(true);
  };

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  };

  const handleContentSizeChange = () => {
    if ((entryMode !== 'history' && entryMode !== 'demo') || didInitialScrollRef.current) return;
    didInitialScrollRef.current = true;
    scrollToTop();
  };

  useEffect(() => {
    didInitialScrollRef.current = false;
  }, [memoryId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (entryMode === 'demo' || memoryId.startsWith('demo-')) {
        if (!cancelled) setHistoryLoading(false);
        return;
      }
      try {
        const { followups } = await getMemory(memoryId);
        if (cancelled) return;
        if (followups.length > 0) {
          setQaList(mapFollowUpsToQA(followups));
        }
      } catch {
        // 历史加载失败不阻断主流程
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [memoryId, entryMode]);

  const theme = getAgentTheme(agentId);
  const isFoodScan = agentId === 'food_scan';
  const isPalmReader = agentId === 'palm_reader';
  const isMedLabel = agentId === 'med_label';
  // food_explorer 产品名「零食分析」；menu_translator「翻译师」
  const isSnack = agentId === 'food_explorer';
  const isMenuTranslator = agentId === 'menu_translator';
  const isTravel = isTravelAgent(agentId);
  const isLightInsight = theme.light;
  const isStructuredFollowUp = isFoodScan || isPalmReader;
  // 有专项字段才进专属 UI，否则回退通用线索列表（兼容旧 memory）
  const isSnackStyle =
    isSnack &&
    Boolean(
      insight.snack_analysis ||
        insight.narrative ||
        insight.flavor_notes?.length ||
        insight.explore_chips?.culinary?.length,
    );
  const isMenuStyle =
    isMenuTranslator &&
    Boolean(
      insight.menu_translation?.dishes?.length ||
        insight.narrative ||
        insight.explore_chips?.culinary?.length,
    );
  const isMedLabelStyle =
    isMedLabel && Boolean(insight.med_label_reading || insight.narrative);
  const isTravelStyle = isTravel && hasTravelStructuredFields(insight, agentId);

  const hasGroupedChips = Boolean(
    insight.explore_chips?.culinary?.length || insight.explore_chips?.nearby?.length,
  );

  const handleInputFocus = () => {
    setTimeout(() => scrollToEnd(true), Platform.OS === 'ios' ? 320 : 120);
  };

  const prefillQuestion = (question: string) => {
    followupSourceRef.current = 'chip';
    setCustomQuestion(question);
    requestAnimationFrame(() => {
      inputBarRef.current?.focus();
    });
  };

  const askQuestion = async (question: string) => {
    if (!question.trim() || loading) return;
    if (entryMode === 'demo' || memoryId.startsWith('demo-')) {
      Alert.alert('示例模式', '这是示例内容，追问请用相机实拍一张再试。');
      return;
    }
    const source = followupSourceRef.current;
    followupSourceRef.current = 'input';
    Keyboard.dismiss();
    setLoading(true);
    track('followup_ask', {
      memory_id: memoryId,
      agent: agentId,
      source,
      is_nearby_query: looksLikeNearbyQuery(question),
    });
    try {
      let latitude: number | undefined;
      let longitude: number | undefined;

      if (looksLikeNearbyQuery(question)) {
        const coords = await ensureLocationForNearby();
        latitude = coords?.latitude;
        longitude = coords?.longitude;
      }

      const result = await followUp(memoryId, question.trim(), {
        latitude,
        longitude,
      });
      setQaList((prev) => [
        ...prev,
        {
          question,
          answer: result.answer,
          structuredAnswer: result.structured_answer ?? undefined,
        },
      ]);
      if (result.suggested_followups.length) {
        setChips(result.suggested_followups);
      }
      setCustomQuestion('');
      scrollToBottom();
    } catch (error) {
      Alert.alert('追问失败', error instanceof Error ? error.message : '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const speakInsight = () => {
    const text = [
      insight.title,
      insight.subtitle,
      insight.narrative,
      insight.category,
      insight.context.cultural,
      insight.context.historical,
      insight.context.practical,
    ]
      .filter(Boolean)
      .join('。');

    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    Speech.speak(text, {
      language: 'zh-CN',
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
    });
  };

  const sharePoster = async () => {
    try {
      const result = await requestSharePoster({ memory_id: memoryId });
      setPosterData(result.poster);

      if (!posterRef.current) return;
      const uri = await captureRef(posterRef, { format: 'png', quality: 1 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        await Share.share({
          message: `${posterData.headline}\n${posterData.quote}`,
        });
      }
      track('share_poster', { memory_id: memoryId, agent: agentId });
    } catch (error) {
      Alert.alert('分享失败', error instanceof Error ? error.message : '请稍后重试');
    }
  };

  const contextBlocks = [
    { label: '文化背景', value: insight.context.cultural },
    { label: '历史背景', value: insight.context.historical },
    { label: '实用信息', value: insight.context.practical },
  ].filter((block) => block.value);


  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.bg }]}
      edges={['top']}
    >
      {/* 顶部色条：一眼区分智能体 */}
      <View style={[styles.accentStrip, { backgroundColor: theme.accent }]} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text
            style={[
              styles.back,
              isLightInsight ? styles.backLight : null,
              { color: theme.headerLink },
            ]}
          >
            返回
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {AGENT_LABELS[agentId] ?? '洞察'}
        </Text>
        <TouchableOpacity onPress={sharePoster}>
          <Text
            style={[
              styles.share,
              isLightInsight ? styles.shareLight : null,
              { color: theme.headerLink },
            ]}
          >
            分享名片
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            isLightInsight ? styles.contentFoodScan : styles.content,
            { paddingBottom: inputBarHeight + keyboardInset + spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          onContentSizeChange={handleContentSizeChange}
        >
        {!isPalmReader ? (
        <TouchableOpacity
          activeOpacity={0.92}
          style={isFoodScan || isMedLabelStyle ? styles.imageWrap : undefined}
          onPress={() => {
            hapticLight();
            setFullImageVisible(true);
          }}
        >
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, (isFoodScan || isMedLabelStyle) && styles.imageFoodScan]}
            resizeMode="cover"
          />
        </TouchableOpacity>
        ) : null}

        <View ref={posterRef} collapsable={false} style={styles.posterHidden}>
          <SharePosterCard imageUri={imageUri} poster={posterData} />
        </View>

        {isLightInsight ? (
          <View style={[styles.foodScanHero, isPalmReader && styles.palmHero]}>
            {isFoodScan || isPalmReader ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setThinkingVisible(true)}
                style={styles.agentTagBtn}
              >
                <Text style={[styles.agentTag, { color: theme.accent }]}>
                  {theme.togetherLabel}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.agentTag, { color: theme.accent, marginBottom: spacing.sm }]}>
                {theme.togetherLabel}
              </Text>
            )}
            {!isMedLabelStyle ? (
              <>
                <Text style={[styles.foodScanTitle, { color: theme.text }]}>{insight.title}</Text>
                {insight.narrative ? (
                  <Text style={[styles.foodScanNarrative, { color: theme.textMuted }]}>
                    {insight.narrative}
                  </Text>
                ) : null}
              </>
            ) : null}
          </View>
        ) : null}

        {isFoodScan ? (
          <View style={styles.foodScanBody}>
            <FoodScanInsightSections
              insight={insight}
              onSelectQuestion={prefillQuestion}
              onScrollToBottom={scrollToBottom}
              theme={theme}
            />
            <Text style={[styles.disclaimerLight, { color: theme.textMuted }]}>
              {insight.disclaimer}
            </Text>
          </View>
        ) : isPalmReader ? (
          <View style={styles.foodScanBody}>
            <PalmReaderInsightSections
              insight={insight}
              onSelectQuestion={prefillQuestion}
              onScrollToBottom={scrollToBottom}
              imageUri={imageUri}
              onOpenFullImage={() => {
                hapticLight();
                setFullImageVisible(true);
              }}
              theme={theme}
            />
            <Text style={[styles.disclaimerLight, { color: theme.textMuted }]}>
              {insight.disclaimer}
            </Text>
          </View>
        ) : isMedLabelStyle ? (
          <View style={styles.foodScanBody}>
            <MedLabelInsightSections
              insight={insight}
              onSelectQuestion={prefillQuestion}
              theme={theme}
            />
            <Text style={[styles.disclaimerLight, { color: theme.textMuted }]}>
              {insight.disclaimer}
            </Text>
          </View>
        ) : (
        <InsightCard
          title={insight.title}
          category={insight.category}
          confidence={insight.confidence}
          light={false}
          accent={theme.accent}
          accentSoft={theme.accentSoft}
          gradientColors={theme.cardGradient}
        >
          {/* 零食 / 翻译师优先专属区块；其余 Agent 走通用线索 UI */}
          {isSnackStyle ? (
            <SnackInsightSections
              insight={insight}
              onSelectQuestion={prefillQuestion}
              theme={theme}
            />
          ) : isMenuStyle ? (
            <MenuTranslatorInsightSections
              insight={insight}
              onSelectQuestion={prefillQuestion}
              theme={theme}
            />
          ) : isTravelStyle ? (
            <TravelInsightSections
              insight={insight}
              agentId={agentId}
              onSelectQuestion={prefillQuestion}
              theme={theme}
            />
          ) : (
            <>
              {insight.visible_clues.length > 0 && (
                <InsightSection title="可见线索">
                  {insight.visible_clues.map((clue) => (
                    <Text key={clue} style={[styles.bodyText, { color: theme.text }]}>
                      • {clue}
                    </Text>
                  ))}
                </InsightSection>
              )}

              {contextBlocks.map((block) => (
                <InsightSection key={block.label} title={block.label}>
                  <Text style={[styles.bodyText, { color: theme.text }]}>{block.value}</Text>
                </InsightSection>
              ))}

              {insight.style_vocabulary.length > 0 && (
                <InsightSection title="风格词汇">
                  <TagList
                    items={insight.style_vocabulary}
                    accent={theme.accent}
                    accentSoft={theme.accentSoft}
                    textColor={theme.accent}
                  />
                </InsightSection>
              )}

              {insight.suggested_searches.length > 0 && (
                <InsightSection title="推荐搜索">
                  <TagList
                    items={insight.suggested_searches}
                    accent={theme.accent}
                    accentSoft={theme.accentSoft}
                    textColor={theme.accent}
                  />
                </InsightSection>
              )}
            </>
          )}

          <Text style={[styles.disclaimer, { color: theme.textMuted }]}>
            {insight.disclaimer}
          </Text>
        </InsightCard>
        )}

        {!isLightInsight ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
              onPress={speakInsight}
            >
              <Text style={[styles.actionBtnText, { color: theme.text }]}>
                {speaking ? '停止播报' : '语音播报'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtnPrimary, { backgroundColor: theme.primaryBtn }]}
              onPress={sharePoster}
            >
              <Text style={[styles.actionBtnPrimaryText, { color: theme.primaryBtnText }]}>
                生成分享名片
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {historyLoading ? (
          <View style={styles.historyLoading}>
            <ActivityIndicator color={theme.accent} size="small" />
            <Text style={[styles.historyLoadingText, { color: theme.textMuted }]}>
              加载追问记录…
            </Text>
          </View>
        ) : null}

        {qaList.length > 0 && (
          <View style={[styles.qaBlock, isLightInsight && styles.qaBlockLight]}>
            {!isLightInsight ? (
              <Text style={[styles.qaTitle, { color: theme.textMuted }]}>追问记录</Text>
            ) : null}
            {qaList.map((item, index) => (
              <View
                key={`${item.question}-${index}`}
                style={[
                  styles.qaItem,
                  { borderBottomColor: theme.border },
                  index === qaList.length - 1 && styles.qaItemLast,
                ]}
              >
                <View
                  style={[
                    styles.userBubble,
                    {
                      backgroundColor: theme.bubbleBg,
                      borderColor: theme.bubbleBorder,
                    },
                  ]}
                >
                  <Text style={[styles.userBubbleText, { color: theme.bubbleText }]}>
                    {item.question}
                  </Text>
                </View>
                {isStructuredFollowUp && item.structuredAnswer ? (
                  <FoodScanFollowUpAnswer
                    answer={item.structuredAnswer}
                    onSelectQuestion={prefillQuestion}
                    theme={theme}
                  />
                ) : (
                  <Text style={[styles.qaAnswer, { color: theme.text }]}>{item.answer}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {!hasGroupedChips && !isLightInsight && (
          <View style={styles.followupBlock}>
            <Text style={[styles.qaTitle, { color: theme.textMuted }]}>继续探索</Text>
            <ChipRow items={chips} onPress={prefillQuestion} theme={theme} />
          </View>
        )}
        </ScrollView>

        <View
          style={[
            styles.inputDock,
            { bottom: keyboardInset, backgroundColor: theme.dockBg },
          ]}
          onLayout={(event) => setInputBarHeight(event.nativeEvent.layout.height)}
        >
          <InsightInputBar
            ref={inputBarRef}
            value={customQuestion}
            onChangeText={(text) => {
              followupSourceRef.current = 'input';
              setCustomQuestion(text);
            }}
            onSubmit={() => askQuestion(customQuestion)}
            onFocus={handleInputFocus}
            loading={loading}
            keyboardInset={keyboardInset}
            theme={theme}
            placeholder={
              isPalmReader
                ? '有什么想问的尽管说…'
                : isSnack
                  ? '想了解配料或热量？问我…'
                  : isMenuTranslator
                    ? '想按忌口筛选或再译详细？问我…'
                    : agentId === 'med_label'
                      ? '想了解用法、不良反应或说明书？问我…'
                      : isTravel
                        ? '关于行程还有什么想问？…'
                        : undefined
            }
          />
        </View>
      </View>

      {isFoodScan ? (
        <FoodScanThinkingSheet
          visible={thinkingVisible}
          imageUri={imageUri}
          completedSteps={thinkingSteps}
          onClose={() => setThinkingVisible(false)}
        />
      ) : null}

      {isPalmReader ? (
        <PalmReaderThinkingSheet
          visible={thinkingVisible}
          imageUri={imageUri}
          completedSteps={thinkingSteps}
          onClose={() => setThinkingVisible(false)}
        />
      ) : null}

      <FullImageViewer
        visible={fullImageVisible}
        imageUri={imageUri}
        onClose={() => setFullImageVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  accentStrip: {
    height: 3,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  back: { ...typography.caption, color: colors.accent },
  backLight: { color: lightColors.text },
  headerTitle: { ...typography.subtitle, color: colors.text },
  headerTitleLight: { color: lightColors.text },
  share: { ...typography.caption, color: colors.accent },
  shareLight: { color: lightColors.text },
  body: { flex: 1, position: 'relative' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },
  contentFoodScan: { paddingHorizontal: spacing.lg, paddingTop: 0, gap: spacing.md },
  inputDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
  },
  image: {
    width: '100%',
    height: 260,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  imageFoodScan: {
    height: 300,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  imageWrap: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radius.lg,
  },
  foodScanHero: {
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  palmHero: {
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  agentTagBtn: {
    alignSelf: 'flex-start',
  },
  agentTag: {
    ...typography.caption,
    color: lightColors.textMuted,
  },
  foodScanTitle: {
    ...typography.title,
    fontSize: 26,
    color: lightColors.text,
    lineHeight: 34,
  },
  foodScanNarrative: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 26,
    fontSize: 16,
  },
  foodScanBody: {
    gap: spacing.lg,
  },
  bodyText: { ...typography.body, color: colors.text, marginBottom: spacing.xs },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  disclaimerLight: {
    ...typography.caption,
    color: lightColors.textMuted,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  actionBtnText: { ...typography.caption, color: colors.text },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  actionBtnPrimaryText: { ...typography.caption, color: colors.text, fontWeight: '600' },
  qaBlock: { gap: spacing.lg },
  qaBlockLight: { marginTop: spacing.sm },
  qaTitle: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase' },
  qaItem: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  qaItemLight: {
    borderBottomColor: lightColors.border,
  },
  qaItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '88%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userBubbleLight: {
    backgroundColor: lightColors.surface,
    borderColor: lightColors.border,
  },
  userBubbleText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  userBubbleTextLight: {
    color: lightColors.text,
  },
  qaAnswer: { ...typography.body, color: colors.text },
  qaAnswerLight: { color: lightColors.text, lineHeight: 24 },
  followupBlock: { gap: spacing.sm },
  historyLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  historyLoadingText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  posterHidden: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
});
