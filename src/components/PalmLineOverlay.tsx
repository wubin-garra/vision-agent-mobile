import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { DEFAULT_PALM_LINE_PATHS } from '@/constants/palmReaderThinking';
import type { PalmLine } from '@/types/insight';

type Props = {
  lines: PalmLine[];
  width: number;
  height: number;
};

function resolvePath(line: PalmLine) {
  if (line.path && line.path.length >= 2) return line.path;
  return DEFAULT_PALM_LINE_PATHS[line.id] ?? [];
}

/** Chance：虚线 + 彩点 +「线名 / 年龄高光」双行标注 */
export function PalmLineOverlay({ lines, width, height }: Props) {
  if (!width || !height || lines.length === 0) return null;

  return (
    <View style={[styles.wrap, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {lines.map((line) => {
          const path = resolvePath(line);
          if (path.length < 2) return null;
          const points = path
            .map((p) => `${(p.x / 100) * width},${(p.y / 100) * height}`)
            .join(' ');
          return (
            <Polyline
              key={`${line.id}-line`}
              points={points}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeDasharray="6 5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.95}
            />
          );
        })}
        {lines.map((line) => {
          const path = resolvePath(line);
          const last = path[path.length - 1];
          if (!last) return null;
          return (
            <Circle
              key={`${line.id}-dot`}
              cx={(last.x / 100) * width}
              cy={(last.y / 100) * height}
              r={5.5}
              fill={line.color || '#FFFFFF'}
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          );
        })}
      </Svg>

      {lines.map((line) => {
        const path = resolvePath(line);
        const last = path[path.length - 1];
        if (!last) return null;

        const preferRight = last.x < 55;
        const left = preferRight
          ? Math.min((last.x / 100) * width + 10, width - 132)
          : Math.max((last.x / 100) * width - 130, 4);
        const top = Math.min(Math.max((last.y / 100) * height - 8, 6), height - 44);

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
