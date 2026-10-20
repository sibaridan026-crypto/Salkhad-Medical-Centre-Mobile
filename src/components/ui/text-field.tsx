import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { Radius, Spacing, textAlignment, rowDirection, Typography } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';
import { Icon, type IconName } from '../icon';

/**
 * Text field.
 *
 * One component covers single-line inputs, passwords (set `secureTextEntry`)
 * and multi-line notes (set `multiline`). It owns focus styling, error styling,
 * an optional leading icon, a required marker, helper/error text, and — for
 * passwords — the show/hide affordance.
 *
 * The label, helper and error text all follow the reading direction, and the
 * leading icon flips side automatically in Arabic.
 */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  error,
  leadingIcon,
  secureTextEntry = false,
  disabled = false,
  multiline = false,
  required = false,
  keyboardType,
  autoCapitalize = 'none',
  maxLength,
  testID,
}: {
  label?: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  helper?: string;
  error?: string;
  leadingIcon?: IconName;
  secureTextEntry?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  testID?: string;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  const borderColor = error
    ? c.danger
    : focused
      ? c.primary
      : c.border;

  return (
    <View style={styles.wrap}>
      {label ? (
        <View style={[styles.labelRow, { flexDirection: rowDirection(isRTL) }]}>
          <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
          {required ? <Text style={[styles.required, { color: c.danger }]}>*</Text> : null}
        </View>
      ) : null}

      <View
        style={[
          styles.field,
          {
            backgroundColor: disabled ? c.coolGray : c.surface,
            borderColor,
            minHeight: multiline ? 104 : theme.layout.searchFieldHeight,
            alignItems: multiline ? 'flex-start' : 'center',
          },
          !disabled && theme.shadows.field,
        ]}
      >
        {leadingIcon ? (
          <Icon name={leadingIcon} size={theme.iconSize.md} color={c.textMuted} />
        ) : null}

        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={c.textMuted}
          secureTextEntry={hidden}
          editable={!disabled}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          style={[
            styles.input,
            {
              color: c.text,
              textAlign: textAlignment(isRTL),
              paddingTop: multiline ? Spacing.md : 0,
            },
          ]}
        />

        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            onPress={() => setHidden((prev) => !prev)}
            hitSlop={8}
          >
            <Icon
              name={hidden ? 'eye-off' : 'eye'}
              size={theme.iconSize.md}
              color={c.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.helper, { color: c.danger, textAlign: textAlignment(isRTL) }]}>
          {error}
        </Text>
      ) : helper ? (
        <Text style={[styles.helper, { color: c.textMuted, textAlign: textAlignment(isRTL) }]}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs, alignSelf: 'stretch' },
  labelRow: { alignItems: 'center', gap: 2 },
  label: { ...Typography.caption, fontWeight: '600' },
  required: { ...Typography.caption, fontWeight: '700' },
  field: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    minWidth: 0,
    ...Typography.body,
    paddingVertical: 0,
  },
  helper: { ...Typography.caption },
});
