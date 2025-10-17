/**
 * Build script for Hidden Key Investments
 * Uses esbuild for production builds
 */

import * as esbuild from 'esbuild'
import { stylePlugin } from 'esbuild-style-plugin'
import { rimraf } from 'rimraf'

// Clean dist directory
await rimraf('dist')

// Build configuration
const buildConfig = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: 'dist',
  minify: true,
  sourcemap: false,
  target: 'es2020',
  plugins: [
    stylePlugin({
      postcss: {
        plugins: [require('tailwindcss'), require('autoprefixer')]
      }
    })
  ],
  loader: {
    '.ts': 'tsx',
    '.tsx': 'tsx',
    '.js': 'jsx',
    '.jsx': 'jsx'
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}

try {
  console.log('🏗️  Building Hidden Key Investments...')
  
  // Build the application
  await esbuild.build(buildConfig)
  
  // Copy index.html to dist
  const fs = await import('fs')
  const indexHtml = fs.readFileSync('index.html', 'utf8')
  fs.writeFileSync('dist/index.html', indexHtml)
  
  console.log('✅ Build completed successfully!')
  process.exit(0)
} catch (error) {
  console.error('❌ Build failed:', error)
  process.exit(1)
}