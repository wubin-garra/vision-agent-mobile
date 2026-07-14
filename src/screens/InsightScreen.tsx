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

import { FoodInsightSections } from '@/components/FoodInsightSections';
import { FoodScanInsightSections } from '@/components/FoodScanInsightSections';
import { FoodScanFollowUpAnswer } from '@/components/FoodScanFollowUpAnswer';
import { FoodScanThinkingSheet } from '@/components/FoodScanThinkingSheet';
import { FullImageViewer } from '@/components/FullImageViewer';
import { ChipRow, InsightCard, InsightSection, TagList } from '@/components/InsightCard';
import { InsightInputBar, type InsightInputBarHandle } from '@/components/InsightInputBar';
import { SharePosterCard, type PosterData } from '@/components/SharePosterCard';
import { AGENT_LABELS } from '@/constants/config';
import { useKeyboardInset } from '@/hooks/useKeyboardInset';
import { buildPosterData, followUp, getMemory, mapFollowUpsToQA, requestSharePoster } from '@/services/api';
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
    if (entryMode !== 'history' || didInitialScrollRef.current) return;
    didInitialScrollRef.current = true;
    scrollToTop();
  };

  useEffect(() => {
    didInitialScrollRef.current = false;
  }, [memoryId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
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
  }, [memoryId]);

  const isFoodScan = agentId === 'food_scan';
  const isFoodStyle =
    agentId === 'food_explorer' &&
    Boolean(
      insight.narrative ||
        insight.flavor_notes?.length ||
        insight.nearby_picks?.length ||
        insight.explore_chips?.culinary?.length,
    );

  const hasGroupedChips = Boolean(
    insight.explore_chips?.culinary?.length || insight.explore_chips?.nearby?.length,
  );

  const handleInputFocus = () => {
    setTimeout(() => scrollToEnd(true), Platform.OS === 'ios' ? 320 : 120);
  };

  const prefillQuestion = (question: string) => {
    setCustomQuestion(question);
    requestAnimationFrame(() => {
      inputBarRef.current?.focus();
    });
  };

  const askQuestion = async (question: string) => {
    if (!question.trim() || loading) return;
    Keyboard.dismiss();
    setLoading(true);
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
    <SafeAreaView style={[styles.root, isFoodScan && styles.rootLight]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, isFoodScan && styles.backLight]}>返回</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isFoodScan && styles.headerTitleLight]}>
          {AGENT_LABELS[agentId] ?? '洞察'}
        </Text>
        <TouchableOpacity onPress={sharePoster}>
          <Text style={[styles.share, isFoodScan && styles.shareLight]}>分享名片</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            isFoodScan ? styles.contentFoodScan : styles.content,
            { paddingBottom: inputBarHeight + keyboardInset + spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          onContentSizeChange={handleContentSizeChange}
        >
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => {
            hapticLight();
            setFullImageVisible(true);
          }}
        >
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, isFoodScan && styles.imageFoodScan]}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View ref={posterRef} collapsable={false} style={styles.posterHidden}>
          <SharePosterCard imageUri={imageUri} poster={posterData} />
        </View>

        {isFoodScan ? (
          <View style={styles.foodScanHero}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setThinkingVisible(true)}
              style={styles.agentTagBtn}
            >
              <Text style={styles.agentTag}>与食识拍一起看见 ›</Text>
            </TouchableOpacity>
            <Text style={styles.foodScanTitle}>{insight.title}</Text>
            {insight.narrative ? (
              <Text style={styles.foodScanNarrative}>{insight.narrative}</Text>
            ) : null}
          </View>
        ) : null}

        {isFoodScan ? (
          <View style={styles.foodScanBody}>
            <FoodScanInsightSections
              insight={insight}
              onSelectQuestion={prefillQuestion}
              onScrollToBottom={scrollToBottom}
            />
            <Text style={styles.disclaimerLight}>{insight.disclaimer}</Text>
          </View>
        ) : (
        <InsightCard
          title={insight.title}
          category={insight.category}
          confidence={insight.confidence}
          light={isFoodScan}
        >
          {isFoodStyle ? (
            <FoodInsightSections insight={insight} onSelectQuestion={prefillQuestion} />
          ) : (
            <>
              {insight.visible_clues.length > 0 && (
                <InsightSection title="可见线索">
                  {insight.visible_clues.map((clue) => (
                    <Text key={clue} style={styles.bodyText}>
                      • {clue}
                    </Text>
                  ))}
                </InsightSection>
              )}

              {contextBlocks.map((block) => (
                <InsightSection key={block.label} title={block.label}>
                  <Text style={styles.bodyText}>{block.value}</Text>
                </InsightSection>
              ))}

              {insight.style_vocabulary.length > 0 && (
                <InsightSection title="风格词汇">
                  <TagList items={insight.style_vocabulary} />
                </InsightSection>
              )}

              {insight.suggested_searches.length > 0 && (
                <InsightSection title="推荐搜索">
                  <TagList items={insight.suggested_searches} />
                </InsightSection>
              )}
            </>
          )}

          <Text style={styles.disclaimer}>{insight.disclaimer}</Text>
        </InsightCard>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={speakInsight}>
            <Text style={styles.actionBtnText}>{speaking ? '停止播报' : '语音播报'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnPrimary} onPress={sharePoster}>
            <Text style={styles.actionBtnPrimaryText}>生成分享名片</Text>
          </TouchableOpacity>
        </View>

        {historyLoading ? (
          <View style={styles.historyLoading}>
            <ActivityIndicator color={colors.accent} size="small" />
            <Text style={styles.historyLoadingText}>加载追问记录…</Text>
          </View>
        ) : null}

        {qaList.length > 0 && (
          <View style={[styles.qaBlock, isFoodScan && styles.qaBlockLight]}>
            {!isFoodScan ? <Text style={styles.qaTitle}>追问记录</Text> : null}
            {qaList.map((item, index) => (
              <View
                key={`${item.question}-${index}`}
                style={[
                  styles.qaItem,
                  isFoodScan && styles.qaItemLight,
                  index === qaList.length - 1 && styles.qaItemLast,
                ]}
              >
                <View style={[styles.userBubble, isFoodScan && styles.userBubbleLight]}>
                  <Text style={[styles.userBubbleText, isFoodScan && styles.userBubbleTextLight]}>
                    {item.question}
                  </Text>
                </View>
                {isFoodScan && item.structuredAnswer ? (
                  <FoodScanFollowUpAnswer
                    answer={item.structuredAnswer}
                    onSelectQuestion={prefillQuestion}
                  />
                ) : (
                  <Text style={[styles.qaAnswer, isFoodScan && styles.qaAnswerLight]}>
                    {item.answer}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {!hasGroupedChips && !isFoodScan && (
          <View style={styles.followupBlock}>
            <Text style={styles.qaTitle}>继续探索</Text>
            <ChipRow items={chips} onPress={prefillQuestion} />
          </View>
        )}
        </ScrollView>

        <View
          style={[styles.inputDock, { bottom: keyboardInset }, isFoodScan && styles.inputDockLight]}
          onLayout={(event) => setInputBarHeight(event.nativeEvent.layout.height)}
        >
          <InsightInputBar
            ref={inputBarRef}
            value={customQuestion}
            onChangeText={setCustomQuestion}
            onSubmit={() => askQuestion(customQuestion)}
            onFocus={handleInputFocus}
            loading={loading}
            keyboardInset={keyboardInset}
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
  rootLight: { backgroundColor: lightColors.bg },
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
  inputDockLight: {
    backgroundColor: lightColors.bg,
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
  foodScanHero: {
    gap: spacing.sm,
    marginBottom: spacing.xs,
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
