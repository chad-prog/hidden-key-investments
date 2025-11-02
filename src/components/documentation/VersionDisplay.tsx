import { Badge } from '@/components/ui/badge';
import { GitBranch, Clock, Tag as TagIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DocumentVersion {
  version?: string;
  lastUpdated?: string;
  author?: string;
  status?: 'draft' | 'published' | 'archived';
}

interface VersionDisplayProps {
  version: DocumentVersion;
  compact?: boolean;
}

/**
 * Display document version information
 */
export function VersionDisplay({ version, compact = false }: VersionDisplayProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'archived':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {version.version && (
          <span className="flex items-center gap-1">
            <TagIcon className="h-3 w-3" />
            v{version.version}
          </span>
        )}
        {version.lastUpdated && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(version.lastUpdated)}
          </span>
        )}
        {version.status && (
          <Badge variant="outline" className={`text-xs ${getStatusColor(version.status)}`}>
            {version.status}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <GitBranch className="h-4 w-4 text-primary" />
        <h4 className="font-semibold text-sm">Document Info</h4>
      </div>
      <div className="space-y-2 text-sm">
        {version.version && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Version</span>
            <Badge variant="outline" className="font-mono">
              v{version.version}
            </Badge>
          </div>
        )}
        {version.lastUpdated && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">{formatDate(version.lastUpdated)}</span>
          </div>
        )}
        {version.author && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Author</span>
            <span className="font-medium">{version.author}</span>
          </div>
        )}
        {version.status && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge className={getStatusColor(version.status)}>
              {version.status.charAt(0).toUpperCase() + version.status.slice(1)}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Extract version info from markdown metadata
 */
export function extractVersionFromMarkdown(content: string): DocumentVersion {
  const version: DocumentVersion = {};

  // Extract metadata from front matter or first few lines
  const lines = content.split('\n').slice(0, 20);
  
  for (const line of lines) {
    const versionMatch = line.match(/\*\*Version:\*\*\s*(.+)/i);
    if (versionMatch) {
      version.version = versionMatch[1].trim();
    }

    const dateMatch = line.match(/\*\*Last Updated:\*\*\s*(.+)/i);
    if (dateMatch) {
      version.lastUpdated = dateMatch[1].trim();
    }

    const authorMatch = line.match(/\*\*Author:\*\*\s*(.+)/i);
    if (authorMatch) {
      version.author = authorMatch[1].trim();
    }

    const statusMatch = line.match(/\*\*Status:\*\*\s*(.+)/i);
    if (statusMatch) {
      const status = statusMatch[1].trim().toLowerCase();
      if (status === 'draft' || status === 'published' || status === 'archived') {
        version.status = status;
      }
    }
  }

  return version;
}
