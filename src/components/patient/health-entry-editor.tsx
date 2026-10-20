import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Spacing, Typography, textAlignment } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';
import {
  createEntry,
  entryText,
  isEntryValid,
  type HealthEntry,
  type HealthSection,
} from '@/services/health-profile';

/**
 * Repeatable entry editor for one health-profile category.
 *
 * Used by both the first-time onboarding steps and the editable health profile,
 * so the two share one behaviour: a patient may add several entries, remove
 * them, or state explicitly that the category is empty. "None" is a distinct,
 * recorded answer — it is never inferred from an empty list, and ticking it
 * clears the entries so the saved value cannot say both things at once.
 */
export function HealthEntryEditor<TEntry extends HealthEntry>({
  section,
  onChange,
  nameLabel,
  detailLabel,
  extraField,
  addLabel,
  noneLabel,
  noneHint,
  disabled = false,
}: {
  section: HealthSection<TEntry>;
  onChange: (next: HealthSection<TEntry>) => void;
  nameLabel: string;
  detailLabel: string;
  /** Optional third field, e.g. the surgery date or the medication dosage. */
  extraField?: {
    key: string;
    label: string;
  };
  addLabel: string;
  noneLabel: string;
  noneHint: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const c = theme.colors;
  const align = { textAlign: textAlignment(isRTL) } as const;

  const extraKey = extraField?.key;

  const readExtra = (entry: TEntry): string =>
    entryText((entry as Record<string, unknown>)[extraKey ?? '']);

  const setNone = (none: boolean) => {
    onChange({ entries: none ? [] : section.entries, none, answered: true });
  };

  const addEntry = () => {
    // `createEntry` returns a complete entry (label, detail and the optional
    // extra field all present and empty), so the stored shape always matches
    // `HealthEntry` and no field can be read as `undefined`.
    onChange({
      entries: [...section.entries, createEntry(extraKey) as TEntry],
      none: false,
      answered: true,
    });
  };

  const patchEntry = (id: string, patch: Record<string, unknown>) => {
    onChange({
      entries: section.entries.map((entry) =>
        entry.id === id ? ({ ...entry, ...patch } as TEntry) : entry,
      ),
      none: false,
      answered: true,
    });
  };

  const removeEntry = (id: string) => {
    onChange({
      entries: section.entries.filter((entry) => entry.id !== id),
      none: section.none,
      answered: true,
    });
  };

  return (
    <View style={styles.wrap}>
      <NoneToggle
        checked={section.none}
        label={noneLabel}
        hint={noneHint}
        disabled={disabled}
        removeLabel={t('remove')}
        onToggle={() => setNone(!section.none)}
      />

      {section.none ? null : (
        <View style={styles.entries}>
          {section.entries.map((entry, index) => (
            <View key={entry.id} style={[styles.entry, { borderColor: c.border }]}>
              <View style={[styles.entryHead, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.entryIndex, align, { color: c.textMuted }]}>{index + 1}</Text>
                <View style={styles.entryHeadSpacer} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('remove')}
                  hitSlop={8}
                  disabled={disabled}
                  onPress={() => removeEntry(entry.id)}
                  style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
                >
                  <Icon name="trash-can-outline" size={18} color={c.danger} />
                </Pressable>
              </View>

              <EntryInput
                label={nameLabel}
                value={entryText(entry.label)}
                invalid={!isEntryValid(entry)}
                disabled={disabled}
                onChange={(label) => patchEntry(entry.id, { label })}
              />
              <EntryInput
                label={detailLabel}
                value={entryText(entry.detail)}
                disabled={disabled}
                multiline
                onChange={(detail) => patchEntry(entry.id, { detail })}
              />
              {extraField ? (
                <EntryInput
                  label={extraField.label}
                  value={readExtra(entry)}
                  disabled={disabled}
                  onChange={(text) => patchEntry(entry.id, { [extraField.key]: text })}
                />
              ) : null}
            </View>
          ))}

          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={addEntry}
            style={({ pressed }) => [
              styles.add,
              { borderColor: c.lavenderBorder, backgroundColor: pressed ? c.lavender : c.surface },
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Icon name="plus-circle-outline" size={20} color={c.primary} />
            <Text style={[styles.addLabel, align, { color: c.primary }]}>{addLabel}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function NoneToggle({
  checked,
  label,
  hint,
  disabled,
  removeLabel,
  onToggle,
}: {
  checked: boolean;
  label: string;
  hint: string;
  disabled: boolean;
  removeLabel: string;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onToggle}
      style={[
        styles.none,
        {
          borderColor: checked ? c.primary : c.borderStrong,
          backgroundColor: checked ? c.primarySurface : c.surface,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      <Icon
        name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
        size={22}
        color={checked ? c.primary : c.textMuted}
      />
      <View style={styles.noneText}>
        <Text style={[styles.noneLabel, { color: c.text, textAlign: textAlignment(isRTL) }]}>
          {label}
        </Text>
        <Text style={[styles.noneHint, { color: c.textMuted, textAlign: textAlignment(isRTL) }]}>
          {hint}
        </Text>
      </View>
      {checked ? <Text style={[styles.clear, { color: c.textMuted }]}>{removeLabel}</Text> : null}
    </Pressable>
  );
}

function EntryInput({
  label,
  value,
  onChange,
  disabled,
  multiline = false,
  invalid = false,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  disabled: boolean;
  multiline?: boolean;
  invalid?: boolean;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: disabled ? c.coolGray : c.surface,
            borderColor: invalid ? c.danger : focused ? c.primary : c.borderStrong,
            minHeight: multiline ? 76 : 46,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={c.textMuted}
          textAlign={textAlignment(isRTL)}
          accessibilityLabel={label}
          style={[styles.input, { color: c.text, paddingTop: multiline ? Spacing.sm : 0 }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md },
  none: {
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  noneText: { flex: 1, minWidth: 0, gap: 1 },
  noneLabel: { ...Typography.bodyStrong },
  noneHint: { ...Typography.caption },
  clear: { ...Typography.micro },
  entries: { gap: Spacing.md },
  entry: { borderWidth: 1, borderRadius: 14, padding: Spacing.md, gap: Spacing.sm },
  entryHead: { alignItems: 'center', gap: Spacing.sm },
  entryHeadSpacer: { flex: 1 },
  entryIndex: { ...Typography.caption, fontWeight: '700' },
  iconButton: { padding: 6, borderRadius: 999 },
  iconButtonPressed: { backgroundColor: 'rgba(210,69,91,0.10)' },
  field: { gap: 4 },
  fieldLabel: { ...Typography.caption, fontWeight: '600' },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  input: { ...Typography.body, flex: 1 },
  add: {
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  addLabel: { ...Typography.bodyStrong },
});
