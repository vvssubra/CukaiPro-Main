import { useMemo } from 'react';
import { useInvoices } from './useInvoices';
import { useDeductionsForYears } from './useDeductions';
import { useTaxCalculation } from './useTaxCalculation';

/**
 * Hook: YoY tax comparison for Dashboard metrics.
 * Returns current year, previous year, and comparison deltas.
 * @returns {{
 *   currentYear: number,
 *   previousYear: number,
 *   current: { revenue, totalDeductions, incomeTax, sstPayable, taxSavings },
 *   previous: { revenue, totalDeductions, incomeTax, sstPayable, taxSavings },
 *   yoy: { revenue: number, totalDeductions: number, incomeTax: number, taxSavings: number },
 *   loading: boolean
 * }}
 */
export function useYoYTaxData() {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const years = useMemo(() => [currentYear, previousYear], [currentYear, previousYear]);

  const { invoices, loading: invoicesLoading } = useInvoices();
  const { deductionsByYear, loading: deductionsLoading } = useDeductionsForYears(years);

  const deductionsCurrent = deductionsByYear[currentYear] ?? [];
  const deductionsPrevious = deductionsByYear[previousYear] ?? [];

  const current = useTaxCalculation(invoices, deductionsCurrent, currentYear);
  const previous = useTaxCalculation(invoices, deductionsPrevious, previousYear);

  const yoy = useMemo(
    () => ({
      revenue: previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0,
      totalDeductions:
        previous.totalDeductions > 0
          ? ((current.totalDeductions - previous.totalDeductions) / previous.totalDeductions) * 100
          : 0,
      incomeTax:
        previous.incomeTax > 0 ? ((current.incomeTax - previous.incomeTax) / previous.incomeTax) * 100 : 0,
      taxSavings:
        previous.taxSavings > 0 ? ((current.taxSavings - previous.taxSavings) / previous.taxSavings) * 100 : 0,
    }),
    [
      current.revenue,
      current.totalDeductions,
      current.incomeTax,
      current.taxSavings,
      previous.revenue,
      previous.totalDeductions,
      previous.incomeTax,
      previous.taxSavings,
    ]
  );

  const loading = invoicesLoading || deductionsLoading;

  return {
    currentYear,
    previousYear,
    current,
    previous,
    yoy,
    loading,
  };
}
