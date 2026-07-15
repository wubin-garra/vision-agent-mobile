import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreditsBadge } from '@/components/CreditsBadge';
import { ActionToast } from '@/components/ActionToast';
import { DeleteMemoryDialog } from '@/components/DeleteMemoryDialog';
import { AGENT_LABELS, formatApiError } from '@/constants/config';
import { deleteMemory, listMemories } from '@/services/api';
import { track } from '@/services/analytics';
import { useSessionStore } from '@/store/session';
import { lightColors, radius, spacing, typography } from '@/theme';
import type { MemoryItem } from '@/types/insight';
import type { MainTabParamList, RootStackParamList } from '@/types/navigation';
import { hapticLight, hapticMedium } from '@/utils/haptics';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;
type Tab = 'diary' | 'insights';

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>('diary');
  const [deleteTarget, setDeleteTarget] = useState<MemoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { memories, setMemories, removeMemory } = useSessionStore();

  const load = useCallback(async () => {
    try {
      const items = await listMemories();
      setMemories(items);
    } catch {
      setMemories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setMemories]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const openMemory = (item: MemoryItem) => {
    track('memory_open', {
      memory_id: item.id,
      agent: item.agent_id,
      from: 'profile',
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

  const confirmDelete = (item: MemoryItem) => {
    hapticMedium();
    setDeleteTarget(item);
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteMemory(deleteTarget.id);
      track('memory_delete', {
        memory_id: deleteTarget.id,
        agent: deleteTarget.agent_id,
      });
      removeMemory(deleteTarget.id);
      setDeleteTarget(null);
      hapticLight();
      setToastMessage('已删除这条日记');
    } catch (error) {
      Alert.alert('删除失败', formatApiError(error));
    } finally {
      setDeleting(false);
    }
  };

  const renderDiaryItem = ({ item }: { item: MemoryItem }) => {
    const date = new Date(item.created_at);
    const monthDay = `${date.getMonth() + 1}月 ${date.getDate()}`;

    return (
      <TouchableOpacity
        style={styles.diaryRow}
        onPress={() => openMemory(item)}
        onLongPress={() => confirmDelete(item)}
        delayLongPress={400}
        activeOpacity={0.7}
      >
        <Text style={styles.diaryDate}>{monthDay}</Text>
        <View style={styles.diaryContent}>
          <Text style={styles.diaryTitle}>{item.title}</Text>
          <Text style={styles.diaryCaption} numberOfLines={2}>
            {item.insight.context.cultural || item.insight.context.practical || item.category}
          </Text>
          <Image source={{ uri: item.thumbnail_url }} style={styles.diaryImage} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>我</Text>
            </View>
            <Text style={styles.userName}>视觉探索者</Text>
          </View>
          <View style={styles.headerActions}>
            <CreditsBadge variant="light" />
            <View style={styles.bell}>
              <Text>🔔</Text>
              {memories.length > 0 ? <View style={styles.bellDot} /> : null}
            </View>
          </View>
        </View>

        {/* Progress card */}
        <View style={styles.progressCard}>
          <View style={styles.progressThumb}>
            {memories[0] ? (
              <Image source={{ uri: memories[0].thumbnail_url }} style={styles.progressImage} />
            ) : (
              <Text style={styles.lockIcon}>🔒</Text>
            )}
          </View>
          <View style={styles.progressBody}>
            <Text style={styles.progressTitle}>
              {memories.length >= 3 ? '故事已解锁' : `再拍 ${Math.max(0, 3 - memories.length)} 张解锁故事`}
            </Text>
            <View style={styles.progressBar}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[styles.progressDot, i < memories.length && styles.progressDotActive]}
                />
              ))}
            </View>
            <Text style={styles.progressHint}>
              用镜头记录日常，AI 帮你读懂背后的文化与故事。
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setTab('diary')} style={styles.tabBtn}>
            <Text style={[styles.tabText, tab === 'diary' && styles.tabTextActive]}>
              日记 ▾
            </Text>
            {tab === 'diary' ? <View style={styles.tabUnderline} /> : null}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('insights')} style={styles.tabBtn}>
            <Text style={[styles.tabText, tab === 'insights' && styles.tabTextActive]}>
              洞察
            </Text>
            {tab === 'insights' ? <View style={styles.tabUnderline} /> : null}
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <ActivityIndicator style={styles.loader} color={lightColors.accent} />
        ) : tab === 'diary' ? (
          <FlatList
            data={memories}
            keyExtractor={(item) => item.id}
            renderItem={renderDiaryItem}
            scrollEnabled={false}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  load();
                }}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>还没有日记</Text>
                <Text style={styles.emptyBody}>去拍照 tab 留下第一条视觉记忆</Text>
              </View>
            }
          />
        ) : (
          <View style={styles.insightsList}>
            {memories.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.insightCard}
                onPress={() => openMemory(item)}
              >
                <Text style={styles.insightCardTitle}>{item.title}</Text>
                <Text style={styles.insightCardMeta}>
                  {AGENT_LABELS[item.agent_id]} · 置信度 {(item.insight.confidence * 100).toFixed(0)}%
                </Text>
                {item.insight.style_vocabulary.slice(0, 3).map((tag) => (
                  <Text key={tag} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </TouchableOpacity>
            ))}
            {memories.length === 0 ? (
              <Text style={styles.emptyBody}>暂无洞察数据</Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      <DeleteMemoryDialog
        visible={deleteTarget !== null}
        deleting={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />

      <ActionToast message={toastMessage} onHidden={() => setToastMessage(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: lightColors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  userName: { ...typography.subtitle, color: lightColors.text, fontSize: 18 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bell: { padding: spacing.sm, position: 'relative' },
  bellDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: lightColors.danger,
  },
  progressCard: {
    marginHorizontal: spacing.md,
    backgroundColor: lightColors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: lightColors.border,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
  },
  progressThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: lightColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  progressImage: { width: '100%', height: '100%' },
  lockIcon: { fontSize: 22 },
  progressBody: { flex: 1 },
  progressTitle: { ...typography.subtitle, color: lightColors.text, fontSize: 15 },
  progressBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: lightColors.border,
  },
  progressDotActive: { backgroundColor: lightColors.text },
  progressHint: { ...typography.caption, color: lightColors.textMuted, lineHeight: 18 },
  tabs: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: lightColors.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightColors.border,
  },
  tabBtn: { paddingBottom: spacing.sm },
  tabText: { ...typography.subtitle, color: lightColors.textMuted, fontSize: 16 },
  tabTextActive: { color: lightColors.text, fontWeight: '700' },
  tabUnderline: {
    height: 3,
    backgroundColor: lightColors.text,
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  loader: { marginTop: spacing.xl },
  list: { paddingBottom: spacing.xxl },
  diaryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightColors.border,
  },
  diaryDate: {
    width: 48,
    ...typography.caption,
    color: lightColors.textMuted,
    fontWeight: '600',
  },
  diaryContent: { flex: 1 },
  diaryTitle: { ...typography.subtitle, color: lightColors.text },
  diaryCaption: {
    ...typography.body,
    color: lightColors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  diaryImage: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: lightColors.surface,
  },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyTitle: { ...typography.subtitle, color: lightColors.text },
  emptyBody: { ...typography.body, color: lightColors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  insightsList: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  insightCard: {
    backgroundColor: lightColors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  insightCardTitle: { ...typography.subtitle, color: lightColors.text },
  insightCardMeta: { ...typography.caption, color: lightColors.textMuted, marginTop: 4 },
  tag: {
    ...typography.caption,
    color: lightColors.accent,
    marginTop: spacing.sm,
  },
});
