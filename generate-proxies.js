#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const oldDir = path.join(srcDir, 'old');

// Function to create proxy file
function createProxyFile(oldFilePath, newFilePath) {
  const ext = path.extname(oldFilePath);
  if (!['.ts', '.tsx'].includes(ext)) return;
  
  // Skip only story files (keep demos)
  if (oldFilePath.includes('.story.')) return;
  
  // Calculate relative path from new file to old file
  const newFileDir = path.dirname(newFilePath);
  let relPath = path.relative(newFileDir, oldFilePath);
  
  // Remove file extension from import path
  relPath = relPath.replace(/\.(tsx?|jsx?)$/, '');
  
  // Ensure the path uses forward slashes and starts with ./
  relPath = relPath.replace(/\\/g, '/');
  if (!relPath.startsWith('.')) {
    relPath = './' + relPath;
  }
  
  // Create re-export content
  const reExportAll = `export * from '${relPath}';\n`;
  const reExportDefault = `export { default } from '${relPath}';\n`;
  
  // Check if old file has a default export
  let content = reExportAll;
  try {
    const oldContent = fs.readFileSync(oldFilePath, 'utf8');
    if (oldContent.includes('export default') || oldContent.includes('export { default }')) {
      content = reExportAll + reExportDefault;
    }
  } catch (e) {
    console.error(`Error reading ${oldFilePath}:`, e.message);
  }
  
  // Create directory if it doesn't exist
  const newFileDir2 = path.dirname(newFilePath);
  if (!fs.existsSync(newFileDir2)) {
    fs.mkdirSync(newFileDir2, { recursive: true });
  }
  
  // Write proxy file
  fs.writeFileSync(newFilePath, content);
  console.log(`Created: ${path.relative(srcDir, newFilePath)}`);
}

// Function to recursively process directory
function processDirectory(oldDirPath) {
  const items = fs.readdirSync(oldDirPath);
  
  for (const item of items) {
    const oldItemPath = path.join(oldDirPath, item);
    const stat = fs.statSync(oldItemPath);
    
    if (stat.isDirectory()) {
      processDirectory(oldItemPath);
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (['.ts', '.tsx', '.css'].includes(ext)) {
        // Calculate new path (remove /old/ from path)
        const relativePath = path.relative(oldDir, oldItemPath);
        const newItemPath = path.join(srcDir, relativePath);
        
        if (!fs.existsSync(newItemPath)) {
          createProxyFile(oldItemPath, newItemPath);
        }
      }
    }
  }
}

// Process each directory under old/
const dirsToProcess = ['components', 'hooks', 'utils', 'config', 'providers', 'types', 'data'];

for (const dir of dirsToProcess) {
  const dirPath = path.join(oldDir, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`\nProcessing ${dir}...`);
    processDirectory(dirPath);
  }
}

console.log('\n✅ Proxy files generated successfully!');
