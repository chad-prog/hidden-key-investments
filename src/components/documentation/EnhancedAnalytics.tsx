import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  Eye, 
  Clock, 
  FileText, 
  Search,
  Tag,
  BarChart3,
  Calendar,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DocAnalytics {
  path: string;
  views: number;
  avgReadTime: number;
  lastViewed: string;
}

interface SearchQuery {
  query: string;
  timestamp: string;
  resultsCount: number;
}

interface NavigationPattern {
  fromPath: string;
  toPath: string;
  count: number;
}

interface StoredDocData {
  path: string;
  views: number;
  totalReadTime: number;
  viewCount: number;
  lastViewed: string | null;
}

interface AnalyticsSummary {
  totalViews: number;
  totalDocs: number;
  popularDocs: DocAnalytics[];
  recentDocs: DocAnalytics[];
  searchQueries: SearchQuery[];
  navigationPatterns: NavigationPattern[];
  categoryStats: Record<string, number>;
  tagStats: Record<string, number>;
}

/**
 * Enhanced analytics with search trends, navigation patterns, and detailed metrics
 */
export function useEnhancedDocumentationAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalViews: 0,
    totalDocs: 0,
    popularDocs: [],
    recentDocs: [],
    searchQueries: [],
    navigationPatterns: [],
    categoryStats: {},
    tagStats: {},
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    try {
      const docData = localStorage.getItem('doc-analytics') || '{}';
      const searchData = localStorage.getItem('search-analytics') || '[]';
      const navData = localStorage.getItem('navigation-analytics') || '[]';
      const categoryData = localStorage.getItem('category-analytics') || '{}';
      const tagData = localStorage.getItem('tag-analytics') || '{}';

      const parsedDocData = JSON.parse(docData);
      const parsedSearchData = JSON.parse(searchData);
      const parsedNavData = JSON.parse(navData);
      const parsedCategoryData = JSON.parse(categoryData);
      const parsedTagData = JSON.parse(tagData);

      setAnalytics(computeSummary(
        parsedDocData,
        parsedSearchData,
        parsedNavData,
        parsedCategoryData,
        parsedTagData
      ));
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const trackView = (path: string, category?: string, tags?: string[]) => {
    try {
      // Track document view
      const stored = localStorage.getItem('doc-analytics') || '{}';
      const data = JSON.parse(stored);

      if (!data[path]) {
        data[path] = {
          path,
          views: 0,
          totalReadTime: 0,
          viewCount: 0,
          lastViewed: null,
        };
      }

      data[path].views += 1;
      data[path].lastViewed = new Date().toISOString();
      data[path].viewCount += 1;

      localStorage.setItem('doc-analytics', JSON.stringify(data));

      // Track category stats
      if (category) {
        const categoryStats = JSON.parse(localStorage.getItem('category-analytics') || '{}');
        categoryStats[category] = (categoryStats[category] || 0) + 1;
        localStorage.setItem('category-analytics', JSON.stringify(categoryStats));
      }

      // Track tag stats
      if (tags && tags.length > 0) {
        const tagStats = JSON.parse(localStorage.getItem('tag-analytics') || '{}');
        tags.forEach(tag => {
          tagStats[tag] = (tagStats[tag] || 0) + 1;
        });
        localStorage.setItem('tag-analytics', JSON.stringify(tagStats));
      }

      loadAnalytics();
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const trackSearch = (query: string, resultsCount: number) => {
    try {
      const stored = localStorage.getItem('search-analytics') || '[]';
      const data = JSON.parse(stored);

      data.push({
        query,
        timestamp: new Date().toISOString(),
        resultsCount,
      });

      // Keep only last 100 searches
      if (data.length > 100) {
        data.shift();
      }

      localStorage.setItem('search-analytics', JSON.stringify(data));
      loadAnalytics();
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  };

  const trackNavigation = (fromPath: string, toPath: string) => {
    try {
      const stored = localStorage.getItem('navigation-analytics') || '[]';
      const data = JSON.parse(stored);

      const existing = data.find(
        (item: NavigationPattern) => item.fromPath === fromPath && item.toPath === toPath
      );

      if (existing) {
        existing.count += 1;
      } else {
        data.push({ fromPath, toPath, count: 1 });
      }

      // Keep only top 50 patterns
      data.sort((a: NavigationPattern, b: NavigationPattern) => b.count - a.count);
      if (data.length > 50) {
        data.length = 50;
      }

      localStorage.setItem('navigation-analytics', JSON.stringify(data));
      loadAnalytics();
    } catch (error) {
      console.error('Failed to track navigation:', error);
    }
  };

  const trackReadTime = (path: string, seconds: number) => {
    try {
      const stored = localStorage.getItem('doc-analytics') || '{}';
      const data = JSON.parse(stored);

      if (data[path]) {
        data[path].totalReadTime += seconds;
        localStorage.setItem('doc-analytics', JSON.stringify(data));
        loadAnalytics();
      }
    } catch (error) {
      console.error('Failed to track read time:', error);
    }
  };

  const clearAnalytics = () => {
    try {
      localStorage.removeItem('doc-analytics');
      localStorage.removeItem('search-analytics');
      localStorage.removeItem('navigation-analytics');
      localStorage.removeItem('category-analytics');
      localStorage.removeItem('tag-analytics');
      loadAnalytics();
    } catch (error) {
      console.error('Failed to clear analytics:', error);
    }
  };

  const computeSummary = (
    docData: Record<string, StoredDocData>,
    searchData: SearchQuery[],
    navData: NavigationPattern[],
    categoryData: Record<string, number>,
    tagData: Record<string, number>
  ): AnalyticsSummary => {
    const docs = Object.values(docData);
    const totalViews = docs.reduce((sum, doc) => sum + doc.views, 0);

    const popularDocs = docs
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(doc => ({
        path: doc.path,
        views: doc.views,
        avgReadTime: doc.viewCount > 0 ? Math.round(doc.totalReadTime / doc.viewCount) : 0,
        lastViewed: doc.lastViewed || '',
      }));

    const recentDocs = docs
      .filter(doc => doc.lastViewed)
      .sort((a, b) => {
        const aTime = a.lastViewed ? new Date(a.lastViewed).getTime() : 0;
        const bTime = b.lastViewed ? new Date(b.lastViewed).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5)
      .map(doc => ({
        path: doc.path,
        views: doc.views,
        avgReadTime: doc.viewCount > 0 ? Math.round(doc.totalReadTime / doc.viewCount) : 0,
        lastViewed: doc.lastViewed || '',
      }));

    return {
      totalViews,
      totalDocs: docs.length,
      popularDocs,
      recentDocs,
      searchQueries: searchData.slice(-20).reverse(), // Last 20 searches
      navigationPatterns: navData.slice(0, 10), // Top 10 patterns
      categoryStats: categoryData,
      tagStats: tagData,
    };
  };

  return {
    analytics,
    trackView,
    trackSearch,
    trackNavigation,
    trackReadTime,
    clearAnalytics,
  };
}

export function EnhancedAnalyticsDashboard() {
  const { analytics, clearAnalytics } = useEnhancedDocumentationAnalytics();
  const [timeRange, setTimeRange] = useState('all');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const topCategories = Object.entries(analytics.categoryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topTags = Object.entries(analytics.tagStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Documentation Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track usage patterns and documentation engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={clearAnalytics}>
            Clear Data
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="text-2xl font-bold">{analytics.totalViews}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Documents</p>
              <p className="text-2xl font-bold">{analytics.totalDocs}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Searches</p>
              <p className="text-2xl font-bold">{analytics.searchQueries.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Views/Doc</p>
              <p className="text-2xl font-bold">
                {analytics.totalDocs > 0
                  ? (analytics.totalViews / analytics.totalDocs).toFixed(1)
                  : '0'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Popular Documents */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Most Popular Documents</h3>
          </div>
          <div className="space-y-3">
            {analytics.popularDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No analytics data yet. Start browsing documentation!
              </p>
            ) : (
              analytics.popularDocs.map((doc, index) => (
                <div
                  key={doc.path}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.path}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {doc.views} views
                        </span>
                        {doc.avgReadTime > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor(doc.avgReadTime / 60)}m {doc.avgReadTime % 60}s
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top Search Queries */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Recent Searches</h3>
          </div>
          <div className="space-y-3">
            {analytics.searchQueries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No search history yet
              </p>
            ) : (
              analytics.searchQueries.map((query, index) => (
                <div
                  key={`${query.query}-${index}`}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{query.query}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(query.timestamp)} • {query.resultsCount} results
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Category Stats */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Top Categories</h3>
          </div>
          <div className="space-y-3">
            {topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No category data yet
              </p>
            ) : (
              topCategories.map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-sm font-medium">{category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(count / analytics.totalViews) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Tag Stats */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Popular Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topTags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 w-full">
                No tag data yet
              </p>
            ) : (
              topTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-sm"
                >
                  {tag}
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    {count}
                  </span>
                </span>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Privacy Notice */}
      <Card className="p-4 bg-muted/50">
        <p className="text-xs text-muted-foreground">
          🔒 <strong>Privacy-Friendly Analytics:</strong> All data is stored locally in your
          browser. No data is sent to external servers. You can clear analytics data anytime by
          clicking the "Clear Data" button above.
        </p>
      </Card>
    </div>
  );
}
