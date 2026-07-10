import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ZoomPresetId } from '@/hooks/useNativeCameraZoom';
import { hapticLight } from '@/utils/haptics';

const SLOT_WIDTH = 44;
const PILL_SIZE = 36;

type ZoomPresetItem = {
  id: ZoomPresetId;
  label: string;
  active: boolean;
};

type Props = {
  presets: ZoomPresetItem[];
  onSelect: (id: ZoomPresetId) => void;
  disabled?: boolean;
};

function pillOffsetForIndex(index: number) {
  return index * SLOT_WIDTH + (SLOT_WIDTH - PILL_SIZE) / 2;
}

export function ZoomSelector({ presets, onSelect, disabled }: Props) {
  const activeIndex = Math.max(
    0,
    presets.findIndex((preset) => preset.active),
  );
  const pillX = useRef(new Animated.Value(pillOffsetForIndex(activeIndex))).current;

  useEffect(() => {
    Animated.spring(pillX, {
      toValue: pillOffsetForIndex(activeIndex),
      useNativeDriver: true,
      friction: 11,
      tension: 95,
    }).start();
  }, [activeIndex, pillX]);

  const handlePress = (id: ZoomPresetId) => {
    if (disabled) return;
    void hapticLight();
    onSelect(id);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Animated.View
          pointerEvents="none"
          style={[styles.pill, { transform: [{ translateX: pillX }] }]}
        />
        {presets.map((preset) => {
          const isActive = preset.active;
          return (
            <Pressable
              key={preset.id}
              style={styles.slot}
              disabled={disabled}
              hitSlop={8}
              onPress={() => handlePress(preset.id)}
            >
              <View style={styles.labelBox}>
                <Text style={[styles.label, isActive && styles.labelActive]}>{preset.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: PILL_SIZE,
  },
  pill: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: PILL_SIZE,
    height: PILL_SIZE,
    borderRadius: PILL_SIZE / 2,
    backgroundColor: 'rgba(28, 28, 30, 0.62)',
  },
  slot: {
    width: SLOT_WIDTH,
    height: PILL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelBox: {
    width: PILL_SIZE,
    height: PILL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.2,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 18,
  },
  labelActive: {
    color: '#FFD60A',
    fontWeight: '600',
  },
});
