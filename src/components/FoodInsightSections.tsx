import { StyleSheet, Text, View } from 'react-native';

import { ChipRow, InsightSection } from '@/components/InsightCard';
import { colors, radius, spacing, typography } from '@/theme';
import type { StructuredInsight } from '@/types/insight';

interface FoodInsightSectionsProps {
  insight: StructuredInsight;
  onSelectQuestion: (question: string) => void;
}

export function FoodInsightSections({ insight, onSelectQuestion }: FoodInsightSectionsProps) {
  const exploreChips = insight.explore_chips;

  return (
    <>
      {insight.subtitle ? (
        <Text style={styles.subtitle}>{insight.subtitle}</Text>
      ) : null}

      {insight.narrative ? (
        <View style={styles.narrativeBlock}>
          <Text style={styles.narrative}>{insight.narrative}</Text>
        </View>
      ) : null}

      {insight.flavor_notes && insight.flavor_notes.length > 0 ? (
        <InsightSection title="风味解构">
          <View style={styles.flavorList}>
            {insight.flavor_notes.map((note) => (
              <View key={`${note.label}-${note.value}`} style={styles.flavorRow}>
                <Text style={styles.flavorEmoji}>{note.emoji ?? '•'}</Text>
                <View style={styles.flavorText}>
                  <Text style={styles.flavorLabel}>{note.label}</Text>
                  <Text style={styles.flavorValue}>{note.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </InsightSection>
      ) : null}

      {insight.context.cultural ? (
        <InsightSection title="文化风味">
          <Text style={styles.bodyText}>{insight.context.cultural}</Text>
        </InsightSection>
      ) : null}

      {insight.context.practical ? (
        <InsightSection title="料理细节">
          <Text style={styles.bodyText}>{insight.context.practical}</Text>
        </InsightSection>
      ) : null}

      {insight.nearby_picks && insight.nearby_picks.length > 0 ? (
        <InsightSection title="周边推荐">
          <View style={styles.nearbyList}>
            {insight.nearby_picks.map((pick) => (
              <View key={pick.name} style={styles.nearbyCard}>
                <Text style={styles.nearbyName}>📍 {pick.name}</Text>
                {pick.blurb ? <Text style={styles.nearbyBlurb}>{pick.blurb}</Text> : null}
              </View>
            ))}
          </View>
        </InsightSection>
      ) : null}

      {exploreChips && (exploreChips.culinary.length > 0 || exploreChips.nearby.length > 0) ? (
        <View style={styles.exploreBlock}>
          {exploreChips.culinary.length > 0 ? (
            <View style={styles.exploreGroup}>
              <Text style={styles.exploreTitle}>探索料理细节</Text>
              <ChipRow items={exploreChips.culinary} onPress={onSelectQuestion} />
            </View>
          ) : null}
          {exploreChips.nearby.length > 0 ? (
            <View style={styles.exploreGroup}>
              <Text style={styles.exploreTitle}>寻找更多美味</Text>
              <ChipRow items={exploreChips.nearby} onPress={onSelectQuestion} />
            </View>
          ) : null}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.subtitle,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 24,
  },
  narrativeBlock: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  narrative: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  flavorList: { gap: spacing.md },
  flavorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  flavorEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
  flavorText: { flex: 1 },
  flavorLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: 2,
  },
  flavorValue: {
    ...typography.body,
    color: colors.text,
  },
  bodyText: { ...typography.body, color: colors.text, lineHeight: 24 },
  nearbyList: { gap: spacing.sm },
  nearbyCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nearbyName: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  nearbyBlurb: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 20,
  },
  exploreBlock: { marginTop: spacing.lg, gap: spacing.lg },
  exploreGroup: { gap: spacing.xs },
  exploreTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
});
