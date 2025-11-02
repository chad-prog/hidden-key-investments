#!/usr/bin/env node

/**
 * Script to generate API documentation from TypeScript source files
 * Usage: node scripts/generate-api-docs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const srcDir = path.join(__dirname, '../src');
const outputFile = path.join(__dirname, '../docs/API-REFERENCE-AUTO.md');

console.log('🚀 Generating API documentation from TypeScript files...\n');

// Find all TypeScript files in src directory
function findTSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and test directories
      if (!file.includes('node_modules') && !file.includes('__tests__')) {
        findTSFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts') && !file.includes('.test.')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Simple TypeScript parser for basic documentation
function parseTypeScriptFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(process.cwd(), filePath);
  
  const docs = {
    interfaces: [],
    types: [],
    functions: [],
    constants: []
  };

  // Extract interfaces with JSDoc
  const interfaceRegex = /\/\*\*\s*([\s\S]*?)\s*\*\/\s*export\s+interface\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let match;
  
  while ((match = interfaceRegex.exec(content)) !== null) {
    const [, comment, name, body] = match;
    const description = comment.replace(/\s*\*\s*/g, ' ').trim();
    
    // Extract properties
    const propRegex = /(\w+)(\?)?:\s*([^;]+);/g;
    const properties = [];
    let propMatch;
    
    while ((propMatch = propRegex.exec(body)) !== null) {
      const [, propName, optional, propType] = propMatch;
      properties.push({
        name: propName,
        type: propType.trim(),
        optional: !!optional,
        description: ''
      });
    }
    
    docs.interfaces.push({
      name,
      description,
      properties,
      filePath: relativePath
    });
  }

  // Extract type aliases
  const typeRegex = /\/\*\*\s*([\s\S]*?)\s*\*\/\s*export\s+type\s+(\w+)\s*=\s*([^;]+);/g;
  
  while ((match = typeRegex.exec(content)) !== null) {
    const [, comment, name, definition] = match;
    const description = comment.replace(/\s*\*\s*/g, ' ').trim();
    
    docs.types.push({
      name,
      description,
      definition: definition.trim(),
      filePath: relativePath
    });
  }

  // Extract exported functions
  const funcRegex = /\/\*\*\s*([\s\S]*?)\s*\*\/\s*export\s+(?:async\s+)?function\s+(\w+)\s*\((.*?)\)\s*:\s*([^{]+)/g;
  
  while ((match = funcRegex.exec(content)) !== null) {
    const [, comment, name, params, returnType] = match;
    const description = comment.replace(/\s*\*\s*/g, ' ').trim();
    
    // Parse parameters
    const parameters = params.split(',').filter(p => p.trim()).map(param => {
      const [paramName, paramType] = param.split(':').map(s => s.trim());
      const isOptional = paramName.includes('?');
      
      return {
        name: paramName.replace('?', '').trim(),
        type: paramType || 'any',
        optional: isOptional,
        description: ''
      };
    });
    
    docs.functions.push({
      name,
      description,
      parameters,
      returnType: returnType.trim(),
      filePath: relativePath
    });
  }

  return docs;
}

