import * as Haptics from 'expo-haptics';

export function hapticLight() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticSelection() {
  void Haptics.selectionAsync();
}

export function hapticMedium() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}
