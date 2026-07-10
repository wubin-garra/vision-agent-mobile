import Constants from 'expo-constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';

interface UseSpeechInputOptions {
  locale?: string;
  onTranscript?: (text: string) => void;
}

type SpeechRecognitionModule = {
  isRecognitionAvailable: () => boolean;
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  start: (options: Record<string, unknown>) => void;
  stop: () => void;
  addListener: (event: string, callback: (payload: never) => void) => { remove: () => void };
};

type SpeechPackage = {
  ExpoSpeechRecognitionModule: SpeechRecognitionModule;
};

let speechPackage: SpeechPackage | null | undefined;

/** Expo Go 不含原生语音识别模块，避免在启动时加载。 */
export const isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  Constants.appOwnership === 'expo';

function loadSpeechPackage(): SpeechPackage | null {
  if (speechPackage !== undefined) {
    return speechPackage;
  }

  if (isExpoGo) {
    speechPackage = null;
    return null;
  }

  try {
    // 仅在非 Expo Go 环境按需加载，避免启动时崩溃
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    speechPackage = require('expo-speech-recognition') as SpeechPackage;
    return speechPackage;
  } catch {
    speechPackage = null;
    return null;
  }
}

export function useSpeechInput({ locale = 'zh-CN', onTranscript }: UseSpeechInputOptions = {}) {
  const [listening, setListening] = useState(false);
  const onTranscriptRef = useRef(onTranscript);
  const listenersRef = useRef<Array<{ remove: () => void }>>([]);

  const speechLang = locale.startsWith('zh') ? 'zh-CN' : 'en-US';

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const cleanupListeners = useCallback(() => {
    listenersRef.current.forEach((listener) => listener.remove());
    listenersRef.current = [];
  }, []);

  useEffect(() => cleanupListeners, [cleanupListeners]);

  const startListening = useCallback(async () => {
    const pkg = loadSpeechPackage();
    if (!pkg) {
      Alert.alert(
        '语音输入不可用',
        'Expo Go 不支持语音输入。请使用开发版 App：\nnpx expo run:android',
      );
      return;
    }

    const module = pkg.ExpoSpeechRecognitionModule;

    try {
      if (!module.isRecognitionAvailable()) {
        Alert.alert('语音输入不可用', '当前设备不支持语音识别。');
        return;
      }
    } catch {
      Alert.alert('语音输入不可用', '语音识别模块未就绪，请使用开发版 App 重新构建。');
      return;
    }

    if (listening) {
      module.stop();
      setListening(false);
      cleanupListeners();
      return;
    }

    const permission = await module.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('需要麦克风权限', '请在系统设置中允许使用麦克风和语音识别。');
      return;
    }

    cleanupListeners();
    listenersRef.current = [
      module.addListener('start', () => setListening(true)),
      module.addListener('end', () => {
        setListening(false);
        cleanupListeners();
      }),
      module.addListener('result', (event: { results: Array<{ transcript?: string }> }) => {
        const transcript = event.results[0]?.transcript?.trim();
        if (transcript) {
          onTranscriptRef.current?.(transcript);
        }
      }),
      module.addListener('error', (event: { error?: string }) => {
        setListening(false);
        cleanupListeners();
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error);
        }
      }),
    ];

    module.start({
      lang: speechLang,
      interimResults: true,
      continuous: false,
      addsPunctuation: true,
    });
  }, [cleanupListeners, listening, speechLang]);

  const stopListening = useCallback(() => {
    const pkg = loadSpeechPackage();
    pkg?.ExpoSpeechRecognitionModule.stop();
    setListening(false);
    cleanupListeners();
  }, [cleanupListeners]);

  return {
    listening,
    voiceAvailable: !isExpoGo,
    startListening,
    stopListening,
  };
}
