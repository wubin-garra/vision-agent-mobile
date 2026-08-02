import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * 触感封装：
 * - iOS：Impact / Selection
 * - Android：优先 performAndroidHapticsAsync（系统推荐，不依赖旧 Vibrator 模拟）
 * - 模块不可用 / Web / 模拟器：静默跳过
 */
async function safe(run: () => Promise<void>) {
  try {
    await run();
  } catch {
    // UnavailabilityError / 无震动硬件等
  }
}

export function hapticLight() {
  void safe(async () => {
    if (Platform.OS === 'android') {
      await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Keyboard_Tap);
      return;
    }
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  });
}

export function hapticSelection() {
  void safe(async () => {
    if (Platform.OS === 'android') {
      await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Segment_Tick);
      return;
    }
    if (Platform.OS === 'ios') {
      await Haptics.selectionAsync();
    }
  });
}

export function hapticMedium() {
  void safe(async () => {
    if (Platform.OS === 'android') {
      await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm);
      return;
    }
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  });
}
