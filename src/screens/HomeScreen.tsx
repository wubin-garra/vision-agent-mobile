import { useCallback, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { featuredPrompts, perspectives } from '@/constants/homeContent';
import { listMemories } from '@/services/api';
import { track } from '@/services/analytics';
import { useSessionStore } from '@/store/session';
import { lightColors, radius, spacing, typography } from '@/theme';
import type { MainTabParamList, RootStackParamList } from '@/types/navigation';
import type { MemoryItem } from '@/types/insight';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { memories, setMemories } = useSessionStore();
  const [promptIndex] = useState(() => Math.floor(Math.random() * featuredPrompts.length));

  useFocusEffect(
    useCallback(() => {
      listMemories()
        .then(setMemories)
        .catch(() => setMemories([]));
    }, [setMemories]),
  );

  const openMemory = (item: MemoryItem) => {
    track('memory_open', {
      memory_id: item.id,
      agent: item.agent_id,
      from: 'home',
    });
    navigation.navigate('Insight', {
      memoryId: item.id,
      imageUri: item.image_url,
      insight: item.insight,
      followupChips: item.insight.next_actions.length
        ? item.insight.next_actions
        : ['更多历史背景', '类似风格有哪些'],
      agentId: item.agent_id,
      entryMode: 'history',
    });
  };

  const goCamera = () => {
    navigation.navigate('Camera');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient
            colors={['#FF6B35', '#FF8E53', '#FFB347']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.heroInner}>
            <Text style={styles.heroTitle}>共发现，同探索</Text>
            <Text style={styles.heroSub}>
              对准世界，一键理解。{'\n'}Vision Agent 是你的好奇心镜头。
            </Text>
            <TouchableOpacity style={styles.heroBtn} onPress={goCamera}>
              <Text style={styles.heroBtnText}>✦ 开始拍照</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 换个视角 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>换个视角</Text>
            <TouchableOpacity onPress={goCamera}>
              <Text style={styles.sectionLink}>探索更多 ›</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.perspectiveRow}>
            {perspectives.map((item) => (
              <TouchableOpacity key={item.id} style={styles.perspectiveItem} onPress={goCamera}>
                <View style={styles.perspectiveCircle}>
                  <Text style={styles.perspectiveEmoji}>{item.emoji}</Text>
                  {item.isNew ? (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.perspectiveLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 拍照提示卡 */}
        <TouchableOpacity style={styles.promptCard} onPress={goCamera} activeOpacity={0.9}>
          <View style={styles.promptGrid}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.promptGridCell, i > 1 && styles.promptGridBlur]} />
            ))}
          </View>
          <View style={styles.promptBody}>
            <Text style={styles.promptText}>{featuredPrompts[promptIndex]}</Text>
            <View style={styles.promptBtn}>
              <Text style={styles.promptBtnText}>📷 立即拍照</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 值得细看 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>值得细看</Text>
          {memories.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>还没有视觉记忆，拍第一张吧</Text>
            </View>
          ) : (
            memories.slice(0, 5).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.feedCard}
                onPress={() => openMemory(item)}
                activeOpacity={0.92}
              >
                <Image source={{ uri: item.thumbnail_url }} style={styles.feedImage} />
                <View style={styles.feedOverlay}>
                  <Text style={styles.feedTitle}>{item.title}</Text>
                  <Text style={styles.feedMeta}>{item.category}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: lightColors.bg },
  content: { paddingBottom: spacing.xxl },
  hero: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.xl,
    overflow: 'hidden',
    minHeight: 200,
  },
  heroInner: {
    padding: spacing.lg,
    paddingVertical: spacing.xl,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSub: {
    ...typography.body,
    color: 'rgba(255,255,255,0.92)',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  heroBtn: {
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  heroBtnText: {
    ...typography.subtitle,
    color: lightColors.text,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 20,
    color: lightColors.text,
  },
  sectionLink: {
    ...typography.caption,
    color: lightColors.textMuted,
  },
  perspectiveRow: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  perspectiveItem: {
    width: 72,
    alignItems: 'center',
  },
  perspectiveCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: lightColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  perspectiveEmoji: { fontSize: 28 },
  newBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: lightColors.badge,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
  },
  perspectiveLabel: {
    ...typography.caption,
    color: lightColors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
    fontSize: 11,
  },
  promptCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: lightColors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: lightColors.border,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
  },
  promptGrid: {
    width: 72,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  promptGridCell: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
  },
  promptGridBlur: { opacity: 0.45 },
  promptBody: { flex: 1, justifyContent: 'space-between' },
  promptText: {
    ...typography.body,
    color: lightColors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  promptBtn: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    backgroundColor: lightColors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  promptBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: lightColors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: lightColors.textMuted,
  },
  feedCard: {
    marginTop: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    height: 220,
    backgroundColor: lightColors.surface,
  },
  feedImage: { width: '100%', height: '100%' },
  feedOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  feedTitle: {
    ...typography.subtitle,
    color: '#FFFFFF',
  },
  feedMeta: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});
