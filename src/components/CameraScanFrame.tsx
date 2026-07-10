import { StyleSheet, View } from 'react-native';

const FRAME_SIZE = 268;
const CORNER_LEN = 44;
const STROKE = 2.5;
const RADIUS = 18;

function Corner({
  style,
}: {
  style: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    borderTopWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
    borderRightWidth?: number;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
  };
}) {
  return <View style={[styles.corner, style]} />;
}

/** Chance 风格四角扫描框 */
export function CameraScanFrame() {
  return (
    <View style={styles.frame} pointerEvents="none">
      <Corner
        style={{
          top: 0,
          left: 0,
          borderTopWidth: STROKE,
          borderLeftWidth: STROKE,
          borderTopLeftRadius: RADIUS,
        }}
      />
      <Corner
        style={{
          top: 0,
          right: 0,
          borderTopWidth: STROKE,
          borderRightWidth: STROKE,
          borderTopRightRadius: RADIUS,
        }}
      />
      <Corner
        style={{
          bottom: 0,
          left: 0,
          borderBottomWidth: STROKE,
          borderLeftWidth: STROKE,
          borderBottomLeftRadius: RADIUS,
        }}
      />
      <Corner
        style={{
          bottom: 0,
          right: 0,
          borderBottomWidth: STROKE,
          borderRightWidth: STROKE,
          borderBottomRightRadius: RADIUS,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'absolute',
    alignSelf: 'center',
    top: '34%',
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  },
  corner: {
    position: 'absolute',
    width: CORNER_LEN,
    height: CORNER_LEN,
    borderColor: 'rgba(255, 255, 255, 0.92)',
  },
});
