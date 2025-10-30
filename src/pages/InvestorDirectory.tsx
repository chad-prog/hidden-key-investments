/**
 * Investor Directory
 * 
 * Directory and management interface for investors with:
 * - Investor listing with search and filter
 * - Profile cards
 * - Investment history
 * - Communication tracking
 * - Portfolio metrics
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus,
  Search,
  Filter,
  Users,
  DollarSign,
  TrendingUp,
  Mail,
  Phone,
  Building2,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { isDemoMode } from '@/lib/envValidation';

interface Investor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  accreditationStatus: 'accredited' | 'pending' | 'not_accredited';
  totalInvested: number;
  activeDeals: number;
  preferredAssetTypes?: string[];
  investmentCapacity?: {
    min: number;
    max: number;
  };
  lastContact?: string;
  status: 'active' | 'prospect' | 'inactive';
}

export default function InvestorDirectory() {
  const navigate = useNavigate();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    setIsLoading(true);
    try {
      if (isDemoMode()) {
        // Demo mode: Generate mock investors
        const mockInvestors: Investor[] = [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@example.com',
            phone: '+1 (555) 123-4567',
            accreditationStatus: 'accredited',
            totalInvested: 1500000,
            activeDeals: 3,
            preferredAssetTypes: ['Multi-Family', 'Commercial'],
            investmentCapacity: { min: 250000, max: 1000000 },
            lastContact: '2025-10-25',
            status: 'active',
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com',
            phone: '+1 (555) 234-5678',
            accreditationStatus: 'accredited',
            totalInvested: 2800000,
            activeDeals: 5,
            preferredAssetTypes: ['Commercial', 'Industrial'],
            investmentCapacity: { min: 500000, max: 2000000 },
            lastContact: '2025-10-28',
            status: 'active',
          },
          {
            id: '3',
            firstName: 'Robert',
            lastName: 'Johnson',
            email: 'robert.j@example.com',
            phone: '+1 (555) 345-6789',
            accreditationStatus: 'pending',
            totalInvested: 0,
            activeDeals: 0,
            preferredAssetTypes: ['Single-Family', 'Multi-Family'],
            investmentCapacity: { min: 100000, max: 500000 },
            lastContact: '2025-10-20',
            status: 'prospect',
          },
          {
            id: '4',
            firstName: 'Sarah',
            lastName: 'Williams',
            email: 'sarah.w@investments.com',
            phone: '+1 (555) 456-7890',
            accreditationStatus: 'accredited',
            totalInvested: 950000,
            activeDeals: 2,
            preferredAssetTypes: ['Retail', 'Mixed-Use'],
            investmentCapacity: { min: 200000, max: 800000 },
            lastContact: '2025-10-15',
            status: 'active',
          },
          {
            id: '5',
            firstName: 'Michael',
            lastName: 'Brown',
            email: 'michael.brown@holdings.com',
            phone: '+1 (555) 567-8901',
            accreditationStatus: 'accredited',
            totalInvested: 3500000,
            activeDeals: 7,
            preferredAssetTypes: ['Commercial', 'Office', 'Retail'],
            investmentCapacity: { min: 1000000, max: 5000000 },
            lastContact: '2025-10-29',
            status: 'active',
          },
        ];
        setInvestors(mockInvestors);
      } else {
        // Real API call
        const response = await fetch('/.netlify/functions/investor');
        if (response.ok) {
          const data = await response.json();
          setInvestors(data.investors || []);
        }
      }
    } catch (error) {
      console.error('Error fetching investors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvestors = investors.filter((investor) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      investor.firstName.toLowerCase().includes(searchLower) ||
      investor.lastName.toLowerCase().includes(searchLower) ||
      investor.email.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAccreditationColor = (status: string) => {
    const colors = {
      accredited: 'bg-green-500',
      pending: 'bg-yellow-500',
      not_accredited: 'bg-gray-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      prospect: 'bg-blue-500',
      inactive: 'bg-gray-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const totalInvested = investors.reduce((sum, inv) => sum + inv.totalInvested, 0);
  const activeInvestors = investors.filter((inv) => inv.status === 'active').length;
  const totalActiveDeals = investors.reduce((sum, inv) => sum + inv.activeDeals, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investor Directory</h1>
          <p className="text-muted-foreground">
            Manage your investor relationships and track investments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => navigate('/crm/investors/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Investor
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
            <p className="text-xs text-muted-foreground">Across all investors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvestors}</div>
            <p className="text-xs text-muted-foreground">
              Out of {investors.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveDeals}</div>
            <p className="text-xs text-muted-foreground">Ongoing investments</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search investors by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Investor Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading investors...</p>
        </div>
      ) : filteredInvestors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <Users className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                {searchQuery ? 'No investors found' : 'No investors yet'}
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate('/crm/investors/new')}>
                  Add Your First Investor
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInvestors.map((investor) => (
            <Card
              key={investor.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/crm/investors/${investor.id}`)}
            >
              <CardContent className="pt-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {getInitials(investor.firstName, investor.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {investor.firstName} {investor.lastName}
                      </h3>
                      <Badge
                        className={`${getStatusColor(investor.status)} text-xs`}
                        variant="default"
                      >
                        {investor.status}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/crm/investors/${investor.id}`);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/crm/investors/${investor.id}/edit`);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{investor.email}</span>
                  </div>
                  {investor.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{investor.phone}</span>
                    </div>
                  )}
                </div>

                {/* Investment Info */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Invested</p>
                    <p className="font-semibold text-sm text-green-600">
                      {formatCurrency(investor.totalInvested)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Deals</p>
                    <p className="font-semibold text-sm">{investor.activeDeals}</p>
                  </div>
                </div>

                {/* Accreditation Status */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Accreditation</span>
                  <Badge
                    className={`${getAccreditationColor(investor.accreditationStatus)} text-xs`}
                    variant="default"
                  >
                    {investor.accreditationStatus.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Last Contact */}
                {investor.lastContact && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                    <Calendar className="h-3 w-3" />
                    Last contact:{' '}
                    {new Date(investor.lastContact).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                )}

                {/* Preferred Asset Types */}
                {investor.preferredAssetTypes && investor.preferredAssetTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {investor.preferredAssetTypes.slice(0, 2).map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {investor.preferredAssetTypes.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{investor.preferredAssetTypes.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Demo Mode Notice */}
      {isDemoMode() && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-900">
                <strong>Demo Mode:</strong> Showing mock investor data. Connect to a real
                database to manage actual investors.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
