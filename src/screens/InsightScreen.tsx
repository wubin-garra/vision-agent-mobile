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
import { ChipRow, InsightCard, InsightSection, TagList } from '@/components/InsightCard';
import { InsightInputBar, type InsightInputBarHandle } from '@/components/InsightInputBar';
import { SharePosterCard, type PosterData } from '@/components/SharePosterCard';
import { AGENT_LABELS } from '@/constants/config';
import { useKeyboardInset } from '@/hooks/useKeyboardInset';
import { buildPosterData, followUp, getMemory, mapFollowUpsToQA, requestSharePoster } from '@/services/api';
import type { RootStackParamList } from '@/types/navigation';
import { colors, radius, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Insight'>;

interface QAItem {
  question: string;
  answer: string;
}

export function InsightScreen({ navigation, route }: Props) {
  const { memoryId, imageUri, insight, followupChips, agentId, entryMode = 'fresh' } = route.params;
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
  const keyboardInset = useKeyboardInset();

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
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
    setTimeout(scrollToBottom, Platform.OS === 'ios' ? 320 : 120);
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
      const result = await followUp(memoryId, question.trim());
      setQaList((prev) => [...prev, { question, answer: result.answer }]);
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
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{AGENT_LABELS[agentId] ?? '洞察'}</Text>
        <TouchableOpacity onPress={sharePoster}>
          <Text style={styles.share}>分享名片</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: inputBarHeight + keyboardInset + spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          onContentSizeChange={handleContentSizeChange}
        >
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

        <View ref={posterRef} collapsable={false} style={styles.posterHidden}>
          <SharePosterCard imageUri={imageUri} poster={posterData} />
        </View>

        <InsightCard title={insight.title} category={insight.category} confidence={insight.confidence}>
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
          <View style={styles.qaBlock}>
            <Text style={styles.qaTitle}>追问记录</Text>
            {qaList.map((item, index) => (
              <View key={`${item.question}-${index}`} style={styles.qaItem}>
                <Text style={styles.qaQuestion}>Q: {item.question}</Text>
                <Text style={styles.qaAnswer}>{item.answer}</Text>
              </View>
            ))}
          </View>
        )}

        {!hasGroupedChips && (
          <View style={styles.followupBlock}>
            <Text style={styles.qaTitle}>继续探索</Text>
            <ChipRow items={chips} onPress={prefillQuestion} />
          </View>
        )}
        </ScrollView>

        <View
          style={[styles.inputDock, { bottom: keyboardInset }]}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  back: { ...typography.caption, color: colors.accent },
  headerTitle: { ...typography.subtitle, color: colors.text },
  share: { ...typography.caption, color: colors.accent },
  body: { flex: 1, position: 'relative' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },
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
  bodyText: { ...typography.body, color: colors.text, marginBottom: spacing.xs },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.lg,
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
  qaBlock: { gap: spacing.md },
  qaTitle: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase' },
  qaItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qaQuestion: { ...typography.caption, color: colors.accent, marginBottom: spacing.xs },
  qaAnswer: { ...typography.body, color: colors.text },
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
