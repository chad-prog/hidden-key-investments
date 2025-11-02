import { describe, it, expect } from 'vitest';
import {
  parseSearchQuery,
  evaluateSearch,
  advancedSearch,
} from '../advancedSearch';

describe('advancedSearch', () => {
  describe('parseSearchQuery', () => {
    it('should parse simple terms', () => {
      const tokens = parseSearchQuery('testing');
      expect(tokens).toEqual([{ type: 'term', value: 'testing' }]);
    });

    it('should parse AND operator', () => {
      const tokens = parseSearchQuery('testing AND deployment');
      expect(tokens).toEqual([
        { type: 'term', value: 'testing' },
        { type: 'and', value: 'AND' },
        { type: 'term', value: 'deployment' },
      ]);
    });

    it('should parse OR operator', () => {
      const tokens = parseSearchQuery('react OR vue');
      expect(tokens).toEqual([
        { type: 'term', value: 'react' },
        { type: 'or', value: 'OR' },
        { type: 'term', value: 'vue' },
      ]);
    });

    it('should parse NOT operator', () => {
      const tokens = parseSearchQuery('NOT deprecated');
      expect(tokens).toEqual([
        { type: 'not', value: 'NOT' },
        { type: 'term', value: 'deprecated' },
      ]);
    });

    it('should handle case-insensitive operators', () => {
      const tokens = parseSearchQuery('testing and deployment');
      expect(tokens[1].type).toBe('and');
    });

    it('should handle multiple operators', () => {
      const tokens = parseSearchQuery('api AND testing OR development');
      expect(tokens).toEqual([
        { type: 'term', value: 'api' },
        { type: 'and', value: 'AND' },
        { type: 'term', value: 'testing' },
        { type: 'or', value: 'OR' },
        { type: 'term', value: 'development' },
      ]);
    });

    it('should handle empty query', () => {
      const tokens = parseSearchQuery('');
      expect(tokens).toEqual([]);
    });
  });

  describe('evaluateSearch', () => {
    it('should match simple term', () => {
      const tokens = parseSearchQuery('testing');
      expect(evaluateSearch(tokens, 'This is a testing document')).toBe(true);
      expect(evaluateSearch(tokens, 'This is production')).toBe(false);
    });

    it('should handle AND operator', () => {
      const tokens = parseSearchQuery('testing AND deployment');
      expect(evaluateSearch(tokens, 'testing and deployment guide')).toBe(true);
      expect(evaluateSearch(tokens, 'only testing here')).toBe(false);
      expect(evaluateSearch(tokens, 'only deployment here')).toBe(false);
    });

    it('should handle OR operator', () => {
      const tokens = parseSearchQuery('react OR vue');
      expect(evaluateSearch(tokens, 'react documentation')).toBe(true);
      expect(evaluateSearch(tokens, 'vue documentation')).toBe(true);
      expect(evaluateSearch(tokens, 'angular documentation')).toBe(false);
    });

    it('should handle NOT operator', () => {
      const tokens = parseSearchQuery('NOT deprecated');
      expect(evaluateSearch(tokens, 'current api')).toBe(true);
      expect(evaluateSearch(tokens, 'deprecated api')).toBe(false);
    });

    it('should handle complex queries', () => {
      const tokens = parseSearchQuery('api AND testing OR development');
      expect(evaluateSearch(tokens, 'api testing guide')).toBe(true);
      expect(evaluateSearch(tokens, 'development guide')).toBe(true);
      expect(evaluateSearch(tokens, 'api guide')).toBe(false);
    });

    it('should be case-insensitive', () => {
      const tokens = parseSearchQuery('Testing');
      expect(evaluateSearch(tokens, 'TESTING GUIDE')).toBe(true);
    });
  });

  describe('advancedSearch', () => {
    const items = [
      { id: 1, text: 'API testing documentation' },
      { id: 2, text: 'Deployment guide' },
      { id: 3, text: 'React tutorial' },
      { id: 4, text: 'Vue tutorial' },
      { id: 5, text: 'Deprecated API reference' },
    ];

    it('should filter with simple term', () => {
      const results = advancedSearch(items, 'API', (item) => item.text);
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.id)).toContain(1);
      expect(results.map((r) => r.id)).toContain(5);
    });

    it('should filter with AND operator', () => {
      const results = advancedSearch(items, 'API AND testing', (item) => item.text);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(1);
    });

    it('should filter with OR operator', () => {
      const results = advancedSearch(items, 'React OR Vue', (item) => item.text);
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.id)).toContain(3);
      expect(results.map((r) => r.id)).toContain(4);
    });

    it('should filter with NOT operator', () => {
      const results = advancedSearch(items, 'API AND NOT Deprecated', (item) => item.text);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(1);
    });

    it('should return all items for empty query', () => {
      const results = advancedSearch(items, '', (item) => item.text);
      expect(results).toHaveLength(5);
    });
  });
});
