import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useCreditsStore } from '@/store/credits';
import { useSessionStore } from '@/store/session';
import { colors, lightColors, radius, spacing, typography } from '@/theme';
import type { MainTabParamList, RootStackParamList } from '@/types/navigation';
import { getCreditsBalance } from '@/utils/credits';
import { hapticLight } from '@/utils/haptics';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  variant?: 'dark' | 'light';
};

export function CreditsBadge({ variant = 'dark' }: Props) {
  const navigation = useNavigation<Nav>();
  const { memories } = useSessionStore();
  const bonusPoints = useCreditsStore((state) => state.bonusPoints);
  const balance = getCreditsBalance(memories.length, bonusPoints);
  const isDark = variant === 'dark';

  return (
    <TouchableOpacity
      style={[styles.badge, isDark ? styles.badgeDark : styles.badgeLight]}
      onPress={() => {
        hapticLight();
        navigation.navigate('Points');
      }}
      activeOpacity={0.85}
    >
      <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>✦ {balance}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  badgeDark: {
    backgroundColor: colors.overlay,
  },
  badgeLight: {
    backgroundColor: lightColors.pill,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
  textDark: {
    color: colors.text,
  },
  textLight: {
    color: lightColors.text,
  },
});
