import {
  Image,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
  type StyleProp,
} from 'react-native';

import {
  getAgentCircleBg,
  getAgentEmoji,
  getAgentIconSource,
  type AgentAssetId,
} from '@/constants/agentAssets';

/**
 * 资源图多为「黑底 + 居中色圆」，圆盘未铺满画布。
 * 显示时放大并裁切，让色圆铺满容器。
 */
export const AGENT_ICON_DISC_SCALE = 1.35;

/** 个别图标圆盘已较满 / 主体偏大时，用更小放大倍数，避免裁得过近 */
const AGENT_ICON_DISC_SCALE_OVERRIDE: Partial<Record<AgentAssetId, number>> = {
  local_guide: 1.12,
  sight_route: 1.12,
};

export function getAgentIconDiscScale(id: AgentAssetId): number {
  return AGENT_ICON_DISC_SCALE_OVERRIDE[id] ?? AGENT_ICON_DISC_SCALE;
}

type Props = {
  id: AgentAssetId;
  /** 圆形容器边长；色圆会尽量铺满此尺寸 */
  size?: number;
  /** 无图时 emoji 字号；默认约 size * 0.48 */
  emojiSize?: number;
  /** 是否放大裁切 PNG 黑边（圆形按钮建议 true） */
  fillDisc?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Agent 图标：有 PNG 用图，否则回退 emoji。
 * 资源统一来自 constants/agentAssets。
 */
export function AgentIcon({
  id,
  size = 28,
  emojiSize,
  fillDisc = true,
  style,
}: Props) {
  const source = getAgentIconSource(id);
  if (source) {
    const scale = fillDisc ? getAgentIconDiscScale(id) : 1;
    const imgSize = Math.round(size * scale);
    const offset = Math.round((size - imgSize) / 2);

    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden',
            backgroundColor: getAgentCircleBg(id),
          },
          style,
        ]}
      >
        <Image
          source={source}
          style={{
            width: imgSize,
            height: imgSize,
            marginLeft: offset,
            marginTop: offset,
          }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: getAgentCircleBg(id),
        },
        style,
      ]}
    >
      <Text
        style={[{ fontSize: emojiSize ?? Math.round(size * 0.48) }, styles.emoji]}
        allowFontScaling={false}
      >
        {getAgentEmoji(id)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emoji: {
    textAlign: 'center',
  },
});
