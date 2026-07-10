import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, lightColors, radius, spacing, typography } from '@/theme';
import type { MainTabParamList } from '@/types/navigation';

type TabName = keyof MainTabParamList;

const TAB_LABELS: Record<TabName, string> = {
  Home: '主页',
  Camera: '拍照',
  Profile: '我的',
};

function TabIcon({ name, focused, dark }: { name: TabName; focused: boolean; dark: boolean }) {
  const color = dark ? colors.text : lightColors.text;
  const muted = dark ? colors.textMuted : lightColors.textMuted;
  const iconColor = focused ? color : muted;

  if (name === 'Home') {
    return <Text style={[styles.icon, { color: iconColor }]}>⌂</Text>;
  }
  if (name === 'Camera') {
    return (
      <View style={styles.cameraIconWrap}>
        <Text style={[styles.icon, { color: iconColor }]}>◎</Text>
        <Text style={styles.sparkle}>✦</Text>
      </View>
    );
  }
  return <Text style={[styles.icon, { color: iconColor }]}>◉</Text>;
}

export function ChanceTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name as TabName;
  const isCamera = activeRoute === 'Camera';

  return (
    <View
      style={[
        styles.bar,
        isCamera ? styles.barDark : styles.barLight,
        isCamera && styles.barDarkCamera,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tabName = route.name as TabName;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.pill,
                focused && (isCamera ? styles.pillDarkActive : styles.pillLightActive),
              ]}
            >
              <TabIcon name={tabName} focused={focused} dark={isCamera} />
            </View>
            <View style={styles.labelSlot}>
              {!isCamera ? (
                <Text
                  style={[
                    styles.label,
                    { color: focused ? lightColors.text : lightColors.textMuted },
                  ]}
                >
                  {TAB_LABELS[tabName]}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const TAB_CONTENT_HEIGHT = 58;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    minHeight: TAB_CONTENT_HEIGHT + spacing.sm,
  },
  barLight: {
    backgroundColor: lightColors.tabBar,
    borderTopColor: lightColors.border,
  },
  barDark: {
    backgroundColor: lightColors.tabBarDark,
    borderTopColor: '#2C2C2E',
  },
  barDarkCamera: {
    borderTopWidth: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: TAB_CONTENT_HEIGHT,
    gap: 2,
  },
  pill: {
    height: 40,
    minWidth: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLightActive: {
    backgroundColor: lightColors.pill,
  },
  pillDarkActive: {
    backgroundColor: lightColors.pillDark,
  },
  labelSlot: {
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    fontSize: 11,
    lineHeight: 14,
  },
  icon: {
    fontSize: 22,
    lineHeight: 24,
  },
  cameraIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkle: {
    fontSize: 10,
    color: colors.accent,
    marginLeft: -2,
    marginTop: -8,
  },
});
