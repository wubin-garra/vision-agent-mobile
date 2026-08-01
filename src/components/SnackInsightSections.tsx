import { StyleSheet, Text, View } from 'react-native';

import { ChipRow, InsightSection, TagList } from '@/components/InsightCard';
import { colors, radius, spacing, typography } from '@/theme';
import type { StructuredInsight } from '@/types/insight';

interface Props {
  insight: StructuredInsight;
  /** 点击追问 chip 时回填输入框 */
  onSelectQuestion: (question: string) => void;
}

/**
 * 零食分析（food_explorer）洞察区块。
 * 核心数据：snack_analysis（档案）+ flavor_notes（风味）+ allergens（过敏原）。
 * agent_id 仍为 food_explorer，与历史记忆兼容。
 */
export function SnackInsightSections({ insight, onSelectQuestion }: Props) {
  const snack = insight.snack_analysis;
  const exploreChips = insight.explore_chips;
  const allergens = insight.allergens ?? [];

  return (
    <>
      {insight.subtitle ? <Text style={styles.subtitle}>{insight.subtitle}</Text> : null}

      {insight.narrative ? (
        <View style={styles.narrativeBlock}>
          <Text style={styles.narrative}>{insight.narrative}</Text>
        </View>
      ) : null}

      {/* 结构化档案：品牌 / 品类 / 热量等一行一项 */}
      {snack ? (
        <InsightSection title="零食档案">
          <View style={styles.metaGrid}>
            {snack.brand ? (
              <MetaRow label="品牌" value={snack.brand} />
            ) : null}
            {snack.product_name ? (
              <MetaRow label="产品" value={snack.product_name} />
            ) : null}
            {snack.snack_type ? (
              <MetaRow label="品类" value={snack.snack_type} />
            ) : null}
            {snack.calories_estimate ? (
              <MetaRow label="热量" value={snack.calories_estimate} />
            ) : null}
          </View>
          {snack.taste_tags && snack.taste_tags.length > 0 ? (
            <View style={styles.tagBlock}>
              <Text style={styles.metaLabel}>口味标签</Text>
              <TagList items={snack.taste_tags} />
            </View>
          ) : null}
          {snack.ingredients_highlight && snack.ingredients_highlight.length > 0 ? (
            <View style={styles.tagBlock}>
              <Text style={styles.metaLabel}>配料亮点</Text>
              <TagList items={snack.ingredients_highlight} />
            </View>
          ) : null}
          {snack.serving_tip ? (
            <Text style={styles.servingTip}>💡 {snack.serving_tip}</Text>
          ) : null}
        </InsightSection>
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

      {/* allergens 与食识拍共用字段；零食侧重包装可见/可推断的过敏原 */}
      {allergens.length > 0 ? (
        <InsightSection title="过敏原提示">
          {allergens.map((item) => (
            <Text key={`${item.category}-${item.detail}`} style={styles.tipLine}>
              {item.emoji ?? '⚠️'} {item.category}
              {item.detail ? ` — ${item.detail}` : ''}
            </Text>
          ))}
        </InsightSection>
      ) : null}

      {snack?.caution_notes && snack.caution_notes.length > 0 ? (
        <InsightSection title="食用注意">
          {snack.caution_notes.map((note) => (
            <Text key={note} style={styles.tipLine}>
              • {note}
            </Text>
          ))}
        </InsightSection>
      ) : null}

      {insight.context.practical ? (
        <InsightSection title="食用提示">
          <Text style={styles.bodyText}>{insight.context.practical}</Text>
        </InsightSection>
      ) : null}

      {insight.context.cultural ? (
        <InsightSection title="零食文化">
          <Text style={styles.bodyText}>{insight.context.cultural}</Text>
        </InsightSection>
      ) : null}

      {insight.nearby_picks && insight.nearby_picks.length > 0 ? (
        <InsightSection title="附近购买">
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

      {exploreChips &&
      (exploreChips.culinary.length > 0 || exploreChips.nearby.length > 0) ? (
        <View style={styles.exploreBlock}>
          {exploreChips.culinary.length > 0 ? (
            <View style={styles.exploreGroup}>
              <Text style={styles.exploreTitle}>继续拆零食</Text>
              <ChipRow items={exploreChips.culinary} onPress={onSelectQuestion} />
            </View>
          ) : null}
          {exploreChips.nearby.length > 0 ? (
            <View style={styles.exploreGroup}>
              <Text style={styles.exploreTitle}>附近购买</Text>
              <ChipRow items={exploreChips.nearby} onPress={onSelectQuestion} />
            </View>
          ) : null}
        </View>
      ) : null}
    </>
  );
}

/** 档案区键值行：左 label、右 value */
function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
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
  metaGrid: { gap: spacing.sm },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metaLabel: {
    ...typography.label,
    color: colors.textMuted,
    minWidth: 56,
  },
  metaValue: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  tagBlock: { marginTop: spacing.md, gap: spacing.xs },
  servingTip: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 20,
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
  tipLine: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 4,
  },
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
