import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

interface FunctionDoc {
  name: string;
  description: string;
  parameters: ParameterDoc[];
  returnType: string;
  examples: string[];
  filePath: string;
  isExported: boolean;
}

interface ParameterDoc {
  name: string;
  type: string;
  description: string;
  optional: boolean;
  defaultValue?: string;
}

interface InterfaceDoc {
  name: string;
  description: string;
  properties: PropertyDoc[];
  filePath: string;
  isExported: boolean;
}

interface PropertyDoc {
  name: string;
  type: string;
  description: string;
  optional: boolean;
  readonly: boolean;
}

interface APIDocumentation {
  functions: FunctionDoc[];
  interfaces: InterfaceDoc[];
  types: TypeDoc[];
  constants: ConstantDoc[];
}

interface TypeDoc {
  name: string;
  description: string;
  definition: string;
  filePath: string;
  isExported: boolean;
}

interface ConstantDoc {
  name: string;
  description: string;
  type: string;
  value: string;
  filePath: string;
  isExported: boolean;
}

/**
 * Extract JSDoc comments from a node
 */
function extractJsDocComment(node: ts.Node, sourceFile: ts.SourceFile): string {
  const jsDocTags = ts.getJSDocTags(node);
  const jsDocComments = ts.getJSDocCommentsAndTags(node);
  
  let description = '';
  
  for (const comment of jsDocComments) {
    if (ts.isJSDoc(comment)) {
      description = comment.comment?.toString() || '';
      break;
    }
  }
  
  return description.trim();
}

/**
 * Extract parameter documentation from JSDoc
 */
function extractParameterDocs(
  node: ts.FunctionDeclaration | ts.MethodDeclaration,
  sourceFile: ts.SourceFile
): Map<string, string> {
  const paramDocs = new Map<string, string>();
  const jsDocTags = ts.getJSDocTags(node);
  
  for (const tag of jsDocTags) {
    if (tag.tagName.text === 'param' && tag.comment) {
      const paramName = tag.comment.toString().split(' ')[0].replace(/[\{\}]/g, '');
      const paramDesc = tag.comment.toString().substring(paramName.length).trim();
      paramDocs.set(paramName, paramDesc);
    }
  }
  
  return paramDocs;
}

/**
 * Extract function documentation from TypeScript file
 */
