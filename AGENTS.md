# Agent Guidelines for AI Fact Checker

## Build Commands

```bash
# Development server (port 3000)
cd frontend && npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

**Note**: No test framework, linter, or formatter is currently configured. Consider adding Vitest, ESLint, and Prettier.

## Project Structure

```
frontend/
├── components/        # React components (PascalCase folders)
│   ├── Form/
│   ├── Header/
│   └── Response/
├── hooks/            # Custom React hooks (use*.ts)
├── pages/            # Page components
├── services/         # API/service logic
├── constants/        # Constants and static data
├── utils/            # Utility functions
├── types.ts          # Shared TypeScript types
└── index.tsx         # Application entry point
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all component props
- Use enums for fixed sets of values (see `types.ts`)
- Export types from `types.ts`
- Use type annotations on function parameters and returns

### Imports

- Use path alias `@/` for imports from project root
- Group imports: React, external libraries, internal modules
- Use single quotes for strings

```typescript
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ModelType } from '../types';
import { useAuth } from '@/hooks/useAuth';
```

### Components

- Use functional components with `React.FC<Props>` typing
- Default export for components
- Props interface named `{ComponentName}Props`

```typescript
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};

export default Button;
```

### Hooks

- Named exports for custom hooks
- Prefix with `use`
- Place in `hooks/` directory

```typescript
export const useCustomHook = () => {
  // implementation
};
```

### Naming Conventions

- **Components**: PascalCase (e.g., `HistorySidebar.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Services**: camelCase (e.g., `geminiService.ts`)
- **Types/Interfaces**: PascalCase (e.g., `HistoryItem`)
- **Enums**: PascalCase, members UPPER_SNAKE_CASE

### Formatting

- 2-space indentation
- Semicolons required
- Single quotes for strings
- Trailing commas in multi-line objects/arrays
- Max line length: ~100 characters

### Styling

- Use Tailwind CSS utility classes
- Custom color palette defined in components:
  - Background: `#F3F0E7`
  - Text: `#2D2D2D`
  - Accent: `#BC5A41`
- Use `className` for all styling

### Error Handling

- Use try/catch for async operations
- Throw errors with descriptive messages
- Log errors to console with `console.error()`
- Set user-friendly error messages in UI state

```typescript
try {
  await asyncOperation();
} catch (error) {
  console.error('Operation failed:', error);
  setError('User-friendly error message');
}
```

### Environment Variables

- Use `.env.local` for local environment variables
- Variables prefixed with `GEMINI_` or `API_`
- Access via `process.env.VAR_NAME` in Vite config

## Key Dependencies

- React 19
- TypeScript 5.8
- Vite 6
- Google GenAI SDK
- Tailwind CSS (via CDN in index.html)

## Important Notes

- Backend directory is empty (backend-less architecture)
- App connects directly to Google Gemini API
- History stored in localStorage
- Authentication uses simple password check
