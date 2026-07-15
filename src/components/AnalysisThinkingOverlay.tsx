import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  FOOD_SCAN_INPUT_HINTS,
  FOOD_SCAN_STAGE_LABELS,
  FOOD_SCAN_STAGE_PHRASES,
  FOOD_SCAN_STEP_DETAILS,
  FOOD_SCAN_THINKING_STEPS,
} from '@/constants/foodScanThinking';
import { lightColors, radius, spacing, typography } from '@/theme';

type Props = {
  imageUri: string | null;
  stage?: string;
  thinkingStep?: string;
};

function useRotatingPhrase(phrases: string[], intervalMs = 2200) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (phrases.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [phrases, intervalMs]);

  return phrases[index] ?? phrases[0] ?? '';
}

export function AnalysisThinkingOverlay({ imageUri, stage, thinkingStep }: Props) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const lastStepRef = useRef<string | undefined>(undefined);
  const scanAnim = useRef(new Animated.Value(0.08)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    setCompletedSteps([]);
    lastStepRef.current = undefined;
  }, [imageUri]);

  useEffect(() => {
    if (!thinkingStep || thinkingStep === lastStepRef.current) return;
    lastStepRef.current = thinkingStep;
    setCompletedSteps((prev) =>
      prev.includes(thinkingStep) ? prev : [...prev, thinkingStep],
    );
  }, [thinkingStep]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 0.92,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(scanAnim, {
          toValue: 0.08,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scanAnim]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const stagePhrases =
    FOOD_SCAN_STAGE_PHRASES[stage ?? ''] ?? FOOD_SCAN_STAGE_PHRASES.default;
  const stagePhrase = useRotatingPhrase(stagePhrases, 2400);

  const stepDetails = thinkingStep
    ? FOOD_SCAN_STEP_DETAILS[thinkingStep] ?? []
    : stagePhrases;
  const stepDetail = useRotatingPhrase(stepDetails, 1800);

  const inputHint = useRotatingPhrase(FOOD_SCAN_INPUT_HINTS, 2600);

  const displaySteps = thinkingStep
    ? FOOD_SCAN_THINKING_STEPS.filter(
        (step) => completedSteps.includes(step) || step === thinkingStep,
      )
    : FOOD_SCAN_THINKING_STEPS.slice(0, 1);

  const stageTitle = FOOD_SCAN_STAGE_LABELS[stage ?? ''] ?? '食识拍思考中';

  const scanLeft = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['6%', '94%'],
  });

  return (
    <View style={styles.overlay}>
      {imageUri ? (
        <View style={styles.imageWrap}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          <View style={styles.imageDim} />
          <Animated.View style={[styles.scanTrack, { left: scanLeft }]}>
            <View style={styles.scanLine} />
            <Animated.View style={[styles.scanGlow, { opacity: pulseAnim }]} />
          </Animated.View>
        </View>
      ) : null}

      <View style={styles.panel}>
        <View style={styles.headerRow}>
          <Text style={styles.sparkle}>✦</Text>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle}>{stageTitle}</Text>
            <Text style={styles.headerSubtitle}>{stagePhrase}</Text>
          </View>
        </View>

        <View style={styles.steps}>
          {displaySteps.map((step) => {
            const active = step === thinkingStep;
            const done = completedSteps.includes(step) && !active;
            return (
              <View key={step} style={styles.stepBlock}>
                <View style={styles.stepRow}>
                  <View style={[styles.stepIcon, done && styles.stepIconDone, active && styles.stepIconActive]}>
                    <Text style={[styles.stepIconText, (done || active) && styles.stepIconTextOn]}>
                      {done ? '✓' : active ? '◉' : '○'}
                    </Text>
                  </View>
                  <Text style={[styles.stepText, active && styles.stepTextActive, done && styles.stepTextDone]}>
                    {step}
                  </Text>
                </View>
                {active ? (
                  <Animated.Text style={[styles.stepDetail, { opacity: pulseAnim }]}>
                    · {stepDetail}
                  </Animated.Text>
                ) : null}
              </View>
            );
          })}
        </View>

        <View style={styles.inputMock}>
          <Text style={styles.inputSparkle}>✦</Text>
          <Text style={styles.inputPlaceholder}>{inputHint}</Text>
          <ThinkingDots />
        </View>
      </View>
    </View>
  );
}

function ThinkingDots() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : `${prev}.`));
    }, 420);
    return () => clearInterval(timer);
  }, []);

  return <Text style={styles.dots}>{dots.padEnd(3, ' ')}</Text>;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  imageWrap: {
    flex: 1,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageDim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  scanTrack: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 48,
    marginLeft: -24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  scanGlow: {
    position: 'absolute',
    top: '20%',
    bottom: '20%',
    width: 48,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
  },
  panel: {
    backgroundColor: lightColors.bg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  sparkle: {
    color: '#7C6CFF',
    fontSize: 16,
    marginTop: 2,
  },
  headerTextCol: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 16,
  },
  headerSubtitle: {
    ...typography.caption,
    color: lightColors.textMuted,
    lineHeight: 18,
  },
  steps: {
    gap: spacing.md,
    paddingLeft: spacing.xs,
  },
  stepBlock: {
    gap: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: lightColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconActive: {
    backgroundColor: '#111111',
  },
  stepIconDone: {
    backgroundColor: '#111111',
  },
  stepIconText: {
    fontSize: 10,
    color: lightColors.textMuted,
    fontWeight: '700',
  },
  stepIconTextOn: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  stepText: {
    ...typography.body,
    color: lightColors.textMuted,
    fontSize: 15,
    flex: 1,
  },
  stepTextActive: {
    color: lightColors.text,
    fontWeight: '600',
  },
  stepTextDone: {
    color: lightColors.text,
  },
  stepDetail: {
    ...typography.caption,
    color: lightColors.textMuted,
    paddingLeft: 30,
    lineHeight: 18,
  },
  inputMock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: lightColors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  inputSparkle: {
    color: lightColors.textMuted,
    fontSize: 14,
  },
  inputPlaceholder: {
    ...typography.body,
    color: lightColors.textMuted,
    flex: 1,
  },
  dots: {
    ...typography.body,
    color: lightColors.textMuted,
    width: 18,
    textAlign: 'left',
  },
});
