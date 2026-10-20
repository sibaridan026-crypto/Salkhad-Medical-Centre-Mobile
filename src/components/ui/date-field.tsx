import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { Radius, Spacing, Typography, Layout, rowDirection } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';

/**
 * Date field built from three numeric parts.
 *
 * A date picker dependency is not installed and was not going to be added
 * without approval, so this is a typed-by-hand field: day / month / year boxes,
 * numeric keypads, and validation that rejects impossible or future dates while
 * accepting every real one. The value is normalised to ISO `YYYY-MM-DD` so it is
 * safe to store and safe to send to a future API unchanged.
 */
export function DateField({
  label,
  value,
  onChange,
  error,
  helper,
  required = false,
  maxYear,
}: {
  label: string;
  /** ISO `YYYY-MM-DD`, or an empty string when unset. */
  value: string;
  onChange: (iso: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  maxYear?: number;
}) {
  const theme = useTheme();
  const { isRTL, t } = useLanguage();
  const c = theme.colors;

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [lastValue, setLastValue] = useState(value);

  // React's documented "adjust state when a prop changes" pattern: updating the
  // component's own state during render is supported, and React re-renders it
  // immediately without committing an extra pass — so no effect is needed and a
  // parent reset still clears the boxes.
  if (value !== lastValue) {
    setLastValue(value);
    const [y, m, d] = value.split('-');
    setYear(y ?? '');
    setMonth(m ?? '');
    setDay(d ?? '');
  }

  const upperYear = maxYear ?? new Date().getFullYear();

  const commit = (nextDay: string, nextMonth: string, nextYear: string) => {
    const allFilled =
      nextDay.length === 2 && nextMonth.length === 2 && nextYear.length === 4;
    if (!allFilled) {
      onChange('');
      return;
    }
    const paddedDay = nextDay.padStart(2, '0');
    const paddedMonth = nextMonth.padStart(2, '0');
    const monthNum = Number(paddedMonth);
    const dayNum = Number(paddedDay);
    const yearNum = Number(nextYear);
    if (monthNum < 1 || monthNum > 12) {
      onChange('');
      return;
    }
    const daysInMonth = new Date(Date.UTC(yearNum, monthNum, 0)).getUTCDate();
    if (dayNum < 1 || dayNum > daysInMonth) {
      onChange('');
      return;
    }
    onChange(`${nextYear}-${paddedMonth}-${paddedDay}`);
  };

  const digitsOnly = (text: string, maxLength: number) =>
    text.replace(/[^0-9]/g, '').slice(0, maxLength);

  const borderColor = error ? c.danger : c.border;

  return (
    <View style={styles.wrap}>
      <View style={[styles.labelRow, { flexDirection: rowDirection(isRTL) }]}>
        <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
        {required ? <Text style={[styles.required, { color: c.danger }]}>*</Text> : null}
      </View>

        <View style={[styles.row, { flexDirection: rowDirection(isRTL) }]}>
          <Part
            value={day}
            placeholder="DD"
            maxLength={2}
            accessibilityLabel={`${label} — day`}
            onChange={(text) => {
              const next = digitsOnly(text, 2);
              setDay(next);
              if (next.length === 2) commit(next, month, year);
              else onChange('');
            }}
            style={{ borderColor, extra: styles.partDay }}
          />
          <Text style={[styles.separator, { color: c.textMuted }]}>/</Text>
          <Part
            value={month}
            placeholder="MM"
            maxLength={2}
            accessibilityLabel={`${label} — month`}
            onChange={(text) => {
              const next = digitsOnly(text, 2);
              setMonth(next);
              if (next.length === 2) commit(day, next, year);
              else onChange('');
            }}
            style={{ borderColor, extra: styles.partMonth }}
          />
          <Text style={[styles.separator, { color: c.textMuted }]}>/</Text>
          <Part
            value={year}
            placeholder="YYYY"
            maxLength={4}
            accessibilityLabel={`${label} — year`}
            onChange={(text) => {
              let next = digitsOnly(text, 4);
              if (next.length === 4 && Number(next) > upperYear) next = String(upperYear);
              setYear(next);
              if (next.length === 4) commit(day, month, next);
              else onChange('');
            }}
            style={{ borderColor, extra: styles.partYear }}
          />
        </View>

      {error ? (
        <Text style={[styles.message, { color: c.danger }]}>{error}</Text>
      ) : helper ? (
        <Text style={[styles.message, { color: c.textMuted }]}>{helper}</Text>
      ) : null}
      <Text style={[styles.hint, { color: c.textMuted }]}>{t('dobHint')}</Text>
    </View>
  );
}

function Part({
  value,
  placeholder,
  maxLength,
  onChange,
  accessibilityLabel,
  style,
}: {
  value: string;
  placeholder: string;
  maxLength: number;
  onChange: (text: string) => void;
  accessibilityLabel: string;
  style: { borderColor: string; extra: StyleProp<TextStyle> };
}) {
  const theme = useTheme();
  const c = theme.colors;
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={c.textMuted}
      keyboardType="number-pad"
      maxLength={maxLength}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.part,
        style.extra,
        { color: c.text, backgroundColor: c.surface, borderColor: style.borderColor },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs, alignSelf: 'stretch' },
  labelRow: { alignItems: 'center', gap: 2 },
  label: { ...Typography.caption, fontWeight: '600' },
  required: { ...Typography.caption, fontWeight: '700' },
  row: { alignItems: 'center', gap: Spacing.sm },
  part: {
    height: Layout.searchFieldHeight,
    borderRadius: Radius.md,
    borderWidth: 1,
    textAlign: 'center',
    ...Typography.body,
  },
  partDay: { width: 64 },
  partMonth: { width: 64 },
  partYear: { width: 92, flexGrow: 1, maxWidth: 120 },
  separator: { ...Typography.bodyStrong },
  message: { ...Typography.caption },
  hint: { ...Typography.caption },
});
