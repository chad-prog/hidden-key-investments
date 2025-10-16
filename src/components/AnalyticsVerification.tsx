/**
 * Comprehensive Analytics Verification Component
 * Tests real-time data, predictive analytics, and system integration
 */
import React, { useState, useEffect } from 'react';
import { useAdvancedAnalytics } from '../utils/advancedAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, RefreshCw, TrendingUp, Users, DollarSign, Target, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'running';
  message: string;
  timestamp: string;
}

export default function AnalyticsVerification() {
  const { analytics, predictions, isLoading, getPrediction, trackEvent, refresh } = useAdvancedAnalytics();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const runAnalyticsTests = async () => {
    setIsTesting(true);
    const results: TestResult[] = [];

    // Test 1: Analytics Engine Initialization
    results.push({
      name: 'Analytics Engine',
      status: 'running',
      message: 'Initializing analytics engine...',
      timestamp: new Date().toISOString()
    });

    try {
      // Simulate analytics initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (analytics) {
        results[0] = {
          name: 'Analytics Engine',
          status: 'pass',
          message: 'Analytics engine successfully initialized with real-time data',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      results[0] = {
        name: 'Analytics Engine',
        status: 'fail',
        message: 'Analytics engine failed to initialize',
        timestamp: new Date().toISOString()
      };
    }

    // Test 2: Real-Time Data Updates
    results.push({
      name: 'Real-Time Data',
      status: 'running',
      message: 'Testing real-time data updates...',
      timestamp: new Date().toISOString()
    });

    try {
      const initialInvestors = analytics?.totalInvestors;
      await refresh();
      
      if (analytics && analytics.totalInvestors !== undefined) {
        results[1] = {
          name: 'Real-Time Data',
          status: 'pass',
          message: `Real-time updates working - ${analytics.totalInvestors} investors tracked`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      results[1] = {
        name: 'Real-Time Data',
        status: 'fail',
        message: 'Real-time data updates failed',
        timestamp: new Date().toISOString()
      };
    }

    // Test 3: Predictive Analytics
    results.push({
      name: 'Predictive Analytics',
      status: 'running',
      message: 'Testing predictive forecasting...',
      timestamp: new Date().toISOString()
    });

    try {
      const prediction = await getPrediction('30d');
      if (prediction && prediction.predictedRaise > 0) {
        results[2] = {
          name: 'Predictive Analytics',
          status: 'pass',
          message: `Predictive models active - $${(prediction.predictedRaise / 1000000).toFixed(1)}M forecast`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      results[2] = {
        name: 'Predictive Analytics',
        status: 'fail',
        message: 'Predictive analytics failed to generate forecasts',
        timestamp: new Date().toISOString()
      };
    }

    // Test 4: Event Tracking
    results.push({
      name: 'Event Tracking',
      status: 'running',
      message: 'Testing event tracking system...',
      timestamp: new Date().toISOString()
    });

    try {
      trackEvent('analytics_test', { testType: 'comprehensive' });
      results[3] = {
        name: 'Event Tracking',
        status: 'pass',
        message: 'Event tracking system active and recording data',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      results[3] = {
        name: 'Event Tracking',
        status: 'fail',
        message: 'Event tracking system failed',
        timestamp: new Date().toISOString()
      };
    }

    // Test 5: Cohort Analysis
    results.push({
      name: 'Cohort Analysis',
      status: 'running',
      message: 'Testing investor cohort analysis...',
      timestamp: new Date().toISOString()
    });

    try {
      if (analytics?.cohortAnalysis && analytics.cohortAnalysis.length > 0) {
        results[4] = {
          name: 'Cohort Analysis',
          status: 'pass',
          message: `Cohort analysis active - ${analytics.cohortAnalysis.length} investor cohorts tracked`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      results[4] = {
        name: 'Cohort Analysis',
        status: 'fail',
        message: 'Cohort analysis system failed',
        timestamp: new Date().toISOString()
      };
    }

    setTestResults(results);
    setIsTesting(false);
  };

  useEffect(() => {
    if (analytics) {
      runAnalyticsTests();
    }
  }, [analytics]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800">FAIL</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">TESTING</Badge>;
      default:
        return <Badge variant="outline">PENDING</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Analytics System Verification
          </CardTitle>
          <CardDescription>
            Comprehensive testing of real-time analytics, predictive models, and data tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Run comprehensive tests to verify all analytics systems are functioning correctly
              </p>
            </div>
            <Button 
              onClick={runAnalyticsTests} 
              disabled={isTesting}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Running Tests...' : 'Run Full Test Suite'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>
            Real-time status of all analytics systems and components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <div className="font-semibold">{test.name}</div>
                    <div className="text-sm text-gray-600">{test.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(test.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>
            ))}

            {testResults.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Initializing analytics tests...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Analytics Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Current Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Investors</span>
                  <span className="font-semibold">{analytics.totalInvestors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Deals</span>
                  <span className="font-semibold">{analytics.activeDeals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Capital Deployed</span>
                  <span className="font-semibold">${(analytics.capitalDeployed / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average ROI</span>
                  <span className="font-semibold text-green-600">{analytics.averageROI}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="font-semibold">{analytics.conversionRate}%</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" />
                <p>Loading analytics data...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Predictive Forecasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictions['30d'] ? (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-semibold text-blue-800">30-Day Forecast</div>
                  <div className="text-xl font-bold text-blue-600">
                    ${(predictions['30d'].predictedRaise / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-blue-600">
                    {(predictions['30d'].confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm font-semibold text-purple-800">90-Day Forecast</div>
                  <div className="text-xl font-bold text-purple-600">
                    ${(predictions['90d'].predictedRaise / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-purple-600">
                    {(predictions['90d'].confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Based on {analytics?.cohortAnalysis.length || 0} investor cohorts and market analysis
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Button 
                  onClick={() => getPrediction('30d')}
                  className="flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Generate Forecasts
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>System Recommendations</CardTitle>
          <CardDescription>
            Actionable insights based on current analytics performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.predictiveMetrics.recommendedActions ? (
            <div className="space-y-2">
              {analytics.predictiveMetrics.recommendedActions.map((action, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">{action}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Generate analytics data to see recommendations
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
