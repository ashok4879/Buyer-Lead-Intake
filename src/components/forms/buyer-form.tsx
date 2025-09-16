'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { type BuyerFormValues } from '@/lib/validations/buyer';

interface BuyerFormProps {
  initialData?: BuyerFormValues;
  isEditing?: boolean;
  serverAction?: (formData: FormData) => Promise<void>;
}

export function BuyerForm({ initialData, isEditing = false, serverAction }: BuyerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BuyerFormValues>({
    defaultValues: initialData || {
      fullName: '',
      email: '',
      phone: '',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      purpose: 'Buy',
      bhk: '',
      timeline: '',
      source: '',
      status: 'New',
      minBudget: '', // ✅ string
      maxBudget: '', // ✅ string
      tags: '',
      notes: '',
    },
  });

  const handleSubmit = async (data: BuyerFormValues) => {
    if (!serverAction) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Append all fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'minBudget' || key === 'maxBudget') {
          formData.append(key, value ? value.toString() : '');
        } else {
          formData.append(key, value?.toString() ?? '');
        }
      });

      await serverAction(formData);
    } catch (err) {
      console.error('Form submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enum options
  const cities = ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'];
  const propertyTypes = ['Apartment', 'Villa', 'Plot', 'Office', 'Retail'];
  const purposes = ['Buy', 'Rent'];
  const bhks = ['Studio', 'One', 'Two', 'Three', 'Four'];
  const timelines = ['0-3m', '3-6m', '>6m', 'Exploring'];
  const sources = ['Website', 'Referral', 'Walk-in', 'Call', 'Other'];
  const statuses = ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Full Name */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }: { field: { value: string; onChange: (value: string) => void; } }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter full name"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter email" 
                  type="email"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter phone"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Enum selects */}
        {[
          { name: 'city', options: cities },
          { name: 'propertyType', options: propertyTypes },
          { name: 'purpose', options: purposes },
          { name: 'bhk', options: bhks },
          { name: 'timeline', options: timelines },
          { name: 'source', options: sources },
          { name: 'status', options: statuses },
        ].map(({ name, options }) => (
          <FormField
            key={name}
            control={form.control}
            name={name as keyof BuyerFormValues}
            render={({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
              <FormItem>
                <FormLabel>{name.charAt(0).toUpperCase() + name.slice(1)}</FormLabel>
                <FormControl>
                  <Controller
                    name={name as keyof BuyerFormValues}
                    control={form.control}
                    render={({ field: ctrlField }: { field: { value: string; onChange: (value: string) => void } }) => (
                      <Select value={ctrlField.value} onValueChange={ctrlField.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {/* Budget */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minBudget"
            render={({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
              <FormItem>
                <FormLabel>Min Budget</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter minimum budget"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    type="number"
                    {...field}
                    placeholder="Enter minimum budget"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxBudget"
            render={({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
              <FormItem>
                <FormLabel>Max Budget</FormLabel>
                <FormControl>
                  <Input
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    type="number"
                    {...field}
                    placeholder="Enter maximum budget"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input 
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Comma-separated tags"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Additional info"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Buyer' : 'Add Buyer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
