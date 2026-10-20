import type { LocalizedText, ScheduleDay } from './types';

/**
 * Weekly schedule days in the supplied order (Saturday → Thursday). The centre
 * is closed on Friday, so it is not part of the schedule at all.
 */
export const DAYS: readonly ScheduleDay[] = [
  'saturday',
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
];

export const DAY_LABELS: Readonly<Record<ScheduleDay, LocalizedText>> = {
  saturday: { ar: 'السبت', en: 'Saturday' },
  sunday: { ar: 'الأحد', en: 'Sunday' },
  monday: { ar: 'الاثنين', en: 'Monday' },
  tuesday: { ar: 'الثلاثاء', en: 'Tuesday' },
  wednesday: { ar: 'الأربعاء', en: 'Wednesday' },
  thursday: { ar: 'الخميس', en: 'Thursday' },
};
