/**
 * Malaysian SST filing period utilities.
 * SST-02: Taxable period is monthly. Due date is 15th of the following month.
 * E.g. May period (1–31 May) → Due 15 June
 */

/**
 * Get period start (1st) and end (last day) for a given year-month.
 * @param {number} year - Year (e.g. 2024)
 * @param {number} month - Month 1–12
 * @returns {{ start: Date, end: Date, startStr: string, endStr: string }}
 */
export function getPeriodDates(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0); // last day of month
  return {
    start,
    end,
    startStr: toYYYYMMDD(start),
    endStr: toYYYYMMDD(end),
  };
}

/**
 * Get due date for a period (15th of following month).
 * @param {number} year - Year of period
 * @param {number} month - Month of period (1–12)
 * @returns {Date}
 */
export function getDueDate(year, month) {
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return new Date(nextYear, nextMonth - 1, 15);
}

/**
 * Get next filing period (current month if before 15th, else next month).
 * @returns {{ year: number, month: number, periodStart: string, periodEnd: string, dueDate: Date, dueDateStr: string, label: string }}
 */
export function getNextFilingPeriod() {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1; // 1–12
  const day = now.getDate();
  // If past 15th, next period is next month
  if (day > 15) {
    month = month === 12 ? 1 : month + 1;
    if (month === 1) year += 1;
  }
  const { startStr, endStr } = getPeriodDates(year, month);
  const dueDate = getDueDate(year, month);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return {
    year,
    month,
    periodStart: startStr,
    periodEnd: endStr,
    dueDate,
    dueDateStr: formatDateMY(dueDate),
    label: `${monthNames[month - 1]} ${year}`,
  };
}

/**
 * Get days until due date.
 * @param {Date} dueDate
 * @returns {number} Days until due (negative if overdue)
 */
export function daysUntilDue(dueDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dueDate);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - now) / (24 * 60 * 60 * 1000));
}

/**
 * Generate last N monthly periods from a reference month.
 * @param {number} count - Number of periods
 * @param {number} refYear - Reference year
 * @param {number} refMonth - Reference month (1–12)
 * @returns {Array<{ year: number, month: number, periodStart: string, periodEnd: string, dueDate: Date, dueDateStr: string, label: string }>}
 */
export function getPeriodsBack(count, refYear, refMonth) {
  const periods = [];
  let y = refYear;
  let m = refMonth;
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  for (let i = 0; i < count; i++) {
    const { startStr, endStr } = getPeriodDates(y, m);
    const dueDate = getDueDate(y, m);
    periods.push({
      year: y,
      month: m,
      periodStart: startStr,
      periodEnd: endStr,
      dueDate,
      dueDateStr: formatDateMY(dueDate),
      label: `${monthNames[m - 1]} ${y}`,
    });
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
  }
  return periods;
}

/** Convert Date to YYYY-MM-DD for DB. */
function toYYYYMMDD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Format date as DD MMM YYYY for display. */
function formatDateMY(d) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}
