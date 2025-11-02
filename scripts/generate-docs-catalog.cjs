#!/usr/bin/env node

/**
 * Documentation Catalog Generator
 * Generates a comprehensive catalog of all documentation with metadata
 * Output: JSON catalog file for use by documentation portal
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

class DocumentationCatalog {
  constructor() {
    this.catalog = [];
  }

  /**
   * Find all markdown files recursively
   */
  findMarkdownFiles(dir, files = [], baseDir = dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);

      // Skip excluded directories
      if (entry.name === 'node_modules' || entry.name === '.git' || 
          entry.name === 'dist' || entry.name === 'build' ||
          entry.name === '.netlify' || entry.name === 'coverage' ||
          entry.name === '.templates') {
        continue;
      }

      if (entry.isDirectory()) {
        this.findMarkdownFiles(fullPath, files, baseDir);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push({ path: fullPath, relativePath });
      }
    }

    return files;
  }

  /**
   * Extract metadata from markdown content
   */
  extractMetadata(content, filePath) {
    const lines = content.split('\n');
    const metadata = {
      title: '',
      description: '',
      readTime: null,
      version: null,
      lastUpdated: null,
      tags: [],
      category: this.categorizeFile(filePath),
    };

    // Extract title (first H1)
    const titleMatch = content.match(/^# (.+)$/m);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
    }

    // Extract description (first paragraph after title)
    const descMatch = content.match(/^# .+\n+(.+?)(?:\n\n|\n#)/s);
    if (descMatch) {
      metadata.description = descMatch[1]
        .replace(/\*\*/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim()
        .substring(0, 200);
    }

    // Extract read time
    const readTimeMatch = content.match(/\*\*Read Time:\*\*\s*(\d+)\s*min/i);
    if (readTimeMatch) {
      metadata.readTime = parseInt(readTimeMatch[1]);
    } else {
      // Estimate read time (200 words per minute)
      const wordCount = content.split(/\s+/).length;
      metadata.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    // Extract version
    const versionMatch = content.match(/\*\*Version:\*\*\s*([^\n]+)/i);
    if (versionMatch) {
      metadata.version = versionMatch[1].trim();
    }

    // Extract last updated
    const updatedMatch = content.match(/\*\*Last Updated:\*\*\s*([^\n]+)/i);
    if (updatedMatch) {
      metadata.lastUpdated = updatedMatch[1].trim();
    } else {
      // Try to get from git using execFileSync (safer than execSync)
      try {
        const gitDate = execFileSync(
          'git',
          ['log', '-1', '--format=%ai', '--', filePath],
          { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
        ).trim();
        if (gitDate) {
          metadata.lastUpdated = new Date(gitDate).toISOString().split('T')[0];
        }
      } catch (e) {
        // Git not available or file not tracked
      }
    }

    // Extract tags from content
    metadata.tags = this.extractTags(content, filePath);

    return metadata;
  }

  /**
   * Categorize file based on path and name
   */
  categorizeFile(filePath) {
    const basename = path.basename(filePath);
    const dirname = path.dirname(filePath);

    // Check if already in a category folder
    const categoryMatch = dirname.match(/(\d{2}-[A-Z-]+)$/);
    if (categoryMatch) {
      return categoryMatch[1];
    }

    // Categorize based on filename
    if (basename === 'README.md' || basename.includes('START-HERE') || 
        basename === 'NAVIGATION-GUIDE.md' || basename === 'DOCUMENTATION-INDEX.md') {
      return '00-START-HERE';
    }

    if (basename.includes('SETUP') || basename.includes('QUICK-START') || 
        basename.includes('GETTING-STARTED') || basename.includes('INSTALLATION')) {
      return '01-GETTING-STARTED';
    }

    if (basename.includes('ARCHITECTURE') || basename.includes('API-REFERENCE') || 
        basename.includes('ML-ARCHITECTURE')) {
      return '02-ARCHITECTURE';
    }

    if (basename.includes('CAPABILITIES') || basename.includes('FEATURES') || 
        basename.includes('WEBHOOK') || basename.includes('INTEGRATION')) {
      return '03-FEATURES';
    }

    if (basename.includes('TESTING') || basename.includes('CONTRIBUTING') || 
        basename.includes('DEVELOPMENT') || basename.includes('DEV-')) {
      return '04-DEVELOPMENT';
    }

    if (basename.includes('DEPLOYMENT') || basename.includes('DEPLOY') || 
        basename.includes('STAGING') || basename.includes('OBSERVABILITY') ||
        basename.includes('CICD') || basename.includes('PIPELINE')) {
      return '05-DEPLOYMENT';
    }

    if (basename.includes('ROADMAP') || basename.includes('VISION') || 
        basename.includes('STATUS') || basename.includes('PHASE') || 
        basename.includes('IMPLEMENTATION')) {
      return '06-VISION-ROADMAP';
    }

    if (basename.includes('REFERENCE') || basename.includes('QUICK-REF')) {
      return '07-REFERENCE';
    }

    return 'UNCATEGORIZED';
  }

  /**
   * Extract tags from content and filename
   */
  extractTags(content, filePath) {
    const tags = new Set();
    const basename = path.basename(filePath, '.md').toLowerCase();
    const contentLower = content.toLowerCase();

    // Add tags based on keywords
    const tagMap = {
      'essential': ['readme', 'start-here', 'index'],
      'getting-started': ['setup', 'quick-start', 'installation'],
      'architecture': ['architecture', 'design', 'system'],
      'api': ['api', 'endpoint', 'rest'],
      'deployment': ['deployment', 'deploy', 'production'],
      'testing': ['testing', 'test', 'vitest', 'jest'],
      'development': ['development', 'contributing'],
      'planning': ['roadmap', 'vision', 'phase'],
      'reference': ['reference', 'cheat', 'quick-ref'],
      'tutorial': ['guide', 'tutorial', 'how-to'],
      'devops': ['cicd', 'pipeline', 'staging', 'observability'],
      'ml': ['ml', 'machine learning', 'ai'],
    };

    Object.entries(tagMap).forEach(([tag, keywords]) => {
      if (keywords.some(kw => basename.includes(kw) || contentLower.includes(kw))) {
        tags.add(tag);
      }
    });

    return Array.from(tags);
  }

  /**
   * Process a single file
   */
  processFile(file) {
    try {
      const content = fs.readFileSync(file.path, 'utf-8');
      const metadata = this.extractMetadata(content, file.path);

      return {
        path: file.relativePath.replace(/\\/g, '/'), // Normalize path separators
        ...metadata,
      };
    } catch (error) {
      console.error(`Error processing ${file.path}: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate catalog
   */
  generate(rootDir) {
    console.log('🔍 Scanning for documentation files...');
    const files = this.findMarkdownFiles(rootDir);
    console.log(`Found ${files.length} markdown files\n`);

    console.log('📝 Processing files...');
    files.forEach(file => {
      const entry = this.processFile(file);
      if (entry) {
        this.catalog.push(entry);
      }
    });

    // Sort by category, then by title
    this.catalog.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.title.localeCompare(b.title);
    });

    console.log(`✅ Processed ${this.catalog.length} files\n`);
    return this.catalog;
  }

  /**
   * Generate statistics
   */
  generateStats() {
    const stats = {
      totalFiles: this.catalog.length,
      totalReadTime: this.catalog.reduce((sum, doc) => sum + (doc.readTime || 0), 0),
      categories: {},
      tags: {},
      filesWithoutMetadata: 0,
    };

    this.catalog.forEach(doc => {
      // Count by category
      stats.categories[doc.category] = (stats.categories[doc.category] || 0) + 1;

      // Count tags
      doc.tags.forEach(tag => {
        stats.tags[tag] = (stats.tags[tag] || 0) + 1;
      });

      // Check for metadata
      if (!doc.version && !doc.lastUpdated) {
        stats.filesWithoutMetadata++;
      }
    });

    return stats;
  }

  /**
   * Save catalog to file
   */
  save(outputPath) {
    const stats = this.generateStats();

    const output = {
      generated: new Date().toISOString(),
      stats,
      documents: this.catalog,
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`💾 Catalog saved to ${outputPath}`);
    return stats;
  }

  /**
   * Print statistics
   */
  printStats(stats) {
    console.log('\n📊 Documentation Statistics:');
    console.log(`  Total files: ${stats.totalFiles}`);
    console.log(`  Total read time: ${stats.totalReadTime} minutes`);
    console.log(`  Files without metadata: ${stats.filesWithoutMetadata}`);
    
    console.log('\n📂 By Category:');
    Object.entries(stats.categories)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} files`);
      });

    console.log('\n🏷️  Top Tags:');
    Object.entries(stats.tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([tag, count]) => {
        console.log(`  ${tag}: ${count} files`);
      });
  }
}

// Main execution
if (require.main === module) {
  const rootDir = process.cwd();
  const outputPath = path.join(rootDir, 'docs', 'documentation-catalog.json');

  const catalog = new DocumentationCatalog();
  catalog.generate(rootDir);
  const stats = catalog.save(outputPath);
  catalog.printStats(stats);

  console.log('\n✅ Documentation catalog generation complete!');
}

module.exports = DocumentationCatalog;
