import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthShell } from '@/components/patient/auth-shell';
import { Button, Card, InlineAlert, TextField } from '@/components/ui';
import { Spacing, Typography, textAlignment } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';

/**
 * Employee (doctor / reception) sign-in — self-contained demo.
 *
 * Runs entirely on the device and routes to the role-specific doctor or admin
 * screens. The credentials below are fictional demo accounts, and every record
 * the doctor/admin screens show is fictional demo data — not real centre data.
 */
const DOCTOR_DEMO = { phone: '0990000001', password: 'doctor1234', name: 'Dr. Ahmad Al-Salkhad' };
const ADMIN_DEMO = { phone: '0990000002', password: 'admin1234', name: 'Reception Desk' };

export default function EmployeeLoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const ar = isRTL;
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    if (pending) return;
    setPending(true);
    await new Promise((r) => setTimeout(r, 200));
    if (phone === DOCTOR_DEMO.phone && password === DOCTOR_DEMO.password) {
      router.replace('/doctor' as any);
    } else if (phone === ADMIN_DEMO.phone && password === ADMIN_DEMO.password) {
      router.replace('/admin' as any);
    } else {
      setError(ar ? 'بيانات موظف غير صحيحة' : 'Invalid employee credentials');
    }
    setPending(false);
  };

  const align = { textAlign: textAlignment(isRTL) } as const;
  return (
    <AuthShell title={ar ? 'تسجيل دخول الموظفين' : 'Employee Login'} subtitle={ar ? 'وصول تجريبي للطبيب/الإدارة' : 'Demo doctor/admin access'} footer={null}>
      <Card style={styles.card}>
        <TextField label={ar ? 'الهاتف' : 'Phone'} value={phone} onChangeText={setPhone} keyboardType="phone-pad" leadingIcon="phone-outline" />
        <TextField label={ar ? 'كلمة المرور' : 'Password'} value={password} onChangeText={setPassword} secureTextEntry leadingIcon="lock-outline" />
        {error ? <InlineAlert variant="danger" title={error} /> : null}
        <Button label={ar ? 'تسجيل الدخول' : 'Sign in'} fullWidth loading={pending} disabled={pending} onPress={submit} />
        <View style={styles.demo}>
          <Text style={[styles.demoLabel, align, { color: theme.colors.textSecondary }]}>
            {ar ? `طبيب: ${DOCTOR_DEMO.phone} / ${DOCTOR_DEMO.password}` : `Doctor: ${DOCTOR_DEMO.phone} / ${DOCTOR_DEMO.password}`}
          </Text>
          <Text style={[styles.demoLabel, align, { color: theme.colors.textSecondary }]}>
            {ar ? `إدارة: ${ADMIN_DEMO.phone} / ${ADMIN_DEMO.password}` : `Admin: ${ADMIN_DEMO.phone} / ${ADMIN_DEMO.password}`}
          </Text>
          <Text style={[styles.demoNote, align, { color: theme.colors.textMuted }]}>
            {ar
              ? 'حسابات وبيانات تجريبية وهمية لأغراض العرض فقط، وليست سجلات المركز.'
              : 'Fictional demo accounts and data for display only — not centre records.'}
          </Text>
        </View>
      </Card>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.lg },
  demo: { borderWidth: 1, borderRadius: 14, padding: Spacing.md, gap: 4 },
  demoLabel: { ...Typography.caption, fontWeight: '600' },
  demoNote: { ...Typography.caption },
});