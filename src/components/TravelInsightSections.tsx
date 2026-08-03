import { StyleSheet, Text, View } from 'react-native';

import { ChipRow, InsightSection } from '@/components/InsightCard';
import type { AgentTheme } from '@/constants/agentThemes';
import { colors, radius, spacing, typography } from '@/theme';
import type { AgentId, StructuredInsight } from '@/types/insight';

type TravelAgentId = 'sight_route' | 'hotel_guide' | 'flight_info';

interface Props {
  insight: StructuredInsight;
  agentId: TravelAgentId;
  onSelectQuestion: (question: string) => void;
  theme: AgentTheme;
}

function MetaRow({
  label,
  value,
  labelColor,
  valueColor,
}: {
  label: string;
  value: string;
  labelColor: string;
  valueColor: string;
}) {
  return (
    <View style={styles.metaRow}>
      <Text style={[styles.metaLabel, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function TipLines({
  items,
  color,
}: {
  items: string[];
  color: string;
}) {
  return (
    <>
      {items.map((item) => (
        <Text key={item} style={[styles.tipLine, { color }]}>
          • {item}
        </Text>
      ))}
    </>
  );
}

/**
 * 出国旅游专项洞察：景点路线 / 酒店入住 / 航班。
 * 药品说明已拆到 MedLabelInsightSections。
 */
export function TravelInsightSections({
  insight,
  agentId,
  onSelectQuestion,
  theme,
}: Props) {
  const { accent, text, textMuted, chipBg, chipText, surface } = theme;
  const explore = insight.explore_chips;
  const chips = [
    ...(explore?.culinary ?? []),
    ...(explore?.nearby ?? []),
  ];

  return (
    <>
      {insight.subtitle ? (
        <Text style={[styles.subtitle, { color: textMuted }]}>{insight.subtitle}</Text>
      ) : null}

      {insight.narrative ? (
        <View style={[styles.narrativeBlock, { borderLeftColor: accent, backgroundColor: surface }]}>
          <Text style={[styles.narrative, { color: text }]}>{insight.narrative}</Text>
        </View>
      ) : null}

      {agentId === 'sight_route' && insight.sight_route ? (
        <>
          <InsightSection title="路线概览">
            <View style={styles.metaGrid}>
              {insight.sight_route.place_name ? (
                <MetaRow
                  label="地点"
                  value={insight.sight_route.place_name}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
              {insight.sight_route.area ? (
                <MetaRow
                  label="片区"
                  value={insight.sight_route.area}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
              {insight.sight_route.duration_estimate ? (
                <MetaRow
                  label="时长"
                  value={insight.sight_route.duration_estimate}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
              {insight.sight_route.best_time ? (
                <MetaRow
                  label="最佳时间"
                  value={insight.sight_route.best_time}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
            </View>
          </InsightSection>
          {(insight.sight_route.suggested_route?.length ?? 0) > 0 ? (
            <InsightSection title="建议路线">
              {insight.sight_route.suggested_route!.map((stop, index) => (
                <Text key={`${stop}-${index}`} style={[styles.tipLine, { color: text }]}>
                  {index + 1}. {stop}
                </Text>
              ))}
            </InsightSection>
          ) : null}
          {(insight.sight_route.highlights?.length ?? 0) > 0 ? (
            <InsightSection title="看点">
              {insight.sight_route.highlights!.map((item) => (
                <Text key={item.name} style={[styles.tipLine, { color: text }]}>
                  • {item.name}
                  {item.tip ? ` — ${item.tip}` : ''}
                </Text>
              ))}
            </InsightSection>
          ) : null}
          {(insight.sight_route.transport_tips?.length ?? 0) > 0 ? (
            <InsightSection title="交通提示">
              <TipLines items={insight.sight_route.transport_tips!} color={text} />
            </InsightSection>
          ) : null}
          {insight.sight_route.ticket_notes ? (
            <InsightSection title="票务">
              <Text style={[styles.bodyText, { color: text }]}>
                {insight.sight_route.ticket_notes}
              </Text>
            </InsightSection>
          ) : null}
        </>
      ) : null}

      {agentId === 'hotel_guide' && insight.hotel_guide ? (
        <>
          <InsightSection title="入住信息">
            <View style={styles.metaGrid}>
              {insight.hotel_guide.hotel_name ? (
                <MetaRow
                  label="酒店"
                  value={insight.hotel_guide.hotel_name}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
              {insight.hotel_guide.confirmation_code ? (
                <MetaRow
                  label="确认号"
                  value={insight.hotel_guide.confirmation_code}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
              {insight.hotel_guide.guest_name ? (
                <MetaRow
                  label="住客"
                  value={insight.hotel_guide.guest_name}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
              {insight.hotel_guide.check_in ? (
                <MetaRow
                  label="入住"
                  value={insight.hotel_guide.check_in}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
              {insight.hotel_guide.check_out ? (
                <MetaRow
                  label="退房"
                  value={insight.hotel_guide.check_out}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
              {insight.hotel_guide.room_type ? (
                <MetaRow
                  label="房型"
                  value={insight.hotel_guide.room_type}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
              {insight.hotel_guide.address ? (
                <MetaRow
                  label="地址"
                  value={insight.hotel_guide.address}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
            </View>
          </InsightSection>
          {(insight.hotel_guide.steps?.length ?? 0) > 0 ? (
            <InsightSection title="到店步骤">
              {insight.hotel_guide.steps!.map((step, index) => (
                <Text key={`${step}-${index}`} style={[styles.tipLine, { color: text }]}>
                  {index + 1}. {step}
                </Text>
              ))}
            </InsightSection>
          ) : null}
          {(insight.hotel_guide.amenities_notes?.length ?? 0) > 0 ? (
            <InsightSection title="设施备注">
              <TipLines items={insight.hotel_guide.amenities_notes!} color={text} />
            </InsightSection>
          ) : null}
          {insight.hotel_guide.wifi_or_access ? (
            <InsightSection title="网络 / 门禁">
              <Text style={[styles.bodyText, { color: text }]}>
                {insight.hotel_guide.wifi_or_access}
              </Text>
            </InsightSection>
          ) : null}
        </>
      ) : null}

      {agentId === 'flight_info' && insight.flight_info ? (
        <>
          <InsightSection title="航班档案">
            <View style={styles.metaGrid}>
              {insight.flight_info.airline ? (
                <MetaRow
                  label="航司"
                  value={insight.flight_info.airline}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
              {insight.flight_info.flight_number ? (
                <MetaRow
                  label="航班"
                  value={insight.flight_info.flight_number}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
              {insight.flight_info.passenger ? (
                <MetaRow
                  label="乘客"
                  value={insight.flight_info.passenger}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
              {insight.flight_info.booking_ref ? (
                <MetaRow
                  label="订座"
                  value={insight.flight_info.booking_ref}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
              {insight.flight_info.seat ? (
                <MetaRow
                  label="座位"
                  value={insight.flight_info.seat}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
              {insight.flight_info.cabin ? (
                <MetaRow
                  label="舱位"
                  value={insight.flight_info.cabin}
                  labelColor={textMuted}
                  valueColor={text}
                />
              ) : null}
            </View>
          </InsightSection>
          {insight.flight_info.departure || insight.flight_info.arrival ? (
            <InsightSection title="起降">
              {insight.flight_info.departure ? (
                <Text style={[styles.tipLine, { color: text }]}>
                  出发：
                  {[
                    insight.flight_info.departure.airport,
                    insight.flight_info.departure.time,
                    insight.flight_info.departure.terminal
                      ? `航站楼 ${insight.flight_info.departure.terminal}`
                      : null,
                    insight.flight_info.departure.gate
                      ? `登机口 ${insight.flight_info.departure.gate}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              ) : null}
              {insight.flight_info.arrival ? (
                <Text style={[styles.tipLine, { color: text }]}>
                  到达：
                  {[
                    insight.flight_info.arrival.airport,
                    insight.flight_info.arrival.time,
                    insight.flight_info.arrival.terminal
                      ? `航站楼 ${insight.flight_info.arrival.terminal}`
                      : null,
                    insight.flight_info.arrival.gate
                      ? `登机口 ${insight.flight_info.arrival.gate}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              ) : null}
            </InsightSection>
          ) : null}
          {(insight.flight_info.timeline_tips?.length ?? 0) > 0 ? (
            <InsightSection title="行程提示">
              <TipLines items={insight.flight_info.timeline_tips!} color={text} />
            </InsightSection>
          ) : null}
          {insight.flight_info.status_notes ? (
            <InsightSection title="状态备注">
              <Text style={[styles.bodyText, { color: text }]}>
                {insight.flight_info.status_notes}
              </Text>
            </InsightSection>
          ) : null}
        </>
      ) : null}

      {insight.context.practical ? (
        <InsightSection title="实用提示">
          <Text style={[styles.bodyText, { color: text }]}>{insight.context.practical}</Text>
        </InsightSection>
      ) : null}

      {chips.length > 0 ? (
        <View style={styles.exploreBlock}>
          <Text style={[styles.exploreTitle, { color: textMuted }]}>继续问</Text>
          <ChipRow items={chips} onPress={onSelectQuestion} chipBg={chipBg} chipText={chipText} />
        </View>
      ) : null}
    </>
  );
}

export function isTravelAgent(agentId: AgentId): agentId is TravelAgentId {
  return (
    agentId === 'sight_route' ||
    agentId === 'hotel_guide' ||
    agentId === 'flight_info'
  );
}

export function hasTravelStructuredFields(insight: StructuredInsight, agentId: TravelAgentId): boolean {
  if (agentId === 'sight_route') return Boolean(insight.sight_route || insight.narrative);
  if (agentId === 'hotel_guide') return Boolean(insight.hotel_guide || insight.narrative);
  return Boolean(insight.flight_info || insight.narrative);
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  narrativeBlock: {
    borderLeftWidth: 3,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  narrative: {
    ...typography.body,
    lineHeight: 22,
  },
  metaGrid: {
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  metaLabel: {
    ...typography.caption,
    width: 64,
  },
  metaValue: {
    ...typography.body,
    flex: 1,
  },
  bodyText: {
    ...typography.body,
    lineHeight: 22,
  },
  summary: {
    ...typography.body,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  tipLine: {
    ...typography.body,
    lineHeight: 22,
    marginBottom: 4,
  },
  exploreBlock: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  exploreTitle: {
    ...typography.caption,
    fontWeight: '600',
  },
});
