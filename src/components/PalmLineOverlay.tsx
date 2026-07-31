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

type LabelLayout = {
  id: string;
  left: number;
  top: number;
  cx: number;
  cy: number;
  name: string;
  highlight: string;
  color: string;
};

/** 各线标签偏好：分散到掌的两侧，减少挤在一起 */
const LABEL_PRESET: Record<
  string,
  { t: number; side: 'left' | 'right'; dy: number }
> = {
  heart: { t: 0.78, side: 'right', dy: -14 },
  head: { t: 0.86, side: 'right', dy: 18 },
  life: { t: 0.7, side: 'left', dy: 8 },
  career: { t: 0.42, side: 'left', dy: -28 },
};

const LABEL_W = 118;
const LABEL_H = 40;

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

/** Catmull-Rom → 平滑三次贝塞尔 */
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

function pointAt(path: PxPoint[], t: number): PxPoint {
  const idx = Math.min(
    path.length - 1,
    Math.max(0, Math.round(t * (path.length - 1))),
  );
  return path[idx]!;
}

function layoutLabel(
  line: PalmLine,
  path: PxPoint[],
  width: number,
  height: number,
): LabelLayout {
  const preset = LABEL_PRESET[line.id] ?? {
    t: 0.72,
    side: 'right' as const,
    dy: 0,
  };
  const p = pointAt(path, preset.t);
  const left =
    preset.side === 'right'
      ? Math.min(p.x + 12, width - LABEL_W - 4)
      : Math.max(p.x - LABEL_W - 8, 4);
  const top = Math.min(Math.max(p.y + preset.dy, 6), height - LABEL_H - 4);
  return {
    id: line.id,
    left,
    top,
    cx: p.x,
    cy: p.y,
    name: line.name,
    highlight: line.highlight,
    color: line.color || '#FFFFFF',
  };
}

/** 简单垂直避让，避免标签叠在一起 */
function deconflictLabels(layouts: LabelLayout[], height: number): LabelLayout[] {
  const sorted = [...layouts].sort((a, b) => a.top - b.top);
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1]!;
    const cur = sorted[i]!;
    const sameSide =
      Math.abs(prev.left - cur.left) < LABEL_W * 0.7 ||
      (prev.left < 80 && cur.left < 80) ||
      (prev.left > 120 && cur.left > 120);
    if (sameSide && cur.top < prev.top + LABEL_H + 6) {
      cur.top = Math.min(prev.top + LABEL_H + 8, height - LABEL_H - 4);
    }
  }
  return sorted;
}

/** Chance：平滑虚线 + 彩点 + 分散标签 */
export function PalmLineOverlay({ lines, width, height }: Props) {
  if (!width || !height || lines.length === 0) return null;

  const prepared = lines
    .map((line) => {
      const px = toPx(resolvePath(line), width, height);
      if (px.length < 2) return null;
      return { line, px, layout: layoutLabel(line, px, width, height) };
    })
    .filter(Boolean) as Array<{
    line: PalmLine;
    px: PxPoint[];
    layout: LabelLayout;
  }>;

  const layouts = deconflictLabels(
    prepared.map((p) => p.layout),
    height,
  );
  const layoutById = new Map(layouts.map((l) => [l.id, l]));

  return (
    <View style={[styles.wrap, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {prepared.map(({ line, px }) => (
          <Path
            key={`${line.id}-line`}
            d={toSmoothPath(px)}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={1.8}
            strokeDasharray="6 5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.92}
          />
        ))}
        {prepared.map(({ line }) => {
          const layout = layoutById.get(line.id);
          if (!layout) return null;
          return (
            <Circle
              key={`${line.id}-dot`}
              cx={layout.cx}
              cy={layout.cy}
              r={5}
              fill={layout.color}
              stroke="#FFFFFF"
              strokeWidth={1.4}
            />
          );
        })}
      </Svg>

      {layouts.map((layout) => (
        <View
          key={`${layout.id}-label`}
          style={[styles.label, { left: layout.left, top: layout.top }]}
        >
          <Text style={styles.labelName}>{layout.name}</Text>
          <Text style={styles.labelHighlight} numberOfLines={2}>
            {layout.highlight}
          </Text>
        </View>
      ))}
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
    maxWidth: LABEL_W,
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
