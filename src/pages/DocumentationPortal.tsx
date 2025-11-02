import { useState, useMemo, useEffect } from 'react';
import { Search, FileText, Book, Menu, X, Home, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface DocMetadata {
  path: string;
  title: string;
  category: string;
  description: string;
  readTime: number;
  tags: string[];
  lastUpdated?: string;
  version?: string;
}

// Documentation catalog - in production this would be loaded from an API or generated at build time
const documentationCatalog: DocMetadata[] = [
  // Essential Docs
  {
    path: '/README.md',
    title: 'Project Overview',
    category: '00-START-HERE',
    description: 'Complete platform overview, features, and quick start guide',
    readTime: 5,
    tags: ['overview', 'getting-started', 'essential'],
  },
  {
    path: '/WHAT-I-CAN-DO-COMPLETE-ANSWER.md',
    title: 'Complete Capability Guide',
    category: '00-START-HERE',
    description: 'Detailed specs for all 7 phases, time and cost breakdowns',
    readTime: 15,
    tags: ['capabilities', 'planning', 'essential'],
  },
  {
    path: '/NEXT-ACTIONS-SIMPLIFIED.md',
    title: 'Take Action Now',
    category: '00-START-HERE',
    description: 'Choose your path (A/B/C/D) and get started in 5 minutes',
    readTime: 5,
    tags: ['action-plan', 'getting-started', 'essential'],
  },
  {
    path: '/DOCUMENTATION-INDEX.md',
    title: 'Documentation Index',
    category: '00-START-HERE',
    description: 'Master navigation hub for all 144+ documentation files',
    readTime: 5,
    tags: ['navigation', 'index', 'essential'],
  },
  // Getting Started
  {
    path: '/SETUP-GUIDE.md',
    title: 'Setup Guide',
    category: '01-GETTING-STARTED',
    description: 'Initial project setup instructions',
    readTime: 10,
    tags: ['setup', 'installation'],
  },
  {
    path: '/QUICK-REFERENCE.md',
    title: 'Quick Reference',
    category: '01-GETTING-STARTED',
    description: 'Common commands and workflows',
    readTime: 5,
    tags: ['reference', 'commands'],
  },
  {
    path: '/docs/QUICK-START.md',
    title: 'Quick Start',
    category: '01-GETTING-STARTED',
    description: 'Get building in 5 minutes',
    readTime: 5,
    tags: ['quickstart', 'tutorial'],
  },
  // Architecture
  {
    path: '/docs/ARCHITECTURE.md',
    title: 'System Architecture',
    category: '02-ARCHITECTURE',
    description: 'Complete system design and architecture overview',
    readTime: 30,
    tags: ['architecture', 'design', 'technical'],
  },
  {
    path: '/docs/API-REFERENCE.md',
    title: 'API Reference',
    category: '02-ARCHITECTURE',
    description: 'API documentation and endpoints',
    readTime: 20,
    tags: ['api', 'reference', 'technical'],
  },
  {
    path: '/docs/ML-ARCHITECTURE.md',
    title: 'ML Architecture',
    category: '02-ARCHITECTURE',
    description: 'Machine learning system design',
    readTime: 25,
    tags: ['ml', 'ai', 'architecture'],
  },
  // Features
  {
    path: '/docs/CAPABILITIES.md',
    title: 'Platform Capabilities',
    category: '03-FEATURES',
    description: 'Complete feature list and capabilities',
    readTime: 20,
    tags: ['features', 'capabilities'],
  },
  {
    path: '/docs/WEBHOOK-INTEGRATION.md',
    title: 'Webhook Integration',
    category: '03-FEATURES',
    description: 'Webhook setup guide for Zapier, Make, n8n',
    readTime: 15,
    tags: ['webhooks', 'integration', 'tutorial'],
  },
  // Development
  {
    path: '/CONTRIBUTING.md',
    title: 'Contributing Guide',
    category: '04-DEVELOPMENT',
    description: 'Developer contribution guidelines',
    readTime: 10,
    tags: ['contributing', 'development'],
  },
  {
    path: '/docs/TESTING-GUIDE.md',
    title: 'Testing Guide',
    category: '04-DEVELOPMENT',
    description: 'Testing practices and utilities',
    readTime: 20,
    tags: ['testing', 'quality', 'development'],
  },
  // Deployment
  {
    path: '/DEPLOYMENT-GUIDE.md',
    title: 'Deployment Guide',
    category: '05-DEPLOYMENT',
    description: 'Deployment overview and procedures',
    readTime: 15,
    tags: ['deployment', 'devops'],
  },
  {
    path: '/docs/STAGING-SETUP.md',
    title: 'Staging Setup',
    category: '05-DEPLOYMENT',
    description: 'Staging environment configuration',
    readTime: 20,
    tags: ['staging', 'deployment', 'devops'],
  },
  {
    path: '/docs/ENVIRONMENT-VARIABLES.md',
    title: 'Environment Variables',
    category: '05-DEPLOYMENT',
    description: 'Configuration and environment setup',
    readTime: 10,
    tags: ['configuration', 'environment'],
  },
  {
    path: '/docs/OBSERVABILITY-GUIDE.md',
    title: 'Observability Guide',
    category: '05-DEPLOYMENT',
    description: 'Monitoring and logging setup',
    readTime: 15,
    tags: ['monitoring', 'observability', 'devops'],
  },
  // Vision & Roadmap
  {
    path: '/IMPLEMENTATION-STATUS.md',
    title: 'Implementation Status',
    category: '06-VISION-ROADMAP',
    description: 'Current completion status',
    readTime: 10,
    tags: ['status', 'progress'],
  },
  {
    path: '/PROJECT-ROADMAP.md',
    title: 'Project Roadmap',
    category: '06-VISION-ROADMAP',
    description: 'Future development phases',
    readTime: 15,
    tags: ['roadmap', 'planning'],
  },
];

const categories = [
  { id: 'all', name: 'All Documentation', icon: FileText },
  { id: '00-START-HERE', name: 'Start Here', icon: Home },
  { id: '01-GETTING-STARTED', name: 'Getting Started', icon: Book },
  { id: '02-ARCHITECTURE', name: 'Architecture', icon: FileText },
  { id: '03-FEATURES', name: 'Features', icon: FileText },
  { id: '04-DEVELOPMENT', name: 'Development', icon: FileText },
  { id: '05-DEPLOYMENT', name: 'Deployment', icon: FileText },
  { id: '06-VISION-ROADMAP', name: 'Vision & Roadmap', icon: FileText },
  { id: '07-REFERENCE', name: 'Reference', icon: FileText },
];

const roles = [
  { id: 'all', name: 'All Roles' },
  { id: 'developer', name: 'Developer', tags: ['development', 'testing', 'technical', 'api'] },
  { id: 'executive', name: 'Executive', tags: ['status', 'planning', 'roadmap', 'overview'] },
  { id: 'devops', name: 'DevOps', tags: ['deployment', 'devops', 'configuration', 'monitoring'] },
  { id: 'architect', name: 'Architect', tags: ['architecture', 'design', 'technical'] },
];

export default function DocumentationPortal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocMetadata | null>(null);

  // Filter documentation based on search, category, and role
  const filteredDocs = useMemo(() => {
    let filtered = documentationCatalog;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Filter by role
    if (selectedRole !== 'all') {
      const role = roles.find(r => r.id === selectedRole);
      if (role && role.tags) {
        filtered = filtered.filter(doc =>
          doc.tags.some(tag => role.tags!.includes(tag))
        );
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedRole]);

  // Group by category
  const groupedDocs = useMemo(() => {
    const grouped: Record<string, DocMetadata[]> = {};
    filteredDocs.forEach(doc => {
      if (!grouped[doc.category]) {
        grouped[doc.category] = [];
      }
      grouped[doc.category].push(doc);
    });
    return grouped;
  }, [filteredDocs]);

  // Calculate total read time
  const totalReadTime = useMemo(() => {
    return filteredDocs.reduce((sum, doc) => sum + doc.readTime, 0);
  }, [filteredDocs]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Book className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Documentation Portal</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? 'block' : 'hidden'
            } md:block w-full md:w-64 space-y-6`}
          >
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Documentation</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Role</label>
              <div className="space-y-1">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedRole === role.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {role.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Navigation */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categories</label>
              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const count = documentationCatalog.filter(
                    (doc) => doc.category === category.id || category.id === 'all'
                  ).length;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {category.name}
                      </div>
                      <span className="text-xs opacity-70">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{filteredDocs.length} documents</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{totalReadTime} min total read time</span>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedCategory === 'all' ? 'All Documentation' : categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} found
                  {selectedRole !== 'all' && ` for ${roles.find(r => r.id === selectedRole)?.name}`}
                </p>
              </div>
            </div>

            {/* Document List */}
            {Object.keys(groupedDocs).length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedDocs).map(([categoryId, docs]) => (
                  <div key={categoryId} className="space-y-3">
                    {selectedCategory === 'all' && (
                      <h3 className="text-lg font-semibold">
                        {categories.find(c => c.id === categoryId)?.name}
                      </h3>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                      {docs.map((doc) => (
                        <Card
                          key={doc.path}
                          className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => window.open(doc.path, '_blank')}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{doc.title}</h4>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {doc.readTime} min
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {doc.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {doc.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-xs"
                              >
                                <Tag className="h-3 w-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-4">📚 Quick Access Guides</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.open('/README.md', '_blank')}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Platform Overview
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.open('/WHAT-I-CAN-DO-COMPLETE-ANSWER.md', '_blank')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Complete Guide
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.open('/NEXT-ACTIONS-SIMPLIFIED.md', '_blank')}
                >
                  <Book className="h-4 w-4 mr-2" />
                  Take Action Now
                </Button>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
