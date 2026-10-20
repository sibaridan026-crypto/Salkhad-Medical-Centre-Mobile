import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography } from '@/constants/brand';
import { useTheme } from '@/theme';
import { Button, type ButtonVariant } from './button';

/**
 * Centered dialog for confirmations and short decisions.
 *
 * Built on the platform modal so Android back and iOS presentation behave
 * natively. The action is always an explicit pair of buttons; tapping the scrim
 * dismisses, matching platform expectations.
 */
export function Dialog({
  visible,
  onClose,
  title,
  description,
  children,
  confirmLabel,
  onConfirm,
  confirmVariant = 'primary',
  cancelLabel,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmVariant?: ButtonVariant;
  cancelLabel?: string;
}) {
  const theme = useTheme();
  const c = theme.colors;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityViewIsModal
        style={[styles.scrim, { backgroundColor: 'rgba(46, 31, 82, 0.5)' }]}
        onPress={onClose}
      >
        <Pressable
          style={[styles.card, { backgroundColor: c.surface }]}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>
          {description ? (
            <Text style={[styles.description, { color: c.textSecondary }]}>{description}</Text>
          ) : null}

          {children ? <View style={styles.body}>{children}</View> : null}

          <View style={styles.actions}>
            {cancelLabel ? (
              <View style={styles.action}>
                <Button label={cancelLabel} variant="secondary" size="sm" onPress={onClose} />
              </View>
            ) : null}
            {confirmLabel ? (
              <View style={styles.action}>
                <Button
                  label={confirmLabel}
                  variant={confirmVariant}
                  size="sm"
                  onPress={onConfirm}
                />
              </View>
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  title: { ...Typography.cardTitle, fontSize: 18 },
  description: { ...Typography.secondary },
  body: { marginTop: Spacing.sm },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  action: { minWidth: 96 },
});
