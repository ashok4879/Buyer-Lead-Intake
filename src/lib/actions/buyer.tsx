'use server'; // MUST be server-only

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function addBuyer(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/signin');

  // Map enums
  const timelineMap: Record<string, string> = {
    '0-3m': 'ZeroToThreeMonths',
    '3-6m': 'ThreeToSixMonths',
    '>6m': 'MoreThanSixMonths',
    Exploring: 'Exploring',
  };

  const sourceMap: Record<string, string> = {
    Website: 'Website',
    Referral: 'Referral',
    'Walk-in': 'WalkIn',
    Call: 'Call',
    Other: 'Other',
  };

  const city = formData.get('city')?.toString() || 'Other';
  const propertyType = formData.get('propertyType')?.toString() || 'Apartment';
  const purpose = formData.get('purpose')?.toString() || 'Buy';
  const bhk = formData.get('bhk')?.toString() || null;
  const timeline = timelineMap[formData.get('timeline')?.toString() || 'Exploring']!;
  const source = sourceMap[formData.get('source')?.toString() || 'Other']!;
  const status = formData.get('status')?.toString() || 'New';
  const fullName = formData.get('fullName')?.toString() || '';
  const email = formData.get('email')?.toString() || '';
  const phone = formData.get('phone')?.toString() || '';
  const notes = formData.get('notes')?.toString() || '';
  const tags = formData.get('tags')?.toString() || '';
  const minBudget = formData.get('minBudget')?.toString();
  const maxBudget = formData.get('maxBudget')?.toString();

  await prisma.buyer.create({
    data: {
      fullName,
      email,
      phone,
      city,
      propertyType,
      purpose,
      bhk,
      timeline,
      source,
      status: status as 'New' | 'InProgress' | 'Closed' | 'Lost',
      budgetMin: minBudget ? parseFloat(minBudget) : null,
      budgetMax: maxBudget ? parseFloat(maxBudget) : null,
      notes,
      tags,
      ownerId: session.user.id,
    },
  });

  redirect('/buyers');
}
