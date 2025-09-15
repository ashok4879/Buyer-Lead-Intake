import { z } from 'zod';

// Enum validation schemas
export const CitySchema = z.enum([
  'MUMBAI',
  'THANE',
  'NAVI_MUMBAI',
  'OTHER'
]);

export const PropertyTypeSchema = z.enum([
  'APARTMENT',
  'VILLA',
  'PLOT',
  'COMMERCIAL',
  'OTHER'
]);

export const BHKSchema = z.enum([
  'ONE_RK',
  'ONE_BHK',
  'TWO_BHK',
  'THREE_BHK',
  'FOUR_PLUS_BHK',
  'OTHER'
]);

export const PurposeSchema = z.enum([
  'INVESTMENT',
  'END_USE',
  'UNDECIDED'
]);

export const TimelineSchema = z.enum([
  'IMMEDIATE',
  'THREE_MONTHS',
  'SIX_MONTHS',
  'ONE_YEAR',
  'MORE_THAN_YEAR'
]);

export const SourceSchema = z.enum([
  'WEBSITE',
  'REFERRAL',
  'DIRECT',
  'PARTNER',
  'OTHER'
]);

export const StatusSchema = z.enum([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST'
]);

// Buyer form validation schema
export const buyerFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }),
  budget: z.coerce.number().min(1, { message: 'Budget must be greater than 0' }),
  city: CitySchema,
  propertyType: PropertyTypeSchema,
  bhk: BHKSchema,
  purpose: PurposeSchema,
  timeline: TimelineSchema,
  source: SourceSchema,
  status: StatusSchema.default('NEW'),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

// Type for the form data
export type BuyerFormValues = z.infer<typeof buyerFormSchema>;

// Buyer search/filter validation schema
export const buyerFilterSchema = z.object({
  search: z.string().optional(),
  city: CitySchema.optional(),
  propertyType: PropertyTypeSchema.optional(),
  bhk: BHKSchema.optional(),
  purpose: PurposeSchema.optional(),
  timeline: TimelineSchema.optional(),
  source: SourceSchema.optional(),
  status: StatusSchema.optional(),
  minBudget: z.coerce.number().optional(),
  maxBudget: z.coerce.number().optional(),
});

export type BuyerFilterValues = z.infer<typeof buyerFilterSchema>;