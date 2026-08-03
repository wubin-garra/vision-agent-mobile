import { StyleSheet, Text, View } from 'react-native';

import { ChipRow } from '@/components/InsightCard';
import type { AgentTheme } from '@/constants/agentThemes';
import { lightColors, radius, spacing, typography } from '@/theme';
import type { StructuredInsight } from '@/types/insight';

type Props = {
  insight: StructuredInsight;
  onSelectQuestion: (question: string) => void;
  theme: AgentTheme;
};

const FALLBACK = {
  usage: '包装上未清晰显示功效/适应症，请对准说明书文字再拍一张',
  dosage: '包装上未清晰显示用法用量，请对准说明书「用法用量」栏再拍一张',
  adverse: '包装上未列出或未看清不良反应，请查阅说明书原文',
  insert: '说明书要点未完整识别，建议对准说明书内页或药盒侧面文字再拍一张',
  warnings: '请仔细阅读说明书，遵医嘱使用；不确定时咨询医师或药师',
};

/**
 * 药品说明专属阅读区：临床浅色、分卡阅读，强调功效 / 用法 / 不良反应。
 */
export function MedLabelInsightSections({ insight, onSelectQuestion, theme }: Props) {
  const reading = insight.med_label_reading;
  const { accent, chipBg, chipText } = theme;
  const chips = insight.explore_chips?.culinary ?? [];

  if (!reading) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.bodyMuted}>暂无药品结构化信息，请再拍一张药盒或说明书。</Text>
      </View>
    );
  }

  const dosageSteps = reading.dosage_steps?.filter(Boolean) ?? [];
  const adverse = reading.adverse_reactions?.filter(Boolean) ?? [];
  const warnings = reading.warnings?.filter(Boolean) ?? [];
  const ingredients = reading.active_ingredients?.filter(Boolean) ?? [];

  return (
    <View style={styles.wrap}>
      {/* 身份卡 */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>药盒速读</Text>
          </View>
          {reading.source_language ? (
            <Text style={styles.langHint}>{reading.source_language} · 包装识别</Text>
          ) : null}
        </View>
        <Text style={styles.drugName}>{reading.drug_name || insight.title}</Text>
        {reading.brand ? <Text style={styles.brand}>品牌 · {reading.brand}</Text> : null}
        {reading.translated_summary ? (
          <Text style={styles.summary}>{reading.translated_summary}</Text>
        ) : insight.narrative ? (
          <Text style={styles.summary}>{insight.narrative}</Text>
        ) : null}
        {ingredients.length > 0 ? (
          <View style={styles.chipWrap}>
            {ingredients.map((item) => (
              <View key={item} style={[styles.ingredientChip, { borderColor: `${accent}55` }]}>
                <Text style={[styles.ingredientText, { color: accent }]}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {reading.storage ? (
          <Text style={styles.storage}>储存 · {reading.storage}</Text>
        ) : null}
      </View>

      {/* 功效 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>功效 / 适应症</Text>
        <View style={[styles.efficacyCard, { borderColor: `${accent}40` }]}>
          <View style={[styles.efficacyBar, { backgroundColor: accent }]} />
          <Text style={styles.efficacyBody}>{reading.usage?.trim() || FALLBACK.usage}</Text>
        </View>
      </View>

      {/* 用法用量 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>用法用量</Text>
        {reading.dosage?.trim() ? <Text style={styles.lead}>{reading.dosage.trim()}</Text> : null}
        {dosageSteps.length > 0 ? (
          <View style={styles.steps}>
            {dosageSteps.map((step, index) => (
              <View key={`${index}-${step}`} style={styles.stepRow}>
                <View style={[styles.stepIndex, { backgroundColor: accent }]}>
                  <Text style={styles.stepIndexText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepBody}>{step}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {!reading.dosage?.trim() && dosageSteps.length === 0 ? (
          <Text style={styles.bodyMuted}>{FALLBACK.dosage}</Text>
        ) : null}
      </View>

      {/* 不良反应 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>不良反应</Text>
        {adverse.length > 0 ? (
          <View style={styles.listStack}>
            {adverse.map((item) => (
              <View key={item} style={styles.adverseRow}>
                <View style={styles.adverseDot} />
                <Text style={styles.listBody}>{item}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.bodyMuted}>{FALLBACK.adverse}</Text>
        )}
      </View>

      {/* 说明书要点 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>说明书要点</Text>
        <View style={styles.paperCard}>
          <Text style={styles.paperBody}>{reading.package_insert?.trim() || FALLBACK.insert}</Text>
        </View>
      </View>

      {/* 警示 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>警示与禁忌</Text>
        <View style={styles.warnCard}>
          {warnings.length > 0 ? (
            warnings.map((item) => (
              <View key={item} style={styles.warnRow}>
                <Text style={styles.warnMark}>!</Text>
                <Text style={styles.warnBody}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.warnBody}>{FALLBACK.warnings}</Text>
          )}
        </View>
      </View>

      {insight.context.practical ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>旅行携带提示</Text>
          <Text style={styles.lead}>{insight.context.practical}</Text>
        </View>
      ) : null}

      {chips.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>想了解更多吗？</Text>
          <ChipRow
            items={chips}
            onPress={onSelectQuestion}
            light
            chipBg={chipBg}
            chipText={chipText}
          />
          <Text style={styles.aiNote}>由 Vision Agent AI 生成，请对照说明书原文核实。</Text>
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
    borderColor: 'rgba(42,155,143,0.12)',
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
    letterSpacing: 0.2,
  },
  langHint: {
    ...typography.caption,
    color: lightColors.textMuted,
  },
  drugName: {
    ...typography.title,
    fontSize: 26,
    lineHeight: 32,
    color: lightColors.text,
    letterSpacing: -0.4,
  },
  brand: {
    ...typography.subtitle,
    color: '#2A9B8F',
    fontSize: 15,
  },
  summary: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 22,
    marginTop: 2,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.xs,
  },
  ingredientChip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(42,155,143,0.06)',
  },
  ingredientText: {
    ...typography.caption,
    fontWeight: '600',
  },
  storage: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: 2,
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
  bodyMuted: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 22,
  },
  efficacyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  efficacyBar: {
    width: 4,
  },
  efficacyBody: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 24,
    padding: spacing.md,
    flex: 1,
  },
  steps: { gap: spacing.sm },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  stepIndex: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepIndexText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  stepBody: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 22,
    flex: 1,
  },
  listStack: { gap: spacing.sm },
  adverseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#FFF7F6',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(240,113,120,0.18)',
  },
  adverseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F07178',
    marginTop: 7,
  },
  listBody: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 22,
    flex: 1,
  },
  paperCard: {
    backgroundColor: '#FBFFFE',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(42,155,143,0.16)',
  },
  paperBody: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 24,
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
  aiNote: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: spacing.xs,
  },
});
