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
    },
    ref,
  ) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const keyboardVisible = keyboardInset > 0;

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
        },
      ]}
    >
      <View style={styles.inputShell}>
        <Pressable style={styles.inputPressable} onPress={() => inputRef.current?.focus()}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
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
            style={[styles.iconBtn, listening && styles.iconBtnActive]}
            onPress={startListening}
            disabled={loading}
            accessibilityLabel={listening ? '停止语音输入' : '语音输入'}
          >
            <Text style={styles.iconText}>{listening ? '⏹' : '🎤'}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.sendBtn, (loading || !value.trim()) && styles.sendBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading || !value.trim()}
          accessibilityLabel="发送"
        >
          {loading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <Text style={styles.sendText}>↑</Text>
          )}
        </TouchableOpacity>
      </View>
      {listening ? <Text style={styles.listeningHint}>正在聆听…</Text> : null}
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
