import { StyleSheet, Text, View } from 'react-native';

import { ChipRow } from '@/components/InsightCard';
import type { AgentTheme } from '@/constants/agentThemes';
import { lightColors, radius, spacing, typography } from '@/theme';
import type { FlightLeg, StructuredInsight } from '@/types/insight';

type Props = {
  insight: StructuredInsight;
  onSelectQuestion: (question: string) => void;
  theme: AgentTheme;
};

function KeyFact({
  label,
  value,
  emphasize,
  accent,
  wide,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  accent: string;
  wide?: boolean;
}) {
  return (
    <View
      style={[
        styles.factTile,
        wide && styles.factTileWide,
        emphasize && { backgroundColor: accent, borderColor: accent },
      ]}
    >
      <Text style={[styles.factLabel, emphasize && styles.factLabelOnAccent]}>{label}</Text>
      <Text
        style={[styles.factValue, emphasize && styles.factValueOnAccent]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function LegColumn({
  title,
  leg,
  alignRight,
  accent,
}: {
  title: string;
  leg?: FlightLeg | null;
  alignRight?: boolean;
  accent: string;
}) {
  return (
    <View style={[styles.legCol, alignRight && styles.legColRight]}>
      <Text style={[styles.legTitle, alignRight && styles.textRight]}>{title}</Text>
      <Text style={[styles.airportCode, alignRight && styles.textRight]}>
        {leg?.airport || '—'}
      </Text>
      <Text style={[styles.legTimeHuge, { color: accent }, alignRight && styles.textRight]}>
        {leg?.time || '待定'}
      </Text>
      {leg?.terminal ? (
        <Text style={[styles.legDetail, alignRight && styles.textRight]}>
          航站楼 {leg.terminal}
        </Text>
      ) : null}
      {leg?.gate ? (
        <View style={[styles.gatePill, { backgroundColor: `${accent}18`, borderColor: accent }]}>
          <Text style={[styles.gatePillText, { color: accent }]}>登机口 {leg.gate}</Text>
        </View>
      ) : (
        <Text style={[styles.legDetailMuted, alignRight && styles.textRight]}>登机口待公布</Text>
      )}
    </View>
  );
}

/**
 * 航班助手专属阅读区：登机牌式行程卡，突出时间 / 登机口等关键信息。
 */
export function FlightInsightSections({ insight, onSelectQuestion, theme }: Props) {
  const flight = insight.flight_info;
  const { accent, chipBg, chipText } = theme;
  const chips = [
    ...(insight.explore_chips?.nearby ?? []),
    ...(insight.explore_chips?.culinary ?? []),
  ];

  if (!flight) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.bodyMuted}>暂无航班结构化信息，请再拍一张登机牌或行程单。</Text>
      </View>
    );
  }

  const dep = flight.departure;
  const arr = flight.arrival;
  const tips = flight.timeline_tips?.filter(Boolean) ?? [];
  const gateValue = dep?.gate?.trim() || '待公布';
  const hasGate = Boolean(dep?.gate?.trim());

  return (
    <View style={styles.wrap}>
      <View style={styles.passCard}>
        <View style={styles.passHeader}>
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>登机牌速读</Text>
          </View>
          {flight.cabin ? <Text style={styles.cabinHint}>{flight.cabin}</Text> : null}
        </View>

        {flight.airline ? (
          <Text style={[styles.airline, { color: accent }]}>{flight.airline}</Text>
        ) : null}
        <Text style={styles.flightNo}>{flight.flight_number || insight.title}</Text>

        {/* 关键信息：时间 / 登机口优先 */}
        <View style={styles.factGrid}>
          <KeyFact
            label="起飞时间"
            value={dep?.time?.trim() || '待定'}
            emphasize
            accent={accent}
          />
          <KeyFact
            label="登机口"
            value={gateValue}
            emphasize={hasGate}
            accent={accent}
          />
          <KeyFact
            label="航站楼"
            value={dep?.terminal?.trim() || '—'}
            accent={accent}
          />
          <KeyFact
            label="座位"
            value={flight.seat?.trim() || '—'}
            accent={accent}
          />
        </View>

        {arr?.time ? (
          <View style={styles.arrivalStrip}>
            <Text style={styles.arrivalLabel}>计划到达</Text>
            <Text style={[styles.arrivalTime, { color: accent }]}>{arr.time}</Text>
            <Text style={styles.arrivalAirport}>{arr.airport || ''}</Text>
          </View>
        ) : null}

        <View style={styles.tearRow}>
          <View style={styles.tearHole} />
          <View style={styles.dashLine} />
          <View style={styles.tearHole} />
        </View>

        {/* 起降对照 */}
        <View style={styles.routeBlock}>
          <LegColumn title="出发" leg={dep} accent={accent} />
          <View style={styles.routeMid}>
            <View style={[styles.routeLine, { backgroundColor: `${accent}55` }]} />
            <View style={[styles.planeDot, { backgroundColor: accent }]}>
              <Text style={styles.planeIcon}>✈</Text>
            </View>
            <View style={[styles.routeLine, { backgroundColor: `${accent}55` }]} />
          </View>
          <LegColumn title="到达" leg={arr} alignRight accent={accent} />
        </View>

        <View style={styles.ticketMeta}>
          {flight.passenger ? (
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>乘客</Text>
              <Text style={styles.metaValue}>{flight.passenger}</Text>
            </View>
          ) : null}
          {flight.booking_ref ? (
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>订座</Text>
              <Text style={styles.metaValue}>{flight.booking_ref}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {flight.status_notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>状态备注</Text>
          <View style={styles.statusCard}>
            <Text style={styles.statusBody}>{flight.status_notes}</Text>
          </View>
        </View>
      ) : null}

      {tips.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>行程提示</Text>
          <View style={styles.timeline}>
            {tips.map((tip, index) => (
              <View key={`${index}-${tip}`} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineDot, { borderColor: accent }]} />
                  {index < tips.length - 1 ? (
                    <View style={[styles.timelineStem, { backgroundColor: `${accent}40` }]} />
                  ) : null}
                </View>
                <View style={styles.timelineCard}>
                  <Text style={styles.timelineBody}>{tip}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {insight.context.practical ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>实用提示</Text>
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
          <Text style={styles.aiNote}>由 Vision Agent AI 生成，登机口与时刻以机场官方为准。</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  passCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(47,111,214,0.14)',
    gap: spacing.sm,
    overflow: 'hidden',
  },
  passHeader: {
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
  cabinHint: {
    ...typography.caption,
    color: lightColors.textMuted,
    fontWeight: '600',
  },
  airline: {
    ...typography.subtitle,
    fontSize: 15,
  },
  flightNo: {
    ...typography.title,
    fontSize: 26,
    lineHeight: 32,
    color: lightColors.text,
    letterSpacing: -0.4,
  },
  factGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: spacing.md,
  },
  factTile: {
    width: '47.5%',
    flexGrow: 1,
    backgroundColor: '#F4F8FF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(47,111,214,0.16)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    minHeight: 84,
    justifyContent: 'center',
  },
  factTileWide: {
    width: '100%',
  },
  factLabel: {
    ...typography.caption,
    color: lightColors.textMuted,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  factLabelOnAccent: {
    color: 'rgba(255,255,255,0.85)',
  },
  factValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: lightColors.text,
    letterSpacing: -0.5,
  },
  factValueOnAccent: {
    color: '#FFFFFF',
  },
  arrivalStrip: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#F7FAFF',
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  arrivalLabel: {
    ...typography.caption,
    color: lightColors.textMuted,
    fontWeight: '700',
  },
  arrivalTime: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  arrivalAirport: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 15,
  },
  tearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  tearHole: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EEF4FB',
    marginHorizontal: -4,
  },
  dashLine: {
    flex: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(47,111,214,0.28)',
    height: 0,
  },
  routeBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  legCol: {
    flex: 1,
    gap: 4,
  },
  legColRight: {
    alignItems: 'flex-end',
  },
  legTitle: {
    ...typography.caption,
    color: lightColors.textMuted,
    fontWeight: '700',
    marginBottom: 2,
  },
  airportCode: {
    fontSize: 26,
    fontWeight: '800',
    color: lightColors.text,
    letterSpacing: 1,
  },
  legTimeHuge: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  legDetail: {
    ...typography.caption,
    color: lightColors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  legDetailMuted: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: 4,
  },
  gatePill: {
    marginTop: 6,
    borderWidth: 1.5,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  gatePillText: {
    ...typography.caption,
    fontWeight: '800',
    fontSize: 13,
  },
  textRight: {
    textAlign: 'right',
  },
  routeMid: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 36,
  },
  routeLine: {
    height: 2,
    flex: 1,
    borderRadius: 1,
  },
  planeDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planeIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    marginLeft: 1,
  },
  ticketMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metaCell: {
    minWidth: '40%',
    gap: 2,
  },
  metaLabel: {
    ...typography.caption,
    color: lightColors.textMuted,
  },
  metaValue: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 15,
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
  statusCard: {
    backgroundColor: '#EEF5FF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(47,111,214,0.2)',
  },
  statusBody: {
    ...typography.body,
    color: '#243B5C',
    lineHeight: 22,
  },
  timeline: { gap: 0 },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
  },
  timelineRail: {
    width: 18,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    marginTop: 14,
  },
  timelineStem: {
    width: 2,
    flex: 1,
    marginTop: 4,
    minHeight: 12,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: lightColors.border,
    marginBottom: spacing.sm,
  },
  timelineBody: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 22,
  },
  aiNote: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: spacing.xs,
  },
});
