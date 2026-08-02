import { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { AgentIcon } from '@/components/AgentIcon';
import { hasAgentIcon } from '@/constants/agentAssets';
import type { CameraModeItem } from '@/constants/cameraModes';
import { hapticLight, hapticSelection } from '@/utils/haptics';

/** 选中态外径（含白环） */
const ACTIVE_SIZE = 72;
/** 未选中图标直径 */
const ITEM_SIZE = 64;
const ITEM_GAP = 14;
/** 选中白环 */
const RING_WIDTH = 3;
/** 白环与色圆之间的黑边（外层黑底露出） */
const BLACK_GAP = 2;
/** 选中时色圆直径 = 外径 − 两侧白环 − 两侧黑边 */
const ICON_ACTIVE = ACTIVE_SIZE - 2 * RING_WIDTH - 2 * BLACK_GAP;
const SCROLL_ANIM_MS = 260;

type Props = {
  modes: CameraModeItem[];
  selectedId: string;
  onSelect: (mode: CameraModeItem) => void;
  disabled?: boolean;
};

export function AgentModeCarousel({ modes, selectedId, onSelect, disabled }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const isTapScrollingRef = useRef(false);
  const sidePadding = (screenWidth - ACTIVE_SIZE) / 2;
  const snapInterval = ITEM_SIZE + ITEM_GAP;

  const selectedIndex = Math.max(
    0,
    modes.findIndex((mode) => mode.id === selectedId),
  );

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      const offset = index * snapInterval;
      scrollRef.current?.scrollTo({ x: offset, animated });
      if (animated) {
        isTapScrollingRef.current = true;
        Animated.timing(scrollX, {
          toValue: offset,
          duration: SCROLL_ANIM_MS,
          useNativeDriver: true,
        }).start(() => {
          isTapScrollingRef.current = false;
        });
      } else {
        scrollX.setValue(offset);
      }
    },
    [scrollX, snapInterval],
  );

  const selectIndex = useCallback(
    (index: number, fromTap = false) => {
      const clamped = Math.max(0, Math.min(modes.length - 1, index));
      const mode = modes[clamped];
      if (!mode) return;

      scrollToIndex(clamped, true);

      if (mode.id !== selectedId) {
        if (fromTap) hapticSelection();
        onSelect(mode);
      } else if (fromTap) {
        hapticLight();
      }
    },
    [modes, onSelect, scrollToIndex, selectedId],
  );

  useEffect(() => {
    scrollToIndex(selectedIndex, false);
    // 仅首次挂载对齐；后续由点击/滑动驱动，避免打断动画
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 收藏导致顺序变化时，保持当前选中项居中
  const modesOrderKey = modes.map((mode) => mode.id).join('|');
  const prevOrderKeyRef = useRef(modesOrderKey);
  useEffect(() => {
    if (prevOrderKeyRef.current === modesOrderKey) return;
    prevOrderKeyRef.current = modesOrderKey;
    scrollToIndex(selectedIndex, true);
  }, [modesOrderKey, selectedIndex, scrollToIndex]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isTapScrollingRef.current) return;

    const index = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
    const clamped = Math.max(0, Math.min(modes.length - 1, index));
    const mode = modes[clamped];
    if (!mode) return;

    if (mode.id !== selectedId) {
      hapticSelection();
      onSelect(mode);
    }

    const targetOffset = clamped * snapInterval;
    if (Math.abs(event.nativeEvent.contentOffset.x - targetOffset) > 1) {
      scrollToIndex(clamped, true);
    }
  };

  return (
    <View style={styles.wrap}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        disableIntervalMomentum
        bounces={false}
        scrollEnabled={!disabled}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: sidePadding }]}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
      >
        {modes.map((item, index) => {
          const inputRange = [
            (index - 1) * snapInterval,
            index * snapInterval,
            (index + 1) * snapInterval,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.82, 1, 0.82],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.55, 1, 0.55],
            extrapolate: 'clamp',
          });
          const isActive = item.id === selectedId;
          const iconReady = hasAgentIcon(item.id);
          const iconSize = isActive ? ICON_ACTIVE : ITEM_SIZE;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              disabled={disabled}
              style={styles.itemSlot}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              onPress={() => selectIndex(index, true)}
            >
              <Animated.View
                style={[
                  styles.itemOuter,
                  isActive && styles.itemOuterActive,
                  { opacity, transform: [{ scale }] },
                ]}
              >
                <View
                  style={[
                    styles.itemInner,
                    {
                      width: iconSize,
                      height: iconSize,
                      borderRadius: iconSize / 2,
                    },
                  ]}
                >
                  <AgentIcon
                    id={item.id}
                    size={iconSize}
                    emojiSize={isActive ? 30 : 28}
                    fillDisc={iconReady}
                  />
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: ACTIVE_SIZE + 4,
    marginBottom: 4,
  },
  listContent: {
    alignItems: 'center',
  },
  itemSlot: {
    width: ITEM_SIZE + ITEM_GAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemOuter: {
    width: ACTIVE_SIZE,
    height: ACTIVE_SIZE,
    borderRadius: ACTIVE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  itemOuterActive: {
    borderWidth: RING_WIDTH,
    borderColor: '#FFFFFF',
    backgroundColor: '#000000',
  },
  itemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
