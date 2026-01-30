# Agent Instructions

## Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx tsc --noEmit` - Run TypeScript check

## Code Style Guidelines

### TypeScript
- Use strict TypeScript mode (enabled in tsconfig.json)
- Always define explicit return types for functions
- Use interfaces for object shapes, types for unions
- Prefer `const` over `let`, never use `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### React Components
- Use functional components with hooks
- Mark client components with `'use client'` when using hooks/browser APIs
- Keep components focused and single-responsibility
- Use destructured props with explicit typing
- Prefer composition over inheritance

### Imports
- React imports first: `import { useState } from 'react'`
- Third-party libraries next (alphabetical)
- Internal imports last using `@/` alias
- Group related imports together
- Example:
  ```typescript
  import { useState, useEffect } from 'react';
  import { motion } from 'framer-motion';
  import Link from 'next/link';
  import { ChevronLeft } from 'lucide-react';
  import { useRouter } from 'next/navigation';
  import { MyComponent } from '@/components/MyComponent';
  ```

### Naming Conventions
- Components: PascalCase (e.g., `PresentationViewer`)
- Functions: camelCase (e.g., `getPresentations`)
- Constants: UPPER_SNAKE_CASE for true constants
- Types/Interfaces: PascalCase with descriptive names
- Files: kebab-case for routes, PascalCase for components
- CSS classes: kebab-case with semantic naming

### Error Handling
- Always use try/catch for async operations
- Log errors to console with descriptive messages
- Return user-friendly fallback values
- Use early returns to avoid deep nesting
- Validate data before processing

### Styling (Tailwind CSS)
- Use Tailwind utility classes exclusively
- Follow mobile-first responsive design
- Use `dark:` variants for dark mode support
- Group related classes together
- Extract repeated patterns to components
- Use semantic color names (e.g., `slate`, `blue`, not `gray-500`)

### State Management
- Use `useState` for local component state
- Use `useEffect` for side effects with proper cleanup
- Use `useCallback` for memoized callbacks passed to children
- Store user preferences in localStorage
- Use sessionStorage for temporary data (e.g., live presentations)

### API Routes
- Use Next.js App Router conventions
- Return JSON with `NextResponse.json()`
- Include proper error status codes
- Validate file paths for security
- Handle edge cases (missing files, empty directories)

### Performance
- Use dynamic imports for large libraries when possible
- Implement proper loading states
- Use `will-change` sparingly for animations
- Lazy load below-the-fold content
- Minimize re-renders with proper dependency arrays

### Accessibility
- Use semantic HTML elements
- Include proper ARIA labels for interactive elements
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Support reduced motion preferences

### Comments
- Use JSDoc for function documentation
- Explain complex logic, not obvious code
- Keep comments up-to-date with code changes
- Use TODO/FIXME markers for temporary solutions
