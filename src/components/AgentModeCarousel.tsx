import { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import type { CameraModeItem } from '@/constants/cameraModes';
import { hapticLight, hapticSelection } from '@/utils/haptics';

const ITEM_SIZE = 58;
const ACTIVE_SIZE = 72;
const ITEM_GAP = 18;
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
                <View style={[styles.itemInner, isActive && styles.itemInnerActive]}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
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
    height: ACTIVE_SIZE + 12,
    marginBottom: 10,
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
  },
  itemOuterActive: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  itemInner: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemInnerActive: {
    width: ACTIVE_SIZE - 8,
    height: ACTIVE_SIZE - 8,
    borderRadius: (ACTIVE_SIZE - 8) / 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  emoji: {
    fontSize: 28,
  },
});
