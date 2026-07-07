import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Reusable Premium Input Component
 */
const Input = forwardRef(({ className, type = 'text', error, ...props }, ref) => {
  return (
    <div className="w-full relative">
      <input
        type={type}
        className={twMerge(
          clsx(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-slate-500 dark:text-slate-400',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <span className="absolute -bottom-5 right-0 text-[11px] text-destructive">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
