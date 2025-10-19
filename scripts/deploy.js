/**
 * Deployment script for Hidden Key Investments
 * Ensures all dependencies are installed and build completes successfully
 */
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting deployment preparation...');

try {
  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Run the build
  console.log('🏗️ Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
  console.log('📤 Ready for deployment to Netlify');
} catch (error) {
  console.error('❌ Deployment preparation failed:', error.message);
  process.exit(1);
}