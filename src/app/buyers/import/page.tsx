'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function ImportExportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    status: '',
    source: '',
    city: '',
    timeline: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a CSV file to import');
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/buyers/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to import buyers');
      }

      toast.success(data.message);
      router.push('/buyers');
      router.refresh();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import buyers');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExportFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = () => {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (exportFilters.status) queryParams.set('status', exportFilters.status);
    if (exportFilters.source) queryParams.set('source', exportFilters.source);
    if (exportFilters.city) queryParams.set('city', exportFilters.city);
    if (exportFilters.timeline) queryParams.set('timeline', exportFilters.timeline);
    
    // Redirect to export endpoint
    window.location.href = `/api/buyers/export?${queryParams.toString()}`;
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Import/Export Leads</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Import Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Import Leads</h2>
          <form onSubmit={handleImport}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                Upload a CSV file with buyer data. The file should have headers matching the buyer fields.
              </p>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={!file || isUploading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </>
                ) : 'Import Leads'}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">CSV Format Example</h3>
            <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
              fullName,email,phone,city,propertyType,bhk,purpose,timeline,budget,source,status,notes<br/>
              John Doe,john@example.com,1234567890,Mumbai,Apartment,2,Investment,3-6 Months,5000000,Website,New,Interested in sea view
            </div>
          </div>
        </div>
        
        {/* Export Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Export Leads</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={exportFilters.status}
                onChange={handleExportFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Converted">Converted</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                name="source"
                value={exportFilters.source}
                onChange={handleExportFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Sources</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Social Media">Social Media</option>
                <option value="Direct">Direct</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                name="city"
                value={exportFilters.city}
                onChange={handleExportFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Pune">Pune</option>
                <option value="Ahmedabad">Ahmedabad</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline
              </label>
              <select
                name="timeline"
                value={exportFilters.timeline}
                onChange={handleExportFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Timelines</option>
                <option value="Immediate">Immediate</option>
                <option value="1-3 Months">1-3 Months</option>
                <option value="3-6 Months">3-6 Months</option>
                <option value="6-12 Months">6-12 Months</option>
                <option value="1+ Year">1+ Year</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleExport}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Export to CSV
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Export your leads to a CSV file that can be opened in Excel or Google Sheets. You can filter the data before exporting.</p>
            {session?.user?.role === 'ADMIN' && (
              <p className="mt-2 text-blue-600">As an admin, you can export all leads in the system.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}