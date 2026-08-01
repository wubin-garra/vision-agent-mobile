import { StyleSheet, Text, View } from 'react-native';

import { ChipRow, InsightSection } from '@/components/InsightCard';
import { colors, radius, spacing, typography } from '@/theme';
import type { StructuredInsight } from '@/types/insight';

interface Props {
  insight: StructuredInsight;
  onSelectQuestion: (question: string) => void;
}

/** 翻译师：原文/译文对照表 + 点餐提示 */
export function MenuTranslatorInsightSections({ insight, onSelectQuestion }: Props) {
  const menu = insight.menu_translation;
  const dishes = menu?.dishes ?? [];
  const tips = menu?.ordering_tips ?? [];
  const exploreChips = insight.explore_chips;

  return (
    <>
      {insight.subtitle ? <Text style={styles.subtitle}>{insight.subtitle}</Text> : null}

      {insight.narrative ? (
        <View style={styles.narrativeBlock}>
          <Text style={styles.narrative}>{insight.narrative}</Text>
        </View>
      ) : null}

      {dishes.length > 0 ? (
        <InsightSection title="菜单对照">
          <View style={styles.dishList}>
            {dishes.map((dish, index) => (
              <View
                key={`${dish.original}-${dish.translation}-${index}`}
                style={styles.dishCard}
              >
                <View style={styles.dishHeader}>
                  <Text style={styles.dishOriginal}>{dish.original}</Text>
                  {dish.price ? <Text style={styles.dishPrice}>{dish.price}</Text> : null}
                </View>
                <Text style={styles.dishTranslation}>{dish.translation}</Text>
                {dish.notes ? <Text style={styles.dishNotes}>{dish.notes}</Text> : null}
                {dish.tags && dish.tags.length > 0 ? (
                  <View style={styles.tagRow}>
                    {dish.tags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </InsightSection>
      ) : null}

      {menu?.dietary_summary ? (
        <InsightSection title="忌口总览">
          <Text style={styles.bodyText}>{menu.dietary_summary}</Text>
        </InsightSection>
      ) : null}

      {tips.length > 0 ? (
        <InsightSection title="点餐提示">
          {tips.map((tip) => (
            <Text key={tip} style={styles.tipLine}>
              • {tip}
            </Text>
          ))}
        </InsightSection>
      ) : null}

      {insight.context.practical && !tips.length ? (
        <InsightSection title="实用建议">
          <Text style={styles.bodyText}>{insight.context.practical}</Text>
        </InsightSection>
      ) : null}

      {insight.context.cultural ? (
        <InsightSection title="文化小注">
          <Text style={styles.bodyText}>{insight.context.cultural}</Text>
        </InsightSection>
      ) : null}

      {exploreChips &&
      (exploreChips.culinary.length > 0 || exploreChips.nearby.length > 0) ? (
        <View style={styles.exploreBlock}>
          {exploreChips.culinary.length > 0 ? (
            <View style={styles.exploreGroup}>
              <Text style={styles.exploreTitle}>继续点餐</Text>
              <ChipRow items={exploreChips.culinary} onPress={onSelectQuestion} />
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
  dishList: { gap: spacing.sm },
  dishCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  dishOriginal: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  dishPrice: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  dishTranslation: {
    ...typography.subtitle,
    color: colors.text,
    marginTop: 4,
  },
  dishNotes: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
  },
  tagText: {
    ...typography.caption,
    color: colors.accent,
    fontSize: 11,
  },
  bodyText: { ...typography.body, color: colors.text, lineHeight: 24 },
  tipLine: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 4,
  },
  exploreBlock: { marginTop: spacing.lg, gap: spacing.lg },
  exploreGroup: { gap: spacing.xs },
  exploreTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
});
