const fs = require('fs');

let content = fs.readFileSync('C:/Users/alan/Desktop/app-amar/frontend/src/index.css', 'utf8');

const newBase = `@layer base {
  :root {
    /* Color Palette based on Deep Government Blues & Grays */
    --background: #f8fafc;
    --foreground: #0f172a;

    --card: #ffffff;
    --card-foreground: #0f172a;

    --popover: #ffffff;
    --popover-foreground: #0f172a;

    --secondary: #f1f5f9;
    --secondary-foreground: #0f172a;

    --muted: #f1f5f9;
    --muted-foreground: #64748b;

    --border: #e2e8f0;
    --input: #e2e8f0;
    
    --radius: 0.75rem; /* modern rounded corners 12px */
  }

  .dark {
    --background: #0B1220;
    --foreground: #F8FAFC;

    --card: #1E293B;
    --card-foreground: #F8FAFC;

    --popover: #1E293B;
    --popover-foreground: #F8FAFC;

    --secondary: #111827;
    --secondary-foreground: #F8FAFC;

    --muted: #111827;
    --muted-foreground: #94A3B8;

    --border: #334155;
    --input: #334155;
  }

  * {
    @apply border-border;
  }

  html, body {
    @apply bg-background text-foreground transition-colors duration-300;
    direction: rtl; /* MANDATORY FOR KURDISH (SORANI) */
    text-align: right;
    font-family: var(--font-primary);
    overflow-y: scroll; /* Forces scrollbar to always show, preventing layout shifts */
  }
}
`;

const layerBaseStart = content.indexOf('@layer base {');
const layerBaseEnd = content.indexOf('}', content.indexOf('html, body {')) + 2; 

if (layerBaseStart !== -1 && layerBaseEnd !== -1) {
  content = content.slice(0, layerBaseStart) + newBase + content.slice(layerBaseEnd);
  fs.writeFileSync('C:/Users/alan/Desktop/app-amar/frontend/src/index.css', content, 'utf8');
  console.log('Updated index.css');
} else {
  console.log('Could not find @layer base');
}
