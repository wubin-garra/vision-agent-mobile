import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CameraModeItem } from '@/constants/cameraModes';
import { radius, spacing, typography } from '@/theme';
import { hapticLight } from '@/utils/haptics';

type Props = {
  visible: boolean;
  mode: CameraModeItem | null;
  onClose: () => void;
  onTry: () => void;
};

export function AgentDetailSheet({ visible, mode, onClose, onTry }: Props) {
  const insets = useSafeAreaInsets();
  if (!mode) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.handle} />
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              hapticLight();
              onClose();
            }}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>{mode.emoji}</Text>
          </View>
          <Text style={styles.title}>{mode.label}</Text>
          <Text style={styles.handleName}>@VisionAgent</Text>
          <Text style={styles.prompt}>{mode.prompt}</Text>
          <Text style={styles.description}>{mode.description}</Text>

          <TouchableOpacity
            style={styles.tryBtn}
            onPress={() => {
              hapticLight();
              onTry();
            }}
          >
            <Text style={styles.tryBtnText}>试一试</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D1D6',
    marginBottom: spacing.md,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 22,
    lineHeight: 24,
    color: '#8E8E93',
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarEmoji: {
    fontSize: 42,
  },
  title: {
    ...typography.title,
    color: '#111111',
    fontSize: 24,
    marginBottom: 4,
  },
  handleName: {
    ...typography.caption,
    color: '#8E8E93',
    marginBottom: spacing.md,
  },
  prompt: {
    ...typography.body,
    color: '#3A3A3C',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.caption,
    color: '#6B6B73',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  tryBtn: {
    width: '100%',
    backgroundColor: '#111111',
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tryBtnText: {
    ...typography.subtitle,
    color: '#FFFFFF',
    fontSize: 17,
  },
});
