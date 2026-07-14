import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ChipRow } from '@/components/InsightCard';
import { NutritionRing } from '@/components/NutritionRing';
import { lightColors, radius, spacing, typography } from '@/theme';
import type { StructuredInsight } from '@/types/insight';

type Props = {
  insight: StructuredInsight;
  onSelectQuestion: (question: string) => void;
  onScrollToBottom?: () => void;
};

export function FoodScanInsightSections({
  insight,
  onSelectQuestion,
  onScrollToBottom,
}: Props) {
  const nutrition = insight.nutrition;
  const chips = insight.explore_chips?.culinary ?? [];

  return (
    <View style={styles.wrap}>
      {nutrition ? (
        <View style={styles.nutritionBlock}>
          <View style={styles.calorieWrap}>
            <NutritionRing
              large
              current={nutrition.calories_current}
              goal={nutrition.calories_goal}
              unit="kcal"
              label="热量"
              emoji="🔥"
              color="#111111"
            />
            {onScrollToBottom ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onScrollToBottom}
                style={styles.scrollFab}
                accessibilityLabel="滚动到底部"
                accessibilityRole="button"
              >
                <Text style={styles.scrollFabIcon}>⌄</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.macroRow}>
            <NutritionRing
              current={nutrition.carbs.current}
              goal={nutrition.carbs.goal}
              unit={nutrition.carbs.unit ?? 'g'}
              label="碳水"
              emoji={nutrition.carbs.emoji ?? '🍚'}
              color="#F5C542"
            />
            <NutritionRing
              current={nutrition.fat.current}
              goal={nutrition.fat.goal}
              unit={nutrition.fat.unit ?? 'g'}
              label="脂肪"
              emoji={nutrition.fat.emoji ?? '🥑'}
              color="#4A9FE8"
            />
            <NutritionRing
              current={nutrition.protein.current}
              goal={nutrition.protein.goal}
              unit={nutrition.protein.unit ?? 'g'}
              label="蛋白质"
              emoji={nutrition.protein.emoji ?? '🍤'}
              color="#2BB8A8"
            />
          </View>
        </View>
      ) : null}

      {insight.diet_summary ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>饮食记录</Text>
          <Text style={styles.body}>{insight.diet_summary}</Text>
        </View>
      ) : null}

      {insight.nutrition_tips && insight.nutrition_tips.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>小贴士</Text>
          {insight.nutrition_tips.map((tip) => (
            <View key={tip.title} style={styles.tipItem}>
              <Text style={styles.tipTitle}>• {tip.title}</Text>
              <Text style={styles.tipBody}>{tip.body}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {insight.allergens && insight.allergens.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>安全与过敏原</Text>
          <View style={styles.allergenCard}>
            {insight.allergens.map((item) => (
              <View key={`${item.category}-${item.detail}`} style={styles.allergenRow}>
                <Text style={styles.allergenLeft}>
                  {item.emoji ? `${item.emoji} ` : ''}
                  {item.category}
                </Text>
                <Text style={styles.allergenRight}>{item.detail}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {chips.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>想了解更多吗？</Text>
          <ChipRow items={chips} onPress={onSelectQuestion} light />
          <Text style={styles.aiNote}>由 Vision Agent AI 生成，请验证重要信息。</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  nutritionBlock: { gap: 0 },
  calorieWrap: {
    position: 'relative',
    zIndex: 2,
    marginBottom: spacing.lg,
  },
  scrollFab: {
    position: 'absolute',
    bottom: -20,
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  scrollFabIcon: {
    fontSize: 18,
    lineHeight: 20,
    color: lightColors.textMuted,
    marginTop: -2,
    fontWeight: '600',
  },
  macroRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'stretch',
    marginTop: spacing.xs,
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    ...typography.title,
    fontSize: 22,
    color: lightColors.text,
  },
  body: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 24,
  },
  tipItem: { gap: 4, marginBottom: spacing.sm },
  tipTitle: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 16,
  },
  tipBody: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 22,
    paddingLeft: spacing.md,
  },
  allergenCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: lightColors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  allergenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  allergenLeft: {
    ...typography.subtitle,
    color: lightColors.text,
    flex: 1,
  },
  allergenRight: {
    ...typography.caption,
    color: lightColors.textMuted,
    flex: 1,
    textAlign: 'right',
  },
  aiNote: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: spacing.xs,
  },
});
