import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { List, ChevronRight } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
  children?: TocItem[];
}

interface TableOfContentsProps {
  content: string;
  maxLevel?: number;
}

/**
 * Generates a table of contents from markdown content
 * Extracts headings and creates a hierarchical structure
 */
export function TableOfContents({ content, maxLevel = 3 }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const items = parseMarkdownHeadings(content, maxLevel);
    setTocItems(items);
  }, [content, maxLevel]);

  const parseMarkdownHeadings = (markdown: string, maxLevel: number): TocItem[] => {
    const lines = markdown.split('\n');
    const items: TocItem[] = [];
    const stack: TocItem[] = [];

    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        if (level > maxLevel) continue;

        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

        const item: TocItem = { id, text, level };

        // Build hierarchy
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          items.push(item);
        } else {
          const parent = stack[stack.length - 1];
          if (!parent.children) parent.children = [];
          parent.children.push(item);
        }

        stack.push(item);
      }
    }

    return items;
  };

  const scrollToHeading = (id: string) => {
    setActiveId(id);
    // In a real implementation, this would scroll to the heading
    // For now, we just track the active item
  };

  const renderTocItem = (item: TocItem, depth: number = 0) => {
    return (
      <div key={item.id}>
        <button
          onClick={() => scrollToHeading(item.id)}
          className={`w-full text-left py-1.5 px-2 rounded text-sm hover:bg-accent transition-colors flex items-start gap-2 ${
            activeId === item.id ? 'bg-accent font-medium' : ''
          }`}
          style={{ paddingLeft: `${depth * 1 + 0.5}rem` }}
        >
          {item.children && item.children.length > 0 && (
            <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
          )}
          <span className="flex-1">{item.text}</span>
        </button>
        {item.children && item.children.map((child) => renderTocItem(child, depth + 1))}
      </div>
    );
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 sticky top-4">
      <div className="flex items-center gap-2 mb-3">
        <List className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Table of Contents</h3>
      </div>
      <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
        {tocItems.map((item) => renderTocItem(item))}
      </div>
    </Card>
  );
}

/**
 * Hook to extract TOC data from markdown files
 */
export function useTableOfContents(filePath: string) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filePath) return;

    setLoading(true);
    fetch(filePath)
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load document:', error);
        setLoading(false);
      });
  }, [filePath]);

  return { content, loading };
}
