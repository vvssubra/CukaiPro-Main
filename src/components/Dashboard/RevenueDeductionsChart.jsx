import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/validators';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Parse DD/MM/YYYY or ISO date to month index (0–11). */
function getMonthIndex(dateStr) {
  if (!dateStr) return -1;
  if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [, month] = dateStr.split('/').map(Number);
    return month - 1;
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? -1 : d.getMonth();
}

/** Parse date to year. */
function getYear(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [, , year] = dateStr.split('/').map(Number);
    return year;
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d.getFullYear();
}

/**
 * Revenue & deductions chart by month.
 * @param {object} props
 * @param {Array} props.invoices - Invoices with invoice_date, amount
 * @param {Array} props.deductions - Deductions with deduction_date, claimable_amount or amount + claimable_percentage
 * @param {number} props.year - Tax year to display
 */
function RevenueDeductionsChart({ invoices = [], deductions = [], year }) {
  const data = useMemo(() => {
    const currentYear = year ?? new Date().getFullYear();
    const byMonth = Array.from({ length: 12 }, (_, i) => ({
      month: MONTH_NAMES[i],
      revenue: 0,
      deductions: 0,
    }));

    (invoices || []).forEach((inv) => {
      const y = getYear(inv.invoice_date);
      if (y !== currentYear) return;
      const m = getMonthIndex(inv.invoice_date);
      if (m >= 0 && m < 12) {
        byMonth[m].revenue += Number(inv.amount) || 0;
      }
    });

    (deductions || []).forEach((d) => {
      if (Number(d.tax_year) !== currentYear) return;
      const claimable = Number(d.claimable_amount ?? (d.amount || 0) * ((d.claimable_percentage || 0) / 100)) || 0;
      const dDate = d.deduction_date;
      const y = typeof dDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dDate)
        ? parseInt(dDate.slice(0, 4), 10)
        : getYear(dDate);
      if (y !== currentYear) return;
      const m = typeof dDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dDate)
        ? parseInt(dDate.slice(5, 7), 10) - 1
        : new Date(dDate).getMonth();
      if (m >= 0 && m < 12) {
        byMonth[m].deductions += claimable;
      }
    });

    return byMonth;
  }, [invoices, deductions, year]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0]?.payload;
    if (!p) return null;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-sm">
        <p className="font-bold text-slate-900 dark:text-white mb-1">{p.month}</p>
        <p className="text-primary dark:text-emerald-400">Revenue: {formatCurrency(p.revenue)}</p>
        <p className="text-amber-600 dark:text-amber-400">Deductions: {formatCurrency(p.deductions)}</p>
      </div>
    );
  };

  return (
    <div className="w-full h-[240px]" aria-label="Revenue and deductions by month">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'currentColor', fontSize: 11 }}
            className="text-slate-500 dark:text-slate-400"
          />
          <YAxis
            tick={{ fill: 'currentColor', fontSize: 11 }}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
            className="text-slate-500 dark:text-slate-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill="rgb(16 185 129)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="deductions"
            name="Deductions"
            fill="rgb(245 158 11)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

RevenueDeductionsChart.propTypes = {
  invoices: PropTypes.array,
  deductions: PropTypes.array,
  year: PropTypes.number,
};

export default RevenueDeductionsChart;
