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

// Malaysian IC number validation
export const icNumberSchema = z
  .string()
  .regex(/^\d{6}-\d{2}-\d{4}$/, 'Please enter a valid IC number (e.g., 900101-01-1234)');

// Malaysian phone number validation
export const phoneSchema = z
  .string()
  .regex(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/, 'Please enter a valid Malaysian phone number');

// Currency amount validation
export const currencySchema = z
  .number()
  .positive('Amount must be positive')
  .max(999999999.99, 'Amount is too large');

// Tax ID validation (Malaysian business registration)
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
};

// Format currency in Malaysian Ringgit
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount);
};

// Format date in Malaysian format
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
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
