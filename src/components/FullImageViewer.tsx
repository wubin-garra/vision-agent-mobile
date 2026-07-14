import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/theme';

type Props = {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
};

export function FullImageViewer({ visible, imageUri, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View
          style={[
            styles.frame,
            {
              paddingTop: insets.top + spacing.sm,
              paddingBottom: insets.bottom + spacing.sm,
            },
          ]}
        >
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  frame: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
