import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgentIcon } from '@/components/AgentIcon';
import { getAgentCircleBg, hasAgentIcon } from '@/constants/agentAssets';
import type { AgentAssetId } from '@/constants/agentAssets';
import { featuredPrompts, perspectives } from '@/constants/homeContent';
import { isDiaryDemoId, withDiaryDemoMemories } from '@/constants/diaryDemos';
import {
  getDemoAgentLabel,
  getDemoCoverColor,
  travelHomeDemos,
  type HomeDemoItem,
} from '@/constants/homeDemos';
import { listMemories } from '@/services/api';
import { track } from '@/services/analytics';
import { useSessionStore } from '@/store/session';
import { lightColors, radius, spacing, typography } from '@/theme';
import type { MainTabParamList, RootStackParamList } from '@/types/navigation';
import type { MemoryItem } from '@/types/insight';
import Svg, { Circle, Line, Path } from 'react-native-svg';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const DISPLAY_FONT = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: undefined,
});

const BRAND_FONT = Platform.select({
  ios: 'AvenirNext-DemiBold',
  android: 'sans-serif-medium',
  default: undefined,
});

const TECH = '#2A6F9E';
const TECH_DEEP = '#1C344A';
const ORB_SIZE = 200;

/** 各专项 Agent 圆底色铺成首页氛围（与 agentAssets.circleBg 对齐） */
const HERO_AGENT_BLOBS: Array<{
  id: AgentAssetId;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  size: number;
  opacity: number;
}> = [
  { id: 'flight_info', top: -56, left: -48, size: 210, opacity: 0.95 },
  { id: 'menu_translator', top: -20, right: -36, size: 200, opacity: 0.9 },
  { id: 'food_scan', top: 88, left: -60, size: 170, opacity: 0.85 },
  { id: 'local_guide', top: 40, left: 120, size: 140, opacity: 0.7 },
  { id: 'stylist', top: 120, right: 40, size: 150, opacity: 0.8 },
  { id: 'food_explorer', top: 160, left: 40, size: 130, opacity: 0.75 },
  { id: 'palm_reader', top: 10, left: 70, size: 110, opacity: 0.65 },
  { id: 'hotel_guide', bottom: -30, right: 80, size: 120, opacity: 0.7 },
  { id: 'med_label', bottom: -40, left: 100, size: 110, opacity: 0.65 },
  { id: 'general_curiosity', top: 70, right: 90, size: 100, opacity: 0.55 },
];

function HeroAgentAura() {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const shiftA = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });
  const shiftB = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={styles.heroWash} pointerEvents="none">
      <LinearGradient
        colors={['#DCECFF', '#D9F3EF', '#FFE8DE', '#FCE4EC', '#FFFFFF']}
        locations={[0, 0.28, 0.55, 0.78, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {HERO_AGENT_BLOBS.map((blob, index) => {
        const color = getAgentCircleBg(blob.id);
        const translateY = index % 2 === 0 ? shiftA : shiftB;
        return (
          <Animated.View
            key={blob.id}
            style={[
              styles.agentBlob,
              {
                top: blob.top,
                left: blob.left,
                right: blob.right,
                bottom: blob.bottom,
                width: blob.size,
                height: blob.size,
                borderRadius: blob.size / 2,
                backgroundColor: color,
                opacity: blob.opacity,
                transform: [{ translateY }],
              },
            ]}
          />
        );
      })}

      {/* 左侧阅读区提亮，保证标题可读 */}
      <LinearGradient
        colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
        locations={[0, 0.45, 1]}
        style={styles.heroReadVeil}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 1, y: 0.5 }}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.85)', '#FFFFFF']}
        locations={[0.35, 0.82, 1]}
        style={styles.heroFadeDown}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <HeroTechOrb />
    </View>
  );
}

