/**
 * About section highlighting company values and team expertise
 */
import React from 'react';
import { Award, Users, Clock, Shield } from 'lucide-react';

export default function AboutSection() {
  const stats = [
    {
      icon: <Award className="w-8 h-8" />,
      number: '15+',
      label: 'Years Experience',
      description: 'Proven track record in real estate'
    },
    {
      icon: <Users className="w-8 h-8" />,
      number: '10K+',
      label: 'Happy Clients',
      description: 'Satisfied customers worldwide'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      number: '500+',
      label: 'Properties Sold',
      description: 'Successful transactions completed'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      number: '99%',
      label: 'Success Rate',
      description: 'Client satisfaction guaranteed'
    }
  ];

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/7a15d461-566a-4c10-adf4-e4d4bc3032bd.jpg',
      experience: '15+ years'
    },
    {
      name: 'Michael Chen',
      role: 'Senior Property Advisor',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/011239b6-672a-41fd-8ccd-90ed00dad05b.jpg',
      experience: '12+ years'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Investment Specialist',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/7f6e25ba-54db-42ef-891d-23a25441f155.jpg',
      experience: '10+ years'
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Main About Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Text Content */}
          <div>
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              About TheCurateProp
            </h2>
            <p className="text-xl text-slate-600 mb-6 leading-relaxed">
              We are more than just a real estate company—we are your trusted partners 
              in finding the perfect property that matches your dreams and lifestyle.
            </p>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Since our founding, we've been committed to providing exceptional service, 
              expert guidance, and innovative solutions that make property transactions 
              seamless and stress-free. Our curated approach ensures that every property 
              we present meets the highest standards of quality and value.
            </p>
            
            {/* Key Values */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Curated Excellence</h4>
                  <p className="text-slate-600">Hand-selected properties that meet our rigorous quality standards</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Expert Guidance</h4>
                  <p className="text-slate-600">Professional advice from experienced real estate specialists</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Client-Focused</h4>
                  <p className="text-slate-600">Personalized service tailored to your unique needs and preferences</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <img
              src="https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/7a6caafa-68ab-4438-8574-eab904420f35.jpg"
              alt="Our Team"
              className="w-full h-96 object-cover rounded-2xl shadow-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent rounded-2xl"></div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                {stat.icon}
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-2">
                {stat.number}
              </h3>
              <h4 className="text-lg font-semibold text-slate-700 mb-2">
                {stat.label}
              </h4>
              <p className="text-slate-600 text-sm">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-slate-800 mb-4">
            Meet Our Expert Team
          </h3>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Our experienced professionals are dedicated to helping you achieve your real estate goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 object-cover rounded-full mx-auto shadow-lg"
                />
                <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {member.experience}
                </div>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">
                {member.name}
              </h4>
              <p className="text-blue-600 font-semibold mb-2">
                {member.role}
              </p>
              <p className="text-slate-600 text-sm">
                Dedicated to providing exceptional real estate services with personalized attention to detail.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
