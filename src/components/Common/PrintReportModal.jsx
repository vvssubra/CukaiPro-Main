import { useState } from 'react';

/**
 * Modal for print options: orientation, copies (optional), then trigger window.print().
 * Use when the user clicks "Print" on a report page.
 */
function PrintReportModal({ isOpen, onClose, title = 'Print Report', reportTitle = 'Report', onPrint }) {
  const [orientation, setOrientation] = useState('portrait');

  const handlePrint = () => {
    if (onPrint) {
      onPrint({ orientation });
    } else {
      if (typeof window !== 'undefined') window.print();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog" aria-labelledby="print-modal-title">
      <div className="bg-white dark:bg-slate-custom rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 id="print-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Orientation</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>
        <div className="p-6 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrintReportModal;
