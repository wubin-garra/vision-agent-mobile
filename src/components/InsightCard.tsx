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
}

export function InsightCard({
  title,
  category,
  confidence,
  children,
  style,
  light = false,
}: InsightCardProps) {
  const confidenceLabel =
    confidence >= 0.8 ? '高置信度' : confidence >= 0.5 ? '中等置信度' : '低置信度';

  return (
    <View style={[styles.card, light && styles.cardLight, style]}>
      {!light ? (
        <LinearGradient
          colors={['rgba(124,108,255,0.12)', 'rgba(20,20,31,0)']}
          style={styles.gradient}
        />
      ) : null}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, light && styles.titleLight]}>{title}</Text>
          <Text style={[styles.category, light && styles.categoryLight]}>{category}</Text>
        </View>
        <View style={[styles.badge, light && styles.badgeLight]}>
          <Text style={[styles.badgeText, light && styles.badgeTextLight]}>{confidenceLabel}</Text>
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

export function TagList({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.tagRow}>
      {items.map((item) => (
        <View key={item} style={styles.tag}>
          <Text style={styles.tagText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function ChipRow({
  items,
  onPress,
  light = false,
}: {
  items: string[];
  onPress: (item: string) => void;
  light?: boolean;
}) {
  return (
    <View style={styles.chipRow}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          activeOpacity={0.7}
          onPress={() => onPress(item)}
          style={[styles.chip, light && styles.chipLight]}
        >
          <Text style={[styles.chipText, light && styles.chipTextLight]}>✦ {item}</Text>
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
