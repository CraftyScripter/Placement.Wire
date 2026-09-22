import { DeadlinePrecision } from '@/schemas/placement.schema';

export interface DeadlineInfo {
  formattedDate: string;
  countdownText: string;
  isExpired: boolean;
  isUrgent: boolean; // <= 3 days remaining
  statusColor: 'green' | 'amber' | 'rose' | 'muted';
}

/**
 * Effective expiry timestamp for a deadline.
 *
 * DATE_ONLY deadlines (e.g. "last date 22 September") mean the form is open
 * till 23:59:59 of that calendar day in the user's local timezone — expiry
 * happens on the 23rd, not on the 22nd. The parser stamps these as 23:59:59
 * UTC, so the intended calendar day is read from the UTC date parts and then
 * converted to local end-of-day. This also repairs older rows that were
 * stored as midnight.
 *
 * EXACT_TIME (or unknown precision) deadlines are compared exactly.
 * Returns null when there is no usable deadline.
 */
export function resolveDeadlineMs(
  deadlineIso: string | null | undefined,
  precision?: DeadlinePrecision
): number | null {
  if (!deadlineIso) return null;
  const deadlineDate = new Date(deadlineIso);
  if (isNaN(deadlineDate.getTime())) return null;

  // Date-only deadline: valid till 23:59:59 of that calendar day in the
  // user's local timezone, i.e. a "last date 22 September" expires at
  // 23rd 00:00, not during the 22nd. Applies when explicitly marked
  // DATE_ONLY, or when the stored time is exactly midnight (which always
  // means a date-only value authored without a time — covers older rows
  // and rows with unknown precision).
  const isMidnightStamp =
    deadlineDate.getUTCHours() === 0 &&
    deadlineDate.getUTCMinutes() === 0 &&
    deadlineDate.getUTCSeconds() === 0 &&
    deadlineDate.getUTCMilliseconds() === 0;

  if (precision === 'DATE_ONLY' || (precision !== 'EXACT_TIME' && isMidnightStamp)) {
    const endOfDay = new Date(
      deadlineDate.getUTCFullYear(),
      deadlineDate.getUTCMonth(),
      deadlineDate.getUTCDate(),
      23,
      59,
      59,
      999
    );
    return endOfDay.getTime();
  }

  return deadlineDate.getTime();
}

/**
 * Deadline display with traffic-light color logic:
 *  > 3 days  -> green
 *  1–3 days  -> amber
 *  < 1 day   -> rose
 *  expired / no deadline -> rose / muted
 */
export function formatDeadline(
  deadlineIso: string | null | undefined,
  precision?: DeadlinePrecision
): DeadlineInfo {
  if (!deadlineIso) {
    return {
      formattedDate: 'No deadline',
      countdownText: 'No deadline',
      isExpired: false,
      isUrgent: false,
      statusColor: 'muted',
    };
  }

  const expiryMs = resolveDeadlineMs(deadlineIso, precision);
  if (expiryMs === null) {
    return {
      formattedDate: 'No deadline',
      countdownText: 'No deadline',
      isExpired: false,
      isUrgent: false,
      statusColor: 'muted',
    };
  }

  const now = Date.now();
  const diffMs = expiryMs - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  const formattedDate = new Date(expiryMs).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (diffMs < 0) {
    return {
      formattedDate,
      countdownText: 'Expired',
      isExpired: true,
      isUrgent: false,
      statusColor: 'rose',
    };
  }

  if (diffHours < 24) {
    const hours = Math.max(1, diffHours);
    return {
      formattedDate,
      countdownText: `${hours}h left`,
      isExpired: false,
      isUrgent: true,
      statusColor: 'rose',
    };
  }

  if (diffDays <= 3) {
    return {
      formattedDate,
      countdownText: diffDays === 1 ? '1 day left' : `${diffDays} days left`,
      isExpired: false,
      isUrgent: true,
      statusColor: 'amber',
    };
  }

  return {
    formattedDate,
    countdownText: `${diffDays} days left`,
    isExpired: false,
    isUrgent: false,
    statusColor: 'green',
  };
}
