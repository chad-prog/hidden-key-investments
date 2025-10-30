/**
 * Opportunity Pipeline
 * 
 * Kanban-style pipeline for managing investment opportunities with:
 * - Drag-and-drop functionality
 * - Stage-based workflow
 * - Deal cards with key metrics
 * - Quick actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus,
  Filter,
  DollarSign,
  Calendar,
  TrendingUp,
  Building2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isDemoMode } from '@/lib/envValidation';

interface Opportunity {
  id: string;
  title: string;
  propertyAddress: string;
  estimatedValue: number;
  stage: string;
  probability: number;
  closeDate?: string;
  investor?: string;
  notes?: string;
}

const PIPELINE_STAGES = [
  { id: 'lead', label: 'Lead', color: 'bg-blue-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-purple-500' },
  { id: 'proposal', label: 'Proposal', color: 'bg-yellow-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { id: 'closing', label: 'Closing', color: 'bg-green-500' },
  { id: 'closed_won', label: 'Closed Won', color: 'bg-emerald-600' },
];

export default function OpportunityPipeline() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setIsLoading(true);
    try {
      if (isDemoMode()) {
        // Demo mode: Generate mock opportunities
        const mockOpportunities: Opportunity[] = [
          {
            id: '1',
            title: '123 Main Street Investment',
            propertyAddress: '123 Main St, Austin, TX',
            estimatedValue: 450000,
            stage: 'lead',
            probability: 25,
            closeDate: '2025-12-15',
            investor: 'John Smith',
          },
          {
            id: '2',
            title: 'Downtown Commercial Property',
            propertyAddress: '456 Commerce Blvd, Austin, TX',
            estimatedValue: 1200000,
            stage: 'qualified',
            probability: 40,
            closeDate: '2025-11-30',
            investor: 'Jane Doe',
          },
          {
            id: '3',
            title: 'Multi-Family Complex',
            propertyAddress: '789 Residence Way, Dallas, TX',
            estimatedValue: 2500000,
            stage: 'proposal',
            probability: 60,
            closeDate: '2025-11-15',
            investor: 'Investment Group LLC',
          },
          {
            id: '4',
            title: 'Retail Space Acquisition',
            propertyAddress: '321 Shopping Center, Houston, TX',
            estimatedValue: 850000,
            stage: 'negotiation',
            probability: 75,
            closeDate: '2025-11-10',
            investor: 'Smith Holdings',
          },
          {
            id: '5',
            title: 'Luxury Condo Development',
            propertyAddress: '555 Park Ave, Austin, TX',
            estimatedValue: 3200000,
            stage: 'closing',
            probability: 90,
            closeDate: '2025-11-05',
            investor: 'Elite Investors',
          },
        ];
        setOpportunities(mockOpportunities);
      } else {
        // Real API call
        const response = await fetch('/.netlify/functions/opportunity');
        if (response.ok) {
          const data = await response.json();
          setOpportunities(data.opportunities || []);
        }
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (opportunityId: string) => {
    setDraggedCard(opportunityId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: string) => {
    if (!draggedCard) return;

    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === draggedCard ? { ...opp, stage: stageId } : opp
      )
    );
    setDraggedCard(null);
  };

  const getOpportunitiesByStage = (stageId: string) => {
    return opportunities.filter((opp) => opp.stage === stageId);
  };

  const getTotalValueByStage = (stageId: string) => {
    return getOpportunitiesByStage(stageId).reduce(
      (sum, opp) => sum + opp.estimatedValue,
      0
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opportunity Pipeline</h1>
          <p className="text-muted-foreground">
            Track and manage investment opportunities through your sales funnel
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => navigate('/crm/opportunities/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Opportunity
          </Button>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(opportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {opportunities.length} opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Deal Size</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                opportunities.length > 0
                  ? opportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0) /
                      opportunities.length
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Per opportunity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(opportunities.map((opp) => opp.investor)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique investors</p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageOpportunities = getOpportunitiesByStage(stage.id);
          const stageValue = getTotalValueByStage(stage.id);

          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-80 space-y-3"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Stage Header */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <h3 className="font-semibold">{stage.label}</h3>
                  </div>
                  <Badge variant="secondary">{stageOpportunities.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {formatCurrency(stageValue)}
                </p>
              </div>

              {/* Opportunity Cards */}
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Loading...
                  </div>
                ) : stageOpportunities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No opportunities
                  </div>
                ) : (
                  stageOpportunities.map((opportunity) => (
                    <Card
                      key={opportunity.id}
                      className="cursor-move hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={() => handleDragStart(opportunity.id)}
                      onClick={() => navigate(`/crm/opportunities/${opportunity.id}`)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">{opportunity.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {opportunity.propertyAddress}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 font-semibold text-green-600">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(opportunity.estimatedValue)}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            {opportunity.probability}%
                          </div>
                        </div>

                        {opportunity.closeDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Close: {formatDate(opportunity.closeDate)}
                          </div>
                        )}

                        {opportunity.investor && (
                          <Badge variant="outline" className="text-xs">
                            {opportunity.investor}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo Mode Notice */}
      {isDemoMode() && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-900">
                <strong>Demo Mode:</strong> Showing mock opportunities. Connect to a real
                database to manage actual deals.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
