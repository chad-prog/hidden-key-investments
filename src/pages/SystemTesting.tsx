/**
 * Comprehensive System Testing Dashboard
 * Verifies all automation systems while waiting for SSL
 */
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnalyticsVerification from '../components/AnalyticsVerification';
import DocumentTesting from '../components/DocumentTesting';
import ZapierWorkflowManager from '../components/ZapierWorkflowManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, FileText, Zap, BarChart3, Settings, Calendar, CreditCard, MessageSquare, Shield } from 'lucide-react';

export default function SystemTesting() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                System Verification & Testing
              </h1>
              <p className="text-xl text-blue-100">
                Comprehensive testing of all automation systems before production launch
              </p>
            </div>
          </div>
        </section>

        {/* Main Testing Interface */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="analytics" className="space-y-6">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="zapier" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Zapier
                </TabsTrigger>
                <TabsTrigger value="setup" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Setup Guide
                </TabsTrigger>
              </TabsList>

              {/* Analytics Testing */}
              <TabsContent value="analytics" className="space-y-6">
                <AnalyticsVerification />
              </TabsContent>

              {/* Document Testing */}
              <TabsContent value="documents" className="space-y-6">
                <DocumentTesting />
              </TabsContent>

              {/* Zapier Testing */}
              <TabsContent value="zapier" className="space-y-6">
                <ZapierWorkflowManager />
              </TabsContent>

              {/* Setup Guide */}
              <TabsContent value="setup" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Premium Integration Setup Guide</CardTitle>
                    <CardDescription>
                      Step-by-step instructions for setting up premium services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Calendly */}
                      <div className="p-6 border rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Calendly Scheduling</h3>
                            <p className="text-gray-600">Automated meeting scheduling</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Sign up for Calendly Pro/Teams</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Get API key from Calendly settings</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Create event types for investor meetings</span>
                          </div>
                        </div>
                      </div>

                      {/* DocuSign */}
                      <div className="p-6 border rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">DocuSign E-Signatures</h3>
                            <p className="text-gray-600">Electronic document signing</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Sign up for DocuSign Business Pro</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Get API credentials from developer console</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Set up document templates</span>
                          </div>
                        </div>
                      </div>

                      {/* Stripe */}
                      <div className="p-6 border rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Stripe Payments</h3>
                            <p className="text-gray-600">Secure payment processing</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Create Stripe Connect account</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Get publishable and secret keys</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Set up bank account for payouts</span>
                          </div>
                        </div>
                      </div>

                      {/* Twilio */}
                      <div className="p-6 border rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Twilio SMS</h3>
                            <p className="text-gray-600">SMS notifications and 2FA</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Sign up for Twilio account</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Purchase phone number</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Get Account SID and Auth Token</span>
                          </div>
                        </div>
                      </div>

                      {/* Security */}
                      <div className="p-6 border rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Advanced Security</h3>
                            <p className="text-gray-600">2FA and encryption</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Set up Auth0 or similar service</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Configure domain and application</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Get client ID and secret</span>
                          </div>
                        </div>
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
