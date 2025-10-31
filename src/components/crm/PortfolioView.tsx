/**
 * PortfolioView Component
 * 
 * Displays investor's portfolio with metrics and ROI calculations
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Investor } from '@/lib/schemas/crm';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  Activity,
  Target
} from 'lucide-react';

interface PortfolioViewProps {
  investor: Investor;
}

export function PortfolioView({ investor }: PortfolioViewProps) {
  // Calculate portfolio metrics
  const totalInvested = investor.totalInvested || 0;
  const activeDeals = investor.activeDeals || 0;
  const completedDeals = investor.completedDeals || 0;
  const averageReturn = investor.averageReturn || 0;

  // Mock calculation for portfolio value (would come from actual investments)
  const estimatedPortfolioValue = totalInvested * (1 + averageReturn / 100);
  const totalGain = estimatedPortfolioValue - totalInvested;
  const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const metrics = [
    {
      label: 'Total Invested',
      value: `$${(totalInvested / 1000).toFixed(1)}K`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Portfolio Value',
      value: `$${(estimatedPortfolioValue / 1000).toFixed(1)}K`,
      icon: PieChart,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Total Gain/Loss',
      value: `$${(totalGain / 1000).toFixed(1)}K`,
      subvalue: `${gainPercentage > 0 ? '+' : ''}${gainPercentage.toFixed(1)}%`,
      icon: gainPercentage >= 0 ? TrendingUp : TrendingDown,
      color: gainPercentage >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: gainPercentage >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      label: 'Average Return',
      value: `${averageReturn.toFixed(1)}%`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Active Deals',
      value: activeDeals.toString(),
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Completed Deals',
      value: completedDeals.toString(),
      icon: Activity,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Overview</CardTitle>
        <CardDescription>
          Investment performance and portfolio metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg ${metric.bgColor}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {metric.label}
                  </span>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${metric.color}`}>
                    {metric.value}
                  </div>
                  {metric.subvalue && (
                    <div className={`text-sm font-medium ${metric.color}`}>
                      {metric.subvalue}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Investment Profile */}
        {investor.investmentProfile && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-4">Investment Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investor.investmentProfile.minInvestment && (
                <div>
                  <span className="text-sm text-gray-600">Minimum Investment</span>
                  <p className="font-semibold">
                    ${(investor.investmentProfile.minInvestment / 1000).toFixed(0)}K
                  </p>
                </div>
              )}
              {investor.investmentProfile.maxInvestment && (
                <div>
                  <span className="text-sm text-gray-600">Maximum Investment</span>
                  <p className="font-semibold">
                    ${(investor.investmentProfile.maxInvestment / 1000).toFixed(0)}K
                  </p>
                </div>
              )}
              {investor.investmentProfile.riskTolerance && (
                <div>
                  <span className="text-sm text-gray-600">Risk Tolerance</span>
                  <p className="font-semibold capitalize">
                    {investor.investmentProfile.riskTolerance.replace('_', ' ')}
                  </p>
                </div>
              )}
              {investor.investmentProfile.preferredDealTypes.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Preferred Deal Types</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {investor.investmentProfile.preferredDealTypes.map((type, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {type.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
