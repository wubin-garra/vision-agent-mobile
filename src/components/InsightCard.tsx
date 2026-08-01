import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { colors, lightColors, radius, spacing, typography } from '@/theme';

interface InsightCardProps {
  title: string;
  category: string;
  confidence: number;
  children?: ReactNode;
  style?: ViewStyle;
  light?: boolean;
  /** 智能体主题：卡片渐变与置信度徽章色 */
  accent?: string;
  accentSoft?: string;
  gradientColors?: [string, string];
}

export function InsightCard({
  title,
  category,
  confidence,
  children,
  style,
  light = false,
  accent,
  accentSoft,
  gradientColors,
}: InsightCardProps) {
  const confidenceLabel =
    confidence >= 0.8 ? '高置信度' : confidence >= 0.5 ? '中等置信度' : '低置信度';

  return (
    <View
      style={[
        styles.card,
        light && styles.cardLight,
        !light && accentSoft
          ? { borderColor: accentSoft, backgroundColor: 'rgba(255,255,255,0.03)' }
          : null,
        style,
      ]}
    >
      {!light ? (
        <LinearGradient
          colors={gradientColors ?? ['rgba(124,108,255,0.12)', 'rgba(20,20,31,0)']}
          style={styles.gradient}
        />
      ) : null}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, light && styles.titleLight]}>{title}</Text>
          <Text style={[styles.category, light && styles.categoryLight]}>{category}</Text>
        </View>
        <View
          style={[
            styles.badge,
            light && styles.badgeLight,
            accentSoft ? { backgroundColor: accentSoft } : null,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              light && styles.badgeTextLight,
              accent ? { color: accent } : null,
            ]}
          >
            {confidenceLabel}
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function InsightSection({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function TagList({
  items,
  accent,
  accentSoft,
  textColor,
}: {
  items: string[];
  accent?: string;
  accentSoft?: string;
  textColor?: string;
}) {
  if (!items.length) return null;
  return (
    <View style={styles.tagRow}>
      {items.map((item) => (
        <View
          key={item}
          style={[
            styles.tag,
            accentSoft ? { backgroundColor: accentSoft, borderColor: accent ?? colors.border } : null,
          ]}
        >
          <Text
            style={[
              styles.tagText,
              textColor ? { color: textColor } : accent ? { color: accent } : null,
            ]}
          >
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function ChipRow({
  items,
  onPress,
  light = false,
  chipBg,
  chipText,
  theme,
}: {
  items: string[];
  onPress: (item: string) => void;
  light?: boolean;
  /** 主题追问 chip 背景（也可用 theme.chipBg） */
  chipBg?: string;
  /** 主题追问 chip 文字（也可用 theme.chipText） */
  chipText?: string;
  /** 传入 AgentTheme 时优先取 chip 色 */
  theme?: { chipBg: string; chipText: string };
}) {
  const resolvedChipBg = theme?.chipBg ?? chipBg;
  const resolvedChipText = theme?.chipText ?? chipText;
  return (
    <View style={styles.chipRow}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          activeOpacity={0.7}
          onPress={() => onPress(item)}
          style={[
            styles.chip,
            light && styles.chipLight,
            resolvedChipBg
              ? { backgroundColor: resolvedChipBg, borderWidth: 0 }
              : null,
          ]}
        >
          <Text
            style={[
              styles.chipText,
              light && styles.chipTextLight,
              resolvedChipText ? { color: resolvedChipText } : null,
            ]}
          >
            ✦ {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: lightColors.border,
  },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  titleLight: { color: lightColors.text },
  category: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  categoryLight: { color: lightColors.textMuted },
  badge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  badgeLight: {
    backgroundColor: lightColors.surface,
  },
  badgeText: {
    ...typography.label,
    color: colors.accent,
  },
  badgeTextLight: { color: lightColors.textMuted },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    ...typography.caption,
    color: colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  chipText: {
    ...typography.caption,
    color: colors.accent,
  },
  chipLight: {
    backgroundColor: lightColors.surface,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  chipTextLight: {
    color: lightColors.text,
  },
});
