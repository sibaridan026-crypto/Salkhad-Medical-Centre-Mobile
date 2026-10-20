import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography, rowDirection } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';
import { Icon } from '../icon';

/**
 * Booking stepper.
 *
 * Shows where the patient is in a multi-step flow. Completed steps take the
 * accent fill with a check, the current step is outlined in the accent, and
 * upcoming steps stay quiet. The connector and order follow the reading
 * direction, so the sequence runs right-to-left in Arabic.
 */
export function ProgressSteps({
  steps,
  current,
}: {
  steps: readonly string[];
  /** 0-based index of the active step. */
  current: number;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;

  return (
    <View style={[styles.row, { flexDirection: rowDirection(isRTL) }]}>
      {steps.map((step, index) => {
        const completed = index < current;
        const active = index === current;
        return (
          <View
            key={step}
            style={[styles.item, { flexDirection: rowDirection(isRTL) }]}
          >
            <View style={styles.column}>
              <View
                style={[
                  styles.dot,
                  completed && { backgroundColor: c.primary, borderColor: c.primary },
                  active && { backgroundColor: c.primarySurface, borderColor: c.primary },
                  !completed && !active && { backgroundColor: c.surface, borderColor: c.borderStrong },
                ]}
              >
                {completed ? (
                  <Icon name="check" size={14} color={c.onPrimary} />
                ) : (
                  <Text
                    style={[
                      styles.dotText,
                      { color: active ? c.primary : c.textMuted },
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[styles.label, { color: active || completed ? c.text : c.textMuted }]}
                numberOfLines={1}
              >
                {step}
              </Text>
            </View>

            {index < steps.length - 1 ? (
              <View
                style={[
                  styles.connector,
                  { backgroundColor: completed ? c.primary : c.borderStrong },
                ]}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'flex-start' },
  item: { flex: 1, alignItems: 'flex-start' },
  column: { alignItems: 'center', gap: Spacing.xs, flex: 1 },
  dot: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: { ...Typography.micro, fontWeight: '700' },
  label: { ...Typography.micro, textAlign: 'center' },
  connector: {
    height: 2,
    flex: 1,
    marginTop: 14,
    marginHorizontal: 2,
    borderRadius: 1,
  },
});
