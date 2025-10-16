/**
 * Team page with placeholder profiles and structure
 * Ready for actual team member data when available
 */
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Mail, Phone, Linkedin, MapPin, Award, Users, Target, BarChart3 } from 'lucide-react';

// Placeholder team data structure - ready for real data
const teamStructure = {
  leadership: [
    {
      id: 1,
      name: 'Leadership Position Available',
      role: 'Managing Partner / CEO',
      bio: 'This position is currently open for an experienced real estate investment professional to lead our growing team.',
      expertise: ['Strategic Planning', 'Investment Strategy', 'Team Leadership'],
      experience: '15+ years in real estate investment',
      image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/3d36fae0-fe42-4c13-a701-ce3dfefc9752.jpg',
      placeholder: true
    }
  ],
  advisors: [
    {
      id: 2,
      name: 'Senior Investment Advisor',
      role: 'Investment Strategy & Portfolio Management',
      bio: 'Seeking experienced investment professional to manage client portfolios and identify new opportunities.',
      expertise: ['Portfolio Management', 'Deal Sourcing', 'Risk Analysis'],
      experience: '10+ years in investment advisory',
      image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/b51e7858-8677-404f-bb39-1d043a3e5a60.jpg',
      placeholder: true
    },
    {
      id: 3,
      name: 'Real Estate Analyst Position',
      role: 'Market Research & Due Diligence',
      bio: 'Opportunity for analytical professional to conduct market research and investment analysis.',
      expertise: ['Market Analysis', 'Financial Modeling', 'Due Diligence'],
      experience: '5+ years in real estate analysis',
      image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/977a73c2-41d8-4efc-9639-1f86dff64098.jpg',
      placeholder: true
    }
  ],
  operations: [
    {
      id: 4,
      name: 'Operations Manager',
      role: 'Portfolio Operations & Client Services',
      bio: 'Role available for operations professional to manage property portfolios and client relationships.',
      expertise: ['Operations Management', 'Client Services', 'Process Improvement'],
      experience: '8+ years in operations',
      image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/094d6b1f-ce88-4270-ac35-b43b4a6dd142.jpg',
      placeholder: true
    }
  ]
};

const companyStats = [
  { icon: Award, value: '15+', label: 'Years Combined Experience' },
  { icon: Users, value: '750+', label: 'Investors Served' },
  { icon: Target, value: '$250M+', label: 'Assets Under Management' },
  { icon: BarChart3, value: '22%', label: 'Average Annual Return' }
];

export default function Team() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Our Investment Team
              </h1>
              <p className="text-xl opacity-90 mb-8">
                Building a world-class team of real estate investment professionals dedicated to your success
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
                {companyStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-200" />
                    <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-blue-200 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Introduction */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Building Excellence in Real Estate Investment
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                At Hidden Key Investments, we're assembling a team of seasoned professionals with 
                diverse expertise in real estate markets, investment strategy, and portfolio management. 
                Our team is committed to identifying unique opportunities and delivering exceptional 
                returns for our investors.
              </p>
              
              <div className="bg-blue-50 rounded-2xl p-8 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">
                  🚀 We're Growing!
                </h3>
                <p className="text-blue-800 mb-4">
                  Our team is expanding to serve our growing investor community. 
                  We're actively seeking talented professionals to join our mission of 
                  delivering superior real estate investment opportunities.
                </p>
                <Button variant="outline" className="bg-transparent border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                  View Career Opportunities
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Leadership Team
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Strategic leadership driving our investment philosophy and company vision
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {teamStructure.leadership.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </section>

        {/* Investment Advisors */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Investment Advisory Team
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Experts in deal sourcing, due diligence, and portfolio management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {teamStructure.advisors.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </section>

        {/* Operations Team */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Operations & Client Services
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Ensuring seamless execution and exceptional investor experience
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {teamStructure.operations.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </section>

        {/* Join Our Team CTA */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Join Our Growing Team
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                We're always looking for talented professionals passionate about real estate investment 
                and dedicated to delivering exceptional results for our investors.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  View Open Positions
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  Submit Your Resume
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Company Values */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Investment Philosophy
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: 'Strategic Due Diligence',
                  description: 'Every investment undergoes rigorous analysis and thorough due diligence to ensure quality and mitigate risk.',
                  icon: '🔍'
                },
                {
                  title: 'Long-Term Value Creation',
                  description: 'We focus on investments with strong fundamentals and sustainable growth potential over market cycles.',
                  icon: '📈'
                },
                {
                  title: 'Investor-Centric Approach',
                  description: 'Our success is measured by our investors success. We prioritize transparency and alignment of interests.',
                  icon: '🤝'
                }
              ].map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="text-4xl mb-4">{value.icon}</div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Team Member Card Component
function TeamMemberCard({ member }: { member: any }) {
  return (
    <Card className={`overflow-hidden hover:shadow-xl transition-all duration-300 ${member.placeholder ? 'border-2 border-dashed border-blue-300' : ''}`}>
      <div className="flex flex-col md:flex-row">
        {/* Profile Image */}
        <div className="md:w-48 flex-shrink-0">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-64 md:h-full object-cover"
          />
        </div>
        
        {/* Profile Info */}
        <CardContent className="p-6 flex-1">
          {member.placeholder && (
            <Badge variant="outline" className="mb-4 bg-yellow-50 text-yellow-700 border-yellow-200">
              Position Available
            </Badge>
          )}
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <CardTitle className="text-2xl mb-2">{member.name}</CardTitle>
              <CardDescription className="text-lg font-semibold text-blue-600">
                {member.role}
              </CardDescription>
            </div>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {member.bio}
          </p>

          {/* Experience */}
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <Award className="w-4 h-4 mr-2" />
            <span>{member.experience}</span>
          </div>

          {/* Expertise */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Areas of Expertise:</h4>
            <div className="flex flex-wrap gap-2">
              {member.expertise.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contact Actions */}
          {!member.placeholder ? (
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" className="bg-transparent">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Linkedin className="w-4 h-4 mr-2" />
                Connect
              </Button>
            </div>
          ) : (
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Learn More About This Role
            </Button>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
