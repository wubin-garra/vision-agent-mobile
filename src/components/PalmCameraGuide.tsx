import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

const GUIDE_W = 280;
const GUIDE_H = 340;

/**
 * 看手相师专属取景引导：半透明掌心轮廓 + 呼吸动画，
 * 引导用户将左手掌心朝上对准画面中央（参考 Chance 爪印/轮廓引导）。
 */
export function PalmCameraGuide() {
  const pulse = useRef(new Animated.Value(0.55)).current;
  const breath = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.92,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1.035,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    breathLoop.start();
    return () => {
      pulseLoop.stop();
      breathLoop.stop();
    };
  }, [breath, pulse]);

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View
        style={[
          styles.guide,
          {
            opacity: pulse,
            transform: [{ scale: breath }],
          },
        ]}
      >
        <Svg width={GUIDE_W} height={GUIDE_H} viewBox="0 0 280 340">
          {/* 掌心主体 */}
          <Path
            d="M92 148
               C78 148 68 160 68 178
               L68 248
               C68 292 98 318 140 318
               C182 318 212 292 212 248
               L212 178
               C212 160 202 148 188 148
               Z"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.88)"
            strokeWidth={2.4}
            strokeLinejoin="round"
          />

          {/* 拇指 */}
          <Path
            d="M92 168
               C62 168 48 148 52 122
               C56 98 78 90 96 104
               C108 114 112 132 108 150"
            fill="none"
            stroke="rgba(255,255,255,0.88)"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 四指：食指 → 小指 */}
          <Ellipse
            cx={108}
            cy={88}
            rx={16}
            ry={42}
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.88)"
            strokeWidth={2.2}
          />
          <Ellipse
            cx={140}
            cy={74}
            rx={17}
            ry={48}
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.88)"
            strokeWidth={2.2}
          />
          <Ellipse
            cx={172}
            cy={82}
            rx={16}
            ry={44}
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.88)"
            strokeWidth={2.2}
          />
          <Ellipse
            cx={200}
            cy={100}
            rx={14}
            ry={36}
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.88)"
            strokeWidth={2.2}
          />

          {/* 示意主线（淡虚感） */}
          <Path
            d="M100 175 C130 168 170 172 196 182"
            fill="none"
            stroke="rgba(232,93,93,0.55)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            strokeLinecap="round"
          />
          <Path
            d="M102 198 C136 196 172 204 198 214"
            fill="none"
            stroke="rgba(74,159,232,0.5)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            strokeLinecap="round"
          />
          <Path
            d="M118 172 C108 210 112 250 122 286"
            fill="none"
            stroke="rgba(61,184,138,0.45)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            strokeLinecap="round"
          />
          <Path
            d="M140 286 C142 240 144 200 146 168"
            fill="none"
            stroke="rgba(240,160,75,0.5)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      <Text style={styles.hint}>将掌心朝上，对准轮廓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  guide: {
    width: GUIDE_W,
    height: GUIDE_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginTop: 14,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
