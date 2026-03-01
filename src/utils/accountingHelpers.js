/**
 * Helpers for double-entry accounting: balances, grouping by account type.
 * All amounts in RM (MYR).
 */

/** Account types for Balance Sheet (asset, liability, equity) and P&L (revenue, expense). */
export const ACCOUNT_TYPES = {
  asset: 'asset',
  liability: 'liability',
  equity: 'equity',
  revenue: 'revenue',
  expense: 'expense',
};

/** Order for Balance Sheet: Assets, Liabilities, Equity. */
export const BALANCE_SHEET_ORDER = ['asset', 'liability', 'equity'];

/** Order for P&L: Revenue, Expense. */
export const PNL_ORDER = ['revenue', 'expense'];

/**
 * Compute running balance for an account: opening_balance + sum(debit) - sum(credit) up to and including each line.
 * @param {number} openingBalance - From accounts.opening_balance
 * @param {Array<{ debit: number, credit: number }>} lines - Sorted by date/transaction
 * @returns {Array<{ ...line, balance: number }>}
 */
export function runningBalance(openingBalance, lines) {
  let balance = Number(openingBalance) || 0;
  return (lines || []).map((line) => {
    const debit = Number(line.debit) || 0;
    const credit = Number(line.credit) || 0;
    balance += debit - credit;
    return { ...line, balance };
  });
}

/**
 * Compute per-account balances as at a given date (inclusive).
 * Uses transaction_lines joined to transactions (transaction_date <= asOfDate) and accounts.opening_balance.
 * @param {Array<{ id: string, opening_balance: number }>} accounts - List of accounts
 * @param {Array<{ account_id: string, debit: number, credit: number, transaction_date: string }>} linesWithDate - Transaction lines with transaction_date on each
 * @param {string} asOfDate - YYYY-MM-DD
 * @returns {Record<string, number>} accountId -> balance (debit positive for asset/expense convention)
 */
export function balancesAsAt(accounts, linesWithDate, asOfDate) {
  const asOf = asOfDate ? new Date(asOfDate) : new Date();
  const result = {};
  (accounts || []).forEach((a) => {
    result[a.id] = Number(a.opening_balance) || 0;
  });
  (linesWithDate || []).forEach((line) => {
    const d = line.transaction_date ? new Date(line.transaction_date) : null;
    if (!d || d > asOf) return;
    const accountId = line.account_id;
    if (!result.hasOwnProperty(accountId)) result[accountId] = 0;
    result[accountId] += Number(line.debit) || 0;
    result[accountId] -= Number(line.credit) || 0;
  });
  return result;
}

/**
 * Group account IDs by type for reports.
 * @param {Array<{ id: string, type: string }>} accounts
 * @returns {Record<string, string[]>} type -> accountIds
 */
export function groupAccountsByType(accounts) {
  const map = {};
  (accounts || []).forEach((a) => {
    if (!map[a.type]) map[a.type] = [];
    map[a.type].push(a.id);
  });
  return map;
}

/**
 * Standard grouping labels for Balance Sheet (Current Assets, Fixed Assets, etc.).
 * Used for display; actual grouping can be by account type or parent.
 */
export const BALANCE_SHEET_GROUP_LABELS = {
  asset: 'Assets',
  liability: 'Liabilities & Equity',
  equity: 'Equity',
};

export const PNL_GROUP_LABELS = {
  revenue: 'Income',
  expense: 'Expenses',
};
