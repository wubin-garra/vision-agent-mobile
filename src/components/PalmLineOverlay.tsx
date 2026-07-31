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
type Side = 'left' | 'right';

type LabelLayout = {
  id: string;
  side: Side;
  left: number;
  top: number;
  cx: number;
  cy: number;
  name: string;
  highlight: string;
  color: string;
};

/**
 * Chance 风格：文字在画面左右外侧，用引线连到掌上彩点，避免遮挡掌心核心区。
 * heart/head 偏右；life/career 偏左。
 */
const LABEL_PRESET: Record<string, { t: number; side: Side; band: number }> = {
  heart: { t: 0.82, side: 'right', band: 0.22 },
  head: { t: 0.88, side: 'right', band: 0.48 },
  life: { t: 0.62, side: 'left', band: 0.58 },
  career: { t: 0.5, side: 'left', band: 0.32 },
};

const LABEL_W = 112;
const LABEL_H = 42;
const EDGE_PAD = 8;

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

function layoutOutsideLabels(
  items: Array<{ line: PalmLine; px: PxPoint[] }>,
  width: number,
  height: number,
): LabelLayout[] {
  // 强制贴画面最左/最右，不依赖掌宽（掌顶满时也能把手外）
  const leftCol = EDGE_PAD;
  const rightCol = width - LABEL_W - EDGE_PAD;

  const layouts: LabelLayout[] = items.map(({ line, px }) => {
    const preset = LABEL_PRESET[line.id] ?? {
      t: 0.72,
      side: 'right' as Side,
      band: 0.4,
    };
    const anchor = pointAt(px, preset.t);
    const left = preset.side === 'right' ? rightCol : leftCol;
    const top = Math.min(
      Math.max(preset.band * height - LABEL_H / 2, EDGE_PAD),
      height - LABEL_H - EDGE_PAD,
    );
    return {
      id: line.id,
      side: preset.side,
      left,
      top,
      cx: anchor.x,
      cy: anchor.y,
      name: line.name,
      highlight: line.highlight,
      color: line.color || '#FFFFFF',
    };
  });

  for (const side of ['left', 'right'] as Side[]) {
    const group = layouts
      .filter((l) => l.side === side)
      .sort((a, b) => a.top - b.top);
    for (let i = 1; i < group.length; i += 1) {
      const prev = group[i - 1]!;
      const cur = group[i]!;
      if (cur.top < prev.top + LABEL_H + 10) {
        cur.top = Math.min(prev.top + LABEL_H + 12, height - LABEL_H - EDGE_PAD);
      }
    }
  }

  return layouts;
}

/** Chance 引线：彩点 → 折线 → 外侧文字 */
function leaderPath(layout: LabelLayout): string {
  const attachX =
    layout.side === 'right' ? layout.left - 2 : layout.left + LABEL_W + 2;
  const attachY = layout.top + 14;
  const outDir = layout.side === 'right' ? 1 : -1;
  const elbowX = layout.cx + outDir * Math.max(18, Math.abs(attachX - layout.cx) * 0.35);
  const clampedElbow =
    layout.side === 'right'
      ? Math.min(elbowX, attachX - 8)
      : Math.max(elbowX, attachX + 8);

  return `M ${layout.cx} ${layout.cy} L ${clampedElbow} ${layout.cy} L ${clampedElbow} ${attachY} L ${attachX} ${attachY}`;
}

/** Chance：掌心虚线 + 彩点 + 外侧解读 + 引线 */
export function PalmLineOverlay({ lines, width, height }: Props) {
  if (!width || !height || lines.length === 0) return null;

  const prepared = lines
    .map((line) => {
      const px = toPx(resolvePath(line), width, height);
      if (px.length < 2) return null;
      return { line, px };
    })
    .filter(Boolean) as Array<{ line: PalmLine; px: PxPoint[] }>;

  if (prepared.length === 0) return null;

  const layouts = layoutOutsideLabels(prepared, width, height);
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

        {layouts.map((layout) => (
          <Path
            key={`${layout.id}-leader`}
            d={leaderPath(layout)}
            fill="none"
            stroke="rgba(255,255,255,0.38)"
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
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
          style={[
            styles.label,
            layout.side === 'left' ? styles.labelLeft : styles.labelRight,
            { left: layout.left, top: layout.top, width: LABEL_W },
          ]}
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
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  labelLeft: {
    alignItems: 'flex-start',
  },
  labelRight: {
    alignItems: 'flex-end',
  },
  labelName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  labelHighlight: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
