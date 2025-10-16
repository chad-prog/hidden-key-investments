/**
 * Elite Investor Dashboard with Real-Time Analytics and Predictive Insights
 * Advanced portfolio management and automated investor intelligence
 */
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RealTimeInvestorDashboard from '../components/RealTimeInvestorDashboard';
import { useAdvancedAnalytics } from '../utils/advancedAnalytics';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TrendingUp, Users, Target, BarChart3, Download, RefreshCw } from 'lucide-react';

export default function InvestorDashboard() {
  const { analytics, predictions, isLoading, getPrediction, trackEvent, refresh } = useAdvancedAnalytics();

  const handleExportReport = () => {
    // Implement export functionality
    trackEvent('report_export', { type: 'comprehensive' });
    alert('Exporting comprehensive investor report...');
  };

  const handleRefreshData = () => {
    refresh();
    trackEvent('dashboard_refresh', { timestamp: new Date().toISOString() });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Elite Investor Dashboard
                </h1>
                <p className="text-blue-100 text-lg">
                  Real-time analytics, predictive insights, and automated intelligence
                </p>
              </div>
              
              <div className="flex items-center space-x-4 mt-6 lg:mt-0">
                <Button 
                  onClick={handleExportReport}
                  variant="outline" 
                  className="bg-transparent border-white text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button 
                  onClick={handleRefreshData}
                  variant="outline" 
                  className="bg-transparent border-white text-white hover:bg-white/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Dashboard Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="pipeline" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Pipeline
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="predictions" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Predictions
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <RealTimeInvestorDashboard />
              </TabsContent>

              {/* Pipeline Tab */}
              <TabsContent value="pipeline" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Investor Pipeline Management</CardTitle>
                    <CardDescription>
                      Track and manage investor progression through the pipeline
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.cohortAnalysis.map((cohort, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-semibold">{cohort.cohort}</div>
                            <div className="text-sm text-gray-600">{cohort.size} investors</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">${(cohort.averageInvestment / 1000).toFixed(0)}K avg</div>
                            <div className="text-sm text-gray-600">{cohort.retentionRate}% retention</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Assessment</CardTitle>
                      <CardDescription>
                        Investor risk profiles and recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics?.riskAssessment.map((risk, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold">{risk.name}</div>
                              <div className={`px-2 py-1 rounded text-xs ${
                                risk.riskScore < 30 ? 'bg-green-100 text-green-800' :
                                risk.riskScore < 70 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                Risk: {risk.riskScore}/100
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {risk.factors.join(', ')}
                            </div>
                            <div className="text-sm font-medium text-blue-600">
                              {risk.recommendation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                      <CardDescription>
                        Key performance indicators and trends
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm font-semibold text-blue-800">Conversion Rate</div>
                            <div className="text-2xl font-bold text-blue-600">{analytics?.conversionRate}%</div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-sm font-semibold text-green-800">Avg. ROI</div>
                            <div className="text-2xl font-bold text-green-600">{analytics?.averageROI}%</div>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="text-sm font-semibold text-purple-800">Active Deals</div>
                            <div className="text-2xl font-bold text-purple-600">{analytics?.activeDeals}</div>
                          </div>
                          <div className="p-3 bg-orange-50 rounded-lg">
                            <div className="text-sm font-semibold text-orange-800">Total Investors</div>
                            <div className="text-2xl font-bold text-orange-600">{analytics?.totalInvestors}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Predictions Tab */}
              <TabsContent value="predictions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Predictive Analytics</CardTitle>
                    <CardDescription>
                      ML-powered forecasts and investment predictions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg">
                        <div className="text-sm font-semibold">30-Day Forecast</div>
                        <div className="text-2xl font-bold my-2">
                          ${predictions['30d'] ? (predictions['30d'].predictedRaise / 1000000).toFixed(1) + 'M' : 'Loading...'}
                        </div>
                        <div className="text-sm opacity-90">
                          {predictions['30d']?.confidence ? (predictions['30d'].confidence * 100).toFixed(0) + '% confidence' : ''}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg">
                        <div className="text-sm font-semibold">90-Day Forecast</div>
                        <div className="text-2xl font-bold my-2">
                          ${predictions['90d'] ? (predictions['90d'].predictedRaise / 1000000).toFixed(1) + 'M' : 'Loading...'}
                        </div>
                        <div className="text-sm opacity-90">
                          {predictions['90d']?.confidence ? (predictions['90d'].confidence * 100).toFixed(0) + '% confidence' : ''}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg">
                        <div className="text-sm font-semibold">1-Year Forecast</div>
                        <div className="text-2xl font-bold my-2">
                          ${predictions['1y'] ? (predictions['1y'].predictedRaise / 1000000).toFixed(1) + 'M' : 'Loading...'}
                        </div>
                        <div className="text-sm opacity-90">
                          {predictions['1y']?.confidence ? (predictions['1y'].confidence * 100).toFixed(0) + '% confidence' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="font-semibold mb-4">Recommended Actions</h3>
                      <div className="space-y-2">
                        {analytics?.predictiveMetrics.recommendedActions.map((action, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Target className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-sm">{action}</span>
                          </div>
                        ))}
                      </div>
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
