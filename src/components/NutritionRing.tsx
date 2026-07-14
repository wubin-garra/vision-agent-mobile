import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { lightColors, radius, spacing, typography } from '@/theme';

type Props = {
  current: number;
  goal: number;
  unit?: string;
  label: string;
  emoji?: string | null;
  color: string;
  /** 热量大卡横排大卡；默认 macro 为 Chance 三列竖排 */
  large?: boolean;
};

/** SVG 圆环：弧长与 progress 精确对应，从 12 点方向顺时针填充 */
function CircularProgress({
  size,
  stroke,
  progress,
  color,
  trackColor = lightColors.surface,
  children,
}: {
  size: number;
  stroke: number;
  progress: number;
  color: string;
  trackColor?: string;
  children?: ReactNode;
}) {
  const pct = Math.min(1, Math.max(0, progress));
  const center = size / 2;
  const ringRadius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const dashOffset = circumference * (1 - pct);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={center}
          cy={center}
          r={ringRadius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        {pct > 0 ? (
          <Circle
            cx={center}
            cy={center}
            r={ringRadius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${center}, ${center}`}
          />
        ) : null}
      </Svg>
      {children}
    </View>
  );
}

function ValueLine({
  current,
  goal,
  unit,
  mainSize,
  unitSize,
}: {
  current: number;
  goal: number;
  unit: string;
  mainSize: number;
  unitSize: number;
}) {
  const suffix = unit === 'kcal' ? `/${goal}kcal` : `/${goal}${unit}`;

  return (
    <View style={styles.valueRow}>
      <Text style={[styles.valueMain, { fontSize: mainSize, lineHeight: mainSize + 4 }]}>
        {Math.round(current)}
      </Text>
      <Text
        style={[styles.valueUnit, { fontSize: unitSize }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {suffix}
      </Text>
    </View>
  );
}

/** 热量大卡：左文右环横排 */
function CalorieCard({
  current,
  goal,
  label,
  emoji,
  color,
  pct,
}: {
  current: number;
  goal: number;
  label: string;
  emoji?: string | null;
  color: string;
  pct: number;
}) {
  return (
    <View style={[styles.card, styles.cardLarge]}>
      <View style={styles.largeRow}>
        <View style={styles.textColLarge}>
          <ValueLine current={current} goal={goal} unit="kcal" mainSize={36} unitSize={17} />
          <Text style={styles.label}>{label}</Text>
        </View>
        <CircularProgress size={76} stroke={7} progress={pct} color={color} trackColor="#ECECF0">
          <Text style={styles.ringEmojiLarge}>{emoji ?? '🔥'}</Text>
        </CircularProgress>
      </View>
    </View>
  );
}

/** 三大营养素：Chance 竖排卡片 */
function MacroCard({
  current,
  goal,
  unit,
  label,
  emoji,
  color,
  pct,
}: {
  current: number;
  goal: number;
  unit: string;
  label: string;
  emoji?: string | null;
  color: string;
  pct: number;
}) {
  return (
    <View style={styles.macroCard}>
      <ValueLine current={current} goal={goal} unit={unit} mainSize={22} unitSize={13} />
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroRingWrap}>
        <CircularProgress size={60} stroke={6} progress={pct} color={color} trackColor="#ECECF0">
          <Text style={styles.ringEmoji}>{emoji ?? '•'}</Text>
        </CircularProgress>
      </View>
    </View>
  );
}

export function NutritionRing({
  current,
  goal,
  unit = 'g',
  label,
  emoji,
  color,
  large = false,
}: Props) {
  const pct = goal > 0 ? Math.min(1, current / goal) : 0;

  if (large && unit === 'kcal') {
    return (
      <CalorieCard
        current={current}
        goal={goal}
        label={label}
        emoji={emoji}
        color={color}
        pct={pct}
      />
    );
  }

  return (
    <MacroCard
      current={current}
      goal={goal}
      unit={unit}
      label={label}
      emoji={emoji}
      color={color}
      pct={pct}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: lightColors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardLarge: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  largeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  textColLarge: {
    flex: 1,
    minWidth: 0,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'nowrap',
  },
  valueMain: {
    fontWeight: '700',
    color: lightColors.text,
  },
  valueUnit: {
    fontWeight: '500',
    color: lightColors.textMuted,
    marginLeft: 1,
    flexShrink: 1,
  },
  label: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: 4,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: lightColors.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'flex-start',
    minHeight: 152,
  },
  macroLabel: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: 2,
    fontSize: 13,
  },
  macroRingWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  ringEmoji: { fontSize: 22 },
  ringEmojiLarge: { fontSize: 24 },
});
