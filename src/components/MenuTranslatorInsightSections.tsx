import { StyleSheet, Text, View } from 'react-native';

import { ChipRow, InsightSection } from '@/components/InsightCard';
import type { AgentTheme } from '@/constants/agentThemes';
import { colors, radius, spacing, typography } from '@/theme';
import type { StructuredInsight } from '@/types/insight';

interface Props {
  insight: StructuredInsight;
  /** 点击追问 chip 时回填输入框 */
  onSelectQuestion: (question: string) => void;
  /** 智能体主题（颜色统一从 agentThemes 来） */
  theme: AgentTheme;
}

/**
 * 翻译师（menu_translator）洞察区块。
 * 核心数据在 insight.menu_translation：dishes 原文/译文对照 + ordering_tips。
 * 若无 dishes，InsightScreen 会回退到通用线索列表。
 */
export function MenuTranslatorInsightSections({
  insight,
  onSelectQuestion,
  theme,
}: Props) {
  const menu = insight.menu_translation;
  const dishes = menu?.dishes ?? [];
  const tips = menu?.ordering_tips ?? [];
  const exploreChips = insight.explore_chips;
  const {
    accent,
    accentSoft,
    text: textColor,
    textMuted,
    chipBg,
    chipText,
    surface,
    border,
  } = theme;

  return (
    <>
      {/* subtitle 一般为「源语言 → 目标语言」 */}
      {insight.subtitle ? (
        <Text style={[styles.subtitle, textMuted ? { color: textMuted } : null]}>
          {insight.subtitle}
        </Text>
      ) : null}

      {insight.narrative ? (
        <View
          style={[
            styles.narrativeBlock,
            accent ? { borderLeftColor: accent } : null,
            surface ? { backgroundColor: surface } : null,
          ]}
        >
          <Text style={[styles.narrative, textColor ? { color: textColor } : null]}>
            {insight.narrative}
          </Text>
        </View>
      ) : null}

      {/* 主内容：逐条菜品对照（原文弱化、译文突出） */}
      {dishes.length > 0 ? (
        <InsightSection title="菜单对照">
          <View style={styles.dishList}>
            {dishes.map((dish, index) => (
              <View
                key={`${dish.original}-${dish.translation}-${index}`}
                style={[
                  styles.dishCard,
                  surface ? { backgroundColor: surface } : null,
                  border ? { borderColor: border } : null,
                ]}
              >
                <View style={styles.dishHeader}>
                  <Text style={[styles.dishOriginal, textMuted ? { color: textMuted } : null]}>
                    {dish.original}
                  </Text>
                  {dish.price ? (
                    <Text style={[styles.dishPrice, accent ? { color: accent } : null]}>
                      {dish.price}
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={[styles.dishTranslation, textColor ? { color: textColor } : null]}
                >
                  {dish.translation}
                </Text>
                {dish.notes ? (
                  <Text style={[styles.dishNotes, textMuted ? { color: textMuted } : null]}>
                    {dish.notes}
                  </Text>
                ) : null}
                {dish.tags && dish.tags.length > 0 ? (
                  <View style={styles.tagRow}>
                    {dish.tags.map((tag) => (
                      <View
                        key={tag}
                        style={[
                          styles.tag,
                          accentSoft ? { backgroundColor: accentSoft } : null,
                        ]}
                      >
                        <Text style={[styles.tagText, accent ? { color: accent } : null]}>
                          {tag}
                        </Text>
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
          <Text style={[styles.bodyText, textColor ? { color: textColor } : null]}>
            {menu.dietary_summary}
          </Text>
        </InsightSection>
      ) : null}

      {tips.length > 0 ? (
        <InsightSection title="点餐提示">
          {tips.map((tip) => (
            <Text key={tip} style={[styles.tipLine, textColor ? { color: textColor } : null]}>
              • {tip}
            </Text>
          ))}
        </InsightSection>
      ) : null}

      {/* 有结构化 tips 时不再重复展示 context.practical，避免文案重复 */}
      {insight.context.practical && !tips.length ? (
        <InsightSection title="实用建议">
          <Text style={[styles.bodyText, textColor ? { color: textColor } : null]}>
            {insight.context.practical}
          </Text>
        </InsightSection>
      ) : null}

      {insight.context.cultural ? (
        <InsightSection title="文化小注">
          <Text style={[styles.bodyText, textColor ? { color: textColor } : null]}>
            {insight.context.cultural}
          </Text>
        </InsightSection>
      ) : null}

      {/* 分组 chips 存在时，InsightScreen 会隐藏底部扁平「继续探索」 */}
      {exploreChips &&
      (exploreChips.culinary.length > 0 || exploreChips.nearby.length > 0) ? (
        <View style={styles.exploreBlock}>
          {exploreChips.culinary.length > 0 ? (
            <View style={styles.exploreGroup}>
              <Text style={[styles.exploreTitle, textMuted ? { color: textMuted } : null]}>
                继续点餐
              </Text>
              <ChipRow
                items={exploreChips.culinary}
                onPress={onSelectQuestion}
                chipBg={chipBg}
                chipText={chipText}
              />
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
