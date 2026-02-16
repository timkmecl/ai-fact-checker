// backend/src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

import { ModelType } from './types.js';



dotenv.config();

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Middleware
const allowOrigins = [process.env.FRONTEND_URL || '', 'http://localhost:3000', 'http://192.168.0.100:3000'];
app.use(cors({
  origin: allowOrigins,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET!;

// Auth Middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth_token;
  console.log("Authenticating request with token:", token);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    jwt.verify(token, JWT_SECRET);
    console.log("Authentication successful for token:", token);
    next();
  } catch (err) {
    console.log("Authentication failed for token:", token, "Error:", err);
    res.status(401).json({ error: 'Invalid token' });
  }
};


// --- ROUTES ---

// 1. Login
app.post('/api/login', async (req: Request, res: Response) => {
  const { password } = req.body;
  const match = await bcrypt.compare(password, process.env.APP_PASSWORD!);
  if (match) {
    const token = jwt.sign({ authorized: true }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log(process.env.NODE_ENV === 'production' ? "Production login successful" : "Development login successful");

    console.log("User authenticated successfully");
    return res.json({ success: true });
  }
  console.log("Failed login attempt with password.");
  res.status(401).json({ error: 'Wrong password' });
});


// 2. Verify (for Auto-login)
app.get('/api/verify', (req: Request, res: Response) => {
  console.log("Verifying authentication token...");
  const token = req.cookies.auth_token;
  if (!token) return res.json({ authenticated: false });
  
  try {
    jwt.verify(token, JWT_SECRET);
    console.log("Token is valid. User is authenticated.");
    res.json({ authenticated: true });
  } catch {
    console.log("Invalid token. User is not authenticated.");
    res.json({ authenticated: false });
  }
});


// 3. Logout
app.post('/api/logout', (req: Request, res: Response) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
  console.log("User logged out, auth_token cookie cleared.");
});


// 4. Gemini Stream Analysis
app.post('/api/analyze', authenticate, async (req: Request, res: Response) => {
  const { model, parts, useRag } = req.body;

  // console.log("Received analysis request", { model, useRag, partsLength: parts.length }); 

  // return res.json({ success: false, message: "Analysis endpoint is under construction. Check console for received data." });

  try {
    const responseStream = await ai.models.generateContentStream({
      model: model === ModelType.GEMINI_3_FLASH ? ModelType.GEMINI_3_FLASH : ModelType.FLASH_LITE,
      contents: { parts },
      config: {
        temperature: 0.5,
        thinkingConfig: model === ModelType.GEMINI_3_FLASH ? { thinkingLevel: ThinkingLevel.LOW } : { thinkingBudget: 4096 },
        ...(useRag && {
          tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [process.env.FILE_SEARCH_STORE_ID!],
            }
          }
      ]
        })
      }
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of responseStream) {
      // console.log("Received chunk from Gemini:", chunk);
      // console.log("Chunk metadata",  chunk.candidates?.[0]?.groundingMetadata);
      // console.log("Chunk grounding chunks", chunk.candidates?.[0]?.groundingMetadata?.groundingChunks);

      const payload = {
        text: chunk.text,
        sources: chunk.candidates?.[0]?.groundingMetadata?.groundingChunks
          ?.filter((c: any) => c.retrievedContext)
          .map((c: any) => ({ title: c.retrievedContext.title, text: c.retrievedContext.text })) || []
      };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
    res.end();
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).write(`data: ${JSON.stringify({ error: 'AI processing failed' })}\n\n`);
    res.end();
  }
});

const PORT = process.env.PORT || 4101;
app.listen(PORT, () => console.log(`AI Fact Checker: Backend running at http://localhost:${PORT}`));