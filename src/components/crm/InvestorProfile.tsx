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
  XCircle,
  DollarSign,
  TrendingUp,
  MessageSquare,
  PhoneCall,
  Video,
  Upload,
  Download,
  Eye,
  Clock,
  Activity
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

      {/* Investment Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Dashboard</CardTitle>
          <CardDescription>Key metrics and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="w-4 h-4 mr-1" />
                Portfolio Value
              </div>
              <div className="text-2xl font-bold">
                ${investor.totalInvested?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5% this year
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="w-4 h-4 mr-1" />
                Active Deals
              </div>
              <div className="text-2xl font-bold">
                {investor.activeDeals || 0}
              </div>
              <div className="text-xs text-gray-600">
                {investor.totalDeals || 0} total deals
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                Average ROI
              </div>
              <div className="text-2xl font-bold">
                18.5%
              </div>
              <div className="text-xs text-green-600">
                Above market average
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                Avg. Hold Time
              </div>
              <div className="text-2xl font-bold">
                3.2 years
              </div>
              <div className="text-xs text-gray-600">
                Across all investments
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline" className="w-full">
              <PhoneCall className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Portfolio, History, Communications, Documents, Activity */}
      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <PortfolioView investor={investor} />
        </TabsContent>

        <TabsContent value="history">
          <InvestmentHistory investor={investor} />
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>All interactions with this investor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sample communications - in production, fetch from backend */}
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">Follow-up Email Sent</h4>
                      <span className="text-sm text-gray-500">2 days ago</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Quarterly investment update and new opportunity alert
                    </p>
                    <div className="mt-2 text-xs text-green-600">
                      ✓ Opened · ✓ Clicked link
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <PhoneCall className="w-5 h-5 text-green-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">Phone Call</h4>
                      <span className="text-sm text-gray-500">1 week ago</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Quarterly review call - discussed portfolio performance
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      Duration: 45 minutes
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <MessageSquare className="w-5 h-5 text-purple-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">SMS Sent</h4>
                      <span className="text-sm text-gray-500">3 days ago</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Deal alert: New downtown commercial property available
                    </p>
                    <div className="mt-2 text-xs text-green-600">
                      ✓ Delivered
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Video className="w-5 h-5 text-red-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">Video Meeting</h4>
                      <span className="text-sm text-gray-500">2 weeks ago</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Property walkthrough and investment discussion
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      Duration: 1 hour 15 minutes
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>All documents related to this investor</CardDescription>
                </div>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Sample documents - in production, fetch from backend */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Investment Agreement.pdf</h4>
                      <p className="text-sm text-gray-500">Added Oct 15, 2025 · 2.4 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-green-600" />
                    <div>
                      <h4 className="font-medium">Tax Documents 2025.pdf</h4>
                      <p className="text-sm text-gray-500">Added Sep 20, 2025 · 1.8 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Property Disclosure.pdf</h4>
                      <p className="text-sm text-gray-500">Added Aug 10, 2025 · 3.2 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-orange-600" />
                    <div>
                      <h4 className="font-medium">Accreditation Certificate.pdf</h4>
                      <p className="text-sm text-gray-500">Added Jul 5, 2025 · 800 KB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Chronological view of all activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Sample activity timeline - in production, fetch from backend */}
                <div className="relative pl-8 pb-6 border-l-2 border-gray-200">
                  <div className="absolute left-0 -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full"></div>
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="font-medium">Follow-up Email Sent</h4>
                    <span className="text-sm text-gray-500">2 days ago</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Quarterly investment update and new opportunity alert
                  </p>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    Email · Opened & Clicked
                  </div>
                </div>

                <div className="relative pl-8 pb-6 border-l-2 border-gray-200">
                  <div className="absolute left-0 -translate-x-1/2 w-4 h-4 bg-purple-600 rounded-full"></div>
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="font-medium">SMS Deal Alert</h4>
                    <span className="text-sm text-gray-500">3 days ago</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    New downtown commercial property available
                  </p>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    SMS · Delivered
                  </div>
                </div>

                <div className="relative pl-8 pb-6 border-l-2 border-gray-200">
                  <div className="absolute left-0 -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full"></div>
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="font-medium">Investment Completed</h4>
                    <span className="text-sm text-gray-500">5 days ago</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    $500,000 investment in Downtown Plaza project
                  </p>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    Deal · Closed
                  </div>
                </div>

                <div className="relative pl-8 pb-6 border-l-2 border-gray-200">
                  <div className="absolute left-0 -translate-x-1/2 w-4 h-4 bg-yellow-600 rounded-full"></div>
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="font-medium">Quarterly Review Call</h4>
                    <span className="text-sm text-gray-500">1 week ago</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Discussed portfolio performance and future opportunities
                  </p>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    Call · 45 minutes
                  </div>
                </div>

                <div className="relative pl-8 pb-6 border-l-2 border-gray-200">
                  <div className="absolute left-0 -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full"></div>
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="font-medium">Document Uploaded</h4>
                    <span className="text-sm text-gray-500">2 weeks ago</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Property Disclosure.pdf added to documents
                  </p>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    Document · 3.2 MB
                  </div>
                </div>

                <div className="relative pl-8">
                  <div className="absolute left-0 -translate-x-1/2 w-4 h-4 bg-gray-400 rounded-full"></div>
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="font-medium">Investor Profile Created</h4>
                    <span className="text-sm text-gray-500">{formatDate(investor.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Initial profile setup and accreditation verification
                  </p>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    System · Profile Created
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
