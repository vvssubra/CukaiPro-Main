/**
 * Shared report export helpers: CSV, PDF (jsPDF), and print.
 * Use formatCurrency from validators for RM when building row data.
 */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Escape a value for CSV (quotes and commas).
 * @param {string|number} value
 * @returns {string}
 */
function escapeCSV(value) {
  if (value == null) return '""';
  const s = String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return `"${s}"`;
}

/**
 * Export table data to CSV and download.
 * @param {string[]} headers - Column headers
 * @param {Array<string|number>[]} rows - Array of row arrays
 * @param {string} [filename] - Download filename (default report-export.csv)
 */
export function exportToCSV(headers, rows, filename = 'report-export.csv') {
  const headerRow = headers.map(escapeCSV).join(',');
  const dataRows = rows.map((row) => row.map(escapeCSV).join(','));
  const csv = [headerRow, ...dataRows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export table data to PDF using jsPDF and autoTable.
 * @param {string} title - Report title
 * @param {string} [subtitle] - Optional subtitle (e.g. date range)
 * @param {string[]} headers - Column headers
 * @param {Array<string|number>[]} rows - Array of row arrays
 * @param {string} [filename] - Download filename (default report.pdf)
 * @param {{ orientation?: 'portrait'|'landscape' }} [opts]
 */
export function exportToPDF(title, subtitle, headers, rows, filename = 'report.pdf', opts = {}) {
  const doc = new jsPDF({ orientation: opts.orientation || 'portrait' });
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  if (subtitle) {
    doc.setFontSize(10);
    doc.text(subtitle, 14, 28);
  }
  const startY = subtitle ? 34 : 26;
  doc.autoTable({
    head: [headers],
    body: rows,
    startY,
    theme: 'striped',
    headStyles: { fillColor: [71, 84, 105] },
    margin: { left: 14 },
  });
  doc.save(filename);
}

/**
 * Trigger browser print. Call from a report page; the current document will be printed.
 * Optionally set a print title for the window.
 * @param {{ title?: string, orientation?: 'portrait'|'landscape' }} [opts]
 */
export function printReport(opts = {}) {
  if (opts.title && typeof document !== 'undefined') {
    const prev = document.title;
    document.title = opts.title;
    window.print();
    document.title = prev;
  } else {
    window.print();
  }
}
