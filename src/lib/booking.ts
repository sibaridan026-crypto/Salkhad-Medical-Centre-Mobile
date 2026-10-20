/**
 * Booking helpers.
 *
 * Pure functions only: they turn the weekly schedule the centre actually
 * supplied into selectable calendar days and time options. No availability is
 * invented and nothing is sent anywhere — the screen decides, and
 * `services/appointments.ts` stores the result.
 *
 * Deliberate honesty rules implemented here:
 *   - Only days that appear in the supplied schedule are offered.
 *   - Times are hourly steps inside a supplied range; a range's end time is the
 *     hard limit, so a slot never runs past the supplied closing time.
 *   - Times that already passed today are dropped, because the schedule cannot
 *     prove a slot in the past is still bookable.
 */

import type { ScheduleDay, ScheduleSlot } from '@/data/types';

/**
 * JS `getUTCDay()` (0 = Sunday) mapped onto the supplied schedule weekday keys.
 *
 * Friday is deliberately `undefined`: the centre supplies no Friday shifts, so a
 * Friday can never be a working day, and no date is offered for it.
 */
const WEEKDAY_BY_JS_DAY: readonly (ScheduleDay | undefined)[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  undefined,
  'saturday',
];

export interface ScheduleDate {
  /** `YYYY-MM-DD`. */
  readonly iso: string;
  readonly day: ScheduleDay;
}

export interface TimeOption {
  /** `HH:MM`. */
  readonly value: string;
  /** `HH:MM` one hour later, capped at the supplied closing time. */
  readonly end: string;
}

export function toIsoDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isoToDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function dayOfIso(iso: string): ScheduleDay | undefined {
  return WEEKDAY_BY_JS_DAY[isoToDate(iso).getUTCDay()];
}

/**
 * The next calendar days on which the supplied schedule has a slot, starting
 * from `from` (today inclusive) and capped at `limit`.
 */
export function upcomingDates(
  schedule: readonly ScheduleSlot[],
  from: Date,
  limit = 6,
): ScheduleDate[] {
  const workingDays = new Set(schedule.map((slot) => slot.day));
  const results: ScheduleDate[] = [];
  const cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  );

  for (let step = 0; step < 21 && results.length < limit; step += 1) {
    const weekday = WEEKDAY_BY_JS_DAY[cursor.getUTCDay()];
    // `undefined` (Friday) can never be a working day, so it is skipped here.
    if (weekday && workingDays.has(weekday)) {
      results.push({ iso: toIsoDate(cursor), day: weekday });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return results;
}

/** The supplied ranges that apply to one calendar day. */
export function slotsForDate(
  schedule: readonly ScheduleSlot[],
  iso: string,
): ScheduleSlot[] {
  const weekday = dayOfIso(iso);
  if (!weekday) return [];
  return schedule.filter((slot) => slot.day === weekday);
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function toTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function minutesNow(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Hourly options for every supplied range on `iso`. When `iso` is today,
 * options whose start has already passed are dropped — passing time is never
 * offered as bookable.
 */
export function timeOptions(
  schedule: readonly ScheduleSlot[],
  iso: string,
  now?: Date,
): TimeOption[] {
  const isToday = Boolean(now) && toIsoDate(now as Date) === iso;
  const todayMinutes = isToday ? minutesNow(now as Date) : -1;

  const options: TimeOption[] = [];

  for (const slot of slotsForDate(schedule, iso)) {
    const start = toMinutes(slot.from);
    const limit = slot.to ? toMinutes(slot.to) : start + 60;

    for (let minute = start; minute + 60 <= limit; minute += 60) {
      if (isToday && minute <= todayMinutes) continue;
      options.push({ value: toTime(minute), end: toTime(minute + 60) });
    }
  }

  // The same hour may appear in two supplied ranges; keep one entry.
  const seen = new Set<string>();
  return options.filter((option) => {
    if (seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
}

/** The `end` value that belongs to a selected option, for the review step. */
export function endOf(
  options: readonly TimeOption[],
  value: string | null,
): string | null {
  if (!value) return null;
  return options.find((option) => option.value === value)?.end ?? null;
}
