import { useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ChipRow } from '@/components/InsightCard';
import { PalmLineOverlay } from '@/components/PalmLineOverlay';
import { lightColors, radius, spacing, typography } from '@/theme';
import type { PalmLine, StructuredInsight } from '@/types/insight';

type Props = {
  insight: StructuredInsight;
  imageUri: string;
  onSelectQuestion: (question: string) => void;
  onScrollToBottom?: () => void;
  onOpenFullImage?: () => void;
};

const LINE_ORDER = ['heart', 'head', 'life', 'career'] as const;

function sortPalmLines(lines: PalmLine[]): PalmLine[] {
  return [...lines].sort((a, b) => {
    const ai = LINE_ORDER.indexOf(a.id as (typeof LINE_ORDER)[number]);
    const bi = LINE_ORDER.indexOf(b.id as (typeof LINE_ORDER)[number]);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function PalmLineSection({
  line,
  defaultOpen,
  isLast,
}: {
  line: PalmLine;
  defaultOpen?: boolean;
  isLast?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  return (
    <View style={[styles.lineCard, isLast && styles.lineCardLast]}>
      <TouchableOpacity
        style={styles.lineHeader}
        activeOpacity={0.75}
        onPress={() => setOpen((v) => !v)}
      >
        <View style={styles.lineHeaderLeft}>
          <View style={[styles.lineDot, { backgroundColor: line.color }]} />
          <View style={styles.lineTitleCol}>
            <Text style={styles.lineName}>{line.name}</Text>
            <Text style={styles.lineHighlight}>{line.highlight}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>{open ? '⌃' : '⌄'}</Text>
      </TouchableOpacity>
      {open ? <Text style={styles.lineBody}>{line.description}</Text> : null}
    </View>
  );
}

function SpectrumSlider({
  low,
  high,
  value,
}: {
  low: string;
  high: string;
  value: number;
}) {
  const percent = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>{low}</Text>
        <Text style={styles.sliderLabel}>{high}</Text>
      </View>
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderThumb, { left: `${percent}%` }]} />
      </View>
    </View>
  );
}

export function PalmReaderInsightSections({
  insight,
  imageUri,
  onSelectQuestion,
  onScrollToBottom,
  onOpenFullImage,
}: Props) {
  const palm = insight.palm_reading;
  const traits =
    palm?.summary_traits && palm.summary_traits.length > 0
      ? palm.summary_traits
      : [
          insight.visible_clues?.[0]
            ? { label: '手型', value: insight.visible_clues[0] }
            : null,
          insight.visible_clues?.[1]
            ? { label: '核心纹路', value: insight.visible_clues[1] }
            : null,
          insight.visible_clues?.[2]
            ? { label: '独特标记', value: insight.visible_clues[2] }
            : null,
        ].filter(Boolean) as { label: string; value: string }[];
  const lines = sortPalmLines(palm?.palm_lines ?? []);
  const spectrum = palm?.personality_spectrum ?? [];
  const chips = insight.explore_chips?.culinary ?? [];
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  return (
    <View style={styles.wrap}>
      {/* Chance：手型 / 核心纹路 / 独特标记 */}
      {traits.length > 0 ? (
        <View style={styles.card}>
          {traits.map((trait, index) => (
            <View
              key={`${trait.label}-${index}`}
              style={[
                styles.traitRow,
                index < traits.length - 1 && styles.traitRowBorder,
              ]}
            >
              <Text style={styles.traitLabel}>{trait.label}</Text>
              <Text style={styles.traitValue}>{trait.value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Chance：带掌纹标注的视觉卡 */}
      <View style={styles.visualCard}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={onOpenFullImage}
          onLayout={(event: LayoutChangeEvent) => {
            const { width, height } = event.nativeEvent.layout;
            setImageSize({ width, height });
          }}
          style={styles.visualImageWrap}
        >
          <Image source={{ uri: imageUri }} style={styles.visualImage} resizeMode="cover" />
          {lines.length > 0 && imageSize.width > 0 ? (
            <PalmLineOverlay
              lines={lines}
              width={imageSize.width}
              height={imageSize.height}
            />
          ) : null}
        </TouchableOpacity>

        {onScrollToBottom ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onScrollToBottom}
            style={styles.scrollFab}
            accessibilityLabel="滚动到底部"
          >
            <Text style={styles.scrollFabIcon}>⌄</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Chance：四条主线折叠解读 */}
      {lines.length > 0 ? (
        <View style={styles.card}>
          {lines.map((line, index) => (
            <PalmLineSection
              key={line.id}
              line={line}
              defaultOpen={index === 0}
              isLast={index === lines.length - 1}
            />
          ))}
        </View>
      ) : null}

      {/* Chance：性格光谱 */}
      {spectrum.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>性格光谱</Text>
          {spectrum.map((item) => (
            <SpectrumSlider
              key={`${item.low_label}-${item.high_label}`}
              low={item.low_label}
              high={item.high_label}
              value={item.value}
            />
          ))}
        </View>
      ) : null}

      {/* Chance：金句 */}
      {palm?.insight_quote ? (
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>“{palm.insight_quote}”</Text>
        </View>
      ) : null}

      {/* Chance：匹配度邀请 */}
      <View style={styles.card}>
        <Text style={styles.compatTitle}>
          {palm?.compatibility_teaser ?? '看看你和重要的人有多匹配'}
        </Text>
        <View style={styles.compatGauge}>
          <View style={styles.compatArc} />
          <View style={styles.compatAvatars}>
            <View style={styles.compatPlus}>
              <Text style={styles.compatPlusText}>+</Text>
            </View>
            <View style={styles.compatSelf}>
              <Text style={styles.compatSelfText}>你</Text>
            </View>
          </View>
          <Text style={styles.compatHint}>? 匹配度</Text>
        </View>
        <TouchableOpacity style={styles.inviteBtn} activeOpacity={0.85}>
          <Text style={styles.inviteText}>立即邀请</Text>
        </TouchableOpacity>
      </View>

      {chips.length > 0 ? (
        <View style={styles.chipSection}>
          <Text style={styles.sectionTitle}>继续探索</Text>
          <ChipRow items={chips} onPress={onSelectQuestion} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 0,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  traitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  traitRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightColors.border,
  },
  traitLabel: {
    ...typography.caption,
    color: lightColors.textMuted,
    width: 72,
    fontWeight: '600',
    paddingTop: 1,
  },
  traitValue: {
    ...typography.body,
    color: lightColors.text,
    flex: 1,
    lineHeight: 22,
  },
  visualCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  visualImageWrap: {
    width: '100%',
    height: 340,
    position: 'relative',
    backgroundColor: lightColors.surface,
  },
  visualImage: {
    width: '100%',
    height: '100%',
  },
  scrollFab: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: spacing.md,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: lightColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollFabIcon: {
    fontSize: 20,
    color: lightColors.text,
  },
  lineCard: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightColors.border,
    gap: spacing.sm,
  },
  lineCardLast: {
    borderBottomWidth: 0,
  },
  lineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  lineHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.sm,
  },
  lineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  lineTitleCol: {
    flex: 1,
    gap: 4,
  },
  lineName: {
    ...typography.subtitle,
    fontSize: 20,
    color: lightColors.text,
  },
  lineHighlight: {
    ...typography.caption,
    color: lightColors.textMuted,
  },
  chevron: {
    ...typography.body,
    color: lightColors.textMuted,
    fontSize: 18,
  },
  lineBody: {
    ...typography.body,
    color: lightColors.text,
    lineHeight: 24,
    paddingLeft: 18,
  },
  cardTitle: {
    ...typography.title,
    fontSize: 22,
    color: lightColors.text,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  sliderBlock: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    ...typography.caption,
    color: lightColors.textMuted,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: lightColors.border,
    position: 'relative',
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    marginLeft: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: lightColors.accent,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  quoteText: {
    ...typography.body,
    color: lightColors.text,
    textAlign: 'center',
    lineHeight: 26,
    fontSize: 16,
  },
  compatTitle: {
    ...typography.subtitle,
    color: lightColors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  compatGauge: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  compatArc: {
    width: 160,
    height: 80,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    borderWidth: 10,
    borderBottomWidth: 0,
    borderColor: lightColors.accent,
    opacity: 0.85,
  },
  compatAvatars: {
    flexDirection: 'row',
    marginTop: -48,
    gap: -8,
  },
  compatPlus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: lightColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  compatPlusText: {
    fontSize: 22,
    color: lightColors.textMuted,
  },
  compatSelf: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E85D9A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compatSelfText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  compatHint: {
    ...typography.caption,
    color: lightColors.textMuted,
  },
  inviteBtn: {
    backgroundColor: lightColors.text,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  inviteText: {
    ...typography.subtitle,
    color: '#FFFFFF',
  },
  chipSection: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    ...typography.label,
    color: lightColors.textMuted,
    textTransform: 'uppercase',
  },
});
