import { router, Redirect } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/app-background';
import { AppHeader } from '@/components/app-header';
import { BottomNav, type NavItem } from '@/components/bottom-nav';
import {
  AccentPicker,
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  Checkbox,
  Chip,
  DayPicker,
  Dialog,
  Divider,
  EmptyState,
  IconButton,
  InlineAlert,
  ListRow,
  LoadingView,
  ProgressSteps,
  QRFrame,
  RadioGroup,
  SectionHeader,
  SegmentedControl,
  Skeleton,
  Spinner,
  SwitchRow,
  TextField,
  TimeSlotGrid,
} from '@/components/ui';
import { Spacing, Typography, textAlignment } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';

/** Every bottom-nav key here maps to a route that actually exists. */
const NAV_ROUTES = {
  home: '/patient',
  specialties: '/patient/specialties',
  doctors: '/patient/doctors',
  appointments: '/patient/appointments',
  profile: '/patient/profile',
} as const;

/**
 * Design-system gallery.
 *
 * A dedicated inspection route for the shared components, accents and RTL/LTR
 * behaviour. It is not Home and it is not a feature screen, and it holds no
 * business logic — every control here is either stateless or wired to local
 * demo state purely to show its interaction states. Anything that navigates
 * goes to a real route.
 *
 * It is a development route: outside `__DEV__` it redirects to the entry gate, so
 * no production build ships an extra screen that is not part of the patient
 * flow. The dev gate is read at the top of the render so the hooks below always
 * run in the same order.
 */
