import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { DEFAULT_PALM_LINE_PATHS } from '@/constants/palmReaderThinking';
import type { PalmLine, PalmPoint } from '@/types/insight';

type Props = {
  lines: PalmLine[];
  width: number;
  height: number;
};

type PxPoint = { x: number; y: number };

function resolvePath(line: PalmLine): PalmPoint[] {
  if (line.path && line.path.length >= 2) return line.path;
  return DEFAULT_PALM_LINE_PATHS[line.id] ?? [];
}

function toPx(points: PalmPoint[], width: number, height: number): PxPoint[] {
  return points.map((p) => ({
    x: (Math.min(100, Math.max(0, p.x)) / 100) * width,
    y: (Math.min(100, Math.max(0, p.y)) / 100) * height,
  }));
}

/** Catmull-Rom → 平滑三次贝塞尔，让叠加更接近 Chance 的流畅虚线 */
function toSmoothPath(points: PxPoint[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`;
  }

  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function labelAnchor(path: PxPoint[], width: number, height: number) {
  // 取靠近末端 70% 处放标签，减少挤在指根
  const idx = Math.min(path.length - 1, Math.max(1, Math.floor(path.length * 0.72)));
  const p = path[idx]!;
  const preferRight = p.x < width * 0.55;
  const left = preferRight
    ? Math.min(p.x + 10, width - 132)
    : Math.max(p.x - 130, 4);
  const top = Math.min(Math.max(p.y - 10, 6), height - 44);
  return { left, top, cx: p.x, cy: p.y };
}

/** Chance：平滑虚线 + 彩点 +「线名 / 年龄高光」 */
export function PalmLineOverlay({ lines, width, height }: Props) {
  if (!width || !height || lines.length === 0) return null;

  return (
    <View style={[styles.wrap, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {lines.map((line) => {
          const px = toPx(resolvePath(line), width, height);
          if (px.length < 2) return null;
          return (
            <Path
              key={`${line.id}-line`}
              d={toSmoothPath(px)}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={2.2}
              strokeDasharray="7 5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.95}
            />
          );
        })}
        {lines.map((line) => {
          const px = toPx(resolvePath(line), width, height);
          if (px.length < 2) return null;
          const { cx, cy } = labelAnchor(px, width, height);
          return (
            <Circle
              key={`${line.id}-dot`}
              cx={cx}
              cy={cy}
              r={5.5}
              fill={line.color || '#FFFFFF'}
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          );
        })}
      </Svg>

      {lines.map((line) => {
        const px = toPx(resolvePath(line), width, height);
        if (px.length < 2) return null;
        const { left, top } = labelAnchor(px, width, height);
        return (
          <View key={`${line.id}-label`} style={[styles.label, { left, top }]}>
            <Text style={styles.labelName}>{line.name}</Text>
            <Text style={styles.labelHighlight} numberOfLines={2}>
              {line.highlight}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  label: {
    position: 'absolute',
    maxWidth: 128,
  },
  labelName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  labelHighlight: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
