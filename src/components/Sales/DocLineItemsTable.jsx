import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/validators';
import Button from '../Common/Button';

const defaultLine = () => ({
  id: crypto.randomUUID?.() ?? `line-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  product_code: '',
  product_variant: '',
  unit: '',
  type: '',
  doc_no: '',
  description: '',
  qty: 1,
  unit_price: 0,
  discount_pct: 0,
  discount_amount: 0,
  subtotal: 0,
});

function computeSubtotal(line) {
  const qty = Number(line.qty) || 0;
  const unitPrice = Number(line.unit_price) || 0;
  const discountPct = Number(line.discount_pct) || 0;
  const discountAmount = Number(line.discount_amount) || 0;
  const gross = qty * unitPrice;
  const discount = discountPct ? gross * (discountPct / 100) : discountAmount;
  return Math.max(0, Math.round((gross - discount) * 100) / 100);
}

/**
 * Table for quotation / invoice / credit note line items.
 * Columns: Product Code, Variant, Unit, Type, Doc. No., Description, Qty, Unit Price, Discount, Subtotal.
 * Add row, delete row, recalc subtotal and total. All money in RM; use formatCurrency in UI.
 */
function DocLineItemsTable({ lines, onChange, total, readOnly = false }) {
  const updateLine = useCallback(
    (index, updates) => {
      const next = lines.map((l, i) => (i === index ? { ...l, ...updates } : l));
      next[index].subtotal = computeSubtotal(next[index]);
      onChange(next);
    },
    [lines, onChange]
  );

  const addRow = useCallback(() => {
    const newLine = defaultLine();
    onChange([...lines, newLine]);
  }, [lines, onChange]);

  const removeRow = useCallback(
    (index) => {
      const next = lines.filter((_, i) => i !== index);
      onChange(next);
    },
    [lines, onChange]
  );

  const totalAmount = total ?? lines.reduce((sum, l) => sum + (Number(l.subtotal) || 0), 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800 text-left">
            <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">Product Code</th>
            <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">Variant</th>
            <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">Unit</th>
            <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">Type</th>
            <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">Doc. No.</th>
            <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">Description</th>
            <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300 text-right">Qty</th>
            <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300 text-right">Unit Price</th>
            <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300 text-right">Discount</th>
            <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300 text-right">Subtotal</th>
            {!readOnly && <th className="px-3 py-2 w-10" aria-label="Actions" />}
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={line.id ?? index} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={line.product_code ?? ''}
                  onChange={(e) => updateLine(index, { product_code: e.target.value })}
                  className="w-full min-w-[80px] rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-slate-900 dark:text-white"
                  disabled={readOnly}
                  aria-label="Product code"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={line.product_variant ?? ''}
                  onChange={(e) => updateLine(index, { product_variant: e.target.value })}
                  className="w-full min-w-[60px] rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1"
                  disabled={readOnly}
                  aria-label="Variant"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={line.unit ?? ''}
                  onChange={(e) => updateLine(index, { unit: e.target.value })}
                  className="w-16 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1"
                  disabled={readOnly}
                  aria-label="Unit"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={line.type ?? ''}
                  onChange={(e) => updateLine(index, { type: e.target.value })}
                  className="w-20 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1"
                  disabled={readOnly}
                  aria-label="Type"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={line.doc_no ?? ''}
                  onChange={(e) => updateLine(index, { doc_no: e.target.value })}
                  className="w-24 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1"
                  disabled={readOnly}
                  aria-label="Doc. no."
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={line.description ?? ''}
                  onChange={(e) => updateLine(index, { description: e.target.value })}
                  className="w-full min-w-[120px] rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1"
                  disabled={readOnly}
                  aria-label="Description"
                />
              </td>
              <td className="px-3 py-2 text-right">
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={line.qty ?? ''}
                  onChange={(e) => updateLine(index, { qty: e.target.value })}
                  className="w-20 text-right rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1"
                  disabled={readOnly}
                  aria-label="Qty"
                />
              </td>
              <td className="px-3 py-2 text-right">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.unit_price ?? ''}
                  onChange={(e) => updateLine(index, { unit_price: e.target.value })}
                  className="w-24 text-right rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1"
                  disabled={readOnly}
                  aria-label="Unit price"
                />
              </td>
              <td className="px-3 py-2 text-right">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="% or amt"
                  value={line.discount_pct ? line.discount_pct : line.discount_amount ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    const num = Number(v) || 0;
                    updateLine(index, { discount_pct: num, discount_amount: 0 });
                  }}
                  className="w-20 text-right rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1"
                  disabled={readOnly}
                  aria-label="Discount"
                />
              </td>
              <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-white">
                {formatCurrency(Number(line.subtotal) || 0)}
              </td>
              {!readOnly && (
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-600 dark:text-red-400 hover:underline text-sm"
                    aria-label="Remove row"
                  >
                    Remove
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!readOnly && (
        <div className="mt-2">
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            Add row
          </Button>
        </div>
      )}
      <p className="mt-3 text-right font-semibold text-slate-900 dark:text-white">
        Total: {formatCurrency(Number(totalAmount) || 0)}
      </p>
    </div>
  );
}

DocLineItemsTable.propTypes = {
  lines: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      product_code: PropTypes.string,
      product_variant: PropTypes.string,
      unit: PropTypes.string,
      type: PropTypes.string,
      doc_no: PropTypes.string,
      description: PropTypes.string,
      qty: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      unit_price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      discount_pct: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      discount_amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      subtotal: PropTypes.number,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  total: PropTypes.number,
  readOnly: PropTypes.bool,
};

export default DocLineItemsTable;
