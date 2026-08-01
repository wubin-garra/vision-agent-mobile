import { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AgentTheme } from '@/constants/agentThemes';
import { useSpeechInput } from '@/hooks/useSpeechInput';
import { colors, radius, spacing, typography } from '@/theme';

interface InsightInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onFocus?: () => void;
  loading?: boolean;
  placeholder?: string;
  locale?: string;
  keyboardInset?: number;
  /** 智能体主题：输入壳 / 发送钮 / 文字色 */
  theme?: AgentTheme;
}

export type InsightInputBarHandle = {
  focus: () => void;
};

export const InsightInputBar = forwardRef<InsightInputBarHandle, InsightInputBarProps>(
  function InsightInputBar(
    {
      value,
      onChangeText,
      onSubmit,
      onFocus,
      loading = false,
      placeholder = '有什么想问的尽管说…',
      locale = 'zh-CN',
      keyboardInset = 0,
      theme,
    },
    ref,
  ) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const keyboardVisible = keyboardInset > 0;

  const shellBg = theme?.inputShell ?? colors.surface;
  const borderColor = theme?.border ?? colors.border;
  const textColor = theme?.inputText ?? colors.text;
  const placeholderColor = theme?.inputPlaceholder ?? colors.textMuted;
  const sendBg = theme?.sendBtn ?? colors.accent;
  const sendText = theme?.sendBtnText ?? colors.text;
  const dockBg = theme?.dockBg ?? colors.bg;
  const accent = theme?.accent ?? colors.accent;

  useImperativeHandle(ref, () => ({
    focus: () => {
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          inputRef.current?.focus();
        }, Platform.OS === 'android' ? 80 : 40);
      });
    },
  }));

  const { listening, voiceAvailable, startListening } = useSpeechInput({
    locale,
    onTranscript: (text) => {
      onChangeText(text);
      inputRef.current?.focus();
    },
  });

  const handleSubmit = () => {
    if (!value.trim() || loading) return;
    Keyboard.dismiss();
    onSubmit();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: keyboardVisible
            ? spacing.sm
            : Math.max(insets.bottom, spacing.sm),
          backgroundColor: dockBg,
          borderTopColor: borderColor,
        },
      ]}
    >
      <View
        style={[
          styles.inputShell,
          { backgroundColor: shellBg, borderColor },
        ]}
      >
        <Pressable style={styles.inputPressable} onPress={() => inputRef.current?.focus()}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: textColor }]}
            placeholder={placeholder}
            placeholderTextColor={placeholderColor}
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={handleSubmit}
            onFocus={onFocus}
            returnKeyType="send"
            multiline
            maxLength={500}
            blurOnSubmit={false}
            showSoftInputOnFocus
            textAlignVertical="center"
            editable={!loading}
          />
        </Pressable>
        {voiceAvailable ? (
          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: theme?.surfaceElevated ?? colors.surfaceElevated },
              listening && styles.iconBtnActive,
            ]}
            onPress={startListening}
            disabled={loading}
            accessibilityLabel={listening ? '停止语音输入' : '语音输入'}
          >
            <Text style={styles.iconText}>{listening ? '⏹' : '🎤'}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: sendBg },
            (loading || !value.trim()) && styles.sendBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || !value.trim()}
          accessibilityLabel="发送"
        >
          {loading ? (
            <ActivityIndicator color={sendText} size="small" />
          ) : (
            <Text style={[styles.sendText, { color: sendText }]}>↑</Text>
          )}
        </TouchableOpacity>
      </View>
      {listening ? (
        <Text style={[styles.listeningHint, { color: accent }]}>正在聆听…</Text>
      ) : null}
    </View>
  );
  },
);

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    minHeight: 48,
  },
  inputPressable: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    maxHeight: 120,
    minHeight: 36,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  iconBtnActive: {
    backgroundColor: colors.danger,
  },
  iconText: {
    fontSize: 16,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: -2,
  },
  listeningHint: {
    ...typography.caption,
    color: colors.accent,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
