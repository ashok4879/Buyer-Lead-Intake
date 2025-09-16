import { z } from 'zod';

// ------------------
// Enum validation schemas (match Prisma enums)
// ------------------

export const CitySchema = z.enum([
  'Chandigarh',
  'Mohali',
  'Zirakpur',
  'Panchkula',
  'Other',
]);

export const PropertyTypeSchema = z.enum([
  'Apartment',
  'Villa',
  'Plot',
  'Office',
  'Retail',
]);

export const BHKSchema = z.enum([
  'Studio',
  'One',
  'Two',
  'Three',
  'Four',
]);

export const PurposeSchema = z.enum([
  'Buy',
  'Rent',
]);

export const TimelineSchema = z.enum([
  'ZeroToThreeMonths',   // 0-3m
  'ThreeToSixMonths',    // 3-6m
  'MoreThanSixMonths',   // >6m
  'Exploring',
]);

export const SourceSchema = z.enum([
  'Website',
  'Referral',
  'WalkIn',
  'Call',
  'Other',
]);

export const StatusSchema = z.enum([
  'New',
  'Qualified',
  'Contacted',
  'Visited',
  'Negotiation',
  'Converted',
  'Dropped',
]);

// ------------------
// Buyer form validation schema
// ------------------

export const buyerFormSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }),
  city: CitySchema,
  propertyType: PropertyTypeSchema,
  bhk: BHKSchema.optional(),
  purpose: PurposeSchema,
  minBudget: z.number().optional(),   // ✅ changed from budgetMin
  maxBudget: z.number().optional(),   // ✅ changed from budgetMax
  timeline: TimelineSchema,
  source: SourceSchema,
  status: StatusSchema.default('New'),
  tags: z.string().optional(),
  notes: z.string().optional(),
  attachmentUrl: z.string().url().nullable().optional(),
});

// Type for Buyer form
export type BuyerFormValues = z.infer<typeof buyerFormSchema>;

// ------------------
// Buyer search/filter schema
// ------------------

export const buyerFilterSchema = z.object({
  search: z.string().optional(),
  city: CitySchema.optional(),
  propertyType: PropertyTypeSchema.optional(),
  bhk: BHKSchema.optional(),
  purpose: PurposeSchema.optional(),
  timeline: TimelineSchema.optional(),
  source: SourceSchema.optional(),
  status: StatusSchema.optional(),
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
});

export type BuyerFilterValues = z.infer<typeof buyerFilterSchema>;
