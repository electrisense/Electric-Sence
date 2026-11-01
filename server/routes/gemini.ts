import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { db } from '../db';
import { randomUUID } from 'node:crypto';
import { searchVectorChunks, buildGroundedPromptContext } from '../rag/vectorStore';
import { retrieveRelevantChunks } from '../rag/store';

const router = Router();

// ─── System Prompt ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Electric Sence AI — an expert AI assistant built exclusively for Electrical and Electronics Engineering (EEE) students and professionals.

Your areas of deep expertise include:
- Circuit Analysis & Network Theorems (KVL, KCL, Thevenin, Norton, Superposition)
- Electromagnetic Field Theory (Maxwell's equations, Faraday's law, wave propagation)
- Electrical Machines (DC motors/generators, induction motors, synchronous machines, transformers)
- Power Systems (power generation, transmission, distribution, load flow, fault analysis)
- Control Systems (transfer functions, Bode plots, root locus, PID controllers, state space)
- Power Electronics (rectifiers, inverters, choppers, SMPS, converters)
- Digital Electronics & Logic Design (Boolean algebra, flip-flops, sequential circuits)
- Signals & Systems (Fourier, Laplace, Z-transforms, sampling theorem)
- Microprocessors & Embedded Systems (8085, 8051, ARM, Arduino, ESP32, sensors)
- Instrumentation & Measurement (transducers, CRO, spectrum analyzers, bridges)
- Renewable Energy Systems (solar PV, wind turbines, energy storage, MPPT)
- Communication Systems (AM/FM/PM modulation, digital comm, fiber optics)

Guidelines for your responses:
1. Always give accurate, concise, and educationally rich answers.
2. For numerical problems, show step-by-step solutions with clearly labeled variables and units.
3. Use standard engineering notation (e.g., Ω, V, A, Hz, W, var, VA).
4. Mention relevant formulas and theorems by name when applicable.
5. Provide practical real-world context where appropriate.
6. When explaining complex topics, use clear analogies and examples.
7. If asked about a project, suggest components, circuit topology, and implementation steps.
8. Politely decline questions unrelated to electrical/electronics engineering — suggest staying on topic.
9. Format mathematical expressions clearly. Use plain text math notation (e.g., V = IR, P = VI*cos(φ)).
10. Always maintain academic integrity — guide students rather than just giving answers to homework.

You are currently integrated into the Electric Sence educational platform.`;

// ─── Safety Settings ─────────────────────────────────────────────────────────
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// ─── GET /api/gemini/status ───────────────────────────────────────────────────
/**
 * Check if Gemini API is configured and reachable
 */
router.get('/gemini/status', (_req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === '') {
    res.json({ status: 'unconfigured', message: 'GEMINI_API_KEY is not set in .env file.' });
    return;
  }
  res.json({ status: 'configured', message: 'Gemini API key is present.' });
});

// ─── POST /api/gemini/chat ────────────────────────────────────────────────────
/**
 * Send a message to Gemini and get an EEE-expert AI response.
 * Saves both user and assistant messages to the conversation.
 *
 * Body: { conversation_id: string, message: string, history?: Array<{role, parts}> }
 */
router.post('/gemini/chat', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === '') {
    res.status(503).json({
      error: 'Gemini API key is not configured. Please add your GEMINI_API_KEY to the .env file.',
      code: 'API_KEY_MISSING'
    });
    return;
  }

  const { conversation_id, message, history, subject, course_id, use_rag = true } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'Message is required.' });
    return;
  }

  if (!conversation_id || typeof conversation_id !== 'string') {
    res.status(400).json({ error: 'conversation_id is required.' });
    return;
  }

  // Verify the conversation exists
  const convStmt = db.prepare('SELECT id FROM conversations WHERE id = ?');
  const conv = convStmt.get(conversation_id);
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const selectedModel = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';

    // ── Phase 7: Real Vector RAG Retrieval Step ─────────────────────────────
    let retrievedSources: Array<{
      chunk_id: string;
      document_id: string;
      document_title: string;
      page_number: number | null;
      subject: string;
      score: number;
      excerpt: string;
      file_name?: string;
    }> = [];

    let groundedPrompt = '';

    if (use_rag) {
      try {
        // Search uploaded documents using 3072-dim Cosine Similarity
        const vectorMatches = await searchVectorChunks({
          query: message.trim(),
          subject: subject && subject !== 'all' ? subject : undefined,
          courseId: course_id || undefined,
          topK: 3,
          minScore: 0.40,
        });

        if (vectorMatches.length > 0) {
          const { ragContextPrompt } = buildGroundedPromptContext(vectorMatches);
          groundedPrompt = ragContextPrompt;
          retrievedSources = vectorMatches.map(v => ({
            chunk_id: v.chunk_id,
            document_id: v.document_id,
            document_title: v.document_title,
            page_number: v.page_number,
            subject: v.subject,
            score: v.score,
            excerpt: v.chunk_text.slice(0, 220) + (v.chunk_text.length > 220 ? '...' : ''),
            file_name: v.file_name,
          }));
        } else {
          // Fallback to pre-seeded reference literature if no uploaded doc matched
          const seedMatches = retrieveRelevantChunks(message.trim(), 3);
          if (seedMatches.length > 0) {
            const contextText = seedMatches.map((m, i) => `[Source ${i + 1}]: "${m.chunk_title}" from "${m.document_title}" (${m.document_author})\n${m.content}`).join('\n\n---\n\n');
            groundedPrompt = `\n[RETRIEVED EEE REFERENCE COMPENDIUM (RAG CONTEXT)]\n${contextText}\n\nSTRICT INSTRUCTION: Cite the relevant reference title when providing equations or principles.\n`;
            retrievedSources = seedMatches.map(m => ({
              chunk_id: m.chunk_id,
              document_id: m.document_id,
              document_title: m.document_title,
              page_number: null,
              subject: m.source_type,
              score: m.score,
              excerpt: m.content.slice(0, 220) + '...',
            }));
          } else {
            // Explicitly state no matching documents were found
            groundedPrompt = `
