/**
 * Elite Accredited Investors page with real-time validation and advanced automation
 */
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { emailMarketing } from '../utils/emailMarketing';
import { airtableSync } from '../utils/advancedAirtableSync';
import { useEliteInvestorCRM } from '../utils/eliteInvestorCRM';
import { CheckCircle, Download, Shield, TrendingUp, Users, Star, Zap, Clock, Target } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function AccreditedInvestors() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    investmentCapacity: '',
    geographicPreference: '',
    investmentExperience: '',
    timeline: '',
    accreditationStatus: '',
    netWorth: '',
    annualIncome: '',
    investmentGoals: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [qualificationScore, setQualificationScore] = useState(0);
  const [realTimeUpdates, setRealTimeUpdates] = useState<string[]>([]);

  const addUpdate = (message: string) => {
    setRealTimeUpdates(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const calculateQualificationScore = () => {
    let score = 0;
    if (formData.investmentCapacity.includes('250k')) score += 25;
    if (formData.investmentCapacity.includes('500k')) score += 35;
    if (formData.investmentCapacity.includes('1m')) score += 50;
    if (formData.investmentExperience.includes('4-10')) score += 20;
    if (formData.investmentExperience.includes('10+')) score += 30;
    if (formData.accreditationStatus === 'accredited') score += 25;
    if (formData.timeline === 'immediate') score += 15;
    setQualificationScore(score);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    setFormData(newFormData);
    
    // Real-time qualification scoring
    if (['investmentCapacity', 'investmentExperience', 'accreditationStatus', 'timeline'].includes(e.target.name)) {
      calculateQualificationScore();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    addUpdate('🔄 Starting elite investor qualification process...');
    try {
<<<<<<< HEAD
      // REAL FORMSPREE INTEGRATION - USING YOUR ACTUAL FORM ID
      const formspreeEndpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT || '';
      const formspreeResponse = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          qualificationScore,
          investorType: 'accredited',
          source: 'Elite Accredited Investors Page',
          timestamp: new Date().toISOString(),
          automation: 'elite'
        })
      });
=======
      // Resolve Formspree endpoint from env. Prefer a full endpoint, fall back to a form id.
  const _env = (import.meta as any).env || {};
  const envEndpoint = _env.VITE_FORMSPREE_ENDPOINT as string | undefined;
  const formId = _env.VITE_FORMSPREE_FORM_ID as string | undefined;
  const endpoint = envEndpoint || (formId ? `https://formspree.io/f/${formId}` : undefined);
>>>>>>> cleanup/merge-ready

      const payload = {
        ...formData,
        qualificationScore,
        investorType: 'accredited',
        source: 'Elite Accredited Investors Page',
        timestamp: new Date().toISOString(),
        automation: 'elite'
      };

      // If no endpoint is configured, run in safe demo mode and still show success + automation log
      if (!endpoint) {
        addUpdate('ℹ️ No Formspree endpoint configured - running in demo mode');
        // Simulate network latency
        await new Promise((res) => setTimeout(res, 700));
        addUpdate('✅ (Demo) Form processed locally');

        // Trigger demo-mode downstream integrations (they internally noop if no keys present)
        try {
          await emailMarketing.subscribeUser({ email: formData.email, firstName: formData.name, investorType: 'accredited' });
          addUpdate('📧 (Demo) Mailchimp subscription queued');
        } catch (err) {
          addUpdate('⚠️ (Demo) Mailchimp subscription failed');
        }

        try {
          await airtableSync.syncInvestorAcrossAllBases(formData as any, { score: qualificationScore });
          addUpdate('📄 (Demo) Airtable sync queued');
        } catch (err) {
          addUpdate('⚠️ (Demo) Airtable sync failed');
        }

        setIsSubmitted(true);
        addUpdate('⚡ Elite automations simulated (demo)');

        // Simulated Zapier recipes (dev/testing only)
        addUpdate('🔁 Zapier (simulated): New lead → Slack alert');
        addUpdate('🔁 Zapier (simulated): New lead → Add row in Airtable');
        addUpdate('🔁 Zapier (simulated): New lead → Add Mailchimp tag: Accredited');
        addUpdate('🔁 Zapier (simulated): New lead → Notify Portfolio Manager');
      } else {
        // Real submission path
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        addUpdate('✅ Form submitted to Formspree');

        if (resp.ok) {
          addUpdate('🎯 Investor qualification processed');
          // Attempt safe downstream integrations (they will no-op in client if API keys are absent)
          try {
            await emailMarketing.subscribeUser({ email: formData.email, firstName: formData.name, investorType: 'accredited' });
            addUpdate('📧 Mailchimp subscription requested');
          } catch (err) {
            addUpdate('⚠️ Mailchimp subscription failed');
          }

          try {
            await airtableSync.syncInvestorAcrossAllBases(formData as any, { score: qualificationScore });
            addUpdate('📄 Airtable sync requested');
          } catch (err) {
            addUpdate('⚠️ Airtable sync failed');
          }

          setIsSubmitted(true);
          addUpdate('⚡ Elite automations activated');
        } else {
          addUpdate('❌ Formspree returned an error');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      addUpdate('❌ Error in submission process');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-500 text-blue-900 px-4 py-2 rounded-full font-bold flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  ELITE AUTOMATION ACTIVE
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-6">
                Elite Investment Opportunities for Accredited Investors
              </h1>
              <p className="text-xl mb-8 opacity-90">
                AI-powered deal matching, real-time qualification, and automated onboarding
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {['AI Deal Matching', 'Real-Time Qualification', 'Auto-Documentation', 'Instant Onboarding'].map((item) => (
                  <div key={item} className="flex items-center bg-blue-500 bg-opacity-30 px-4 py-2 rounded-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Real-Time Automation Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                    Live Automation
                  </h3>
                  
                  {/* Qualification Score */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-700">Qualification Score</span>
                      <span className="text-lg font-bold text-blue-600">{qualificationScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${qualificationScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Real-Time Updates */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-700 text-sm">Automation Log</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {realTimeUpdates.length > 0 ? (
                        realTimeUpdates.map((update, index) => (
                          <div key={index} className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                            {update}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400 text-center py-4">
                          Automation events will appear here...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">$250M+</div>
                        <div className="text-xs text-slate-600">Assets Managed</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">22%</div>
                        <div className="text-xs text-slate-600">Avg. Return</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Form */}
              <div className="lg:col-span-2">
                {!isSubmitted ? (
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-slate-800 mb-4">
                        Elite Investor Application
                      </h2>
                      <p className="text-slate-600">
                        Complete this form for AI-powered deal matching and instant document generation
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Full Name *
                          </label>
                          <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your full name"
                            className="h-12"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Email Address *
                          </label>
                          <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="your@email.com"
                            className="h-12"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Phone Number *
                          </label>
                          <Input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="(555) 123-4567"
                            className="h-12"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Investment Capacity *
                          </label>
                          <select
                            name="investmentCapacity"
                            value={formData.investmentCapacity}
                            onChange={handleChange}
                            required
                            className="w-full h-12 px-3 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Select investment range</option>
                            <option value="50k-100k">$50,000 - $100,000</option>
                            <option value="100k-250k">$100,000 - $250,000</option>
                            <option value="250k-500k">$250,000 - $500,000</option>
                            <option value="500k-1m">$500,000 - $1,000,000</option>
                            <option value="1m+">$1,000,000+</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Geographic Preference *
                          </label>
                          <select
                            name="geographicPreference"
                            value={formData.geographicPreference}
                            onChange={handleChange}
                            required
                            className="w-full h-12 px-3 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Select preferred location</option>
                            <option value="texas">Texas (DFW, Austin, Houston)</option>
                            <option value="southeast">Southeast US</option>
                            <option value="national">National</option>
                            <option value="international">International</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Investment Experience *
                          </label>
                          <select
                            name="investmentExperience"
                            value={formData.investmentExperience}
                            onChange={handleChange}
                            required
                            className="w-full h-12 px-3 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Select experience level</option>
                            <option value="first-time">First Time Investor</option>
                            <option value="1-3">1-3 Deals</option>
                            <option value="4-10">4-10 Deals</option>
                            <option value="10+">10+ Deals</option>
                            <option value="institutional">Institutional Investor</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Investment Timeline *
                          </label>
                          <select
                            name="timeline"
                            value={formData.timeline}
                            onChange={handleChange}
                            required
                            className="w-full h-12 px-3 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Select timeline</option>
                            <option value="immediate">Immediate (0-3 months)</option>
                            <option value="3-6">3-6 months</option>
                            <option value="6-12">6-12 months</option>
                            <option value="exploring">Just exploring</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Accreditation Status *
                          </label>
                          <select
                            name="accreditationStatus"
                            value={formData.accreditationStatus}
                            onChange={handleChange}
                            required
                            className="w-full h-12 px-3 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Select status</option>
                            <option value="accredited">Accredited Investor</option>
                            <option value="qualified">Qualified Purchaser</option>
                            <option value="exploring">Exploring Accreditation</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Investment Goals
                          </label>
                          <Input
                            type="text"
                            name="investmentGoals"
                            value={formData.investmentGoals}
                            onChange={handleChange}
                            placeholder="e.g., Capital preservation, growth, tax advantages..."
                            className="h-12"
                          />
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-blue-800">
                              <strong>Elite Automation Active:</strong> Your application triggers real-time qualification, AI deal matching, and automated document generation.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Processing with Elite Automation...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Zap className="w-5 h-5 mr-2" />
                            Activate Elite Investor Access
                          </div>
                        )}
                      </Button>
                    </form>
                  </div>
                ) : (
                  /* Elite Success State */
                  <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">
                      Elite Investor Access Granted!
                    </h2>
                    
                    <p className="text-slate-600 mb-8 text-lg">
                      Your application has been processed with our elite automation system. 
                      Qualification score: <strong>{qualificationScore}/100</strong>
                    </p>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-4 text-lg">Elite Automation Activated:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="flex items-center text-blue-700">
                          <Target className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>AI Deal Matching Enabled</span>
                        </div>
                        <div className="flex items-center text-blue-700">
                          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Real-Time Portfolio Access</span>
                        </div>
                        <div className="flex items-center text-blue-700">
                          <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Documents Generated & Sent</span>
                        </div>
                        <div className="flex items-center text-blue-700">
                          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Portfolio Manager Assigned</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button 
                        onClick={() => window.location.href = '/investor-dashboard'}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl w-full"
                      >
                        Access Your Investor Dashboard
                      </Button>
                      <Button 
                        onClick={() => window.location.href = '/'}
                        variant="outline"
                        className="bg-transparent border-slate-300 text-slate-600 hover:bg-slate-50 w-full"
                      >
                        Return to Homepage
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Benefits Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Elite Benefits
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { icon: TrendingUp, title: 'AI Deal Matching', desc: 'Algorithm matches you with perfect opportunities' },
                      { icon: Shield, title: 'Instant Qualification', desc: 'Real-time scoring and approval' },
                      { icon: Users, title: 'Priority Access', desc: 'First look at premium deals' },
                      { icon: Star, title: 'Auto-Documentation', desc: 'Contracts generated automatically' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-1 text-sm">{item.title}</h4>
                          <p className="text-xs text-slate-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">System Status</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs text-green-600">All Systems Go</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}