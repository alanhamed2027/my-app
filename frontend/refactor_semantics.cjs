const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-slate-50 dark:bg-slate-900/g, replacement: 'bg-background' },
  { regex: /bg-white dark:bg-slate-900/g, replacement: 'bg-background' },
  { regex: /bg-white(\/\d+)? dark:bg-slate-900(\/\d+)?/g, replacement: 'bg-background$1' },
  { regex: /bg-white(\/\d+)? dark:bg-slate-800(\/\d+)?/g, replacement: 'bg-card$1' },
  { regex: /bg-slate-50 dark:bg-slate-800\/50/g, replacement: 'bg-card/50' },
  { regex: /border-slate-200 dark:border-slate-800/g, replacement: 'border-border' },
  { regex: /border-slate-200 dark:border-slate-700/g, replacement: 'border-border' },
  { regex: /border-slate-100 dark:border-slate-800/g, replacement: 'border-border' },
  { regex: /text-slate-800 dark:text-slate-100/g, replacement: 'text-foreground' },
  { regex: /text-slate-800 dark:text-white/g, replacement: 'text-foreground' },
  { regex: /text-slate-700 dark:text-slate-200/g, replacement: 'text-foreground' },
  { regex: /text-slate-600 dark:text-slate-400/g, replacement: 'text-muted-foreground' },
  { regex: /text-slate-500 dark:text-slate-400/g, replacement: 'text-muted-foreground' },
  { regex: /text-slate-500/g, replacement: 'text-muted-foreground' },
  { regex: /bg-slate-100 dark:bg-slate-800/g, replacement: 'bg-secondary' },
  { regex: /bg-slate-100 dark:bg-slate-900\/50/g, replacement: 'bg-secondary/50' },
  { regex: /bg-slate-200 dark:bg-slate-700/g, replacement: 'bg-secondary/80' },
  { regex: /bg-slate-200 dark:bg-slate-800/g, replacement: 'bg-secondary/80' },
  { regex: /hover:bg-slate-100 dark:hover:bg-slate-800/g, replacement: 'hover:bg-secondary' },
  { regex: /border-slate-200/g, replacement: 'border-border' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const { regex, replacement } of replacements) {
    content = content.replace(regex, replacement);
  }

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
console.log('Semantic refactoring complete.');
