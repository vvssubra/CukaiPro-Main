import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string().email('Please enter a valid email address');

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Malaysian Tax Identification Number (14 digits)
/** @type {import('zod').ZodString} */
export const tinSchema = z
  .string()
  .length(14, 'TIN must be exactly 14 digits')
  .regex(/^\d{14}$/, 'TIN must contain only numbers');

// Malaysian IC number validation (format: YYMMDD-SS-XXXX)
/** @type {import('zod').ZodString} */
export const icNumberSchema = z
  .string()
  .regex(/^\d{6}-\d{2}-\d{4}$/, 'IC Number must be in format YYMMDD-SS-XXXX');

// Malaysian phone number validation (format: +60XX-XXXXXXX)
/** @type {import('zod').ZodString} */
export const phoneSchema = z
  .string()
  .regex(/^\+60\d{2}-\d{7,8}$/, 'Phone must be in format +60XX-XXXXXXX');

// Business Registration Number (12-20 characters)
/** @type {import('zod').ZodString} */
export const brnSchema = z
  .string()
  .min(12, 'BRN must be 12-20 characters')
  .max(20, 'BRN must be 12-20 characters');

// Currency amount validation (RM, max 2 decimal places)
/** @type {import('zod').ZodNumber} */
export const currencySchema = z
  .number()
  .positive('Amount must be greater than 0')
  .max(999999999.99)
  .refine(
    (val) => (val.toString().split('.')[1] || '').length <= 2,
    'Amount cannot have more than 2 decimal places'
  );

// Date validation (format: DD/MM/YYYY)
/** @type {import('zod').ZodString} */
export const dateSchema = z
  .string()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in DD/MM/YYYY format');

// Invoice form validation schema
/** @type {import('zod').ZodObject} */
export const invoiceSchema = z.object({
  clientName: z.string().min(2).max(100),
  tin: tinSchema,
  amount: currencySchema,
  invoiceDate: dateSchema,
  notes: z.string().optional(),
});

// Tax ID validation (Malaysian business registration, 12 digits)
export const taxIdSchema = z
  .string()
  .regex(/^[0-9]{12}$/, 'Tax ID must be 12 digits');

// Validation helper functions
export const validators = {
  email: (value) => emailSchema.safeParse(value).success,
  password: (value) => passwordSchema.safeParse(value).success,
  icNumber: (value) => icNumberSchema.safeParse(value).success,
  phone: (value) => phoneSchema.safeParse(value).success,
  currency: (value) => currencySchema.safeParse(value).success,
  taxId: (value) => taxIdSchema.safeParse(value).success,
  tin: (value) => tinSchema.safeParse(value).success,
  brn: (value) => brnSchema.safeParse(value).success,
};

/**
 * Formats a number as Malaysian Ringgit currency.
 * @param {number} amount - The amount to format
 * @returns {string} Formatted string e.g. "RM 1,234.56"
 */
export const formatCurrency = (amount) => {
  return `RM ${amount.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Converts a Date or date string to DD/MM/YYYY format.
 * @param {Date|string} date - The date to format
 * @returns {string} Date string in DD/MM/YYYY format
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Validate form with Zod schema
export const validateForm = (schema, data) => {
  try {
    schema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: 'Validation failed' } };
  }
};
