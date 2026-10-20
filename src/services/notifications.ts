/**
 * Notifications service.
 *
 * CURRENT STATE: EMPTY — NO PUSH OR SERVER-SIDE NOTIFICATIONS EXIST.
 *
 * There is no notification backend and no push registration, so this returns an
 * empty list rather than a placeholder. The header bell therefore opens a real
 * screen that honestly explains there is nothing to show yet, instead of doing
 * nothing or showing fake items.
 */

export type PatientNotificationKind = 'appointment' | 'record' | 'system';

export interface PatientNotification {
  readonly id: string;
  readonly kind: PatientNotificationKind;
  /** ISO date-time. */
  readonly createdAt: string;
  readonly title: string;
  readonly body: string;
  readonly read: boolean;
}

/** Notifications for this patient. Empty until a backend supplies them. */
export async function listNotifications(): Promise<PatientNotification[]> {
  return [];
}
