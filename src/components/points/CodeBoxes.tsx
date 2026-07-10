import { useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';

import { lightColors, radius, spacing } from '@/theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  editable?: boolean;
  onCopy?: () => void;
};

export function CodeBoxes({
  value,
  onChange,
  length = 6,
  editable = true,
  onCopy,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const chars = value.padEnd(length, ' ').slice(0, length).split('');

  const updateAt = (index: number, char: string) => {
    const next = value.split('');
    next[index] = char;
    onChange(next.join('').slice(0, length));
  };

  const handleKeyPress = (
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (event.nativeEvent.key !== 'Backspace') return;
    if (chars[index]?.trim()) {
      updateAt(index, '');
      return;
    }
    if (index > 0) {
      const prev = value.slice(0, index - 1) + value.slice(index);
      onChange(prev);
    }
  };

  if (!editable) {
    return (
      <View style={styles.row}>
        {chars.map((char, index) => (
          <View key={index} style={styles.box}>
            <Text style={styles.char}>{char.trim() || ' '}</Text>
          </View>
        ))}
        {onCopy ? (
          <Pressable style={styles.copyBtn} onPress={onCopy} hitSlop={8}>
            <Text style={styles.copyIcon}>⧉</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <Pressable style={styles.row} onPress={() => inputRef.current?.focus()}>
      {Array.from({ length }).map((_, index) => (
        <View key={index} style={styles.box}>
          <Text style={styles.char}>{chars[index]?.trim() || '–'}</Text>
        </View>
      ))}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, length))}
        onKeyPress={(event) => handleKeyPress(value.length, event)}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={length}
        style={styles.hiddenInput}
        caretHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  box: {
    width: 44,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: lightColors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  char: {
    fontSize: 20,
    fontWeight: '600',
    color: lightColors.text,
    letterSpacing: 0.5,
  },
  copyBtn: {
    marginLeft: spacing.xs,
    padding: spacing.sm,
  },
  copyIcon: {
    fontSize: 20,
    color: lightColors.textMuted,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});
