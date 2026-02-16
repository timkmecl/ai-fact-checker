# Agent Guidelines for AI Fact Checker

## Architecture Overview

This is a **full-stack application** with:
- **Frontend**: React 19 SPA (port 3000)
- **Backend**: Express.js API server (port 4101)
- **Communication**: REST API with JWT authentication via HTTP-only cookies

The backend proxies all Gemini API requests and handles authentication securely.

## Build Commands

### Backend
```bash
cd backend
npm run dev       # Development with hot reload (tsx watch)
npm run build     # Compile TypeScript to dist/
npm start         # Run compiled JavaScript
```

### Frontend
```bash
cd frontend
npm run dev       # Development server (port 3000)
npm run build     # Production build to dist/
npm run preview   # Preview production build
```

**Note**: Both frontend and backend must be running for the app to work. Start the backend first.

## Project Structure

```
ai-fact-checker/
├── backend/              # Express.js backend
│   ├── src/
│   │   ├── index.ts     # Main server: auth, Gemini proxy, SSE streaming, File Search RAG
│   │   └── types.ts     # Shared types (ModelType enum)
│   ├── .env            # Environment variables (API_KEY, JWT_SECRET, FILE_SEARCH_STORE_ID)
│   └── package.json
├── frontend/            # React frontend
│   ├── components/      # React components (PascalCase folders)
│   │   ├── AnalysisForm/  # Input forms with RAG toggle
│   │   ├── Header/
│   │   └── ResponseDisplay/ # Results with grounding source citations
│   ├── hooks/          # Custom React hooks
│   │   ├── useAuth.ts  # JWT auth with cookie-based sessions
│   │   ├── useStreaming.ts # SSE handling with grounding sources
│   │   └── useHistory.ts
│   ├── pages/          # Page components
│   ├── services/       # API integration
│   │   └── geminiService.ts # Backend API calls with RAG support
│   ├── constants/      # Static data
│   ├── utils/          # Helper functions
│   └── types.ts        # TypeScript types (GroundingSource, AnalysisRequest)
├── rag-setup/          # RAG knowledge base configuration
│   ├── setup.ipynb     # Jupyter notebook for document upload
│   └── sources/        # 100+ curated documents (PDF, DOCX, MD)
└── README.md
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
import { streamAnalysis } from '@/services/geminiService';
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
- Custom color palette:
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

### Backend Error Handling

```typescript
// Always use proper HTTP status codes
res.status(401).json({ error: 'Unauthorized' });
res.status(500).json({ error: 'Server error' });

// Log errors for debugging
console.error('Detailed error:', error);
```

## API Communication Patterns

### Frontend → Backend

All API calls use the `API_URL` environment variable and include credentials:

```typescript
// Authentication
credentials: 'include'  // Required for cookies

// Example
const response = await fetch(`${process.env.API_URL}/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
  credentials: 'include',
});
```

### Backend Authentication Middleware

```typescript
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Server-Sent Events (SSE)

The `/api/analyze` endpoint streams Gemini responses:

```typescript
// Backend
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');

for await (const chunk of responseStream) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}
```

When `useRag: true`, the backend enables File Search tool:

```typescript
// Conditional File Search tool for RAG
...(useRag && {
  tools: [{
    fileSearch: {
      fileSearchStoreNames: [process.env.FILE_SEARCH_STORE_ID!],
    }
  }]
})
```

Grounding sources are extracted from `groundingMetadata.groundingChunks` and sent as metadata events to the frontend.

## Environment Variables

### Backend (.env)
Create in `backend/.env`:
```env
API_KEY=your_google_gemini_api_key
JWT_SECRET=your_jwt_secret_key
APP_PASSWORD=bcrypt_hashed_password
FILE_SEARCH_STORE_ID=your_file_search_store_id
FRONTEND_URL=http://localhost:3000
PORT=4101
NODE_ENV=development
```

### Frontend (.env.local)
Create in `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:4101/api
```

**Note**: Frontend uses `VITE_` prefix for env vars. Backend uses `process.env` directly.

## Key Dependencies

### Frontend
- React 19
- TypeScript 5.8
- Vite 6
- Tailwind CSS (via CDN in index.html)

### Backend
- Express 5.x
- @google/genai (Google Gemini SDK)
- jsonwebtoken (JWT authentication)
- bcrypt (Password hashing)
- cookie-parser (Cookie handling)
- cors (CORS middleware)

## Important Notes

- **Backend is required**: The app cannot function without the backend running
- **No direct Gemini access**: Frontend never accesses Gemini API directly; all requests go through backend
- **Authentication stateless**: Uses JWT in HTTP-only cookies, not localStorage
- **History stored locally**: Only history persists in localStorage; auth is cookie-based
- **CORS configured**: Backend only accepts requests from configured `FRONTEND_URL`
- **Streaming API**: Analysis uses SSE for real-time response streaming
- **RAG File Search**: When `useRag: true`, backend queries Google File Search Store with 100+ documents
- **Grounding sources**: RAG queries return sources in `groundingMetadata.groundingChunks`

## Security Considerations

- Never expose `API_KEY` or `JWT_SECRET` to frontend
- Always use `credentials: 'include'` for authenticated requests
- Passwords are bcrypt hashed before storage
- Cookies are httpOnly and secure in production
- JWT tokens expire after 7 days
