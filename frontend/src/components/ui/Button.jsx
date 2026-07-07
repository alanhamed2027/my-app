import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Reusable Premium Button Component
 * Uses tailwind-merge and clsx to combine default styles with any custom classes passed in.
 */
const Button = forwardRef(({ className, variant = 'primary', size = 'default', isLoading, children, ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    primary: 'bg-primary-600 text-white shadow hover:bg-primary-700',
    destructive: 'bg-red-600 text-white shadow hover:bg-red-700',
    outline: 'border border-input bg-transparent shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-secondary-foreground shadow-sm hover:bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700/50',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-md px-8',
    icon: 'h-9 w-9',
  };

  const combinedClasses = twMerge(clsx(baseStyles, variants[variant], sizes[size], className));

  return (
    <button ref={ref} className={combinedClasses} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <svg className="animate-spin -ms-1 me-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