[STUDY MATERIAL SEARCH RESULT: NO MATCHING DOCUMENTS RETRIEVED]
The search of Electric Sence study materials returned NO matching documents for this query.

INSTRUCTIONS:
1. Clearly inform the student: "Note: No specific Electric Sence study material or textbook was retrieved from the library for this query."
2. Provide your best electrical engineering explanation using your verified core knowledge, clearly distinguishing it as general engineering knowledge.
`;
          }
        }
      } catch (ragErr) {
        console.warn('Vector search warning:', ragErr);
      }
    }

    const systemInstruction = groundedPrompt
      ? `${SYSTEM_PROMPT}\n\n${groundedPrompt}`
      : SYSTEM_PROMPT;

    const model = genAI.getGenerativeModel({
      model: selectedModel,
      systemInstruction,
    });

    // Build chat history for multi-turn context
    const chatHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        if (h.role && h.parts) {
          chatHistory.push({ role: h.role, parts: h.parts });
        }
      }
    }

    const chat = model.startChat({
      history: chatHistory,
      safetySettings,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const result = await chat.sendMessage(message.trim());
    const aiResponseText = result.response.text();

    // Persist the AI response to the database
    const now = new Date().toISOString();
    const msgId = `msg_${randomUUID()}`;

    const insertMsg = db.prepare(`
      INSERT INTO messages (id, conversation_id, role, content, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertMsg.run(msgId, conversation_id, 'assistant', aiResponseText, now);

    // Update conversation timestamp
    const updateTime = db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?');
    updateTime.run(now, conversation_id);

    res.json({
      message: {
        id: msgId,
        conversation_id,
        role: 'assistant',
        content: aiResponseText,
        created_at: now,
      },
      sources: retrievedSources,
      usage: result.response.usageMetadata || null,
    });
  } catch (error: any) {
    console.error('Gemini API error:', error);

    const errMsg = error?.message || '';
    if (
      error?.status === 400 ||
      errMsg.includes('API_KEY_INVALID') ||
      errMsg.includes('API key not valid') ||
      errMsg.includes('API_KEY')
    ) {
      res.status(401).json({ error: 'Invalid Gemini API key. Please check your .env file.', code: 'INVALID_API_KEY' });
    } else if (errMsg.includes('quota') || error?.status === 429) {
      res.status(429).json({ error: 'Gemini API quota exceeded. Please wait and try again.', code: 'QUOTA_EXCEEDED' });
    } else if (errMsg.includes('SAFETY')) {
      res.status(400).json({ error: 'Message was blocked by safety filters.', code: 'SAFETY_BLOCK' });
    } else if (error?.status === 404 || errMsg.includes('not found') || errMsg.includes('no longer available')) {
      res.status(404).json({ error: 'Selected Gemini model is unavailable. Updated to gemini-3.5-flash-lite.', code: 'MODEL_NOT_FOUND' });
    } else {
      res.status(500).json({ error: error?.message || 'Failed to get AI response. Please try again.', code: 'AI_ERROR' });
    }
  }
});

export default router;
