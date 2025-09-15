'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        new: 'bg-blue-50 text-blue-700 border border-blue-200',
        contacted: 'bg-purple-50 text-purple-700 border border-purple-200',
        qualified: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
        proposal: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        negotiation: 'bg-orange-50 text-orange-700 border border-orange-200',
        'closed-won': 'bg-green-50 text-green-700 border border-green-200',
        'closed-lost': 'bg-red-50 text-red-700 border border-red-200',
        default: 'bg-gray-50 text-gray-700 border border-gray-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: string;
}

export function StatusBadge({
  className,
  variant,
  status,
  ...props
}: StatusBadgeProps) {
  // Convert status to lowercase and replace underscores with hyphens for CSS class compatibility
  const normalizedStatus = status.toLowerCase().replace('_', '-');
  
  return (
    <div
      className={cn(statusBadgeVariants({ variant: normalizedStatus as any, className }))}
      {...props}
    >
      {status.replace('_', ' ')}
    </div>
  );
}