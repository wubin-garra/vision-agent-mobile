import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { lightColors, radius, spacing, typography } from '@/theme';
import type {
  FollowUpMetricSlider,
  FollowUpSection,
  StructuredFollowUpAnswer,
} from '@/types/insight';

type Props = {
  answer: StructuredFollowUpAnswer;
  onSelectQuestion?: (question: string) => void;
};

/** 饱腹感 / 热量密度等对比滑条 */
function MetricSliderRow({ slider }: { slider: FollowUpMetricSlider }) {
  const percent = Math.min(1, Math.max(0, slider.value)) * 100;

  return (
    <View style={styles.sliderBlock}>
      <Text style={styles.sliderLabel}>{slider.label}</Text>
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${percent}%` }]} />
        <View style={[styles.sliderDot, { left: `${percent}%` }]} />
      </View>
      <View style={styles.sliderEnds}>
        <Text style={styles.sliderEndText}>{slider.low_label}</Text>
        <Text style={styles.sliderEndText}>{slider.high_label}</Text>
      </View>
    </View>
  );
}

/** 绿圈优点 / 红圈隐患 图例 */
function AssessmentLegend() {
  return (
    <View style={styles.legendRow}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, styles.dotPositive]} />
        <Text style={styles.legendText}>优点</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, styles.dotWarning]} />
        <Text style={styles.legendText}>需注意</Text>
      </View>
    </View>
  );
}

/** 适配度评估卡片 */
function AssessmentCard({ section }: { section: FollowUpSection }) {
  if (!section.assessments.length) return null;

  return (
    <View style={styles.assessmentCard}>
      <AssessmentLegend />
      {section.assessments.map((item) => (
        <View key={`${item.tone}-${item.title}`} style={styles.assessmentRow}>
          <View
            style={[
              styles.assessmentDot,
              item.tone === 'positive' ? styles.dotPositive : styles.dotWarning,
            ]}
          />
          <View style={styles.assessmentText}>
            <Text style={styles.assessmentTitle}>{item.title}</Text>
            <Text style={styles.assessmentBody}>{item.body}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** 优化小窍门区块 */
function TipsBlock({ section }: { section: FollowUpSection }) {
  if (!section.tips.length) return null;

  const heading = section.tips_heading?.trim() || '优化小窍门';
  const lead =
    section.tips_lead?.trim() ||
    '如果你打算长期以此作为减脂餐，可以尝试微调：';

  return (
    <View style={styles.tipsBlock}>
      <Text style={styles.tipsHeading}>{heading}</Text>
      <Text style={styles.tipsLead}>{lead}</Text>
      {section.tips.map((tip) => (
        <View key={tip.label} style={styles.tipRow}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipLine}>
            <Text style={styles.tipLabel}>{tip.label}：</Text>
            {tip.body}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * 食识拍 Chance 风格追问回答。
 * 结构：品牌行 → 总结 → 分段正文 → 评估卡 → 优化建议 → 指标卡 → 备注 → 追问芯片
 */
export function FoodScanFollowUpAnswer({ answer, onSelectQuestion }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.agentTag}>与食识拍一起看见 ›</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summary}>{answer.summary}</Text>
      </View>

      {answer.sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.heading}</Text>
          {section.paragraphs.map((paragraph, index) => (
            <Text key={`${section.heading}-p-${index}`} style={styles.body}>
              {paragraph}
            </Text>
          ))}
          <AssessmentCard section={section} />
          <TipsBlock section={section} />
        </View>
      ))}

      {answer.metric_card ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{answer.metric_card.title}</Text>
          <View style={styles.metricCard}>
            {answer.metric_card.sliders.map((slider) => (
              <MetricSliderRow key={slider.label} slider={slider} />
            ))}
          </View>
          {answer.metric_card.note ? (
            <Text style={styles.metricNote}>{answer.metric_card.note}</Text>
          ) : null}
        </View>
      ) : null}

      {answer.remark ? (
        <View style={styles.remarkCard}>
          <Text style={styles.remarkLabel}>备注</Text>
          <Text style={styles.remarkBody}>{answer.remark}</Text>
        </View>
      ) : null}

      {answer.suggestion_groups.map((group) => (
        <View key={group.title} style={styles.suggestionGroup}>
          <Text style={styles.suggestionTitle}>{group.title}</Text>
          {group.questions.map((question) => (
            <TouchableOpacity
              key={question}
              activeOpacity={0.7}
              style={styles.suggestionRow}
              onPress={() => onSelectQuestion?.(question)}
            >
              <Text style={styles.suggestionText}>✦ {question}</Text>
              <Text style={styles.suggestionArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <Text style={styles.aiNote}>由 Vision Agent AI 生成，请验证重要信息。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  agentTag: {
    ...typography.caption,
    color: lightColors.textMuted,
    letterSpacing: 0.2,
  },
  summaryCard: {
    backgroundColor: lightColors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  summary: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 26,
    fontSize: 16,
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    ...typography.title,
    fontSize: 22,
    color: lightColors.text,
    marginBottom: spacing.xs,
  },
  body: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 26,
    marginBottom: spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightColors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  legendText: {
    ...typography.caption,
    color: lightColors.textMuted,
  },
  assessmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: lightColors.border,
    padding: spacing.md,
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  assessmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  assessmentDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    marginTop: 5,
  },
  dotPositive: {
    borderColor: '#34C759',
  },
  dotWarning: {
    borderColor: '#FF3B30',
  },
  assessmentText: { flex: 1, gap: 4 },
  assessmentTitle: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 16,
    lineHeight: 22,
  },
  assessmentBody: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 22,
    fontSize: 14,
  },
  tipsBlock: {
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: lightColors.border,
  },
  tipsHeading: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 17,
  },
  tipsLead: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 24,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  tipBullet: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 26,
    width: 12,
  },
  tipLine: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 26,
    flex: 1,
  },
  tipLabel: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 15,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: lightColors.border,
    padding: spacing.md,
    gap: spacing.lg,
  },
  sliderBlock: { gap: spacing.xs },
  sliderLabel: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 15,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: lightColors.surface,
    position: 'relative',
    marginVertical: spacing.sm,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  sliderDot: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: lightColors.accent,
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sliderEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderEndText: {
    ...typography.caption,
    color: lightColors.textMuted,
  },
  metricNote: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  remarkCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#F5E6B8',
    padding: spacing.md,
    gap: spacing.xs,
  },
  remarkLabel: {
    ...typography.label,
    color: '#9A7B2F',
    textTransform: 'none',
    letterSpacing: 0,
  },
  remarkBody: {
    ...typography.caption,
    color: '#6B5B2F',
    lineHeight: 20,
  },
  suggestionGroup: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  suggestionTitle: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 17,
    marginBottom: spacing.xs,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightColors.border,
  },
  suggestionText: {
    ...typography.body,
    color: lightColors.text,
    flex: 1,
    lineHeight: 24,
  },
  suggestionArrow: {
    ...typography.body,
    color: lightColors.textMuted,
    fontSize: 20,
  },
  aiNote: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
});
