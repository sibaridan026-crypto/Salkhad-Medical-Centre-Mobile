import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppBackground } from '@/components/app-background';
import { DetailHeader } from '@/components/patient/detail-header';
import { Button, Card, InlineAlert, QRFrame, SectionHeader } from '@/components/ui';
import { Spacing, Typography, rowDirection, textAlignment } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { loadQrIdentity, type QrIdentity } from '@/services/qr-identity';
import { useTheme } from '@/theme';

/**
 * My medical QR card.
 *
 * There is no identity service yet, so the screen shows the honest setup state:
 * a placeholder frame (never a fake pattern that looks scannable), an
 * explanation of how the card will be used, and what it will and will not
 * contain. Nothing here encodes a diagnosis, an allergy, a phone number or any
 * other credential — those decisions belong to the identity API.
 */
export default function QrScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLanguage();

  const [identity, setIdentity] = useState<QrIdentity | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // The state is only assigned inside the async continuation, so the effect
    // body itself never triggers a render.
    void (async () => {
      try {
        const loaded = await loadQrIdentity();
        if (!cancelled) setIdentity(loaded);
      } catch {
        if (!cancelled) setIdentity({ state: 'unavailable', token: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const align = { textAlign: textAlignment(isRTL) } as const;
  const c = theme.colors;

  const ready = identity?.state === 'ready' && identity.token;

  return (
    <AppBackground>
      <DetailHeader title={t('qrTitle')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, align, { color: c.textSecondary }]}>
          {t('qrSubtitle')}
        </Text>

        <Card style={styles.frameCard}>
          <QRFrame size={200} label={t('qrTitle')} />
        </Card>

        {ready ? (
          <InlineAlert variant="success" title={t('qrHowToTitle')} description={t('qrHowToBody')} />
        ) : (
          <View style={styles.stateBlock}>
            <InlineAlert
              variant="warning"
              title={t('qrUnavailableTitle')}
              description={t('qrUnavailableBody')}
            />
            <Button
              label={t('qrRefresh')}
              variant="secondary"
              onPress={() => setReloadKey((key) => key + 1)}
            />
          </View>
        )}

        <SectionHeader title={t('qrHowToTitle')} />
        <Card style={styles.card}>
          <Text style={[styles.body, align, { color: c.textSecondary }]}>{t('qrHowToBody')}</Text>
        </Card>

        <SectionHeader title={t('qrPrivacyTitle')} />
        <Card style={styles.card}>
          <View style={[styles.row, { flexDirection: rowDirection(isRTL) }]}>
            <Text style={[styles.body, align, { color: c.textSecondary }]}>
              {t('qrPrivacyBody')}
            </Text>
          </View>
        </Card>

        <SectionHeader title={t('qrSecurityTitle')} />
        <Card style={styles.card}>
          <Text style={[styles.body, align, { color: c.textSecondary }]}>
            {t('qrSecurityBody')}
          </Text>
        </Card>
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
  subtitle: { ...Typography.secondary },
  frameCard: { alignItems: 'center', gap: Spacing.md },
  stateBlock: { gap: Spacing.md },
  card: { gap: Spacing.sm },
  row: { gap: Spacing.sm },
  body: { ...Typography.secondary },
});
