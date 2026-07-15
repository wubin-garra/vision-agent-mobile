import { useEffect, useRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';

import { track, trackScreen } from '@/services/analytics';
import type { RootStackParamList } from '@/types/navigation';

type NavRef = NavigationContainerRef<RootStackParamList> | null;

/** React Navigation v7：手动上报屏幕浏览；冷启动记一次 app_open */
export function useNavigationAnalytics(navigationRef: { current: NavRef }) {
  const routeNameRef = useRef<string | undefined>(undefined);
  const didTrackAppOpen = useRef(false);

  useEffect(() => {
    if (didTrackAppOpen.current) return;
    didTrackAppOpen.current = true;
    track('app_open');
  }, []);

  const onReady = () => {
    const current = navigationRef.current?.getCurrentRoute()?.name;
    routeNameRef.current = current;
    if (current) trackScreen(current);
  };

  const onStateChange = () => {
    const previous = routeNameRef.current;
    const current = navigationRef.current?.getCurrentRoute()?.name;
    if (current && previous !== current) {
      trackScreen(current);
    }
    routeNameRef.current = current;
  };

  return { onReady, onStateChange };
}
