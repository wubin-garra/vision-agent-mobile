import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { lightColors, radius, spacing, typography } from '@/theme';

type Props = {
  visible: boolean;
  deleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteMemoryDialog({ visible, deleting, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={deleting ? undefined : onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>删除历史记录？</Text>
          <Text style={styles.body}>
            这将从你的历史记录中移除此记录。你已发布的快照不会受到影响。
          </Text>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onConfirm}
            disabled={deleting}
            activeOpacity={0.75}
          >
            {deleting ? (
              <ActivityIndicator color={lightColors.danger} size="small" />
            ) : (
              <Text style={styles.deleteText}>删除</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onCancel}
            disabled={deleting}
            activeOpacity={0.75}
          >
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: lightColors.bg,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  title: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: lightColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actionBtn: {
    width: '100%',
    backgroundColor: lightColors.surface,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    minHeight: 48,
  },
  deleteText: {
    ...typography.subtitle,
    color: lightColors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    ...typography.subtitle,
    color: lightColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
