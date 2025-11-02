import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Eye, Clock, FileText } from 'lucide-react';

interface DocAnalytics {
  path: string;
  views: number;
  avgReadTime: number;
  lastViewed: string;
}

interface AnalyticsSummary {
  totalViews: number;
  totalDocs: number;
  popularDocs: DocAnalytics[];
  recentDocs: DocAnalytics[];
}

/**
 * Privacy-friendly documentation analytics
 * Uses localStorage only (no external tracking)
 */
export function useDocumentationAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalViews: 0,
    totalDocs: 0,
    popularDocs: [],
    recentDocs: [],
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    try {
      const stored = localStorage.getItem('doc-analytics');
      if (stored) {
        const data = JSON.parse(stored);
        setAnalytics(computeSummary(data));
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const trackView = (path: string) => {
    try {
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
      setAnalytics(computeSummary(data));
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const trackReadTime = (path: string, seconds: number) => {
    try {
      const stored = localStorage.getItem('doc-analytics') || '{}';
      const data = JSON.parse(stored);

      if (data[path]) {
        data[path].totalReadTime += seconds;
        localStorage.setItem('doc-analytics', JSON.stringify(data));
        setAnalytics(computeSummary(data));
      }
    } catch (error) {
      console.error('Failed to track read time:', error);
    }
  };

  const computeSummary = (data: Record<string, any>): AnalyticsSummary => {
    const docs = Object.values(data) as any[];
    const totalViews = docs.reduce((sum, doc) => sum + doc.views, 0);

    const popularDocs = docs
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(doc => ({
        path: doc.path,
        views: doc.views,
        avgReadTime: doc.viewCount > 0 ? Math.round(doc.totalReadTime / doc.viewCount) : 0,
        lastViewed: doc.lastViewed,
      }));

    const recentDocs = docs
      .filter(doc => doc.lastViewed)
      .sort((a, b) => new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime())
      .slice(0, 5)
      .map(doc => ({
        path: doc.path,
        views: doc.views,
        avgReadTime: doc.viewCount > 0 ? Math.round(doc.totalReadTime / doc.viewCount) : 0,
        lastViewed: doc.lastViewed,
      }));

    return {
      totalViews,
      totalDocs: docs.length,
      popularDocs,
      recentDocs,
    };
  };

  return {
    analytics,
    trackView,
    trackReadTime,
  };
}

export function DocumentationAnalytics() {
  const { analytics } = useDocumentationAnalytics();

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

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
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
              <p className="text-sm text-muted-foreground">Documents Tracked</p>
              <p className="text-2xl font-bold">{analytics.totalDocs}</p>
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

        {/* Recently Viewed */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Recently Viewed</h3>
          </div>
          <div className="space-y-3">
            {analytics.recentDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent views yet
              </p>
            ) : (
              analytics.recentDocs.map((doc) => (
                <div
                  key={doc.path}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.path}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(doc.lastViewed)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {doc.views}
                  </div>
                </div>
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
          clearing your browser's local storage.
        </p>
      </Card>
    </div>
  );
}
