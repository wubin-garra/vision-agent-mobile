import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FOOD_SCAN_THINKING_GROUPS } from '@/constants/foodScanThinking';
import { lightColors, radius, spacing, typography } from '@/theme';

type Props = {
  visible: boolean;
  imageUri: string;
  completedSteps?: string[];
  onClose: () => void;
};

export function FoodScanThinkingSheet({
  visible,
  imageUri,
  completedSteps,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const doneSet = new Set(completedSteps ?? FOOD_SCAN_THINKING_GROUPS.flatMap((g) => g.steps));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.handle} />

          <View style={styles.imageWrap}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <View style={styles.imageDim} />
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>分析过程</Text>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.groups}>
              {FOOD_SCAN_THINKING_GROUPS.map((group, groupIndex) => (
                <View key={group.id} style={styles.group}>
                  <View style={styles.groupHead}>
                    <View style={styles.checkCircle}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                  </View>

                  <View
                    style={[
                      styles.subSteps,
                      groupIndex < FOOD_SCAN_THINKING_GROUPS.length - 1 && styles.subStepsLine,
                    ]}
                  >
                    {group.steps.map((step) => {
                      const done = doneSet.has(step);
                      return (
                        <View key={step} style={styles.subRow}>
                          <Text style={[styles.subBullet, done && styles.subBulletDone]}>•</Text>
                          <Text style={[styles.subText, done && styles.subTextDone]}>{step}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  backdropTap: {
    flex: 1,
  },
  sheet: {
    backgroundColor: lightColors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: lightColors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  imageWrap: {
    height: 200,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  panel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelTitle: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 17,
  },
  closeBtn: {
    fontSize: 18,
    color: lightColors.textMuted,
    padding: spacing.xs,
  },
  groups: {
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  group: {
    gap: spacing.sm,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  groupTitle: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 16,
  },
  subSteps: {
    marginLeft: 11,
    paddingLeft: spacing.lg,
    gap: spacing.xs,
  },
  subStepsLine: {
    borderLeftWidth: 1,
    borderLeftColor: lightColors.border,
    paddingBottom: spacing.sm,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  subBullet: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 22,
    width: 10,
  },
  subBulletDone: {
    color: lightColors.text,
  },
  subText: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 22,
    flex: 1,
  },
  subTextDone: {
    color: lightColors.text,
  },
});
