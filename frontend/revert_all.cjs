const fs = require('fs');
const path = require('path');

const replacements = [
  // Reverse semantics
  { regex: /bg-background/g, replacement: 'bg-slate-50 dark:bg-slate-900' },
  { regex: /bg-card\/50/g, replacement: 'bg-slate-50 dark:bg-slate-800/50' },
  { regex: /bg-card/g, replacement: 'bg-white dark:bg-slate-800' },
  { regex: /border-border/g, replacement: 'border-slate-200 dark:border-slate-700' },
  { regex: /text-foreground/g, replacement: 'text-slate-800 dark:text-slate-100' },
  { regex: /text-muted-foreground/g, replacement: 'text-slate-500 dark:text-slate-400' },
  { regex: /bg-secondary\/50/g, replacement: 'bg-slate-100 dark:bg-slate-900/50' },
  { regex: /bg-secondary\/80/g, replacement: 'bg-slate-200 dark:bg-slate-700' },
  { regex: /bg-secondary/g, replacement: 'bg-slate-100 dark:bg-slate-800' },
  { regex: /hover:bg-secondary/g, replacement: 'hover:bg-slate-100 dark:hover:bg-slate-800' },
  
  // Reverse primary to indigo
  { regex: /([a-zA-Z:-]+)-primary-([0-9]{2,3}(\/[0-9]+)?)/g, replacement: '$1-indigo-$2' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const { regex, replacement } of replacements) {
    content = content.replace(regex, replacement);
  }

  // Also replace some specific cases manually
  content = content.replace(/bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow hover:shadow-md hover:from-indigo-500 hover:to-indigo-400 border border-indigo-500\/20/g, 'bg-indigo-600 text-white shadow hover:bg-indigo-700');
  content = content.replace(/bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm hover:shadow-md hover:from-red-500 hover:to-red-400/g, 'bg-red-600 text-white shadow hover:bg-red-700');
  content = content.replace(/border border-input bg-slate-50 dark:bg-slate-900\/50 backdrop-blur-sm shadow-sm hover:bg-accent hover:text-accent-foreground/g, 'border border-input bg-transparent shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

walkDir('C:/Users/alan/Desktop/app-amar/frontend/src');
console.log('Revert complete.');
