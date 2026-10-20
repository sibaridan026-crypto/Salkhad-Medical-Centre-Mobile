import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppBackground } from '@/components/app-background';
import { DetailHeader } from '@/components/patient/detail-header';
import { Button, Card, DateField, InlineAlert, RadioGroup, TextField } from '@/components/ui';
import { Spacing, Typography, rowDirection } from '@/constants/brand';
import { isPastDate, isValidEmail } from '@/services/auth';
import type { AuthErrorCode } from '@/services/auth';
import type { Gender } from '@/data/types';
import { authErrorKey } from '@/lib/auth-messages';
import { useLanguage } from '@/i18n/language-context';
import { useAuth } from '@/state/auth-context';
import { useTheme } from '@/theme';

/**
 * Account edit.
 *
 * Account fields only: name, email, date of birth and sex. The phone number is
 * shown read-only because it is the account key. Nothing medical is editable
 * here — the health profile is edited on its own screen, and clinician records
 * are never editable by the patient.
 */
export default function EditProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const { user, saveAccount } = useAuth();
  const c = theme.colors;

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ?? '');
  const [gender, setGender] = useState<Gender | null>(user?.gender ?? null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorCode, setErrorCode] = useState<AuthErrorCode | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  if (!user) return null;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2) next.fullName = t('errNameRequired');
    if (!isValidEmail(email)) next.email = t('errInvalidEmail');
    if (!dateOfBirth || !isPastDate(dateOfBirth)) next.dateOfBirth = t('errDobInvalid');
    if (!gender) next.gender = t('errGenderRequired');
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (pending) return;
    setErrorCode(null);
    setSaved(false);
    if (!validate()) return;

    setPending(true);
    const code = await saveAccount({
      fullName: fullName.trim(),
      email: email.trim() ? email.trim() : null,
      dateOfBirth,
      gender,
    });
    setPending(false);

    if (code) {
      setErrorCode(code);
      return;
    }
    setSaved(true);
  };

  return (
    <AppBackground>
      <DetailHeader title={t('editProfileTitle')} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <TextField
            label={t('editProfileNameLabel')}
            placeholder={t('fullNamePlaceholder')}
            value={fullName}
            onChangeText={(value) => {
              setFullName(value);
              setFieldErrors((prev) => ({ ...prev, fullName: '' }));
            }}
            autoCapitalize="words"
            leadingIcon="account-outline"
            error={fieldErrors.fullName || undefined}
          />

          <TextField
            label={t('phoneLabel')}
            value={user.phone}
            disabled
            leadingIcon="phone-outline"
            helper={t('required')}
          />

          <TextField
            label={`${t('editProfileEmailLabel')} · ${t('optional')}`}
            placeholder={t('emailPlaceholder')}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setFieldErrors((prev) => ({ ...prev, email: '' }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leadingIcon="email-outline"
            error={fieldErrors.email || undefined}
          />

          <DateField
            label={t('editProfileDobLabel')}
            value={dateOfBirth}
            onChange={(iso) => {
              setDateOfBirth(iso);
              setFieldErrors((prev) => ({ ...prev, dateOfBirth: '' }));
            }}
            error={fieldErrors.dateOfBirth || undefined}
          />

          <View style={styles.gender}>
            <Text style={[styles.genderLabel, { color: c.textSecondary }]}>
              {t('editProfileGenderLabel')}
            </Text>
            <RadioGroup<Gender>
              options={[
                { value: 'male', label: t('genderMale') },
                { value: 'female', label: t('genderFemale') },
              ]}
              value={gender}
              onChange={(value) => {
                setGender(value);
                setFieldErrors((prev) => ({ ...prev, gender: '' }));
              }}
            />
            {fieldErrors.gender ? (
              <InlineAlert variant="danger" title={fieldErrors.gender} />
            ) : null}
          </View>

          {errorCode ? (
            <InlineAlert variant="danger" title={t(authErrorKey(errorCode))} />
          ) : null}

          {saved ? <InlineAlert variant="success" title={t('editProfileSaved')} /> : null}

          <View style={[styles.actions, { flexDirection: rowDirection(isRTL) }]}>
            <Button
              label={t('editProfileSave')}
              onPress={submit}
              loading={pending}
              disabled={pending}
            />
            <Button
              label={t('editProfileCancel')}
              variant="ghost"
              onPress={() => router.back()}
              disabled={pending}
            />
          </View>
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
  card: { gap: Spacing.lg },
  gender: { gap: Spacing.sm },
  genderLabel: { ...Typography.caption, fontWeight: '700' },
  actions: { gap: Spacing.sm, alignItems: 'center' },
});
