import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Printer, 
  ExternalLink, 
  X, 
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TableOfContents } from './TableOfContents';
import { VersionDisplay, extractVersionFromMarkdown } from './VersionDisplay';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import 'highlight.js/styles/github-dark.css';

interface MarkdownPreviewProps {
  filePath: string;
  title: string;
  onClose?: () => void;
  open?: boolean;
}

/**
 * Markdown preview component with table of contents, version info, and export options
 */
export function MarkdownPreview({ 
  filePath, 
  title, 
  onClose,
  open = true 
}: MarkdownPreviewProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToc, setShowToc] = useState(true);

  useEffect(() => {
    if (!filePath || !open) return;

    setLoading(true);
    setError(null);

    fetch(filePath)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load document: ${res.statusText}`);
        }
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Failed to load document '${filePath}':`, err);
        setError(err.message);
        setLoading(false);
      });
  }, [filePath, open]);

  const handleExportPDF = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenInNewTab = () => {
    window.open(filePath, '_blank');
  };

  const versionInfo = content ? extractVersionFromMarkdown(content) : {};

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="truncate">{title}</span>
              </DialogTitle>
              <DialogDescription className="mt-1">
                {filePath}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowToc(!showToc)}
                title={showToc ? 'Hide sidebar' : 'Show sidebar'}
              >
                {showToc ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadMarkdown}
                title="Download Markdown"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                title="Export as PDF"
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading document...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <FileText className="h-16 w-16 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Document</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {error}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleOpenInNewTab}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Try Opening in New Tab
              </Button>
            </div>
          ) : (
            <div className="flex h-full gap-4 p-6 pt-2">
              {/* Main Content */}
              <ScrollArea className="flex-1">
                <div className="prose prose-sm dark:prose-invert max-w-none pr-4">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      // Custom rendering for code blocks
                      code({ node, inline, className, children, ...props }) {
                        return (
                          <code
                            className={className}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      // Custom rendering for links to open in new tab
                      a({ node, children, href, ...props }) {
                        const isExternal = href?.startsWith('http');
                        return (
                          <a
                            href={href}
                            target={isExternal ? '_blank' : undefined}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            {...props}
                          >
                            {children}
                          </a>
                        );
                      },
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              </ScrollArea>

              {/* Sidebar with TOC and Version Info */}
              {showToc && (
                <aside className="w-80 space-y-4 flex-shrink-0">
                  {/* Version Info */}
                  {(versionInfo.version || versionInfo.lastUpdated) && (
                    <VersionDisplay version={versionInfo} />
                  )}

                  {/* Table of Contents */}
                  <TableOfContents content={content} maxLevel={3} />
                </aside>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage markdown preview state
 */
export function useMarkdownPreview() {
  const [previewState, setPreviewState] = useState<{
    isOpen: boolean;
    filePath: string;
    title: string;
  }>({
    isOpen: false,
    filePath: '',
    title: '',
  });

  const openPreview = (filePath: string, title: string) => {
    setPreviewState({
      isOpen: true,
      filePath,
      title,
    });
  };

  const closePreview = () => {
    setPreviewState({
      isOpen: false,
      filePath: '',
      title: '',
    });
  };

  return {
    previewState,
    openPreview,
    closePreview,
  };
}
