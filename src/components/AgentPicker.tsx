import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AGENT_LABELS } from '@/constants/config';
import type { AgentId } from '@/types/insight';
import { colors, radius, spacing, typography } from '@/theme';

interface AgentPickerProps {
  agents?: AgentId[];
  selected: AgentId | null;
  onSelect: (agent: AgentId | null) => void;
}

const DEFAULT_AGENTS: AgentId[] = [
  'general_curiosity',
  'local_guide',
  'art_critic',
  'design_critic',
  'stylist',
  'food_explorer',
  'food_scan',
  'text_reader',
];

export function AgentPicker({ agents = DEFAULT_AGENTS, selected, onSelect }: AgentPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <TouchableOpacity
        style={[styles.chip, !selected && styles.chipActive]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.chipText, !selected && styles.chipTextActive]}>自动</Text>
      </TouchableOpacity>
      {agents.map((agent) => {
        const active = selected === agent;
        return (
          <TouchableOpacity
            key={agent}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(agent)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {AGENT_LABELS[agent] ?? agent}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  chipText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
});