// Generate markdown documentation
function generateMarkdown(allDocs) {
  let markdown = '# API Reference (Auto-Generated)\n\n';
  markdown += `_Generated on: ${new Date().toLocaleString()}_\n\n`;
  markdown += '_This documentation is automatically generated from TypeScript source files._\n\n';

  // Table of Contents
  markdown += '## Table of Contents\n\n';
  
  const hasInterfaces = allDocs.some(d => d.interfaces.length > 0);
  const hasTypes = allDocs.some(d => d.types.length > 0);
  const hasFunctions = allDocs.some(d => d.functions.length > 0);
  
  if (hasInterfaces) markdown += '- [Interfaces](#interfaces)\n';
  if (hasTypes) markdown += '- [Types](#types)\n';
  if (hasFunctions) markdown += '- [Functions](#functions)\n';
  
  markdown += '\n---\n\n';

  // Interfaces
  if (hasInterfaces) {
    markdown += '## Interfaces\n\n';
    
    allDocs.forEach(doc => {
      doc.interfaces.forEach(iface => {
        markdown += `### \`${iface.name}\`\n\n`;
        
        if (iface.description) {
          markdown += `${iface.description}\n\n`;
        }
        
        if (iface.properties.length > 0) {
          markdown += '**Properties:**\n\n';
          markdown += '| Name | Type | Optional |\n';
          markdown += '|------|------|----------|\n';
          
          iface.properties.forEach(prop => {
            const optional = prop.optional ? '✓' : '';
            markdown += `| \`${prop.name}\` | \`${prop.type}\` | ${optional} |\n`;
          });
          
          markdown += '\n';
        }
        
        markdown += `_Source: \`${iface.filePath}\`_\n\n`;
        markdown += '---\n\n';
      });
    });
  }

  // Types
  if (hasTypes) {
    markdown += '## Types\n\n';
    
    allDocs.forEach(doc => {
      doc.types.forEach(type => {
        markdown += `### \`${type.name}\`\n\n`;
        
        if (type.description) {
          markdown += `${type.description}\n\n`;
        }
        
        markdown += '```typescript\n';
        markdown += `type ${type.name} = ${type.definition};\n`;
        markdown += '```\n\n';
        
        markdown += `_Source: \`${type.filePath}\`_\n\n`;
        markdown += '---\n\n';
      });
    });
  }

  // Functions
  if (hasFunctions) {
    markdown += '## Functions\n\n';
    
    allDocs.forEach(doc => {
      doc.functions.forEach(func => {
        markdown += `### \`${func.name}()\`\n\n`;
        
        if (func.description) {
          markdown += `${func.description}\n\n`;
        }
        
        if (func.parameters.length > 0) {
          markdown += '**Parameters:**\n\n';
          markdown += '| Name | Type | Optional |\n';
          markdown += '|------|------|----------|\n';
          
          func.parameters.forEach(param => {
            const optional = param.optional ? '✓' : '';
            markdown += `| \`${param.name}\` | \`${param.type}\` | ${optional} |\n`;
          });
          
          markdown += '\n';
        }
        
        markdown += `**Returns:** \`${func.returnType}\`\n\n`;
        
        markdown += `_Source: \`${func.filePath}\`_\n\n`;
        markdown += '---\n\n';
      });
    });
  }

  return markdown;
}

// Main execution
try {
  const tsFiles = findTSFiles(srcDir);
  console.log(`📁 Found ${tsFiles.length} TypeScript files\n`);

  const allDocs = [];
  let totalItems = 0;

  tsFiles.forEach(file => {
    const docs = parseTypeScriptFile(file);
    const itemCount = docs.interfaces.length + docs.types.length + docs.functions.length;
    
    if (itemCount > 0) {
      allDocs.push(docs);
      totalItems += itemCount;
      console.log(`  ✓ ${path.relative(srcDir, file)} - ${itemCount} items`);
    }
  });

  console.log(`\n📝 Generating documentation for ${totalItems} items...\n`);

  const markdown = generateMarkdown(allDocs);
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, markdown, 'utf-8');

  console.log(`✅ API documentation generated successfully!`);
  console.log(`📄 Output: ${path.relative(process.cwd(), outputFile)}\n`);
  
  // Print summary
  const interfaceCount = allDocs.reduce((sum, d) => sum + d.interfaces.length, 0);
  const typeCount = allDocs.reduce((sum, d) => sum + d.types.length, 0);
  const functionCount = allDocs.reduce((sum, d) => sum + d.functions.length, 0);
  
  console.log('📊 Summary:');
  console.log(`   - ${interfaceCount} interfaces`);
  console.log(`   - ${typeCount} types`);
  console.log(`   - ${functionCount} functions`);
  console.log(`   - ${totalItems} total items\n`);
  
} catch (error) {
  console.error('❌ Error generating API documentation:', error.message);
  process.exit(1);
}
