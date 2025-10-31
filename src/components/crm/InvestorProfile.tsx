/**
 * InvestorProfile Component
 * 
 * Displays comprehensive investor profile with all details,
 * portfolio, and investment history
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Investor } from '@/lib/schemas/crm';
import { PortfolioView } from './PortfolioView';
import { InvestmentHistory } from './InvestmentHistory';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Building,
  Calendar,
  FileText,
  Edit,
  Share2,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface InvestorProfileProps {
  investor: Investor;
  onEdit?: () => void;
}

export function InvestorProfile({ investor, onEdit }: InvestorProfileProps) {
  const displayName = investor.companyName || 
    `${investor.firstName || ''} ${investor.lastName || ''}`.trim() || 
    'Unnamed Investor';

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

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
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{displayName}</h1>
                <div className="flex items-center space-x-3 mt-2">
                  <Badge className={getStatusColor(investor.status)}>
                    {investor.status}
                  </Badge>
                  <Badge variant="outline">
                    {getTypeLabel(investor.type)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button variant="outline" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Contact Information
              </h3>
              <div className="space-y-2 text-sm">
                {investor.contact.email && (
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{investor.contact.email}</p>
                  </div>
                )}
                {investor.contact.phone && (
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{investor.contact.phone}</p>
                  </div>
                )}
                {investor.contact.preferredContact && (
                  <div>
                    <span className="text-gray-600">Preferred Contact:</span>
                    <p className="font-medium capitalize">
                      {investor.contact.preferredContact}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {investor.address && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Address
                </h3>
                <div className="space-y-1 text-sm">
                  {investor.address.street && <p>{investor.address.street}</p>}
                  <p>
                    {[
                      investor.address.city,
                      investor.address.state,
                      investor.address.zip
                    ].filter(Boolean).join(', ')}
                  </p>
                  {investor.address.country && (
                    <p className="text-gray-600">{investor.address.country}</p>
                  )}
                </div>
              </div>
            )}

            {/* Company Information */}
            {investor.companyName && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Company
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Company Name:</span>
                    <p className="font-medium">{investor.companyName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dates */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Joined:</span>
                  <p className="font-medium">{formatDate(investor.createdAt)}</p>
                </div>
                {investor.lastContactedAt && (
                  <div>
                    <span className="text-gray-600">Last Contacted:</span>
                    <p className="font-medium">{formatDate(investor.lastContactedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Accreditation */}
            {investor.accreditation && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Accreditation
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    {investor.accreditation.isAccredited ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-600">Accredited</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-600">Not Accredited</span>
                      </>
                    )}
                  </div>
                  {investor.accreditation.verifiedAt && (
                    <div>
                      <span className="text-gray-600">Verified:</span>
                      <p className="font-medium">
                        {formatDate(investor.accreditation.verifiedAt)}
                      </p>
                    </div>
                  )}
                  {investor.accreditation.expiresAt && (
                    <div>
                      <span className="text-gray-600">Expires:</span>
                      <p className="font-medium">
                        {formatDate(investor.accreditation.expiresAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {investor.tags && investor.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {investor.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {investor.notes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {investor.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Portfolio and History */}
      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="history">Investment History</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <PortfolioView investor={investor} />
        </TabsContent>

        <TabsContent value="history">
          <InvestmentHistory investor={investor} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
