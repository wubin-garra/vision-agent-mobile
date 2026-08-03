import { StyleSheet, Text, View } from 'react-native';

import { ChipRow } from '@/components/InsightCard';
import type { AgentTheme } from '@/constants/agentThemes';
import { lightColors, radius, spacing, typography } from '@/theme';
import type { StructuredInsight } from '@/types/insight';

interface Props {
  insight: StructuredInsight;
  onSelectQuestion: (question: string) => void;
  theme: AgentTheme;
}

/**
 * 零食分析专属阅读区：暖杏浅色、包装速读卡，突出热量 / 口味 / 过敏提示。
 */
export function SnackInsightSections({ insight, onSelectQuestion, theme }: Props) {
  const snack = insight.snack_analysis;
  const allergens = insight.allergens ?? [];
  const flavorNotes = insight.flavor_notes ?? [];
  const cautionNotes = snack?.caution_notes ?? [];
  const tasteTags = snack?.taste_tags ?? [];
  const ingredients = snack?.ingredients_highlight ?? [];
  const culinaryChips = insight.explore_chips?.culinary ?? [];
  const nearbyChips = insight.explore_chips?.nearby ?? [];
  const { accent, chipBg, chipText } = theme;

  const productName = snack?.product_name || insight.title;
  const brand = snack?.brand;

  return (
    <View style={styles.wrap}>
      {/* 产品身份卡 */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>零食速读</Text>
          </View>
          {snack?.snack_type ? (
            <Text style={styles.typeHint}>{snack.snack_type}</Text>
          ) : null}
        </View>

        {brand ? <Text style={[styles.brand, { color: accent }]}>{brand}</Text> : null}
        <Text style={styles.productName}>{productName}</Text>
        {insight.subtitle ? <Text style={styles.subtitle}>{insight.subtitle}</Text> : null}
        {insight.narrative ? <Text style={styles.summary}>{insight.narrative}</Text> : null}

        {snack?.calories_estimate ? (
          <View style={[styles.calorieBanner, { backgroundColor: accent }]}>
            <Text style={styles.calorieLabel}>热量估算</Text>
            <Text style={styles.calorieValue}>{snack.calories_estimate}</Text>
          </View>
        ) : null}

        {tasteTags.length > 0 ? (
          <View style={styles.chipWrap}>
            {tasteTags.map((tag) => (
              <View key={tag} style={[styles.tasteChip, { borderColor: `${accent}55` }]}>
                <Text style={[styles.tasteChipText, { color: accent }]}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {/* 配料亮点 */}
      {ingredients.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>配料亮点</Text>
          <View style={styles.ingredientGrid}>
            {ingredients.map((item) => (
              <View key={item} style={styles.ingredientCard}>
                <Text style={styles.ingredientText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* 风味 */}
      {flavorNotes.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>风味解构</Text>
          <View style={styles.flavorList}>
            {flavorNotes.map((note) => (
              <View key={`${note.label}-${note.value}`} style={styles.flavorCard}>
                <View style={[styles.flavorIconWrap, { backgroundColor: `${accent}22` }]}>
                  <Text style={styles.flavorEmoji}>{note.emoji ?? '✦'}</Text>
                </View>
                <View style={styles.flavorText}>
                  <Text style={styles.flavorLabel}>{note.label}</Text>
                  <Text style={styles.flavorValue}>{note.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* 食用提示 */}
      {snack?.serving_tip || insight.context.practical ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>怎么吃更合适</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipBody}>
              {snack?.serving_tip || insight.context.practical}
            </Text>
          </View>
        </View>
      ) : null}

      {/* 过敏原 */}
      {allergens.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>过敏原提示</Text>
          <View style={styles.allergenStack}>
            {allergens.map((item) => (
              <View key={`${item.category}-${item.detail}`} style={styles.allergenRow}>
                <Text style={styles.allergenEmoji}>{item.emoji ?? '⚠️'}</Text>
                <View style={styles.allergenText}>
                  <Text style={styles.allergenCategory}>{item.category}</Text>
                  {item.detail ? <Text style={styles.allergenDetail}>{item.detail}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* 注意 */}
      {cautionNotes.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>食用注意</Text>
          <View style={styles.warnCard}>
            {cautionNotes.map((note) => (
              <View key={note} style={styles.warnRow}>
                <Text style={styles.warnMark}>!</Text>
                <Text style={styles.warnBody}>{note}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {insight.context.cultural ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>零食文化</Text>
          <Text style={styles.lead}>{insight.context.cultural}</Text>
        </View>
      ) : null}

      {insight.nearby_picks && insight.nearby_picks.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>附近购买</Text>
          {insight.nearby_picks.map((pick) => (
            <View key={pick.name} style={styles.nearbyCard}>
              <Text style={styles.nearbyName}>📍 {pick.name}</Text>
              {pick.blurb ? <Text style={styles.nearbyBlurb}>{pick.blurb}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}

      {culinaryChips.length > 0 || nearbyChips.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>想了解更多吗？</Text>
          {culinaryChips.length > 0 ? (
            <ChipRow
              items={culinaryChips}
              onPress={onSelectQuestion}
              light
              chipBg={chipBg}
              chipText={chipText}
            />
          ) : null}
          {nearbyChips.length > 0 ? (
            <View style={{ marginTop: spacing.sm }}>
              <ChipRow
                items={nearbyChips}
                onPress={onSelectQuestion}
                light
                chipBg={chipBg}
                chipText={chipText}
              />
            </View>
          ) : null}
          <Text style={styles.aiNote}>由 Vision Agent AI 生成，配料与过敏信息请以包装原文为准。</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(212,137,58,0.16)',
    gap: spacing.sm,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  typeHint: {
    ...typography.caption,
    color: lightColors.textMuted,
    fontWeight: '600',
  },
  brand: {
    ...typography.subtitle,
    fontSize: 15,
  },
  productName: {
    ...typography.title,
    fontSize: 26,
    lineHeight: 32,
    color: lightColors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 22,
  },
  summary: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 22,
  },
  calorieBanner: {
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  calorieLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
  },
  calorieValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.xs,
  },
  tasteChip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(212,137,58,0.08)',
  },
  tasteChipText: {
    ...typography.caption,
    fontWeight: '700',
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    ...typography.title,
    fontSize: 22,
    color: lightColors.text,
    letterSpacing: -0.3,
  },
  lead: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 24,
  },
  ingredientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  ingredientText: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 14,
  },
  flavorList: { gap: spacing.sm },
  flavorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  flavorIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flavorEmoji: { fontSize: 18 },
  flavorText: { flex: 1, gap: 2 },
  flavorLabel: {
    ...typography.caption,
    color: lightColors.textMuted,
    fontWeight: '700',
  },
  flavorValue: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 22,
  },
  tipCard: {
    backgroundColor: '#FFF7EC',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(212,137,58,0.22)',
  },
  tipBody: {
    ...typography.body,
    color: '#5C4A2E',
    lineHeight: 22,
  },
  allergenStack: { gap: spacing.sm },
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#FFF7F6',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(232,107,74,0.2)',
  },
  allergenEmoji: { fontSize: 18, marginTop: 1 },
  allergenText: { flex: 1, gap: 2 },
  allergenCategory: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 15,
  },
  allergenDetail: {
    ...typography.caption,
    color: lightColors.textMuted,
    lineHeight: 18,
  },
  warnCard: {
    backgroundColor: '#FFF9EF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(232,160,75,0.35)',
    gap: spacing.sm,
  },
  warnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  warnMark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 12,
    fontWeight: '800',
    color: '#B86B12',
    backgroundColor: 'rgba(232,160,75,0.28)',
  },
  warnBody: {
    ...typography.body,
    color: '#5C4A2E',
    lineHeight: 22,
    flex: 1,
  },
  nearbyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: lightColors.border,
    gap: 4,
    marginBottom: spacing.xs,
  },
  nearbyName: {
    ...typography.subtitle,
    color: lightColors.text,
  },
  nearbyBlurb: {
    ...typography.caption,
    color: lightColors.textMuted,
    lineHeight: 18,
  },
  aiNote: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: spacing.xs,
  },
});
