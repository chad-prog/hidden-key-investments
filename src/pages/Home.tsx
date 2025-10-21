/**
 * Home page component for Hidden Key Investments
 * Main landing page with hero section and investment platform overview
 */
import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedProperties from '../components/FeaturedProperties';
import InvestmentBenefits from '../components/InvestmentBenefits';
import TestimonialsSection from '../components/TestimonialsSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import IntegrationDashboard from '../components/IntegrationDashboard';

/**
 * Home page component that serves as the main landing page
 * @returns {JSX.Element} Home page with all sections
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <IntegrationDashboard />
      <FeaturedProperties />
      <InvestmentBenefits />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
