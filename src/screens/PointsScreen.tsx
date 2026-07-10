import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CodeBoxes } from '@/components/points/CodeBoxes';
import {
  INVITE_COPY,
  POINTS_TABS,
  REDEEM_COPY,
  RULES_SECTIONS,
  type PointsTabId,
} from '@/constants/pointsContent';
import { useCreditsStore } from '@/store/credits';
import { useSessionStore } from '@/store/session';
import { lightColors, radius, spacing, typography } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';
import { getCreditsBalance } from '@/utils/credits';
import { hapticLight, hapticSelection } from '@/utils/haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'Points'>;

const TAB_CONTENT_MIN_HEIGHT = 420;

export function PointsScreen({ navigation, route }: Props) {
  const { width } = useWindowDimensions();
  const initialTab = route.params?.tab ?? 'invite';
  const [activeTab, setActiveTab] = useState<PointsTabId>(initialTab);
  const [redeemCode, setRedeemCode] = useState('');
  const { memories } = useSessionStore();
  const { inviteCode, welcomeRedeemed, bonusPoints, redeemInviteCode } = useCreditsStore();

  const balance = getCreditsBalance(memories.length, bonusPoints);
  const canRedeem = redeemCode.length === 6 && !welcomeRedeemed;

  const tabIndex = useMemo(
    () => Math.max(0, POINTS_TABS.findIndex((tab) => tab.id === activeTab)),
    [activeTab],
  );
  const indicatorWidth = width / POINTS_TABS.length;

  const switchTab = (tab: PointsTabId) => {
    hapticSelection();
    setActiveTab(tab);
  };

  const copyInviteCode = async () => {
    hapticLight();
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert('已复制', '邀请码已复制到剪贴板');
  };

  const shareInvite = async () => {
    hapticLight();
    try {
      await Share.share({
        message: `加入 Vision Agent，用我的邀请码 ${inviteCode} 注册，我们各得 20 积分！`,
      });
    } catch {
      // 用户取消分享
    }
  };

  const submitRedeem = () => {
    hapticLight();
    const result = redeemInviteCode(redeemCode);
    if (result.ok) {
      Alert.alert('兑换成功', result.message);
      setRedeemCode('');
    } else {
      Alert.alert('无法兑换', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            hapticLight();
            navigation.goBack();
          }}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>积分</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.hero}>
        <Text style={styles.stars}>✦   ✦</Text>
        <Text style={styles.balance}>{balance}</Text>
        <Text style={styles.balanceLabel}>你的积分</Text>
      </View>

      <View style={styles.tabBar}>
        {POINTS_TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <Pressable key={tab.id} style={styles.tabItem} onPress={() => switchTab(tab.id)}>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
        <View
          style={[
            styles.tabIndicator,
            {
              width: indicatorWidth,
              transform: [{ translateX: tabIndex * indicatorWidth }],
            },
          ]}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { minHeight: TAB_CONTENT_MIN_HEIGHT }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'invite' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{INVITE_COPY.title}</Text>
            <Text style={styles.panelSubtitle}>{INVITE_COPY.subtitle}</Text>
            <Text style={styles.panelDesc}>{INVITE_COPY.description}</Text>

            <View style={styles.codeWrap}>
              <CodeBoxes value={inviteCode} onChange={() => {}} editable={false} onCopy={copyInviteCode} />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={shareInvite}>
              <Text style={styles.primaryBtnText}>{INVITE_COPY.shareLabel}</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>{INVITE_COPY.contactsTitle}</Text>
            <View style={styles.contactRow}>
              <View style={styles.contactAvatars}>
                <Text style={styles.contactEmoji}>👥</Text>
              </View>
              <Text style={styles.contactHint}>{INVITE_COPY.contactsHint}</Text>
              <TouchableOpacity style={styles.allowBtn} onPress={() => hapticLight()}>
                <Text style={styles.allowBtnText}>{INVITE_COPY.contactsAllow}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {activeTab === 'redeem' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{REDEEM_COPY.title}</Text>
            <Text style={styles.panelDesc}>{REDEEM_COPY.description}</Text>

            <View style={styles.codeWrap}>
              <CodeBoxes value={redeemCode} onChange={setRedeemCode} />
            </View>

            {welcomeRedeemed ? (
              <Text style={styles.redeemedHint}>{REDEEM_COPY.redeemedHint}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryBtn, !canRedeem && styles.primaryBtnDisabled]}
              onPress={submitRedeem}
              disabled={!canRedeem}
            >
              <Text style={[styles.primaryBtnText, !canRedeem && styles.primaryBtnTextDisabled]}>
                {REDEEM_COPY.submit}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {activeTab === 'rules' ? (
          <View style={styles.panel}>
            {RULES_SECTIONS.map((section) => (
              <View key={section.title} style={styles.rulesSection}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.items.map((item) => (
                  <View key={item.title} style={styles.ruleCard}>
                    <View style={styles.ruleBody}>
                      <Text style={styles.ruleTitle}>{item.title}</Text>
                      <Text style={styles.ruleDesc}>{item.body}</Text>
                    </View>
                    {'action' in item && item.action ? (
                      <TouchableOpacity
                        style={styles.ruleAction}
                        onPress={() => {
                          hapticLight();
                          if (item.action === '邀请') switchTab('invite');
                        }}
                      >
                        <Text style={styles.ruleActionText}>{item.action}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: lightColors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lightColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    lineHeight: 30,
    color: lightColors.text,
    marginTop: -2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 17,
  },
  headerSpacer: { width: 36 },
  hero: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  stars: {
    fontSize: 28,
    color: '#B8B8C0',
    letterSpacing: 12,
    marginBottom: spacing.sm,
  },
  balance: {
    fontSize: 56,
    fontWeight: '700',
    color: lightColors.text,
    letterSpacing: -1,
  },
  balanceLabel: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightColors.border,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  tabLabel: {
    ...typography.subtitle,
    color: lightColors.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: lightColors.text,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: lightColors.text,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  panel: {
    alignItems: 'center',
  },
  panelTitle: {
    ...typography.title,
    color: lightColors.text,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  panelSubtitle: {
    ...typography.title,
    color: lightColors.text,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  panelDesc: {
    ...typography.body,
    color: lightColors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
    maxWidth: 320,
  },
  codeWrap: {
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: lightColors.text,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  primaryBtnDisabled: {
    backgroundColor: '#E5E5EA',
  },
  primaryBtnText: {
    ...typography.subtitle,
    color: '#FFFFFF',
    fontSize: 17,
  },
  primaryBtnTextDisabled: {
    color: '#AEAEB2',
  },
  redeemedHint: {
    ...typography.caption,
    color: lightColors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  sectionTitle: {
    alignSelf: 'stretch',
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  contactRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  contactAvatars: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lightColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactEmoji: { fontSize: 22 },
  contactHint: {
    flex: 1,
    ...typography.body,
    color: lightColors.text,
    fontSize: 15,
  },
  allowBtn: {
    backgroundColor: lightColors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  allowBtnText: {
    ...typography.caption,
    color: lightColors.text,
    fontWeight: '600',
  },
  rulesSection: {
    alignSelf: 'stretch',
    marginBottom: spacing.lg,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightColors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  ruleBody: { flex: 1 },
  ruleTitle: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 16,
    marginBottom: 4,
  },
  ruleDesc: {
    ...typography.caption,
    color: lightColors.textMuted,
    lineHeight: 18,
  },
  ruleAction: {
    backgroundColor: lightColors.text,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  ruleActionText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
