/**
 * InvestorProfilePage
 * 
 * Main page for displaying detailed investor profile
 * Includes portfolio view and investment history
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useInvestors } from '@/hooks/useInvestors';
import { InvestorProfile } from '@/components/crm/InvestorProfile';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function InvestorProfilePage() {
  const { investorId } = useParams<{ investorId: string }>();
  const navigate = useNavigate();
  const { getInvestor, isLoading, error } = useInvestors();
  const [investor, setInvestor] = useState(investorId ? getInvestor(investorId) : undefined);

  useEffect(() => {
    if (investorId && !isLoading) {
      const foundInvestor = getInvestor(investorId);
      setInvestor(foundInvestor);
    }
  }, [investorId, isLoading, getInvestor]);

  const handleEdit = () => {
    // Navigate to edit page or open edit modal
    console.log('Edit investor:', investorId);
    // TODO: Implement edit functionality
  };

  const handleBack = () => {
    navigate('/crm/investors');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading investor profile...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Investor</h2>
              <p className="text-gray-600 mb-6">{error.message}</p>
              <Button onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Investors
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Investor Not Found</h2>
              <p className="text-gray-600 mb-6">
                The investor you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Investors
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        {/* Breadcrumb / Back Navigation */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Investors
            </Button>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <InvestorProfile investor={investor} onEdit={handleEdit} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
