import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  GitBranch, 
  Clock, 
  User, 
  FileText,
  ChevronRight,
  GitCommit,
  Calendar
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
  changes: {
    additions: number;
    deletions: number;
  };
}

interface VersionHistoryProps {
  filePath: string;
  compact?: boolean;
}

/**
 * Display version history for a document by tracking Git commits
 * Note: This requires a backend API to fetch Git history
 * For demo purposes, we'll use localStorage to track local changes
 */
export function VersionHistory({ filePath, compact = false }: VersionHistoryProps) {
  const [history, setHistory] = useState<GitCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadVersionHistory();
  }, [filePath]);

  const loadVersionHistory = () => {
    setLoading(true);
    
    // In production, this would call an API endpoint
    // For demo, we'll load from localStorage
    try {
      const stored = localStorage.getItem(`version-history-${filePath}`) || '[]';
      const parsedHistory = JSON.parse(stored);
      setHistory(parsedHistory);
    } catch (error) {
      console.error('Failed to load version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackVersionChange = (message: string) => {
    try {
      const stored = localStorage.getItem(`version-history-${filePath}`) || '[]';
      const parsedHistory = JSON.parse(stored);
      
      const newCommit: GitCommit = {
        hash: Math.random().toString(36).substring(7),
        author: 'Current User',
        date: new Date().toISOString(),
        message,
        changes: {
          additions: 0,
          deletions: 0,
        },
      };
      
      parsedHistory.unshift(newCommit);
      
      // Keep only last 50 commits
      if (parsedHistory.length > 50) {
        parsedHistory.length = 50;
      }
      
      localStorage.setItem(`version-history-${filePath}`, JSON.stringify(parsedHistory));
      setHistory(parsedHistory);
    } catch (error) {
      console.error('Failed to track version change:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin" />
          Loading version history...
        </div>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Version History</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          No version history available for this document.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Version history will be tracked automatically as changes are made.
        </p>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Version History</h4>
          </div>
          <span className="text-xs text-muted-foreground">{history.length} versions</span>
        </div>
        
        <div className="space-y-2">
          {history.slice(0, 3).map((commit) => (
            <div
              key={commit.hash}
              className="flex items-start gap-2 text-sm pb-2 border-b last:border-0"
            >
              <GitCommit className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{commit.message}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{formatDate(commit.date)}</span>
                  <span>•</span>
                  <span>{commit.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {history.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => setExpanded(!expanded)}
          >
            View all {history.length} versions
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Version History</h3>
        </div>
        <span className="text-sm text-muted-foreground">{history.length} versions</span>
      </div>

      <div className="space-y-4">
        {history.map((commit, index) => (
          <Collapsible key={commit.hash}>
            <div className="flex items-start gap-3 pb-4 border-b last:border-0">
              <div className="relative">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <GitCommit className="h-4 w-4 text-primary" />
                </div>
                {index < history.length - 1 && (
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border" />
                )}
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{commit.message}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {commit.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(commit.date)}
                      </span>
                    </div>
                  </div>
                  
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <div className="mt-3 p-3 bg-muted/50 rounded-md text-xs space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-green-600 dark:text-green-400">
                        +{commit.changes.additions} additions
                      </span>
                      <span className="text-red-600 dark:text-red-400">
                        -{commit.changes.deletions} deletions
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Commit: <code className="bg-background px-1 py-0.5 rounded">{commit.hash}</code>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </div>
          </Collapsible>
        ))}
      </div>

      {/* Info about real Git integration */}
      <Card className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>Production Note:</strong> In a production environment, this component would
          integrate with your Git repository to show real commit history. For now, it tracks local
          changes in browser storage.
        </p>
      </Card>
    </Card>
  );
}

/**
 * Hook to manage version history
 */
export function useVersionHistory(filePath: string) {
  const [history, setHistory] = useState<GitCommit[]>([]);

  useEffect(() => {
    loadHistory();
  }, [filePath]);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(`version-history-${filePath}`) || '[]';
      setHistory(JSON.parse(stored));
    } catch (error) {
      console.error('Failed to load version history:', error);
    }
  };

  const addVersion = (message: string) => {
    try {
      const newCommit: GitCommit = {
        hash: Math.random().toString(36).substring(7),
        author: 'Current User',
        date: new Date().toISOString(),
        message,
        changes: {
          additions: 0,
          deletions: 0,
        },
      };

      const updated = [newCommit, ...history];
      
      // Keep only last 50 commits
      if (updated.length > 50) {
        updated.length = 50;
      }

      localStorage.setItem(`version-history-${filePath}`, JSON.stringify(updated));
      setHistory(updated);
    } catch (error) {
      console.error('Failed to add version:', error);
    }
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(`version-history-${filePath}`);
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  return {
    history,
    addVersion,
    clearHistory,
    loadHistory,
  };
}
