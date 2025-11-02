#!/usr/bin/env node

/**
 * Documentation Linter
 * Validates documentation files for:
 * - Required metadata headers
 * - Read time estimates
 * - Broken internal links
 * - Consistent formatting
 * - TOC completeness
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class DocumentationLinter {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.stats = {
      totalFiles: 0,
      filesWithErrors: 0,
      filesWithWarnings: 0,
      totalLinks: 0,
      brokenLinks: 0,
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  addError(file, message) {
    this.errors.push({ file, message });
  }

  addWarning(file, message) {
    this.warnings.push({ file, message });
  }

  addInfo(file, message) {
    this.info.push({ file, message });
  }

  /**
   * Find all markdown files recursively
   */
  findMarkdownFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip node_modules, .git, dist, etc.
      if (entry.name === 'node_modules' || entry.name === '.git' || 
          entry.name === 'dist' || entry.name === 'build' ||
          entry.name === '.netlify') {
        continue;
      }

      if (entry.isDirectory()) {
        this.findMarkdownFiles(fullPath, files);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Validate metadata headers
   */
  validateMetadata(file, content) {
    const lines = content.split('\n');
    const firstLine = lines[0];

    // Check for title (should be H1)
    if (!firstLine.startsWith('# ')) {
      this.addError(file, 'Missing H1 title as first line');
    }

    // Check for metadata section (optional but recommended)
    const hasMetadata = content.includes('**Version:**') || 
                       content.includes('**Last Updated:**') ||
                       content.includes('**Read Time:**');
    
    if (!hasMetadata && !file.includes('README.md')) {
      this.addWarning(file, 'Missing metadata section (Version, Last Updated, or Read Time)');
    }

    // Validate read time format
    const readTimeMatch = content.match(/\*\*Read Time:\*\*\s*(\d+)\s*min/i);
    if (readTimeMatch) {
      const readTime = parseInt(readTimeMatch[1]);
      if (readTime < 1 || readTime > 180) {
        this.addWarning(file, `Unusual read time: ${readTime} minutes`);
      }
    }
  }

  /**
   * Check for broken internal links
   */
  validateLinks(file, content, allFiles) {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const linkUrl = match[2];
      this.stats.totalLinks++;

      // Skip external links
      if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
        continue;
      }

      // Skip anchors only
      if (linkUrl.startsWith('#')) {
        continue;
      }

      // Resolve relative path
      const fileDir = path.dirname(file);
      let targetPath = path.resolve(fileDir, linkUrl.split('#')[0]);

      // Check if file exists
      if (!fs.existsSync(targetPath)) {
        this.addError(file, `Broken link: [${linkText}](${linkUrl}) - Target not found`);
        this.stats.brokenLinks++;
      }
    }
  }

  /**
   * Validate consistent formatting
   */
  validateFormatting(file, content) {
    const lines = content.split('\n');

    // Check for trailing whitespace
    let trailingWhitespaceCount = 0;
    lines.forEach((line, index) => {
      if (line.endsWith(' ') || line.endsWith('\t')) {
        trailingWhitespaceCount++;
      }
    });
    if (trailingWhitespaceCount > 0) {
      this.addWarning(file, `${trailingWhitespaceCount} lines with trailing whitespace`);
    }

    // Check for consistent heading hierarchy
    const headings = [];
    lines.forEach((line, index) => {
      if (line.startsWith('#')) {
        const match = line.match(/^#+/);
        if (match) {
          const level = match[0].length;
          headings.push({ level, line: index + 1, text: line });
        }
      }
    });

    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1];
      const curr = headings[i];
      
      // Check if heading level jumps by more than 1
      if (curr.level > prev.level + 1) {
        this.addWarning(
          file,
          `Heading hierarchy skip at line ${curr.line}: ${prev.level} to ${curr.level}`
        );
      }
    }
  }

  /**
   * Check for Table of Contents
   */
  validateTOC(file, content) {
    const hasMultipleSections = (content.match(/^## /gm) || []).length >= 4;
    const hasTOC = content.toLowerCase().includes('table of contents') ||
                   content.toLowerCase().includes('## contents');

    if (hasMultipleSections && !hasTOC && content.length > 5000) {
      this.addInfo(file, 'Consider adding a Table of Contents (document has many sections)');
    }
  }

  /**
   * Lint a single file
   */
  lintFile(file) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const relativePath = path.relative(process.cwd(), file);

      this.stats.totalFiles++;

      // Run all validations
      this.validateMetadata(relativePath, content);
      this.validateLinks(relativePath, content, []);
      this.validateFormatting(relativePath, content);
      this.validateTOC(relativePath, content);

    } catch (error) {
      this.addError(file, `Failed to read file: ${error.message}`);
    }
  }

  /**
   * Print results
   */
  printResults() {
    this.log('\n' + '='.repeat(70), 'cyan');
    this.log('Documentation Linter Results', 'cyan');
    this.log('='.repeat(70), 'cyan');

    // Stats
    this.log('\n📊 Statistics:', 'blue');
    this.log(`  Total files scanned: ${this.stats.totalFiles}`);
    this.log(`  Total links checked: ${this.stats.totalLinks}`);
    this.log(`  Files with errors: ${this.stats.filesWithErrors}`);
    this.log(`  Files with warnings: ${this.stats.filesWithWarnings}`);
    if (this.stats.brokenLinks > 0) {
      this.log(`  Broken links: ${this.stats.brokenLinks}`, 'red');
    }

    // Errors
    if (this.errors.length > 0) {
      this.log('\n❌ Errors:', 'red');
      this.errors.forEach(({ file, message }) => {
        this.log(`  ${file}`, 'yellow');
        this.log(`    ${message}`, 'red');
      });
    }

    // Warnings
    if (this.warnings.length > 0) {
      this.log('\n⚠️  Warnings:', 'yellow');
      this.warnings.forEach(({ file, message }) => {
        this.log(`  ${file}`, 'cyan');
        this.log(`    ${message}`, 'yellow');
      });
    }

    // Info
    if (this.info.length > 0) {
      this.log('\nℹ️  Suggestions:', 'blue');
      this.info.forEach(({ file, message }) => {
        this.log(`  ${file}`, 'cyan');
        this.log(`    ${message}`, 'blue');
      });
    }

    // Summary
    this.log('\n' + '='.repeat(70), 'cyan');
    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log('✅ All documentation files passed linting!', 'green');
    } else {
      this.log(`Found ${this.errors.length} errors and ${this.warnings.length} warnings`, 'yellow');
    }
    this.log('='.repeat(70) + '\n', 'cyan');

    // Count files with issues
    const filesWithErrors = new Set(this.errors.map(e => e.file));
    const filesWithWarnings = new Set(this.warnings.map(w => w.file));
    this.stats.filesWithErrors = filesWithErrors.size;
    this.stats.filesWithWarnings = filesWithWarnings.size;

    // Exit code
    return this.errors.length > 0 ? 1 : 0;
  }

  /**
   * Run linter on all documentation
   */
  run(rootDir) {
    this.log('🔍 Scanning for documentation files...', 'cyan');
    const files = this.findMarkdownFiles(rootDir);
    this.log(`Found ${files.length} markdown files\n`, 'green');

    this.log('📝 Linting documentation files...', 'cyan');
    files.forEach(file => {
      this.lintFile(file);
    });

    return this.printResults();
  }
}

// Main execution
if (require.main === module) {
  const rootDir = process.cwd();
  const linter = new DocumentationLinter();
  const exitCode = linter.run(rootDir);
  process.exit(exitCode);
}

module.exports = DocumentationLinter;
