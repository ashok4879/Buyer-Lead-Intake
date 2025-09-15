'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Buyer, BuyerHistory } from '@prisma/client';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { BuyerForm } from '@/components/forms/buyer-form';
import { formatCurrency, formatDate, formatPhoneNumber } from '@/lib/utils';
import { StatusSchema } from '@/lib/validations/buyer';

type BuyerWithHistory = Buyer & {
  history: BuyerHistory[];
};

interface BuyerDetailProps {
  buyer: BuyerWithHistory;
}

export function BuyerDetail({ buyer }: BuyerDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(buyer.status);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (selectedStatus === buyer.status) {
      return;
    }

    setIsUpdatingStatus(true);

    try {
      const response = await fetch(`/api/buyers/${buyer.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
          note: statusNote,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success('Status updated successfully');
      router.refresh();
      setStatusNote('');
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle buyer deletion
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this buyer? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/buyers/${buyer.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete buyer');
      }

      toast.success('Buyer deleted successfully');
      router.push('/buyers');
    } catch (error) {
      toast.error('Failed to delete buyer');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Render edit form if in editing mode
  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Buyer</h2>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
        <BuyerForm 
          buyer={buyer} 
          onSuccess={() => {
            setIsEditing(false);
            router.refresh();
          }} 
        />
      </div>
    );
  }

  // Render buyer details
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header with actions */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{buyer.name}</h2>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      {/* Status section */}
      <div className="p-6 border-b bg-gray-50">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="border rounded px-3 py-2 w-full sm:w-auto"
            >
              {Object.values(StatusSchema.enum).map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Add a note about this status change"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <Button 
            onClick={handleStatusUpdate}
            disabled={isUpdatingStatus || selectedStatus === buyer.status}
          >
            {isUpdatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </div>

      {/* Contact information */}
      <div className="p-6 border-b">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{buyer.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{formatPhoneNumber(buyer.phone)}</p>
          </div>
        </div>
      </div>

      {/* Property requirements */}
      <div className="p-6 border-b">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Property Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">City</p>
            <p className="font-medium">{buyer.city.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Property Type</p>
            <p className="font-medium">{buyer.propertyType.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">BHK</p>
            <p className="font-medium">{buyer.bhk.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Budget</p>
            <p className="font-medium">{formatCurrency(buyer.budget)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Purpose</p>
            <p className="font-medium">{buyer.purpose.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Timeline</p>
            <p className="font-medium">{buyer.timeline.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Additional information */}
      <div className="p-6 border-b">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Source</p>
            <p className="font-medium">{buyer.source.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="font-medium">{formatDate(buyer.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Tags */}
      {buyer.tags && buyer.tags.length > 0 && (
        <div className="p-6 border-b">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {buyer.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Notes</h3>
        {buyer.notes ? (
          <div className="whitespace-pre-wrap">{buyer.notes}</div>
        ) : (
          <p className="text-gray-400 italic">No notes added yet</p>
        )}
      </div>
    </div>
  );
}