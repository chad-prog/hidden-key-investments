/**
 * Advanced Investor Portal with dashboard, portfolio tracking, and deal access
 * Provides personalized investment management interface
 */
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  FileText, 
  Settings, 
  Bell, 
  Download,
  Eye,
  Share2,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';

// Mock data - replace with real API data
const investorData = {
  profile: {
    name: 'John Investor',
    tier: 'Platinum',
    joinDate: '2024-01-15',
    accreditationStatus: 'Verified',
    totalInvested: 1250000,
    availableFunds: 250000
  },
  portfolio: {
    totalValue: 2850000,
    monthlyCashFlow: 18500,
    annualROI: '8.7%',
    properties: 6,
    distributions: [
      { month: 'Jan', amount: 15200 },
      { month: 'Feb', amount: 14800 },
      { month: 'Mar', amount: 16100 },
      { month: 'Apr', amount: 17200 },
      { month: 'May', amount: 18500 }
    ]
  },
  investments: [
    {
      id: 1,
      name: 'Luxury Oceanfront Villa',
      type: 'Direct Ownership',
      invested: 450000,
      currentValue: 520000,
      cashFlow: 4500,
      roi: '9.2%',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Multifamily Complex - Austin',
      type: 'Syndication',
      invested: 300000,
      currentValue: 325000,
      cashFlow: 3200,
      roi: '8.1%',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Commercial Redevelopment',
      type: 'Development Fund',
      invested: 500000,
      currentValue: 525000,
      cashFlow: 0,
      roi: '5.0%',
      status: 'Development'
    }
  ],
  opportunities: [
    {
      id: 101,
      name: 'Tech Corridor Apartments',
      location: 'Austin, TX',
      type: 'Multifamily',
      targetROI: '8.5-9.5%',
      minInvestment: 100000,
      timeline: 'Q2 2024',
      status: 'Open',
      priority: 'High'
    },
    {
      id: 102,
      name: 'Industrial Warehouse Portfolio',
      location: 'Dallas, TX',
      type: 'Commercial',
      targetROI: '7.5-8.5%',
      minInvestment: 250000,
      timeline: 'Q3 2024',
      status: 'Coming Soon',
      priority: 'Medium'
    }
  ]
};

