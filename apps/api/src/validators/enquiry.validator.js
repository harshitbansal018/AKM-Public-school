import { z } from 'zod';
import { CLASS_GROUPS, ENQUIRY_STATUS, MEDIUM } from '../config/constants.js';
import { optionalText } from './common.validator.js';

/**
 * The public form. Deliberately forgiving about phone formatting — parents
 * type "+91 98765 43210", "098765 43210" and "9876543210" — but strict that
 * there are 10 real digits behind it.
 */
export const createEnquirySchema = z.object({
  // Required on the form, but the column stays nullable: enquiries taken before
  // the student name was compulsory would fail to load otherwise.
  studentName: z.string().trim().min(2, 'Enter the student name').max(120),

  parentName: z.string().trim().min(2, 'Enter the parent name').max(120),

  phone: z
    .string()
    .trim()
    .min(10, 'Enter a valid phone number')
    .max(20)
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 13;
    }, 'Enter a valid 10-digit phone number'),

  email: z.string().trim().toLowerCase().email('Enter a valid email').optional().nullable(),
  classGroup: z.enum(CLASS_GROUPS, { errorMap: () => ({ message: 'Choose a class' }) }),
  medium: z.enum(Object.values(MEDIUM)).optional().nullable(),
  address: optionalText(500),
  message: optionalText(2000),

  // Honeypot — the middleware handles it; accepted here so validation passes.
  website: z.string().optional(),
});

export const updateEnquirySchema = z.object({
  status: z.enum(Object.values(ENQUIRY_STATUS)).optional(),
  adminNote: optionalText(2000),
});

export const listEnquiriesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(Object.values(ENQUIRY_STATUS)).optional(),
  q: z.string().trim().max(120).optional(),
});