function extractFunctionDocs(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): FunctionDoc[] {
  const functions: FunctionDoc[] = [];

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const symbol = checker.getSymbolAtLocation(node.name);
      if (!symbol) return;

      const description = extractJsDocComment(node, sourceFile);
      const paramDocs = extractParameterDocs(node, sourceFile);
      
      const parameters: ParameterDoc[] = [];
      if (node.parameters) {
        node.parameters.forEach(param => {
          const paramName = param.name.getText(sourceFile);
          const paramType = param.type ? param.type.getText(sourceFile) : 'any';
          const paramDesc = paramDocs.get(paramName) || '';
          
          parameters.push({
            name: paramName,
            type: paramType,
            description: paramDesc,
            optional: !!param.questionToken,
            defaultValue: param.initializer?.getText(sourceFile),
          });
        });
      }

      const returnType = node.type ? node.type.getText(sourceFile) : 'void';
      
      const isExported = node.modifiers?.some(
        mod => mod.kind === ts.SyntaxKind.ExportKeyword
      ) || false;

      functions.push({
        name: node.name.text,
        description,
        parameters,
        returnType,
        examples: [],
        filePath: sourceFile.fileName,
        isExported,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return functions;
}

/**
 * Extract interface documentation from TypeScript file
 */
function extractInterfaceDocs(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): InterfaceDoc[] {
  const interfaces: InterfaceDoc[] = [];

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node)) {
      const description = extractJsDocComment(node, sourceFile);
      const properties: PropertyDoc[] = [];

      node.members.forEach(member => {
        if (ts.isPropertySignature(member) && member.name) {
          const propName = member.name.getText(sourceFile);
          const propType = member.type ? member.type.getText(sourceFile) : 'any';
          const propDesc = extractJsDocComment(member, sourceFile);

          properties.push({
            name: propName,
            type: propType,
            description: propDesc,
            optional: !!member.questionToken,
            readonly: member.modifiers?.some(
              mod => mod.kind === ts.SyntaxKind.ReadonlyKeyword
            ) || false,
          });
        }
      });

      const isExported = node.modifiers?.some(
        mod => mod.kind === ts.SyntaxKind.ExportKeyword
      ) || false;

      interfaces.push({
        name: node.name.text,
        description,
        properties,
        filePath: sourceFile.fileName,
        isExported,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return interfaces;
}

/**
 * Extract type alias documentation from TypeScript file
 */
function extractTypeDocs(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): TypeDoc[] {
  const types: TypeDoc[] = [];

  function visit(node: ts.Node) {
    if (ts.isTypeAliasDeclaration(node)) {
      const description = extractJsDocComment(node, sourceFile);
      const definition = node.type.getText(sourceFile);

      const isExported = node.modifiers?.some(
        mod => mod.kind === ts.SyntaxKind.ExportKeyword
      ) || false;

      types.push({
        name: node.name.text,
        description,
        definition,
        filePath: sourceFile.fileName,
        isExported,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return types;
}

/**
 * Generate API documentation from TypeScript files
 */
export function generateAPIDocumentation(
  filePatterns: string[],
  rootDir: string = process.cwd()
): APIDocumentation {
  const documentation: APIDocumentation = {
    functions: [],
    interfaces: [],
    types: [],
    constants: [],
  };

  // Create TypeScript program
  const program = ts.createProgram(filePatterns, {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
  });

  const checker = program.getTypeChecker();

  // Process each source file
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile && filePatterns.some(pattern => 
      sourceFile.fileName.includes(pattern.replace('**/*.ts', ''))
    )) {
      documentation.functions.push(...extractFunctionDocs(sourceFile, checker));
      documentation.interfaces.push(...extractInterfaceDocs(sourceFile, checker));
      documentation.types.push(...extractTypeDocs(sourceFile, checker));
    }
  }

  return documentation;
}

/**
 * Format API documentation as Markdown
 */
export function formatAPIDocumentationAsMarkdown(
  documentation: APIDocumentation
): string {
  let markdown = '# API Documentation\n\n';
  markdown += '_Auto-generated from TypeScript source files_\n\n';
  markdown += `Generated on: ${new Date().toLocaleString()}\n\n`;

  // Table of Contents
  markdown += '## Table of Contents\n\n';
  
  if (documentation.interfaces.length > 0) {
    markdown += '- [Interfaces](#interfaces)\n';
  }
  if (documentation.types.length > 0) {
    markdown += '- [Types](#types)\n';
  }
  if (documentation.functions.length > 0) {
    markdown += '- [Functions](#functions)\n';
  }
  markdown += '\n---\n\n';

  // Interfaces
  if (documentation.interfaces.length > 0) {
    markdown += '## Interfaces\n\n';
    
    documentation.interfaces
      .filter(iface => iface.isExported)
      .forEach(iface => {
        markdown += `### \`${iface.name}\`\n\n`;
        
        if (iface.description) {
          markdown += `${iface.description}\n\n`;
        }
        
        markdown += '**Properties:**\n\n';
        markdown += '| Name | Type | Optional | Description |\n';
        markdown += '|------|------|----------|-------------|\n';
        
        iface.properties.forEach(prop => {
          const optional = prop.optional ? 'Yes' : 'No';
          const readonly = prop.readonly ? '_(readonly)_ ' : '';
          markdown += `| \`${prop.name}\` | \`${prop.type}\` | ${optional} | ${readonly}${prop.description || '-'} |\n`;
        });
        
        markdown += `\n_Source: \`${path.relative(process.cwd(), iface.filePath)}\`_\n\n`;
        markdown += '---\n\n';
      });
  }

  // Types
  if (documentation.types.length > 0) {
    markdown += '## Types\n\n';
    
    documentation.types
      .filter(type => type.isExported)
      .forEach(type => {
        markdown += `### \`${type.name}\`\n\n`;
        
        if (type.description) {
          markdown += `${type.description}\n\n`;
        }
        
        markdown += '```typescript\n';
        markdown += `type ${type.name} = ${type.definition};\n`;
        markdown += '```\n\n';
        
        markdown += `_Source: \`${path.relative(process.cwd(), type.filePath)}\`_\n\n`;
        markdown += '---\n\n';
      });
  }

  // Functions
  if (documentation.functions.length > 0) {
    markdown += '## Functions\n\n';
    
    documentation.functions
      .filter(func => func.isExported)
      .forEach(func => {
        markdown += `### \`${func.name}()\`\n\n`;
        
        if (func.description) {
          markdown += `${func.description}\n\n`;
        }
        
        if (func.parameters.length > 0) {
          markdown += '**Parameters:**\n\n';
          markdown += '| Name | Type | Optional | Description |\n';
          markdown += '|------|------|----------|-------------|\n';
          
          func.parameters.forEach(param => {
            const optional = param.optional ? 'Yes' : 'No';
            const defaultVal = param.defaultValue ? ` _(default: \`${param.defaultValue}\`)_` : '';
            markdown += `| \`${param.name}\` | \`${param.type}\` | ${optional} | ${param.description || '-'}${defaultVal} |\n`;
          });
          
          markdown += '\n';
        }
        
        markdown += `**Returns:** \`${func.returnType}\`\n\n`;
        
        markdown += `_Source: \`${path.relative(process.cwd(), func.filePath)}\`_\n\n`;
        markdown += '---\n\n';
      });
  }

  return markdown;
}

/**
 * Save API documentation to file
 */
export function saveAPIDocumentation(
  documentation: APIDocumentation,
  outputPath: string
): void {
  const markdown = formatAPIDocumentationAsMarkdown(documentation);
  fs.writeFileSync(outputPath, markdown, 'utf-8');
  console.log(`✅ API documentation saved to: ${outputPath}`);
}
