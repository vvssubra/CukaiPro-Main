/**
 * Malaysian tax deduction categories for business, capital allowance, and personal relief.
 * Used by DeductionsPage and tax calculation.
 */

export const TAX_CATEGORIES = [
  // Business Expenses (100% claimable)
  { id: 'salaries', name: 'Salaries & Wages', type: 'business', claimable: 100, icon: 'people' },
  { id: 'rent', name: 'Business Rent', type: 'business', claimable: 100, icon: 'home_work' },
  { id: 'utilities', name: 'Utilities', type: 'business', claimable: 100, icon: 'power' },
  { id: 'insurance', name: 'Business Insurance', type: 'business', claimable: 100, icon: 'shield' },
  { id: 'advertising', name: 'Advertising & Promotion', type: 'business', claimable: 100, icon: 'campaign' },
  { id: 'professional_fees', name: 'Professional Fees', type: 'business', claimable: 100, icon: 'account_balance' },
  { id: 'repairs', name: 'Repairs & Maintenance', type: 'business', claimable: 100, icon: 'build' },
  { id: 'office_supplies', name: 'Office Supplies', type: 'business', claimable: 100, icon: 'inventory' },
  { id: 'travel', name: 'Business Travel', type: 'business', claimable: 100, icon: 'flight' },
  { id: 'training', name: 'Staff Training', type: 'business', claimable: 100, icon: 'school', doubleDeduction: true },
  { id: 'bank_charges', name: 'Bank Charges & Interest', type: 'business', claimable: 100, icon: 'account_balance_wallet' },
  { id: 'subscriptions', name: 'Subscriptions & Memberships', type: 'business', claimable: 100, icon: 'groups' },
  { id: 'telecommunications', name: 'Telecommunications', type: 'business', claimable: 100, icon: 'phone_android' },
  { id: 'donations', name: 'Donations (Approved)', type: 'business', claimable: 100, icon: 'volunteer_activism' },

  // Capital Allowance
  { id: 'machinery', name: 'Machinery & Equipment', type: 'capital', initial: 20, annual: 14, icon: 'precision_manufacturing' },
  { id: 'vehicle', name: 'Motor Vehicles', type: 'capital', initial: 20, annual: 20, icon: 'directions_car' },
  { id: 'computers', name: 'Computers & IT Equipment', type: 'capital', initial: 20, annual: 40, icon: 'computer' },
  { id: 'furniture', name: 'Furniture & Fittings', type: 'capital', initial: 20, annual: 10, icon: 'chair' },

  // Personal Relief
  { id: 'self_dependent', name: 'Self & Dependents', type: 'personal', maxClaim: 9000, icon: 'family_restroom' },
  { id: 'parents_medical', name: 'Parents Medical', type: 'personal', maxClaim: 8000, icon: 'medical_services' },
  { id: 'education_self', name: 'Education (Self)', type: 'personal', maxClaim: 7000, icon: 'school' },
  { id: 'epf', name: 'EPF Contributions', type: 'personal', maxClaim: 4000, icon: 'savings' },
  { id: 'life_insurance', name: 'Life Insurance', type: 'personal', maxClaim: 3000, icon: 'health_and_safety' },
  { id: 'medical_insurance', name: 'Medical Insurance', type: 'personal', maxClaim: 4000, icon: 'local_hospital' },
  { id: 'socso', name: 'SOCSO', type: 'personal', maxClaim: 350, icon: 'security' },
  { id: 'sspn', name: 'SSPN (Education Savings)', type: 'personal', maxClaim: 8000, icon: 'account_balance' },
];

export const CATEGORY_TYPES = [
  { value: 'business', label: 'Business Expenses' },
  { value: 'capital', label: 'Capital Allowance' },
  { value: 'personal', label: 'Personal Relief' },
];

export function getCategoryById(id) {
  return TAX_CATEGORIES.find((c) => c.id === id) || null;
}

export function getCategoriesByType(type) {
  return TAX_CATEGORIES.filter((c) => c.type === type);
}

export function getClaimableLabel(cat) {
  if (cat.claimable) return `${cat.claimable}% claimable`;
  if (cat.initial != null && cat.annual != null) return `${cat.initial}% initial + ${cat.annual}% annual`;
  if (cat.maxClaim != null) return `Max RM ${cat.maxClaim.toLocaleString()}`;
  return '';
}
