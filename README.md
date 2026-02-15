# AI Fact Checker

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) ![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat&logo=google&logoColor=white)

An AI-powered fact-checking application that helps verify information using Google's Gemini AI. The app analyzes text, URLs, and documents to provide fact-checking results with sources and explanations.

## Features

- **Multi-input Support**: Analyze text, URLs, and uploaded documents (PDF, text, etc.)
- **AI-Powered Analysis**: Uses Google Gemini API for intelligent fact-checking
- **Real-time Streaming**: Get results as they are generated
- **History Management**: Save and review previous fact-checks
- **Markdown Rendering**: Rich display of analysis results
- **Authentication**: Simple password-based access control
- **Local Storage**: History persists in browser storage

## Usage

1. **Authentication**: Enter the password to access the application.
2. **Input Selection**: Choose between Text, URL, or File input tabs. You can add multiple inputs for comprehensive analysis.
3. **Analysis**: Enter your content and click "Analyze" to start fact-checking.
4. **Results**: View the AI-generated analysis with sources and explanations. Copy results to clipboard or download as a Word document.
5. **History**: Access previous analyses from the sidebar.

## Tech Stack

- **Frontend**: React 19, TypeScript 5.8, Vite 6
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini API (@google/genai)
- **Document Processing**: DOCX support
- **Markdown**: Marked and React Markdown for rendering


## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-fact-checker.git
   cd ai-fact-checker
   ```

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the `frontend` directory with your Google Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.


## Project Structure

```
frontend/
├── components/        # React components
│   ├── Form/         # Input forms and tabs
│   ├── Header/       # App header
│   └── Response/     # Result display components
├── hooks/            # Custom React hooks
├── pages/            # Main application pages
├── services/         # API integration (Gemini)
├── utils/            # Helper functions and icons
├── constants/        # Static data and configurations
└── types.ts          # TypeScript type definitions

backend/              # Empty for now (placeholder for future backend)
rag-setup/           # RAG configuration (placeholder for future RAG implementation)
```

## Build Commands

```bash
# Development server
cd frontend && npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```


## Notes

- The application currently uses a backend-less architecture, connecting directly to external APIs - not recommended for production. Future versions will include a backend for better security and performance.


## License 

This project is the intellectual property of Tim Kmecl. All rights reserved. Unauthorized use, reproduction, or distribution of this code is strictly prohibited. For inquiries or permissions, please contact Tim Kmecl directly.




