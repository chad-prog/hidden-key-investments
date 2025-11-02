/**
 * Advanced search utilities for documentation portal
 * Supports boolean operators: AND, OR, NOT
 */

export interface SearchToken {
  type: 'term' | 'and' | 'or' | 'not';
  value: string;
}

/**
 * Parse search query into tokens supporting AND, OR, NOT operators
 * Examples:
 * - "testing AND deployment" - both terms must be present
 * - "react OR vue" - either term must be present  
 * - "NOT deprecated" - term must not be present
 * - "api AND testing OR development" - complex queries
 */
export function parseSearchQuery(query: string): SearchToken[] {
  const tokens: SearchToken[] = [];
  
  // Normalize query
  const normalized = query.trim();
  if (!normalized) return tokens;

  // Split by operators while preserving them
  // Handle case where NOT is at the beginning
  const regex = /\b(AND|OR|NOT)\b/gi;
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(normalized)) !== null) {
    // Add the term before the operator
    const beforeTerm = normalized.substring(lastIndex, match.index).trim();
    if (beforeTerm) {
      tokens.push({ type: 'term', value: beforeTerm.toLowerCase() });
    }
    
    // Add the operator
    const operator = match[1].toUpperCase();
    if (operator === 'AND') {
      tokens.push({ type: 'and', value: 'AND' });
    } else if (operator === 'OR') {
      tokens.push({ type: 'or', value: 'OR' });
    } else if (operator === 'NOT') {
      tokens.push({ type: 'not', value: 'NOT' });
    }
    
    lastIndex = regex.lastIndex;
  }
  
  // Add remaining term after last operator
  const remainingTerm = normalized.substring(lastIndex).trim();
  if (remainingTerm) {
    tokens.push({ type: 'term', value: remainingTerm.toLowerCase() });
  }

  return tokens;
}

/**
 * Evaluate search tokens against searchable text
 */
export function evaluateSearch(tokens: SearchToken[], searchableText: string): boolean {
  if (tokens.length === 0) return true;
  
  const text = searchableText.toLowerCase();
  let result = true;
  let currentOperator: 'and' | 'or' | null = null;
  let expectingNegation = false;

  for (const token of tokens) {
    if (token.type === 'and') {
      currentOperator = 'and';
    } else if (token.type === 'or') {
      currentOperator = 'or';
    } else if (token.type === 'not') {
      expectingNegation = true;
    } else if (token.type === 'term') {
      const matches = text.includes(token.value);
      const termResult = expectingNegation ? !matches : matches;
      
      if (currentOperator === 'and') {
        result = result && termResult;
      } else if (currentOperator === 'or') {
        result = result || termResult;
      } else {
        result = termResult;
      }
      
      currentOperator = null;
      expectingNegation = false;
    }
  }

  return result;
}

/**
 * Advanced search with boolean operators
 */
export function advancedSearch<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string
): T[] {
  const tokens = parseSearchQuery(query);
  
  if (tokens.length === 0) return items;

  return items.filter((item) => {
    const searchableText = getSearchableText(item);
    return evaluateSearch(tokens, searchableText);
  });
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text: string, query: string): string {
  const tokens = parseSearchQuery(query);
  const terms = tokens
    .filter((t) => t.type === 'term')
    .map((t) => t.value);

  if (terms.length === 0) return text;

  let highlighted = text;
  terms.forEach((term) => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  });

  return highlighted;
}

/**
 * Get search syntax help text
 */
export function getSearchHelp(): string {
  return `
**Advanced Search Operators:**

- **AND** - Both terms must be present
  Example: \`testing AND deployment\`

- **OR** - Either term must be present
  Example: \`react OR vue\`

- **NOT** - Term must not be present
  Example: \`NOT deprecated\`

**Tips:**
- Operators are case-insensitive
- Combine operators for complex searches
- Use quotes for exact phrases (coming soon)
`.trim();
}
