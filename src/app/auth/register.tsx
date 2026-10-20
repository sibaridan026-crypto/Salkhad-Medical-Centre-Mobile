import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthShell } from '@/components/patient/auth-shell';
import { Button, Card, DateField, InlineAlert, RadioGroup, TextField } from '@/components/ui';
import { Spacing, Typography, textAlignment } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { authErrorKey } from '@/lib/auth-messages';
import { isPastDate, isValidEmail, isValidPhone } from '@/services/auth';
import type { AuthErrorCode } from '@/services/auth';
import type { Gender } from '@/data/types';
import { useAuth } from '@/state/auth-context';
import { useTheme } from '@/theme';

/**
 * Patient registration.
 *
 * Required: full name, phone, password, confirm password, date of birth, sex.
 * Optional: email.
 *
 * Validation runs on submit and again per field once the patient has left it, so
 * an honest message appears early instead of only after a failed submission.
 * The submit button is disabled and shows a spinner while the request is
 * pending, which is what stops a double registration.
 *
 * Self-contained demo: no network request is made. The account is stored on
 * this device only and is fictional demo data, not a real centre record.
 */
export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const { isAuthenticated, register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);

  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [formError, setFormError] = useState<AuthErrorCode | null>(null);
  const [pending, setPending] = useState(false);

  if (isAuthenticated) return <Redirect href="/" />;

  const validate = (): boolean => {
    const next: Partial<Record<FieldKey, string>> = {};

    if (fullName.trim().length < 2) next.fullName = t('errNameRequired');
    if (!isValidPhone(phone)) next.phone = t('errInvalidPhone');
    if (!isValidEmail(email)) next.email = t('errInvalidEmail');
    if (password.length < 6) next.password = t('errWeakPassword');
    if (confirmPassword !== password) next.confirmPassword = t('errPasswordMismatch');
    if (!dateOfBirth) next.dateOfBirth = t('errDobRequired');
    else if (!isPastDate(dateOfBirth)) next.dateOfBirth = t('errDobInvalid');
    if (!gender) next.gender = t('errGenderRequired');

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (pending) return;
    setFormError(null);
    if (!validate()) return;

    setPending(true);
    const code = await register({
      fullName,
      phone,
      email,
      password,
      confirmPassword,
      dateOfBirth,
      gender,
    });
    setPending(false);

    if (code) {
      setFormError(code);
      return;
    }
    // Successful registration → the gate sends a brand-new account to the
    // initial health-profile onboarding.
  };

  const align = { textAlign: textAlignment(isRTL) } as const;

  return (
    <AuthShell
      title={t('registerTitle')}
      subtitle={t('registerSubtitle')}
      footer={
        <>
          <Text style={[styles.footerText, align, { color: theme.colors.textSecondary }]}>
            {t('haveAccount')}
          </Text>
          <Button
            label={t('goLogin')}
            variant="ghost"
            size="sm"
            onPress={() => router.replace('/auth/login')}
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
          label={`${t('fullNameLabel')} *`}
          placeholder={t('fullNamePlaceholder')}
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
          }}
          autoCapitalize="words"
          leadingIcon="account-outline"
          error={errors.fullName}
        />

        <TextField
          label={`${t('phoneLabel')} *`}
          placeholder={t('phonePlaceholder')}
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
          }}
          keyboardType="phone-pad"
          leadingIcon="phone-outline"
          error={errors.phone}
        />

        <TextField
          label={t('emailLabel')}
          placeholder={t('emailPlaceholder')}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          leadingIcon="email-outline"
          helper={t('emailOptional')}
          error={errors.email}
        />

        <TextField
          label={`${t('passwordLabel')} *`}
          placeholder={t('passwordPlaceholder')}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          secureTextEntry
          leadingIcon="lock-outline"
          helper={t('passwordRule')}
          error={errors.password}
        />

        <TextField
          label={`${t('confirmPasswordLabel')} *`}
          placeholder={t('confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) {
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          secureTextEntry
          leadingIcon="lock-check-outline"
          error={errors.confirmPassword}
        />

        <DateField
          label={`${t('dobLabel')} *`}
          value={dateOfBirth}
          onChange={(iso) => {
            setDateOfBirth(iso);
            if (errors.dateOfBirth) setErrors((prev) => ({ ...prev, dateOfBirth: undefined }));
          }}
          error={errors.dateOfBirth}
        />

        <View style={styles.gender}>
          <Text style={[styles.genderLabel, { color: theme.colors.textSecondary }]}>
            {`${t('genderLabel')} *`}
          </Text>
          <RadioGroup<Gender>
            options={[
              { value: 'male', label: t('genderMale') },
              { value: 'female', label: t('genderFemale') },
            ]}
            value={gender}
            onChange={(value) => {
              setGender(value);
              if (errors.gender) setErrors((prev) => ({ ...prev, gender: undefined }));
            }}
          />
          {errors.gender ? (
            <Text style={[styles.genderError, { color: theme.colors.danger }]}>
              {errors.gender}
            </Text>
          ) : null}
        </View>

        {formError ? (
          <InlineAlert variant="danger" title={t(authErrorKey(formError))} />
        ) : null}

        <InlineAlert variant="info" title={t('authLocalNote')} />

        <Button
          label={t('registerCta')}
          fullWidth
          loading={pending}
          disabled={pending}
          onPress={submit}
        />
      </Card>
    </AuthShell>
  );
}

type FieldKey = 'fullName' | 'phone' | 'email' | 'password' | 'confirmPassword' | 'dateOfBirth' | 'gender';

const styles = StyleSheet.create({
  card: { gap: Spacing.lg },
  gender: { gap: Spacing.sm },
  genderLabel: { ...Typography.caption, fontWeight: '600' },
  genderError: { ...Typography.caption },
  footerText: { ...Typography.secondary },
});
