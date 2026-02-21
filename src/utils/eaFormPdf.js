import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './validators';
import { computeEASummary } from '../hooks/useEAForms';

/**
 * Safely get numeric value from EA form field.
 * @param {number|string|null|undefined} val
 * @returns {number}
 */
function num(val) {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Build income/deduction rows for a single EA form.
 * @param {Object} ea - EA form record
 * @param {{ totalRemuneration: number, netEmploymentIncome: number }} summary
 * @returns {{ incomeRows: string[][], deductionRows: string[][] }}
 */
function buildEATableRows(ea, summary) {
  const fmt = (n) => formatCurrency(num(n));

  const incomeRows = [
    ['Gross Salary', fmt(ea.gross_salary)],
    ['Allowances', fmt(ea.allowances)],
    ['Bonuses', fmt(ea.bonuses)],
    ['Benefits in Kind', fmt(ea.benefits_in_kind)],
    ['Overtime', fmt(ea.overtime)],
    ['Director Fees', fmt(ea.director_fees)],
    ['Commission', fmt(ea.commission)],
    ['Total Remuneration', fmt(summary.totalRemuneration)],
  ];

  const deductionRows = [
    ['EPF (Employee)', fmt(ea.epf_employee)],
    ['SOCSO', fmt(ea.socso)],
    ['EIS', fmt(ea.eis)],
    ['PCB', fmt(ea.pcb)],
    ['Net Employment Income', fmt(summary.netEmploymentIncome)],
  ];

  return { incomeRows, deductionRows };
}

/**
 * Add one EA form section to the PDF.
 * @param {jsPDF} doc
 * @param {Object} ea - EA form record
 * @param {number} taxYear
 * @param {number} index - 1-based form index (for "Form 1 of N")
 * @param {number} total - total number of forms
 * @param {number} startY - starting Y position
 * @returns {number} Y position after this section
 */
function addEAFormSection(doc, ea, taxYear, index, total, startY) {
  const summary = computeEASummary(ea);
  const { incomeRows, deductionRows } = buildEATableRows(ea, summary);

  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let y = startY;

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`EA Form - Employment Information (${taxYear})`, margin, y);
  y += 8;

  if (total > 1) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Form ${index} of ${total}`, margin, y);
    y += 6;
  }

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Employee Information', margin, y);
  y += 6;

  doc.setFont(undefined, 'normal');
  doc.text(`Name: ${ea.employee_name || '—'}`, margin, y);
  y += 5;
  doc.text(`IC No: ${ea.employee_ic || '—'}`, margin, y);
  y += 5;
  doc.text(`Tax File No: ${ea.employee_tax_no || '—'}`, margin, y);
  y += 10;

  doc.setFont(undefined, 'bold');
  doc.text('Income (RM)', margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Amount (RM)']],
    body: incomeRows,
    theme: 'grid',
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [71, 85, 105] },
    columnStyles: { 0: { cellWidth: contentWidth * 0.6 }, 1: { cellWidth: contentWidth * 0.4, halign: 'right' } },
  });
  y = doc.lastAutoTable.finalY + 8;

  doc.setFont(undefined, 'bold');
  doc.text('Deductions & Net Income (RM)', margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Amount (RM)']],
    body: deductionRows,
    theme: 'grid',
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [71, 85, 105] },
    columnStyles: { 0: { cellWidth: contentWidth * 0.6 }, 1: { cellWidth: contentWidth * 0.4, halign: 'right' } },
  });
  y = doc.lastAutoTable.finalY + 12;

  if (ea.notes) {
    doc.setFont(undefined, 'italic');
    doc.setFontSize(9);
    doc.text(`Notes: ${ea.notes}`, margin, y);
    y += 8;
  }

  return y;
}

/**
 * Generate EA Form PDF and trigger download.
 * @param {Object|Object[]} eaFormsOrSingle - Single EA form object or array of EA forms
 * @param {number} taxYear - Tax year (e.g. 2025)
 * @param {{ filename?: string }} [options] - Optional filename (without .pdf)
 */
export function generateEAFormPDF(eaFormsOrSingle, taxYear, options = {}) {
  const forms = Array.isArray(eaFormsOrSingle) ? eaFormsOrSingle : [eaFormsOrSingle];
  if (forms.length === 0) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;
  const bottomMargin = 20;

  let y = margin;

  for (let i = 0; i < forms.length; i++) {
    if (y > pageHeight - 100) {
      doc.addPage();
      y = margin;
    }

    y = addEAFormSection(doc, forms[i], taxYear, i + 1, forms.length, y);
  }

  const baseFilename = options.filename || `EA-Forms-${taxYear}`;
  const filename = forms.length === 1 && forms[0].employee_name
    ? `EA-${forms[0].employee_name.replace(/\s+/g, '-')}-${taxYear}.pdf`
    : `${baseFilename}.pdf`;

  doc.save(filename);
}