/** 首页右上角科技 HUD：旋转刻度环 + 反向扫描弧 + 扫描线 + 核心脉冲 */
function HeroTechOrb() {
  const spin = useRef(new Animated.Value(0)).current;
  const spinRev = useRef(new Animated.Value(0)).current;
  const scan = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const blip = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = [
      Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 14000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      Animated.loop(
        Animated.timing(spinRev, {
          toValue: 1,
          duration: 9000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      Animated.loop(
        Animated.timing(scan, {
          toValue: 1,
          duration: 3200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(blip, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(blip, {
            toValue: 0,
            duration: 720,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(900),
        ]),
      ),
    ];
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [blip, pulse, scan, spin, spinRev]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const rotateRev = spinRev.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });
  const scanRotate = scan.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const coreScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.14],
  });
  const coreGlow = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.75],
  });
  const blipOpacity = blip.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 1],
  });

  return (
    <View style={styles.orbWrap} pointerEvents="none">
      {/* 外环刻度：慢速顺时针 */}
      <Animated.View style={[styles.orbLayer, { transform: [{ rotate }] }]}>
        <Svg width={ORB_SIZE} height={ORB_SIZE} viewBox="0 0 200 200">
          <Circle
            cx={100}
            cy={100}
            r={88}
            stroke={TECH}
            strokeWidth={1.2}
            strokeDasharray="3 7"
            fill="none"
            opacity={0.55}
          />
          <Circle
            cx={100}
            cy={100}
            r={78}
            stroke={TECH_DEEP}
            strokeWidth={0.8}
            strokeDasharray="1 5"
            fill="none"
            opacity={0.28}
          />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 100 + Math.cos(rad) * 82;
            const y1 = 100 + Math.sin(rad) * 82;
            const x2 = 100 + Math.cos(rad) * 92;
            const y2 = 100 + Math.sin(rad) * 92;
            return (
              <Line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={TECH_DEEP}
                strokeWidth={deg % 90 === 0 ? 2 : 1}
                opacity={deg % 90 === 0 ? 0.55 : 0.3}
              />
            );
          })}
        </Svg>
      </Animated.View>

      {/* 内弧：反向旋转 */}
      <Animated.View style={[styles.orbLayer, { transform: [{ rotate: rotateRev }] }]}>
        <Svg width={ORB_SIZE} height={ORB_SIZE} viewBox="0 0 200 200">
          <Path
            d="M100 34 A66 66 0 0 1 166 100"
            stroke={TECH}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
            opacity={0.75}
          />
          <Path
            d="M100 166 A66 66 0 0 1 34 100"
            stroke={TECH}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
            opacity={0.45}
          />
          <Circle cx={166} cy={100} r={3.2} fill={TECH} opacity={0.9} />
          <Circle cx={34} cy={100} r={2.4} fill={TECH} opacity={0.55} />
        </Svg>
      </Animated.View>

      {/* 扫描线 */}
      <Animated.View style={[styles.orbLayer, { transform: [{ rotate: scanRotate }] }]}>
        <Svg width={ORB_SIZE} height={ORB_SIZE} viewBox="0 0 200 200">
          <Path
            d="M100 100 L100 28"
            stroke={TECH}
            strokeWidth={1.6}
            strokeLinecap="round"
            opacity={0.7}
          />
          <Path
            d="M100 100 L118 36 L100 28 L82 36 Z"
            fill={TECH}
            opacity={0.12}
          />
          <Circle cx={100} cy={28} r={2.5} fill={TECH} opacity={0.95} />
        </Svg>
      </Animated.View>

      {/* 十字准星 + 核心 */}
      <View style={styles.orbLayer}>
        <Svg width={ORB_SIZE} height={ORB_SIZE} viewBox="0 0 200 200">
          <Circle cx={100} cy={100} r={42} stroke={TECH_DEEP} strokeWidth={1} fill="none" opacity={0.22} />
          <Line x1={100} y1={70} x2={100} y2={82} stroke={TECH_DEEP} strokeWidth={1.4} opacity={0.45} />
          <Line x1={100} y1={118} x2={100} y2={130} stroke={TECH_DEEP} strokeWidth={1.4} opacity={0.45} />
          <Line x1={70} y1={100} x2={82} y2={100} stroke={TECH_DEEP} strokeWidth={1.4} opacity={0.45} />
          <Line x1={118} y1={100} x2={130} y2={100} stroke={TECH_DEEP} strokeWidth={1.4} opacity={0.45} />
          {/* 角括号 */}
          <Path d="M62 74 L62 62 L74 62" stroke={TECH} strokeWidth={1.5} fill="none" opacity={0.5} />
          <Path d="M138 74 L138 62 L126 62" stroke={TECH} strokeWidth={1.5} fill="none" opacity={0.5} />
          <Path d="M62 126 L62 138 L74 138" stroke={TECH} strokeWidth={1.5} fill="none" opacity={0.5} />
          <Path d="M138 126 L138 138 L126 138" stroke={TECH} strokeWidth={1.5} fill="none" opacity={0.5} />
        </Svg>
      </View>

      <Animated.View
        style={[
          styles.orbCoreGlow,
          { opacity: coreGlow, transform: [{ scale: coreScale }] },
        ]}
      />
      <Animated.View style={[styles.orbCore, { transform: [{ scale: coreScale }] }]} />
      <Animated.View style={[styles.orbBlip, { opacity: blipOpacity }]} />
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { memories, setMemories, setSelectedAgent } = useSessionStore();
  const [promptIndex] = useState(() => Math.floor(Math.random() * featuredPrompts.length));

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroRise = useRef(new Animated.Value(18)).current;
  const ctaScale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroRise, {
        toValue: 0,
        duration: 680,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(ctaScale, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [ctaScale, heroOpacity, heroRise]);

  useFocusEffect(
    useCallback(() => {
      listMemories()
        .then((items) => setMemories(withDiaryDemoMemories(items)))
        .catch(() => setMemories(withDiaryDemoMemories([])));
    }, [setMemories]),
  );

  const openMemory = (item: MemoryItem) => {
    const isDemo = isDiaryDemoId(item.id);
    track('memory_open', {
      memory_id: item.id,
      agent: item.agent_id,
      from: 'home',
    });
    navigation.navigate('Insight', {
      memoryId: item.id,
      imageUri: item.image_url,
      insight: item.insight,
      followupChips: item.insight.next_actions.length
        ? item.insight.next_actions
        : ['更多历史背景', '类似风格有哪些'],
      agentId: item.agent_id,
      entryMode: isDemo ? 'demo' : 'history',
    });
  };

  const openDemo = (item: HomeDemoItem) => {
    track('home_demo_open', {
      demo_id: item.id,
      agent: item.agentId,
    });
    navigation.navigate('Insight', {
      memoryId: item.id,
      imageUri: item.coverUri,
      insight: item.insight,
      followupChips: item.followupChips,
      agentId: item.agentId,
      entryMode: 'demo',
    });
  };

  const goCamera = (agentId?: MemoryItem['agent_id']) => {
    if (agentId) {
      setSelectedAgent(agentId);
    }
    navigation.navigate('Camera');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero：通栏品牌场，非卡片 */}
        <View style={styles.hero}>
          <HeroAgentAura />

          <Animated.View
            style={[
              styles.heroInner,
              {
                opacity: heroOpacity,
                transform: [{ translateY: heroRise }],
              },
            ]}
          >
            <Text style={styles.brandMark}>Vision Agent</Text>
            <Text style={styles.heroTitle}>对准世界，一键理解</Text>
            <Text style={styles.heroSub}>把日常画面交给专项镜头，读出可行动的洞察。</Text>
            <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => goCamera()}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel="开始拍照"
              >
                <Text style={styles.heroBtnText}>开始拍照</Text>
                <Text style={styles.heroBtnArrow}>→</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>

        {/* 换个视角 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>换个视角</Text>
              <Text style={styles.sectionKicker}>点选镜头，直接开拍</Text>
            </View>
            <TouchableOpacity onPress={() => goCamera()} hitSlop={8}>
              <Text style={styles.sectionLink}>探索更多 ›</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.perspectiveRow}>
            {perspectives.map((item) => (
              <TouchableOpacity key={item.id} style={styles.perspectiveItem} onPress={() => goCamera(item.id)}>
                <View
                  style={[
                    styles.perspectiveCircle,
                    {
                      backgroundColor: hasAgentIcon(item.id)
                        ? 'transparent'
                        : getAgentCircleBg(item.id),
                      borderColor: hasAgentIcon(item.id) ? 'transparent' : lightColors.border,
                    },
                  ]}
                >
                  <AgentIcon id={item.id} size={hasAgentIcon(item.id) ? 64 : 40} emojiSize={28} />
                  {item.isNew ? (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.perspectiveLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 出国旅行 Demo */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>出国旅行 · 示例</Text>
            <TouchableOpacity onPress={() => goCamera('menu_translator')}>
              <Text style={styles.sectionLink}>去拍照 ›</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionHint}>点开看药品、路线、酒店、航班怎么解读</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.demoRow}
          >
            {travelHomeDemos.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.demoCard}
                onPress={() => openDemo(item)}
                activeOpacity={0.92}
              >
                <View style={[styles.demoCover, { backgroundColor: getDemoCoverColor(item.agentId) }]}>
                  {item.coverUri.startsWith('http') ? (
                    <Image source={{ uri: item.coverUri }} style={styles.demoCoverImage} />
                  ) : (
                    <AgentIcon id={item.agentId} size={72} emojiSize={36} />
                  )}
                  <View style={styles.demoAgentPill}>
                    <Text style={styles.demoAgentPillText}>{getDemoAgentLabel(item.agentId)}</Text>
                  </View>
                </View>
                <Text style={styles.demoTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.demoSubtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 拍照提示卡 */}
        <TouchableOpacity style={styles.promptCard} onPress={() => goCamera()} activeOpacity={0.9}>
          <View style={styles.promptGrid}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.promptGridCell, i > 1 && styles.promptGridBlur]} />
            ))}
          </View>
          <View style={styles.promptBody}>
            <Text style={styles.promptText}>{featuredPrompts[promptIndex]}</Text>
            <View style={styles.promptBtn}>
              <Text style={styles.promptBtnText}>📷 立即拍照</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 值得细看 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>值得细看</Text>
          {memories.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>还没有视觉记忆，拍第一张吧</Text>
            </View>
          ) : (
            memories.slice(0, 5).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.feedCard}
                onPress={() => openMemory(item)}
                activeOpacity={0.92}
              >
                <Image source={{ uri: item.image_url }} style={styles.feedImage} />
                <View style={styles.feedOverlay}>
                  <Text style={styles.feedTitle}>{item.title}</Text>
                  <Text style={styles.feedMeta}>{item.category}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: lightColors.bg },
  content: { paddingBottom: spacing.xxl },
  hero: {
    minHeight: 288,
    overflow: 'hidden',
    paddingBottom: spacing.md,
  },
  heroWash: {
    ...StyleSheet.absoluteFill,
  },
  agentBlob: {
    position: 'absolute',
  },
  heroReadVeil: {
    ...StyleSheet.absoluteFill,
    width: '72%',
  },
  heroFadeDown: {
    ...StyleSheet.absoluteFill,
  },
  orbWrap: {
    position: 'absolute',
    right: -36,
    top: 28,
    width: ORB_SIZE,
    height: ORB_SIZE,
  },
  orbLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbCoreGlow: {
    position: 'absolute',
    top: ORB_SIZE / 2 - 28,
    left: ORB_SIZE / 2 - 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(42,111,158,0.22)',
  },
  orbCore: {
    position: 'absolute',
    top: ORB_SIZE / 2 - 11,
    left: ORB_SIZE / 2 - 11,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: TECH,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  orbBlip: {
    position: 'absolute',
    top: 46,
    right: 48,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TECH,
    shadowColor: TECH,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  heroInner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    maxWidth: 360,
  },
  brandMark: {
    fontFamily: BRAND_FONT,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#1C344A',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: '#12161C',
    letterSpacing: -0.6,
  },
  heroSub: {
    marginTop: spacing.sm,
    fontSize: 15,
    lineHeight: 22,
    color: '#5A6570',
    maxWidth: 280,
  },
  heroBtn: {
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1C344A',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: radius.full,
  },
  heroBtnText: {
    fontFamily: BRAND_FONT,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroBtnArrow: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.title,
    fontFamily: DISPLAY_FONT,
    fontSize: 22,
    color: lightColors.text,
    letterSpacing: -0.3,
  },
  sectionKicker: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: 2,
  },
  sectionLink: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: 4,
  },
  perspectiveRow: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  perspectiveItem: {
    width: 72,
    alignItems: 'center',
  },
  perspectiveCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  newBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: lightColors.badge,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
  },
  perspectiveLabel: {
    ...typography.caption,
    color: lightColors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
    fontSize: 11,
  },
  sectionHint: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  demoRow: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  demoCard: {
    width: 168,
  },
  demoCover: {
    width: 168,
    height: 120,
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoCoverImage: {
    ...StyleSheet.absoluteFill,
  },
  demoAgentPill: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  demoAgentPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  demoTitle: {
    ...typography.subtitle,
    fontSize: 14,
    color: lightColors.text,
    marginTop: spacing.sm,
  },
  demoSubtitle: {
    ...typography.caption,
    color: lightColors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  promptCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: lightColors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: lightColors.border,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
  },
  promptGrid: {
    width: 72,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  promptGridCell: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
  },
  promptGridBlur: { opacity: 0.45 },
  promptBody: { flex: 1, justifyContent: 'space-between' },
  promptText: {
    ...typography.body,
    color: lightColors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  promptBtn: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    backgroundColor: lightColors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  promptBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: lightColors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: lightColors.textMuted,
  },
  feedCard: {
    marginTop: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    height: 220,
    backgroundColor: lightColors.surface,
  },
  feedImage: { width: '100%', height: '100%' },
  feedOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  feedTitle: {
    ...typography.subtitle,
    color: '#FFFFFF',
  },
  feedMeta: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});
