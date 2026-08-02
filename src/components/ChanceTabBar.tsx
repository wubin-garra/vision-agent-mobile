import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, lightColors, spacing } from '@/theme';
import type { MainTabParamList } from '@/types/navigation';
import { hapticSelection } from '@/utils/haptics';

type TabName = keyof MainTabParamList;

const TAB_LABELS: Record<TabName, string> = {
  Home: '主页',
  Camera: '拍照',
  Profile: '我的',
};

function HomeGlyph({ color, focused }: { color: string; focused: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 10.8 12 4.5l7.5 6.3V19a1.5 1.5 0 0 1-1.5 1.5h-3.75v-5.25h-4.5V20.5H6A1.5 1.5 0 0 1 4.5 19v-8.2Z"
        stroke={color}
        strokeWidth={focused ? 2 : 1.7}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.14 : 0}
      />
    </Svg>
  );
}

function ProfileGlyph({ color, focused }: { color: string; focused: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={12}
        cy={8.25}
        r={3.35}
        stroke={color}
        strokeWidth={focused ? 2 : 1.7}
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.14 : 0}
      />
      <Path
        d="M5.5 19.25c.7-3.15 2.95-4.75 6.5-4.75s5.8 1.6 6.5 4.75"
        stroke={color}
        strokeWidth={focused ? 2 : 1.7}
        strokeLinecap="round"
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.1 : 0}
      />
    </Svg>
  );
}

function CameraGlyph({ color, accent }: { color: string; accent: string }) {
  return (
    <View style={styles.cameraGlyphWrap}>
      <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={7.2} stroke={color} strokeWidth={1.8} />
        <Circle cx={12} cy={12} r={3.1} stroke={color} strokeWidth={1.6} fill={color} fillOpacity={0.12} />
      </Svg>
      <Text style={[styles.sparkle, { color: accent }]}>✦</Text>
    </View>
  );
}

function TabIcon({
  name,
  focused,
  dark,
}: {
  name: TabName;
  focused: boolean;
  dark: boolean;
}) {
  const active = dark ? '#F5F5FA' : lightColors.text;
  const muted = dark ? 'rgba(245,245,250,0.45)' : lightColors.textMuted;
  const color = focused ? active : muted;

  if (name === 'Home') return <HomeGlyph color={color} focused={focused} />;
  if (name === 'Camera') {
    return <CameraGlyph color={color} accent={dark ? '#A78BFA' : colors.accent} />;
  }
  return <ProfileGlyph color={color} focused={focused} />;
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
            hapticSelection();
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={TAB_LABELS[tabName]}
            onPress={onPress}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          >
            <View
              style={[
                styles.pill,
                focused && (isCamera ? styles.pillDarkActive : styles.pillLightActive),
              ]}
            >
              <TabIcon name={tabName} focused={focused} dark={isCamera} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const TAB_CONTENT_HEIGHT = 44;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
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
    justifyContent: 'center',
    minHeight: TAB_CONTENT_HEIGHT,
  },
  tabPressed: {
    opacity: 0.72,
  },
  pill: {
    width: 64,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  pillLightActive: {
    backgroundColor: '#F2F2F7',
    borderColor: 'rgba(0,0,0,0.04)',
  },
  pillDarkActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cameraGlyphWrap: {
    width: 28,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    right: -1,
    top: -2,
    fontSize: 9,
    fontWeight: '700',
  },
});