export default function DesignSystemGallery() {
  const theme = useTheme();
  const { isRTL, lang, strings } = useLanguage();
  const c = theme.colors;
  const align = { textAlign: textAlignment(isRTL) };

  const [text, setText] = useState('');
  const [password, setPassword] = useState('secret');
  const [notes, setNotes] = useState('');
  const [chip, setChip] = useState(true);
  const [segment, setSegment] = useState<'all' | 'upcoming'>('all');
  const [check, setCheck] = useState(true);
  const [radio, setRadio] = useState<'female' | 'male' | null>('female');
  const [switched, setSwitched] = useState(true);
  const [day, setDay] = useState<string | null>('saturday');
  const [slot, setSlot] = useState<string | null>('09:00');
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [nav] = useState('home');

  // Every item here navigates to a real route, so the gallery never shows a
  // control that looks functional but does nothing.
  const navItems: NavItem[] = [
    { key: 'home', label: strings.navHome, icon: 'home', iconInactive: 'home-outline' },
    {
      key: 'specialties',
      label: strings.navSpecialties,
      icon: 'view-grid',
      iconInactive: 'view-grid-outline',
    },
    { key: 'doctors', label: strings.navDoctors, icon: 'doctor', iconInactive: 'doctor' },
    {
      key: 'appointments',
      label: strings.navAppointments,
      icon: 'calendar',
      iconInactive: 'calendar-outline',
    },
    { key: 'profile', label: strings.navProfile, icon: 'account', iconInactive: 'account-outline' },
  ];

  // Dev-only gate, evaluated during render after all hooks have run.
  if (!__DEV__) return <Redirect href="/" />;

  return (
    <AppBackground edges={[]}>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <AppHeader
          showNotification
          showProfile
          onNotification={() => router.push('/patient/notifications')}
          onProfile={() => router.push('/patient/profile')}
        />

        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <InlineAlert
            variant="info"
            title="Temporary design-system gallery"
            description="Phase 3 inspection route — not a feature screen and not Home. Switch the accent below or the language in the header to check theme + RTL/LTR behaviour."
          />

          <View style={[styles.jumpRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Button label="Phase 2 preview" variant="ghost" size="sm" onPress={() => router.push('/preview')} />
            <Button
              label="Phase 1 foundation"
              variant="ghost"
              size="sm"
              onPress={() => router.push('/foundation')}
            />
          </View>

          <Section title="Theme accents" subtitle="Live — selecting one repaints the whole app">
            <AccentPicker />
            <Divider spacing={Spacing.md} />
            <Text style={[styles.note, { color: c.textMuted }, align]}>
              Active: {theme.accentName}
            </Text>
          </Section>

          <Section title="Colour tokens">
            <View style={styles.swatchRow}>
              {(
                [
                  ['primary', c.primary],
                  ['primaryDark', c.primaryDark],
                  ['primarySoft', c.primarySoft],
                  ['primarySurface', c.primarySurface],
                  ['blue', c.blue],
                  ['teal', c.teal],
                  ['lavender', c.lavender],
                  ['success', c.success],
                  ['warning', c.warning],
                  ['danger', c.danger],
                  ['text', c.text],
                  ['textMuted', c.textMuted],
                ] as const
              ).map(([name, value]) => (
                <View key={name} style={styles.swatchItem}>
                  <View style={[styles.swatch, { backgroundColor: value, borderColor: c.border }]} />
                  <Text style={[styles.swatchLabel, { color: c.textMuted }]} numberOfLines={1}>
                    {name}
                  </Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Typography">
            <Text style={[{ ...theme.typography.screenTitle, color: c.text }, align]}>Screen title</Text>
            <Text style={[{ ...theme.typography.sectionTitle, color: c.text }, align]}>Section title</Text>
            <Text style={[{ ...theme.typography.cardTitle, color: c.text }, align]}>Card title</Text>
            <Text style={[{ ...theme.typography.body, color: c.text }, align]}>Body text 15</Text>
            <Text style={[{ ...theme.typography.secondary, color: c.textSecondary }, align]}>
              Secondary text 14
            </Text>
            <Text style={[{ ...theme.typography.caption, color: c.textMuted }, align]}>
              Caption text 13
            </Text>
            <Text style={[{ ...theme.typography.micro, color: c.textMuted }, align]}>
              MICRO LABEL 12
            </Text>
          </Section>

          <Section title="Buttons">
            <Button label="Primary" onPress={() => {}} />
            <Button label="Secondary" variant="secondary" onPress={() => {}} />
            <Button label="Ghost" variant="ghost" onPress={() => {}} />
            <Button label="Destructive" variant="danger" onPress={() => {}} />
            <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Button label="Small" size="sm" onPress={() => {}} />
              <Button label="With icon" icon="calendar-clock" onPress={() => {}} />
            </View>
            <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Button label="Loading" loading onPress={() => {}} />
              <Button label="Disabled" disabled onPress={() => {}} />
            </View>
            <Button label="Full width" fullWidth icon="arrow-left" iconPosition="trailing" onPress={() => {}} />
          </Section>

          <Section title="Icon buttons">
            <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <IconButton icon="bell-outline" label="Notifications" onPress={() => {}} />
              <IconButton icon="magnify" label="Search" variant="ghost" onPress={() => {}} />
              <IconButton icon="plus" label="Add" variant="accent" onPress={() => {}} />
              <IconButton icon="close" label="Close" variant="danger" onPress={() => {}} />
              <IconButton icon="cog-outline" label="Settings" disabled />
            </View>
          </Section>

          <Section title="Text fields">
            <TextField
              label="Full name"
              value={text}
              onChangeText={setText}
              placeholder="Name"
              leadingIcon="account-outline"
              required
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leadingIcon="lock-outline"
              helper="At least 8 characters"
            />
            <TextField
              label="Phone"
              value={text}
              onChangeText={setText}
              keyboardType="phone-pad"
              leadingIcon="phone-outline"
              error="This field is required"
            />
            <TextField
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Multi-line notes"
              multiline
            />
            <TextField label="Disabled" value="Read only" disabled />
          </Section>

          <Section title="Selection controls">
            <SwitchRow
              label="Notifications"
              description="Receive appointment updates"
              value={switched}
              onValueChange={setSwitched}
            />
            <Divider spacing={Spacing.sm} />
            <Checkbox
              checked={check}
              onChange={setCheck}
              label="I agree to the terms"
              description="Required to continue"
            />
            <Checkbox checked={false} label="Unchecked" />
            <Divider spacing={Spacing.sm} />
            <RadioGroup
              value={radio}
              onChange={setRadio}
              options={[
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
              ]}
            />
          </Section>

          <Section title="Segmented control & chips">
            <SegmentedControl
              value={segment}
              onChange={setSegment}
              options={[
                { value: 'all', label: 'All' },
                { value: 'upcoming', label: 'Upcoming' },
              ]}
            />
            <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Chip label="Selected" selected onPress={() => setChip(true)} />
              <Chip label="Unselected" selected={!chip} onPress={() => setChip(false)} />
              <Chip label="Static" />
              <Chip label="With icon" icon="filter-variant" onPress={() => {}} />
            </View>
          </Section>

          <Section title="Badges">
            <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Badge label="Neutral" />
              <Badge label="Accent" tone="accent" />
              <Badge label="Confirmed" tone="success" icon="check-circle-outline" />
              <Badge label="Pending" tone="warning" />
              <Badge label="Rejected" tone="danger" />
            </View>
          </Section>

          <Section title="Cards & list rows">
            <Card tone="surface" padded>
              <Text style={[styles.note, { color: c.textSecondary }, align]}>Surface card</Text>
            </Card>
            <Card tone="subtle" padded>
              <Text style={[styles.note, { color: c.textSecondary }, align]}>Subtle card</Text>
            </Card>
            <Card tone="accent" padded>
              <Text style={[styles.note, { color: c.textSecondary }, align]}>Accent card</Text>
            </Card>

            <Card padded={false} style={styles.listCard}>
              <ListRow
                title="Row with chevron"
                subtitle="Tappable list row"
                leading={<Avatar icon="calendar-outline" size={40} shape="rounded" />}
                onPress={() => {}}
              />
              <ListRow
                title="Row with avatar"
                subtitle="Dr. Example"
                leading={<Avatar initials="EX" size={40} />}
                trailing={<Badge label="Active" tone="success" />}
              />
              <ListRow
                title="Danger row"
                subtitle="Destructive action"
                leading={<Avatar icon="close" size={40} shape="rounded" />}
                danger
                last
                onPress={() => {}}
              />
            </Card>

            <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Avatar initials="SM" size={56} />
              <Avatar size={48} />
              <Avatar icon="stethoscope" size={44} shape="rounded" />
            </View>
          </Section>

          <Section title="Alerts">
            <InlineAlert variant="info" title="Information" description="Informational notice." />
            <InlineAlert variant="success" title="Success" description="Saved successfully." />
            <InlineAlert variant="warning" title="Warning" description="Please review." />
            <InlineAlert variant="danger" title="Error" description="Something went wrong." />
          </Section>

          <Section title="Empty, loading & skeleton">
            <Card padded>
              <EmptyState
                title="Nothing here yet"
                description="Empty states explain the situation instead of looking broken."
                actionLabel="Retry"
                onAction={() => {}}
              />
            </Card>
            <View style={styles.row}>
              <Spinner />
              <LoadingView label="Loading…" />
            </View>
            <View style={styles.skeleton}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="100%" height={12} />
              <Skeleton width="80%" height={12} />
            </View>
          </Section>

          <Section title="Overlays">
            <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Button label="Open dialog" variant="secondary" onPress={() => setDialog(true)} />
              <Button label="Open sheet" variant="secondary" onPress={() => setSheet(true)} />
            </View>
          </Section>

          <Section title="Booking primitives (demo data)">
            <ProgressSteps steps={['Specialty', 'Doctor', 'Time', 'Review']} current={2} />
            <Divider spacing={Spacing.md} />
            <DayPicker
              days={[
                { value: 'saturday', label: 'Sat', sublabel: '12' },
                { value: 'sunday', label: 'Sun', sublabel: '13' },
                { value: 'monday', label: 'Mon', sublabel: '14', disabled: true },
                { value: 'tuesday', label: 'Tue', sublabel: '15' },
                { value: 'wednesday', label: 'Wed', sublabel: '16' },
              ]}
              selected={day}
              onSelect={setDay}
            />
            <TimeSlotGrid
              slots={[
                { value: '09:00', label: '09:00' },
                { value: '09:20', label: '09:20' },
                { value: '09:40', label: '09:40', disabled: true },
                { value: '10:00', label: '10:00' },
                { value: '10:20', label: '10:20' },
                { value: '10:40', label: '10:40' },
              ]}
              selected={slot}
              onSelect={setSlot}
            />
          </Section>

          <Section title="QR frame">
            <QRFrame label="رمزي الطبي / My medical code" />
          </Section>

          <Section title="Direction">
            <Text style={[styles.note, { color: c.textSecondary }, align]}>
              Current language: {lang} — {isRTL ? 'RTL (right-to-left)' : 'LTR (left-to-right)'}. Use the
              header language switch to verify every component mirrors correctly.
            </Text>
          </Section>
        </ScrollView>
      </SafeAreaView>

      <BottomNav
        items={navItems}
        activeKey={nav}
        onSelect={(key) => {
          const route = NAV_ROUTES[key as keyof typeof NAV_ROUTES];
          if (route) router.replace(route);
        }}
      />

      <Dialog
        visible={dialog}
        onClose={() => setDialog(false)}
        title="Confirm action"
        description="This dialog is presentation only."
        confirmLabel="Confirm"
        onConfirm={() => setDialog(false)}
        cancelLabel="Cancel"
      />

      <BottomSheet visible={sheet} onClose={() => setSheet(false)} title="Bottom sheet">
        <Text style={[{ ...theme.typography.body, color: c.text }, align]}>
          Sheets rise from the bottom, respect the system-navigation inset and scroll internally.
        </Text>
      </BottomSheet>
    </AppBackground>
  );
}

/** Local layout helper — a titled, stacked block with a divider between groups. */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;

  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      {subtitle ? (
        <Text
          style={[styles.note, { color: c.textMuted, textAlign: textAlignment(isRTL) }]}
        >
          {subtitle}
        </Text>
      ) : null}
      <Card padded>
        <View style={styles.sectionBody}>{children}</View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
  jumpRow: { gap: Spacing.sm },
  section: { gap: Spacing.sm },
  sectionBody: { gap: Spacing.md },
  note: { ...Typography.secondary },
  row: { alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  swatchItem: { alignItems: 'center', gap: Spacing.xs, width: 64 },
  swatch: { width: 40, height: 40, borderRadius: 12, borderWidth: 1 },
  swatchLabel: { ...Typography.micro, textAlign: 'center' },
  listCard: { overflow: 'hidden' },
  skeleton: { gap: Spacing.sm },
});
