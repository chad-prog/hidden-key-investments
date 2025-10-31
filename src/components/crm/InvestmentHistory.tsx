/**
 * InvestmentHistory Component
 * 
 * Displays investor's investment timeline and history
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Investor } from '@/lib/schemas/crm';
import { 
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface Investment {
  id: string;
  name: string;
  amount: number;
  date: Date;
  status: 'active' | 'completed' | 'pending';
  roi?: number;
  type: string;
}

interface InvestmentHistoryProps {
  investor: Investor;
}

export function InvestmentHistory({ investor }: InvestmentHistoryProps) {
  // Mock investment data - in production, this would come from the API
  const mockInvestments: Investment[] = [
    {
      id: '1',
      name: 'Luxury Oceanfront Villa',
      amount: 450000,
      date: new Date('2024-01-15'),
      status: 'active',
      roi: 9.2,
      type: 'Direct Ownership'
    },
    {
      id: '2',
      name: 'Multifamily Complex - Austin',
      amount: 300000,
      date: new Date('2024-03-22'),
      status: 'active',
      roi: 8.1,
      type: 'Syndication'
    },
    {
      id: '3',
      name: 'Commercial Redevelopment',
      amount: 500000,
      date: new Date('2024-05-10'),
      status: 'pending',
      type: 'Development Fund'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment History</CardTitle>
        <CardDescription>
          Complete timeline of all investments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mockInvestments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No investment history available
          </div>
        ) : (
          <div className="space-y-4">
            {mockInvestments.map((investment, index) => (
              <div 
                key={investment.id}
                className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-0 -translate-x-1/2 bg-white">
                  {getStatusIcon(investment.status)}
                </div>

                {/* Investment card */}
                <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{investment.name}</h3>
                      <p className="text-sm text-gray-600">{investment.type}</p>
                    </div>
                    <Badge className={getStatusColor(investment.status)}>
                      {investment.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Investment Amount</span>
                      </div>
                      <p className="font-semibold">
                        ${investment.amount.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Investment Date</span>
                      </div>
                      <p className="font-semibold">
                        {formatDate(investment.date)}
                      </p>
                    </div>

                    {investment.roi !== undefined && (
                      <div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>ROI</span>
                        </div>
                        <p className="font-semibold text-green-600">
                          {investment.roi.toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>

                  {index < mockInvestments.length - 1 && (
                    <div className="text-xs text-gray-500 mt-2">
                      {Math.floor(
                        (mockInvestments[index + 1].date.getTime() - investment.date.getTime()) / 
                        (1000 * 60 * 60 * 24)
                      )} days until next investment
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Statistics */}
        <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Investments</p>
            <p className="text-2xl font-bold text-blue-600">
              {mockInvestments.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {mockInvestments.filter(i => i.status === 'active').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg. ROI</p>
            <p className="text-2xl font-bold text-purple-600">
              {(
                mockInvestments
                  .filter(i => i.roi !== undefined)
                  .reduce((sum, i) => sum + (i.roi || 0), 0) / 
                mockInvestments.filter(i => i.roi !== undefined).length || 0
              ).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
