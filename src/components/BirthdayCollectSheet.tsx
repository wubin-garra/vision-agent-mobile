import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { lightColors, radius, spacing, typography } from '@/theme';
import { hapticLight } from '@/utils/haptics';

type Props = {
  visible: boolean;
  initialBirthday?: string | null;
  onConfirm: (birthday: string) => void;
  onSkip: () => void;
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function parseBirthday(value?: string | null): { year: number; month: number; day: number } {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return { year: y!, month: m!, day: d! };
  }
  return { year: 2000, month: 1, day: 1 };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDisplay(year: number, month: number, day: number): string {
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

function WheelColumn({
  values,
  selected,
  onSelect,
}: {
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
}) {
  return (
    <ScrollView style={styles.wheel} showsVerticalScrollIndicator={false}>
      {values.map((value) => {
        const active = value === selected;
        return (
          <TouchableOpacity
            key={value}
            style={[styles.wheelItem, active && styles.wheelItemActive]}
            onPress={() => {
              hapticLight();
              onSelect(value);
            }}
          >
            <Text style={[styles.wheelText, active && styles.wheelTextActive]}>
              {value}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export function BirthdayCollectSheet({
  visible,
  initialBirthday,
  onConfirm,
  onSkip,
}: Props) {
  const insets = useSafeAreaInsets();
  const initial = useMemo(() => parseBirthday(initialBirthday), [initialBirthday]);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const next = parseBirthday(initialBirthday);
    setYear(next.year);
    setMonth(next.month);
    setDay(next.day);
    setPickerOpen(false);
  }, [visible, initialBirthday]);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: current - 1940 + 1 }, (_, i) => current - i);
  }, []);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const maxDay = daysInMonth(year, month);
  const days = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => i + 1),
    [maxDay],
  );

  const safeDay = Math.min(day, maxDay);
  const birthdayIso = `${year}-${pad2(month)}-${pad2(safeDay)}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onSkip}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onSkip} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <Text style={styles.title}>更清晰地看见自己。</Text>
          <Text style={styles.subtitle}>
            你的生日能结合星座与命理，让手相解读更加精准。
          </Text>

          <TouchableOpacity
            style={styles.dateField}
            activeOpacity={0.85}
            onPress={() => {
              hapticLight();
              setPickerOpen((open) => !open);
            }}
          >
            <Text style={styles.calendarIcon}>📅</Text>
            <Text style={styles.dateText}>{formatDisplay(year, month, safeDay)}</Text>
            <Text style={styles.chevron}>⌄</Text>
          </TouchableOpacity>

          {pickerOpen ? (
            <View style={styles.pickerRow}>
              <WheelColumn
                values={years}
                selected={year}
                onSelect={(value) => {
                  setYear(value);
                  setDay((d) => Math.min(d, daysInMonth(value, month)));
                }}
              />
              <WheelColumn
                values={months}
                selected={month}
                onSelect={(value) => {
                  setMonth(value);
                  setDay((d) => Math.min(d, daysInMonth(year, value)));
                }}
              />
              <WheelColumn
                values={days}
                selected={safeDay}
                onSelect={setDay}
              />
            </View>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => {
                hapticLight();
                onSkip();
              }}
            >
              <Text style={styles.skipText}>跳过</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                hapticLight();
                onConfirm(birthdayIso);
              }}
            >
              <Text style={styles.confirmText}>确认</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backdropTap: {
    flex: 1,
  },
  sheet: {
    backgroundColor: lightColors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 26,
    color: lightColors.text,
    lineHeight: 34,
  },
  subtitle: {
    ...typography.body,
    color: lightColors.textMuted,
    lineHeight: 22,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: lightColors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  calendarIcon: {
    fontSize: 16,
  },
  dateText: {
    ...typography.body,
    color: lightColors.text,
    flex: 1,
  },
  chevron: {
    ...typography.body,
    color: lightColors.textMuted,
    fontSize: 18,
  },
  pickerRow: {
    flexDirection: 'row',
    height: 140,
    gap: spacing.sm,
  },
  wheel: {
    flex: 1,
    backgroundColor: lightColors.surface,
    borderRadius: radius.md,
  },
  wheelItem: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  wheelItemActive: {
    backgroundColor: lightColors.accentSoft,
  },
  wheelText: {
    ...typography.body,
    color: lightColors.textMuted,
  },
  wheelTextActive: {
    color: lightColors.text,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  skipBtn: {
    flex: 1,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: lightColors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: lightColors.bg,
  },
  skipText: {
    ...typography.subtitle,
    color: lightColors.text,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: lightColors.text,
  },
  confirmText: {
    ...typography.subtitle,
    color: '#FFFFFF',
  },
});
