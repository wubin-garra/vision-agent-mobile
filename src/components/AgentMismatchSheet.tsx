import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import type { AgentMismatchInfo } from '@/types/insight';
import { lightColors, radius, spacing, typography } from '@/theme';
import { hapticLight } from '@/utils/haptics';

type Props = {
  visible: boolean;
  mismatch: AgentMismatchInfo | null;
  onRetake: () => void;
  onContinue?: () => void;
  onClose: () => void;
};

function HintIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.5 9.5c0-3 2.4-5.2 5.5-5.2s5.5 2.2 5.5 5.2c0 2.1-1.1 3.4-2.3 4.4-.8.7-1.4 1.3-1.7 2.3h-3c-.3-1.1-.9-1.7-1.7-2.4-1.2-1-2.3-2.3-2.3-4.3Z"
        stroke="#8B8B8B"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M10 19h4" stroke="#8B8B8B" strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={12} cy={12.2} r={1.1} fill="#8B8B8B" />
    </Svg>
  );
}

/**
 * 照片与当前专项镜头不匹配时的引导弹层（参考 Chance「换一张照片试试」）。
 */
export function AgentMismatchSheet({
  visible,
  mismatch,
  onRetake,
  onContinue,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  if (!mismatch) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <HintIcon />
              <Text style={styles.title}>{mismatch.title || '换一张照片试试'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                hapticLight();
                onClose();
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="关闭"
            >
              <Text style={styles.close}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.body}>{mismatch.message}</Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => {
              hapticLight();
              onRetake();
            }}
          >
            <Text style={styles.primaryText}>重新拍照</Text>
          </TouchableOpacity>

          {onContinue ? (
            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.75}
              onPress={() => {
                hapticLight();
                onContinue();
              }}
            >
              <Text style={styles.secondaryText}>继续智能解读</Text>
            </TouchableOpacity>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: lightColors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    ...typography.subtitle,
    fontSize: 18,
    fontWeight: '700',
    color: lightColors.text,
    flexShrink: 1,
  },
  close: {
    fontSize: 28,
    lineHeight: 28,
    color: lightColors.textMuted,
    fontWeight: '300',
    marginTop: -4,
  },
  body: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: lightColors.textMuted,
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    backgroundColor: '#111111',
    borderRadius: radius.full,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    marginTop: spacing.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: lightColors.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
});
