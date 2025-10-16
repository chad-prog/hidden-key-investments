/**
 * Testimonials section showcasing client reviews and experiences
 */
import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: 'Jennifer Williams',
      role: 'Property Investor',
      rating: 5,
      comment: 'TheCurateProp made finding my dream investment property incredibly easy. Their market knowledge and personalized service exceeded all my expectations. Highly recommended!',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/aabcc6cf-e438-434d-8871-e2123c1f5d0d.jpg',
      property: 'Purchased luxury condo in Miami'
    },
    {
      id: 2,
      name: 'Robert Davis',
      role: 'First-time Homebuyer',
      rating: 5,
      comment: 'As a first-time buyer, I was nervous about the process. The team at TheCurateProp guided me through every step with patience and expertise. Found the perfect family home!',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/1c0f4b22-aba4-4bf9-9daf-8179c306f0b6.jpg',
      property: 'Bought family home in Austin'
    },
    {
      id: 3,
      name: 'Maria Garcia',
      role: 'Property Seller',
      rating: 5,
      comment: 'Sold my property 20% above asking price within two weeks! Their marketing strategy and negotiation skills are unmatched. Professional service from start to finish.',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/4e1684cb-deb6-4e35-b889-091c02d10442.jpg',
      property: 'Sold townhouse in Denver'
    },
    {
      id: 4,
      name: 'David Thompson',
      role: 'Real Estate Investor',
      rating: 5,
      comment: 'Working with TheCurateProp has transformed my investment portfolio. Their market insights and exclusive listings have helped me achieve exceptional returns.',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/60ffac34-f20f-4218-8967-800b394f7aab.jpg',
      property: 'Multiple investment properties'
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      role: 'Luxury Home Buyer',
      rating: 5,
      comment: 'The attention to detail and curated selection of luxury properties is outstanding. They understood exactly what I was looking for and delivered beyond my expectations.',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/66cde7df-5ba6-4a02-890f-37b6cb84db05.jpg',
      property: 'Luxury estate in Scottsdale'
    },
    {
      id: 6,
      name: 'James Wilson',
      role: 'Commercial Investor',
      rating: 5,
      comment: 'Their commercial real estate expertise helped me identify and acquire prime investment opportunities. Professional, knowledgeable, and results-driven team.',
      image: 'https://pub-cdn.sider.ai/u/U0NWHZ643YA/web-coder/68957cfbd30e3e771cc7e6e5/resource/4e01f83d-75f0-4de0-a86e-2cb2780d895a.jpg',
      property: 'Commercial building portfolio'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Don't just take our word for it—hear from satisfied clients who have achieved 
            their real estate dreams with TheCurateProp
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="w-8 h-8 text-blue-400" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Comment */}
              <p className="text-slate-200 mb-6 leading-relaxed">
                "{testimonial.comment}"
              </p>

              {/* Property Info */}
              <p className="text-blue-300 text-sm mb-4 font-medium">
                {testimonial.property}
              </p>

              {/* Client Info */}
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 object-cover rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-slate-400 text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Rating Summary */}
        <div className="mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="flex justify-center items-center mb-4">
              <div className="flex items-center mr-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-3xl font-bold">4.9/5.0</span>
            </div>
            <p className="text-slate-300 mb-4">
              Based on 500+ client reviews
            </p>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-slate-400">Happy Clients</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">99%</div>
                <div className="text-sm text-slate-400">Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">15+</div>
                <div className="text-sm text-slate-400">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
