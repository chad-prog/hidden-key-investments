/**
 * InvestorCard Component
 * 
 * Displays a summary card for an investor with key metrics
 */

import React from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Investor } from '@/lib/schemas/crm';
import { 
  User, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Mail,
  Phone
} from 'lucide-react';

interface InvestorCardProps {
  investor: Investor;
  onSelect?: (investor: Investor) => void;
}

export function InvestorCard({ investor, onSelect }: InvestorCardProps) {
  const displayName = investor.companyName || 
    `${investor.firstName || ''} ${investor.lastName || ''}`.trim() || 
    'Unnamed Investor';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'blacklisted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{displayName}</h3>
              <p className="text-sm text-gray-600">{getTypeLabel(investor.type)}</p>
            </div>
          </div>
          <Badge className={getStatusColor(investor.status)}>
            {investor.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          {investor.contact.email && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{investor.contact.email}</span>
            </div>
          )}
          {investor.contact.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{investor.contact.phone}</span>
            </div>
          )}
        </div>

        {/* Investment Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
          <div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Total Invested</span>
            </div>
            <p className="font-semibold text-lg">
              ${(investor.totalInvested / 1000).toFixed(0)}K
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>Active Deals</span>
            </div>
            <p className="font-semibold text-lg">{investor.activeDeals}</p>
          </div>
        </div>

        {/* Accreditation Status */}
        {investor.accreditation && (
          <div className="flex items-center space-x-2 pt-3 border-t">
            {investor.accreditation.isAccredited ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm text-gray-600">
              {investor.accreditation.isAccredited ? 'Accredited Investor' : 'Not Accredited'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-3">
          <Link to={`/crm/investors/${investor.id}`} className="flex-1">
            <Button variant="default" className="w-full">
              View Profile
            </Button>
          </Link>
          {onSelect && (
            <Button 
              variant="outline" 
              onClick={() => onSelect(investor)}
              className="flex-1"
            >
              Select
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
