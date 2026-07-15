import { Alert, Linking } from 'react-native';
import * as Location from 'expo-location';

import { track } from '@/services/analytics';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

/** 判断追问是否在问附近餐厅/地点（需要定位） */
export function looksLikeNearbyQuery(question: string): boolean {
  const q = question.trim();
  if (!q) return false;
  return /附近|周边|周围|旁边|这附近|附近有|本地|当地|nearby|around\b|near me/i.test(q);
}

function confirmLocationPrompt(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      '需要位置权限',
      '你正在询问附近餐厅或地点，开启定位后可给出更准确的本地推荐。',
      [
        { text: '暂不', style: 'cancel', onPress: () => resolve(false) },
        { text: '开启定位', onPress: () => resolve(true) },
      ],
    );
  });
}

async function readCurrentPosition(): Promise<GeoCoordinates | null> {
  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return null;
  }
}

export async function getCurrentCoordinates(): Promise<GeoCoordinates | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    return readCurrentPosition();
  } catch {
    return null;
  }
}

/**
 * 附近类追问专用：先说明用途并征得同意，再请求系统定位权限并取坐标。
 * - 已授权：直接取位置，不再弹确认框
 * - 未授权：先弹「开启定位」确认，再走系统权限；拒绝则引导去设置
 */
export async function ensureLocationForNearby(): Promise<GeoCoordinates | null> {
  try {
    const current = await Location.getForegroundPermissionsAsync();

    if (current.status === 'granted') {
      return readCurrentPosition();
    }

    const accepted = await confirmLocationPrompt();
    if (!accepted) {
      track('location_prompt', { result: 'deny_prompt', context: 'nearby_followup' });
      return null;
    }

    track('location_prompt', { result: 'accept_prompt', context: 'nearby_followup' });

    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      track('location_prompt', { result: 'grant', context: 'nearby_followup' });
      return readCurrentPosition();
    }

    track('location_prompt', {
      result: 'deny_system',
      context: 'nearby_followup',
      can_ask_again: canAskAgain !== false,
    });

    Alert.alert(
      '无法获取位置',
      canAskAgain === false
        ? '定位权限已被关闭。请在系统设置中允许 Vision Agent 使用位置，以便推荐附近餐厅。'
        : '未获得位置权限，附近推荐可能不够准确。',
      canAskAgain === false
        ? [
            { text: '取消', style: 'cancel' },
            { text: '去设置', onPress: () => Linking.openSettings() },
          ]
        : [{ text: '知道了' }],
    );
    return null;
  } catch {
    return null;
  }
}