export default function InvestorPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        {/* Portal Header */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Investor Portal
                </h1>
                <p className="text-blue-100 text-lg">
                  Welcome back, {investorData.profile.name}
                </p>
                <div className="flex items-center space-x-4 mt-4">
                  <Badge variant="secondary" className="bg-blue-500 text-white">
                    {investorData.profile.tier} Tier
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    {investorData.profile.accreditationStatus}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mt-6 lg:mt-0">
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  <Bell className="w-4 h-4 mr-2" />
                  Alerts
                </Button>
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Portal Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="portfolio" className="flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Portfolio
                </TabsTrigger>
                <TabsTrigger value="opportunities" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Opportunities
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Reports
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${(investorData.portfolio.totalValue / 1000000).toFixed(1)}M
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +12.5% from last quarter
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Cash Flow</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${investorData.portfolio.monthlyCashFlow.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +8.7% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Annual ROI</CardTitle>
                      <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {investorData.portfolio.annualROI}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Target: 8.0%
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {investorData.portfolio.properties}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Across 4 markets
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity and Opportunities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Distributions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Recent Distributions
                      </CardTitle>
                      <CardDescription>
                        Your last 5 monthly distributions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {investorData.portfolio.distributions.map((dist, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-semibold">{dist.month} 2024</div>
                              <div className="text-sm text-gray-600">Monthly Distribution</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">
                                ${dist.amount.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">Deposited</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* New Opportunities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        New Opportunities
                      </CardTitle>
                      <CardDescription>
                        Curated deals matching your profile
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {investorData.opportunities.slice(0, 2).map((opp) => (
                          <div key={opp.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{opp.name}</h4>
                              <Badge variant={
                                opp.priority === 'High' ? 'destructive' : 
                                opp.priority === 'Medium' ? 'default' : 'secondary'
                              }>
                                {opp.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{opp.location} • {opp.type}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span>Target ROI: {opp.targetROI}</span>
                              <span>Min: ${opp.minInvestment.toLocaleString()}</span>
                            </div>
                            <Button size="sm" className="w-full mt-3">
                              View Details
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Portfolio Tab */}
              <TabsContent value="portfolio" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Portfolio</CardTitle>
                    <CardDescription>
                      Your current real estate investments and performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {investorData.investments.map((investment) => (
                        <div key={investment.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{investment.name}</h3>
                              <p className="text-gray-600">{investment.type}</p>
                            </div>
                            <Badge variant={
                              investment.status === 'Active' ? 'default' : 
                              investment.status === 'Development' ? 'secondary' : 'outline'
                            }>
                              {investment.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-600">Invested</div>
                              <div className="font-semibold">${investment.invested.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Current Value</div>
                              <div className="font-semibold text-green-600">${investment.currentValue.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Monthly Cash Flow</div>
                              <div className="font-semibold">${investment.cashFlow.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">ROI</div>
                              <div className="font-semibold text-green-600">{investment.roi}</div>
                            </div>
                          </div>

                          <div className="flex space-x-3">
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <FileText className="w-4 h-4 mr-2" />
                              Documents
                            </Button>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Opportunities Tab */}
              <TabsContent value="opportunities" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Investment Opportunities</h2>
                    <p className="text-gray-600">Pre-vetted deals matching your investment criteria</p>
                  </div>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Download Prospectus
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {investorData.opportunities.map((opportunity) => (
                    <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{opportunity.name}</CardTitle>
                            <CardDescription>{opportunity.location}</CardDescription>
                          </div>
                          <Badge variant={
                            opportunity.status === 'Open' ? 'default' : 
                            opportunity.status === 'Coming Soon' ? 'secondary' : 'outline'
                          }>
                            {opportunity.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Property Type</div>
                            <div className="font-semibold">{opportunity.type}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Target ROI</div>
                            <div className="font-semibold text-green-600">{opportunity.targetROI}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Minimum Investment</div>
                            <div className="font-semibold">${opportunity.minInvestment.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Timeline</div>
                            <div className="font-semibold">{opportunity.timeline}</div>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <Button className="flex-1">
                            View Full Details
                          </Button>
                          <Button variant="outline" className="bg-transparent">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Documents</CardTitle>
                    <CardDescription>
                      All your investment-related documents and reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Q1 2024 Portfolio Report', date: '2024-04-15', type: 'PDF', size: '2.4 MB' },
                        { name: 'Investment Agreement - Multifamily Austin', date: '2024-03-22', type: 'PDF', size: '1.8 MB' },
                        { name: 'Tax Documents 2023', date: '2024-02-28', type: 'ZIP', size: '4.2 MB' },
                        { name: 'Property Inspection Report', date: '2024-01-15', type: 'PDF', size: '3.1 MB' }
                      ].map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div>
                              <div className="font-semibold">{doc.name}</div>
                              <div className="text-sm text-gray-600">
                                Uploaded {doc.date} • {doc.type} • {doc.size}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Reports</CardTitle>
                    <CardDescription>
                      Detailed analytics and performance reports for your portfolio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { title: 'Portfolio Performance', description: 'Quarterly performance analysis', date: '2024-04-01' },
                        { title: 'Cash Flow Analysis', description: 'Monthly distribution tracking', date: '2024-03-28' },
                        { title: 'Market Comparison', description: 'Benchmark against market indices', date: '2024-03-15' },
                        { title: 'Tax Planning Report', description: 'Year-end tax strategy', date: '2024-02-20' }
                      ].map((report, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            <CardDescription>{report.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Generated: {report.date}</span>
                              <Button variant="outline" size="sm" className="bg-transparent">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
