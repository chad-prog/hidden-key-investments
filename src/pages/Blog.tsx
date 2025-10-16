/**
 * Blog and News section for real estate investment insights and company updates
 * Features articles, market analysis, and educational content
 */
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar, User, ArrowRight, Share2, Bookmark, Eye } from 'lucide-react';

// Mock blog data - replace with CMS or API data later
const blogPosts = [
  {
    id: 1,
    title: '2024 Real Estate Market Outlook: Opportunities in Volatile Times',
    excerpt: 'Exploring the key trends and investment opportunities in the current real estate market landscape.',
    content: 'Full article content would go here...',
    author: 'Sarah Johnson',
    date: '2024-03-15',
    readTime: '8 min read',
    category: 'Market Analysis',
    image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/eef260ec-4ae7-4f6c-90bf-6fb263e1aced.jpg',
    tags: ['Market Trends', 'Investment Strategy', '2024 Outlook'],
    featured: true,
    views: 1247
  },
  {
    id: 2,
    title: 'The Rise of Passive Real Estate Investing: What You Need to Know',
    excerpt: 'How passive investment strategies are changing the real estate landscape for busy professionals.',
    content: 'Full article content would go here...',
    author: 'Michael Chen',
    date: '2024-03-10',
    readTime: '6 min read',
    category: 'Investment Education',
    image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/23dfbaaf-434d-4426-8a8d-9df31e430bc7.jpg',
    tags: ['Passive Income', 'Syndications', 'REITs'],
    featured: true,
    views: 892
  },
  {
    id: 3,
    title: 'Texas Real Estate Boom: Why Investors Are Flocking to the Lone Star State',
    excerpt: 'Analyzing the economic drivers behind Texas explosive growth in commercial and residential real estate.',
    content: 'Full article content would go here...',
    author: 'Emily Rodriguez',
    date: '2024-03-05',
    readTime: '10 min read',
    category: 'Regional Markets',
    image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/24caba8e-b78c-42bd-a89a-4cd686f6c802.jpg',
    tags: ['Texas', 'Market Growth', 'Commercial'],
    featured: false,
    views: 1563
  },
  {
    id: 4,
    title: 'Tax Advantages of Real Estate Investing: A Comprehensive Guide',
    excerpt: 'Maximizing your returns through strategic tax planning and property ownership structures.',
    content: 'Full article content would go here...',
    author: 'David Thompson',
    date: '2024-02-28',
    readTime: '12 min read',
    category: 'Tax Strategy',
    image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/f4587778-df51-4070-b03c-1ae93d37a945.jpg',
    tags: ['Tax Benefits', '1031 Exchange', 'Depreciation'],
    featured: false,
    views: 2104
  },
  {
    id: 5,
    title: 'Multifamily vs. Commercial: Which Investment Strategy is Right for You?',
    excerpt: 'Comparing the risks, returns, and requirements of different real estate investment approaches.',
    content: 'Full article content would go here...',
    author: 'Sarah Johnson',
    date: '2024-02-20',
    readTime: '9 min read',
    category: 'Investment Strategy',
    image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/a85cdb3c-3a92-42a9-a58c-b6ad64e007bf.jpg',
    tags: ['Multifamily', 'Commercial', 'Strategy'],
    featured: false,
    views: 1345
  },
  {
    id: 6,
    title: 'The Impact of Interest Rates on Real Estate Valuations',
    excerpt: 'Understanding how monetary policy changes affect property prices and investment returns.',
    content: 'Full article content would go here...',
    author: 'Michael Chen',
    date: '2024-02-15',
    readTime: '7 min read',
    category: 'Economic Analysis',
    image: 'https://pub-cdn.sider.ai/u/U0JJH4N9KG7/web-coder/68e8f8e96b803a5b0ff9876e/resource/900e6a82-0636-4d2b-ad98-9660a6f225ba.jpg',
    tags: ['Interest Rates', 'Valuation', 'Economics'],
    featured: false,
    views: 987
  }
];

const categories = [
  'All',
  'Market Analysis',
  'Investment Education',
  'Regional Markets',
  'Tax Strategy',
  'Investment Strategy',
  'Economic Analysis'
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Investment Insights & News
              </h1>
              <p className="text-xl opacity-90 mb-8">
                Expert analysis, market trends, and educational resources for savvy real estate investors
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles, topics, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-6 border-2 border-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="bg-transparent"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Featured Insights
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Curated content highlighting key market trends and investment strategies
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <FeaturedPostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Posts */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredPosts.length} Articles{selectedCategory !== 'All' && ` in ${selectedCategory}`}
                </h2>
                <p className="text-gray-600">
                  Browse all our investment insights and educational content
                </p>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Sort by: </span>
                <select className="border-none bg-transparent focus:outline-none">
                  <option>Newest First</option>
                  <option>Most Popular</option>
                  <option>Oldest First</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Stay Informed with Market Insights
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Get weekly investment opportunities and market analysis delivered to your inbox
              </p>
              <div className="max-w-md mx-auto">
                <div className="flex gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Subscribe
                  </Button>
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  No spam. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Featured Post Card Component
function FeaturedPostCard({ post }: { post: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-blue-600 text-white">
            Featured
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(post.date).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            {post.author}
          </div>
          <div>{post.readTime}</div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button>
            Read More
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {post.views}
            </div>
            <Button variant="ghost" size="sm" className="bg-transparent">
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="bg-transparent">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Regular Post Card Component
function PostCard({ post }: { post: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            {post.category}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(post.date).toLocaleDateString()}
          </div>
          <div>{post.readTime}</div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" className="bg-transparent">
            Read More
          </Button>
          
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Eye className="w-3 h-3" />
            <span>{post.views}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
