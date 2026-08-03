import { StyleSheet, Text, View } from 'react-native';

import { ChipRow } from '@/components/InsightCard';
import type { AgentTheme } from '@/constants/agentThemes';
import { lightColors, radius, spacing, typography } from '@/theme';
import type { MenuDish, StructuredInsight } from '@/types/insight';

interface Props {
  insight: StructuredInsight;
  onSelectQuestion: (question: string) => void;
  theme: AgentTheme;
}

function DishRow({
  dish,
  index,
  accent,
}: {
  dish: MenuDish;
  index: number;
  accent: string;
}) {
  const tags = dish.tags?.filter(Boolean) ?? [];

  return (
    <View style={styles.dishCard}>
      <View style={styles.dishTop}>
        <View style={[styles.dishIndex, { backgroundColor: `${accent}18` }]}>
          <Text style={[styles.dishIndexText, { color: accent }]}>{index + 1}</Text>
        </View>
        <View style={styles.dishMain}>
          <View style={styles.dishHeader}>
            <Text style={styles.dishOriginal} numberOfLines={3}>
              {dish.original}
            </Text>
            {dish.price ? (
              <Text style={[styles.dishPrice, { color: accent }]}>{dish.price}</Text>
            ) : null}
          </View>

          <View style={styles.arrowRow}>
            <View style={[styles.arrowStem, { backgroundColor: `${accent}35` }]} />
            <Text style={[styles.arrowMark, { color: accent }]}>↓</Text>
          </View>

          <Text style={styles.dishTranslation}>{dish.translation}</Text>

          {dish.notes ? <Text style={styles.dishNotes}>{dish.notes}</Text> : null}

          {tags.length > 0 ? (
            <View style={styles.tagRow}>
              {tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: `${accent}14`, borderColor: `${accent}40` }]}
                >
                  <Text style={[styles.tagText, { color: accent }]}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/**
 * 翻译师专属阅读区：薄荷绿浅色、双语对照卡，突出原文→译文。
 */
export function MenuTranslatorInsightSections({
  insight,
  onSelectQuestion,
  theme,
}: Props) {
  const menu = insight.menu_translation;
  const dishes = menu?.dishes ?? [];
  const tips = menu?.ordering_tips?.filter(Boolean) ?? [];
  const culinaryChips = insight.explore_chips?.culinary ?? [];
  const nearbyChips = insight.explore_chips?.nearby ?? [];
  const { accent, chipBg, chipText } = theme;

  const source = menu?.source_language?.trim();
  const target = menu?.target_language?.trim();
  const langPair =
    source && target ? `${source} → ${target}` : insight.subtitle?.trim() || null;

  return (
    <View style={styles.wrap}>
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>菜单对照</Text>
          </View>
          {dishes.length > 0 ? (
            <Text style={styles.langHint}>共 {dishes.length} 条</Text>
          ) : null}
        </View>

        <Text style={styles.title}>{insight.title}</Text>
        {insight.narrative ? <Text style={styles.summary}>{insight.narrative}</Text> : null}

        {langPair ? (
          <View style={[styles.langBanner, { backgroundColor: accent }]}>
            <Text style={styles.langBannerLabel}>语言方向</Text>
            <Text style={styles.langBannerValue}>{langPair}</Text>
          </View>
        ) : null}
      </View>

      {dishes.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>逐条对照</Text>
          <Text style={styles.sectionLead}>原文在上，译文在下；价格与忌口标签旁注。</Text>
          <View style={styles.dishList}>
            {dishes.map((dish, index) => (
              <DishRow
                key={`${dish.original}-${dish.translation}-${index}`}
                dish={dish}
                index={index}
                accent={accent}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.bodyMuted}>暂无菜品对照，请对准菜单文字再拍一张。</Text>
        </View>
      )}

      {menu?.dietary_summary ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>忌口总览</Text>
          <View style={[styles.dietCard, { borderColor: `${accent}40` }]}>
            <View style={[styles.dietBar, { backgroundColor: accent }]} />
            <Text style={styles.dietBody}>{menu.dietary_summary}</Text>
          </View>
        </View>
      ) : null}

      {tips.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>点餐提示</Text>
          <View style={styles.tipStack}>
            {tips.map((tip, index) => (
              <View key={`${index}-${tip}`} style={styles.tipRow}>
                <View style={[styles.tipIndex, { backgroundColor: accent }]}>
                  <Text style={styles.tipIndexText}>{index + 1}</Text>
                </View>
                <Text style={styles.tipBody}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {insight.context.practical && tips.length === 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>实用建议</Text>
          <View style={styles.softCard}>
            <Text style={styles.softBody}>{insight.context.practical}</Text>
          </View>
        </View>
      ) : null}

      {insight.context.cultural ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>文化小注</Text>
          <Text style={styles.lead}>{insight.context.cultural}</Text>
        </View>
      ) : null}

      {insight.visible_clues.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>画面线索</Text>
          <View style={styles.clueWrap}>
            {insight.visible_clues.map((clue) => (
              <View key={clue} style={styles.clueChip}>
                <Text style={styles.clueText}>{clue}</Text>
              </View>
            ))}
          </View>
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
          <Text style={styles.aiNote}>由 Vision Agent AI 生成，翻译与忌口请以店家说明为准。</Text>
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
    borderColor: 'rgba(42,155,143,0.14)',
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
  langHint: {
    ...typography.caption,
    color: lightColors.textMuted,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  title: {
    ...typography.title,
    fontSize: 26,
    lineHeight: 32,
    color: lightColors.text,
    letterSpacing: -0.4,
  },
  summary: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 22,
  },
  langBanner: {
    marginTop: spacing.xs,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  langBannerLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
  },
  langBannerValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    ...typography.label,
    color: lightColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionLead: {
    ...typography.caption,
    color: lightColors.textMuted,
    lineHeight: 18,
    marginTop: -2,
  },
  dishList: { gap: spacing.sm },
  dishCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  dishTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  dishIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dishIndexText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dishMain: { flex: 1, gap: 4 },
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  dishOriginal: {
    ...typography.body,
    color: lightColors.textMuted,
    flex: 1,
    lineHeight: 22,
  },
  dishPrice: {
    ...typography.caption,
    fontWeight: '700',
    marginTop: 2,
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  arrowStem: {
    width: 18,
    height: 2,
    borderRadius: 1,
  },
  arrowMark: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  dishTranslation: {
    ...typography.subtitle,
    fontSize: 18,
    lineHeight: 24,
    color: lightColors.text,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  dishNotes: {
    ...typography.caption,
    color: lightColors.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.xs,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  tagText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  dietCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingLeft: spacing.md + 6,
    overflow: 'hidden',
  },
  dietBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  dietBody: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 24,
  },
  tipStack: { gap: spacing.sm },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  tipIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  tipIndexText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  tipBody: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 22,
    flex: 1,
  },
  softCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  softBody: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 24,
  },
  lead: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 24,
  },
  clueWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  clueChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  clueText: {
    ...typography.caption,
    color: lightColors.textMuted,
  },
  bodyMuted: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 22,
  },
  aiNote: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});
