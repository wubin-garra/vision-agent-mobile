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

/** 常见 12 小时制 → 24 小时制，便于窄卡一行显示（如 3:00 PM → 15:00） */
function to24HourClock(raw: string | null | undefined, fallback = '—'): string {
  const text = raw?.trim();
  if (!text) return fallback;

  return text.replace(
    /\b(\d{1,2})(?::(\d{2}))?\s*(?:([AaPp])\.?[Mm]\.?)\b/g,
    (_match, hourStr: string, minuteStr: string | undefined, meridiem: string) => {
      let hour = Number.parseInt(hourStr, 10);
      const minutes = minuteStr ?? '00';
      const isPm = meridiem.toUpperCase() === 'P';
      if (isPm && hour < 12) hour += 12;
      if (!isPm && hour === 12) hour = 0;
      return `${String(hour).padStart(2, '0')}:${minutes}`;
    },
  );
}

/**
 * 酒店入住专属阅读区：暖沙浅色入住卡，突出确认号 / 入住退房时间 / 到店步骤。
 */
export function HotelInsightSections({ insight, onSelectQuestion, theme }: Props) {
  const hotel = insight.hotel_guide;
  const { accent, chipBg, chipText } = theme;
  const chips = [
    ...(insight.explore_chips?.nearby ?? []),
    ...(insight.explore_chips?.culinary ?? []),
  ];

  if (!hotel) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.bodyMuted}>暂无酒店结构化信息，请再拍一张确认单或入住凭证。</Text>
      </View>
    );
  }

  const steps = hotel.steps?.filter(Boolean) ?? [];
  const amenities = hotel.amenities_notes?.filter(Boolean) ?? [];
  const checkIn = to24HourClock(hotel.check_in);
  const checkOut = to24HourClock(hotel.check_out);
  const passSub = insight.subtitle
    ? to24HourClock(insight.subtitle, insight.subtitle)
    : insight.narrative
      ? to24HourClock(insight.narrative, insight.narrative)
      : null;

  return (
    <View style={styles.wrap}>
      {/* 入住主卡 */}
      <View style={styles.passCard}>
        <View style={styles.passHeader}>
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>入住速读</Text>
          </View>
          {hotel.room_type ? <Text style={styles.roomHint}>{hotel.room_type}</Text> : null}
        </View>

        <Text style={styles.hotelName}>{hotel.hotel_name || insight.title}</Text>
        {passSub ? <Text style={styles.passSub}>{passSub}</Text> : null}

        {hotel.confirmation_code ? (
          <View style={[styles.codeBanner, { backgroundColor: accent }]}>
            <Text style={styles.codeLabel}>确认号</Text>
            <Text style={styles.codeValue}>{hotel.confirmation_code}</Text>
          </View>
        ) : null}

        {/* 入住 / 退房时间突显（24 小时制，尽量一行） */}
        <View style={styles.timeRow}>
          <View style={[styles.timeTile, { borderColor: `${accent}40` }]}>
            <Text style={styles.timeLabel}>入住</Text>
            <Text
              style={[styles.timeValue, { color: accent }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {checkIn}
            </Text>
          </View>
          <View style={styles.timeArrow}>
            <Text style={[styles.timeArrowText, { color: accent }]}>→</Text>
          </View>
          <View style={[styles.timeTile, { borderColor: `${accent}40` }]}>
            <Text style={styles.timeLabel}>退房</Text>
            <Text
              style={[styles.timeValue, { color: accent }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {checkOut}
            </Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          {hotel.guest_name ? (
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>住客</Text>
              <Text style={styles.metaValue}>{hotel.guest_name}</Text>
            </View>
          ) : null}
          {hotel.address ? (
            <View style={[styles.metaCell, styles.metaCellWide]}>
              <Text style={styles.metaLabel}>地址</Text>
              <Text style={styles.metaValue}>{hotel.address}</Text>
            </View>
          ) : null}
          {hotel.contact ? (
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>联系</Text>
              <Text style={styles.metaValue}>{hotel.contact}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* 到店步骤 */}
      {steps.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>到店步骤</Text>
          <View style={styles.steps}>
            {steps.map((step, index) => (
              <View key={`${index}-${step}`} style={styles.stepRow}>
                <View style={[styles.stepIndex, { backgroundColor: accent }]}>
                  <Text style={styles.stepIndexText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepBody}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Wi‑Fi / 门禁 */}
      {hotel.wifi_or_access ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>网络 / 门禁</Text>
          <View style={styles.accessCard}>
            <Text style={styles.accessBody}>{hotel.wifi_or_access}</Text>
          </View>
        </View>
      ) : null}

      {/* 设施 */}
      {amenities.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>设施备注</Text>
          <View style={styles.amenityWrap}>
            {amenities.map((item) => (
              <View key={item} style={[styles.amenityChip, { borderColor: `${accent}55` }]}>
                <Text style={[styles.amenityText, { color: accent }]}>{item}</Text>
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
          <Text style={styles.aiNote}>由 Vision Agent AI 生成，入住细节以酒店确认邮件/前台为准。</Text>
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
    borderColor: 'rgba(184,138,90,0.18)',
    gap: spacing.sm,
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
  roomHint: {
    ...typography.caption,
    color: lightColors.textMuted,
    fontWeight: '600',
  },
  hotelName: {
    ...typography.title,
    fontSize: 26,
    lineHeight: 32,
    color: lightColors.text,
    letterSpacing: -0.4,
  },
  passSub: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 22,
  },
  codeBanner: {
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  codeLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
  },
  codeValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  timeTile: {
    flex: 1,
    backgroundColor: '#FFFBF5',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    minHeight: 72,
    justifyContent: 'center',
  },
  timeLabel: {
    ...typography.caption,
    color: lightColors.textMuted,
    fontWeight: '700',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  timeArrow: {
    width: 20,
    alignItems: 'center',
  },
  timeArrowText: {
    fontSize: 18,
    fontWeight: '700',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metaCell: {
    minWidth: '40%',
    gap: 2,
  },
  metaCellWide: {
    width: '100%',
  },
  metaLabel: {
    ...typography.caption,
    color: lightColors.textMuted,
  },
  metaValue: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 15,
    lineHeight: 20,
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
  accessCard: {
    backgroundColor: '#FFF8EE',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(184,138,90,0.28)',
  },
  accessBody: {
    ...typography.body,
    color: '#5C4A2E',
    lineHeight: 22,
  },
  amenityWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(184,138,90,0.08)',
  },
  amenityText: {
    ...typography.caption,
    fontWeight: '700',
  },
  aiNote: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: spacing.xs,
  },
});
