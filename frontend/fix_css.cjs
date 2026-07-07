const fs = require('fs');
let content = fs.readFileSync('C:/Users/alan/Desktop/app-amar/frontend/src/index.css', 'utf8');

// Find the first null byte (from UTF-16 corruption)
const nullIndex = content.indexOf('\0');
if (nullIndex !== -1) {
  // Back up before the null byte, looking for the last clean CSS rule '}'
  const cleanPart = content.slice(0, nullIndex);
  const lastBraceIndex = cleanPart.lastIndexOf('}');
  
  if (lastBraceIndex !== -1) {
    content = cleanPart.slice(0, lastBraceIndex + 1) + '\n\n';
    
    const additionalCss = `
/* Dynamic Theme CSS Variables */
:root {
  --font-primary: 'Noto Sans Arabic', Inter, system-ui, sans-serif;
}
:root[data-font='Rudaw'] {
  --font-primary: 'Rudaw', Inter, system-ui, sans-serif;
}
:root[data-font='Speda'] {
  --font-primary: 'Speda', Inter, system-ui, sans-serif;
}
:root[data-font='NRT'] {
  --font-primary: 'NRT', Inter, system-ui, sans-serif;
}

:root[data-size='small'] {
  font-size: 14px !important;
}
:root[data-size='base'] {
  font-size: 16px !important;
}
:root[data-size='large'] {
  font-size: 18px !important;
}

/* Blue (Default) */
:root[data-color='blue'], :root {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
}
/* Indigo */
:root[data-color='indigo'] {
  --color-primary-50: #eef2ff;
  --color-primary-100: #e0e7ff;
  --color-primary-200: #c7d2fe;
  --color-primary-300: #a5b4fc;
  --color-primary-400: #818cf8;
  --color-primary-500: #6366f1;
  --color-primary-600: #4f46e5;
  --color-primary-700: #4338ca;
  --color-primary-800: #3730a3;
  --color-primary-900: #312e81;
}
/* Emerald */
:root[data-color='emerald'] {
  --color-primary-50: #ecfdf5;
  --color-primary-100: #d1fae5;
  --color-primary-200: #a7f3d0;
  --color-primary-300: #6ee7b7;
  --color-primary-400: #34d399;
  --color-primary-500: #10b981;
  --color-primary-600: #059669;
  --color-primary-700: #047857;
  --color-primary-800: #065f46;
  --color-primary-900: #064e3b;
}
/* Rose */
:root[data-color='rose'] {
  --color-primary-50: #fff1f2;
  --color-primary-100: #ffe4e6;
  --color-primary-200: #fecdd3;
  --color-primary-300: #fda4af;
  --color-primary-400: #fb7185;
  --color-primary-500: #f43f5e;
  --color-primary-600: #e11d48;
  --color-primary-700: #be123c;
  --color-primary-800: #9f1239;
  --color-primary-900: #881337;
}
`;
    
    fs.writeFileSync('C:/Users/alan/Desktop/app-amar/frontend/src/index.css', content + additionalCss, 'utf8');
    console.log('Fixed index.css');
  }
} else {
  console.log('No null byte found.');
}
