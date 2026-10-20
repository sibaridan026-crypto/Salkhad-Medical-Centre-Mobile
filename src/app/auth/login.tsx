import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthShell } from '@/components/patient/auth-shell';
import { Button, Card, InlineAlert, TextField } from '@/components/ui';
import { Spacing, Typography, textAlignment } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { authErrorKey } from '@/lib/auth-messages';
import { isValidPhone, type AuthErrorCode } from '@/services/auth';
import { useAuth } from '@/state/auth-context';
import { useTheme } from '@/theme';

/**
 * Patient sign-in — self-contained demo.
 *
 * Runs entirely on the device: no network request is made. Sign-in still
 * requires a matching phone and password (the seeded demo account or an
 * account registered in this demo session), so authentication is not bypassed.
 * The submit button shows a spinner and is disabled while pending, so a double
 * tap cannot fire two sign-ins. The demo hint states the credentials and that
 * the data is fictional.
 */
export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const { isAuthenticated, signIn } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<AuthErrorCode | null>(null);
  const [pending, setPending] = useState(false);

  if (isAuthenticated) return <Redirect href="/" />;

  const submit = async () => {
    if (pending) return;
    setFormError(null);

    if (!isValidPhone(phone)) {
      setFieldError(t('errInvalidPhone'));
      return;
    }
    setFieldError(null);

    setPending(true);
    const code = await signIn(phone, password);
    setPending(false);

    if (code) {
      setFormError(code);
      return;
    }
    // On success the gate in `app/index.tsx` routes the patient to the
    // onboarding or the patient area, based on the stored onboarding state.
  };

  const align = { textAlign: textAlignment(isRTL) } as const;

  return (
    <AuthShell
      title={t('loginTitle')}
      subtitle={t('loginSubtitle')}
      footer={
        <>
          <Text style={[styles.footerText, align, { color: theme.colors.textSecondary }]}>
            {t('noAccount')}
          </Text>
          <Button
            label={t('goRegister')}
            variant="ghost"
            size="sm"
            onPress={() => router.push('/auth/register')}
          />
          <Button
            label={t('employeeLogin')}
            variant="ghost"
            size="sm"
            onPress={() => router.push('/auth/employee-login')}
          />
        </>
      }
    >
      <Card style={styles.card}>
        <TextField
          label={t('phoneLabel')}
          placeholder={t('phonePlaceholder')}
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (fieldError) setFieldError(null);
          }}
          keyboardType="phone-pad"
          leadingIcon="phone-outline"
          error={fieldError ?? undefined}
        />
        <TextField
          label={t('passwordLabel')}
          placeholder={t('passwordPlaceholder')}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (formError) setFormError(null);
          }}
          secureTextEntry
          leadingIcon="lock-outline"
        />

        {formError ? <InlineAlert variant="danger" title={t(authErrorKey(formError))} /> : null}

        <InlineAlert variant="info" title={t('demoLoginHint')} />
        <InlineAlert variant="info" title={t('authLocalNote')} />

        <Button label={t('loginCta')} fullWidth loading={pending} disabled={pending} onPress={submit} />
      </Card>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.lg },
  demo: { borderWidth: 1, borderRadius: 14, padding: Spacing.md, gap: 4 },
  demoLabel: { ...Typography.caption, fontWeight: '600' },
  demoNote: { ...Typography.caption },
  footerText: { ...Typography.secondary },
});
