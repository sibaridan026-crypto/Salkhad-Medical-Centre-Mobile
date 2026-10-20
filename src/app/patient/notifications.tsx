import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppBackground } from '@/components/app-background';
import { Icon } from '@/components/icon';
import { DetailHeader } from '@/components/patient/detail-header';
import {
  Button,
  Card,
  EmptyState,
  InlineAlert,
  LoadingView,
} from '@/components/ui';
import { Spacing } from '@/constants/brand';
import { listNotifications, type PatientNotification } from '@/services/notifications';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';

/**
 * Notifications.
 *
 * A real screen, not a dead bell: it shows the loading state, the empty state
 * and the error state of the notification service, and says plainly that no
 * notification service is connected yet instead of inventing items.
 */
export default function NotificationsScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const c = theme.colors;

  const [items, setItems] = useState<PatientNotification[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // State is only assigned inside the async continuation, so the effect body
    // itself never triggers a render.
    void (async () => {
      try {
        const loaded = await listNotifications();
        if (cancelled) return;
        setItems(loaded);
        setFailed(false);
      } catch {
        if (cancelled) return;
        setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setLoading(true);
    setItems(null);
    setReloadKey((key) => key + 1);
  };

  return (
    <AppBackground>
      <DetailHeader title={t('notificationsTitle')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading && !failed ? <LoadingView label={t('loading')} /> : null}

        {failed ? (
          <View style={styles.block}>
            <InlineAlert variant="danger" title={t('backendPending')} />
            <Button label={t('retry')} variant="secondary" onPress={retry} />
          </View>
        ) : null}

        {items !== null && !loading && items.length === 0 ? (
          <View style={styles.block}>
            <EmptyState
              icon="bell-off-outline"
              title={t('notificationsEmptyTitle')}
              description={t('notificationsEmptyBody')}
            />
            <Card style={styles.note}>
              <View style={styles.row}>
                <Icon name="information-outline" size={18} color={c.textMuted} />
                <View style={styles.noteText}>
                  <View>
                    <InlineAlert variant="info" title={t('notificationsBackendNote')} />
                  </View>
                </View>
              </View>
            </Card>
          </View>
        ) : null}

        {!loading && items !== null && items.length > 0
          ? items.map((item) => (
              <Card key={item.id} style={styles.item}>
                <View style={[styles.itemHead, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Icon name="bell-outline" size={18} color={c.primary} />
                  <View style={styles.noteText}>
                    <InlineAlert
                      variant={item.read ? 'info' : 'warning'}
                      title={item.title}
                      description={item.body}
                    />
                  </View>
                </View>
              </Card>
            ))
          : null}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  block: { gap: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  note: { gap: Spacing.sm },
  noteText: { flex: 1, minWidth: 0, gap: Spacing.sm },
  item: { gap: Spacing.sm },
  itemHead: { alignItems: 'flex-start', gap: Spacing.sm },
});
