import { z } from 'zod';
import {
  generateChatResponse,
  generateChatResponseStream,
  analyzeSymptoms,
  setApiKey,
  getAiConfig,
} from '../services/aiService.js';
import { dbStore } from '../store/inMemoryStore.js';
import { isDbConnected } from '../config/db.js';
import { ChatHistory, SymptomCheck } from '../models/schemas.js';

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  conversationId: z.string().optional(),
  history: z.array(z.any()).optional(),
});

const symptomCheckSchema = z.object({
  symptoms: z.preprocess(
    val => (typeof val === 'string' ? [val] : val),
    z.array(z.string()).min(1, 'Please provide at least one symptom')
  ),
  severity: z.string().optional(),
  duration: z.string().optional(),
  bodyArea: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export const handleChat = async (req, res) => {
  try {
    const { message, conversationId, history = [] } = chatSchema.parse(req.body);
    const userId = req.user ? req.user.id : 'anonymous';
    const aiResult = await generateChatResponse(message, history);

    // Save to chat history if user is authenticated
    let savedHistory;
    if (req.user) {
      const userMessage = {
        id: `msg-${Date.now()}-u`,
        sender: 'user',
        text: message,
        timestamp: new Date().toISOString(),
      };
      const assistantMessage = {
        id: `msg-${Date.now()}-a`,
        sender: 'assistant',
        text: aiResult.text,
        timestamp: new Date().toISOString(),
        suggestions: aiResult.suggestions,
      };

      if (isDbConnected()) {
        if (conversationId) {
          const existing = await ChatHistory.findOne({ id: conversationId, userId });
          if (existing) {
            existing.messages.push(userMessage, assistantMessage);
            existing.lastUpdated = new Date().toISOString();
            await existing.save();
            savedHistory = existing.toObject();
          }
        }
        if (!savedHistory) {
          const title = message.length > 35 ? message.substring(0, 32) + '...' : message;
          const newId =
            conversationId && !(await ChatHistory.findOne({ id: conversationId }))
              ? conversationId
              : `chat-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          const created = await ChatHistory.create({
            id: newId,
            userId,
            title,
            messages: [userMessage, assistantMessage],
            lastUpdated: new Date().toISOString(),
          });
          savedHistory = created.toObject();
        }
      } else {
        if (conversationId) {
          const existing = dbStore.findChatHistoryById(conversationId);
          if (existing && existing.userId === userId) {
            existing.messages.push(userMessage, assistantMessage);
            existing.lastUpdated = new Date().toISOString();
            savedHistory = dbStore.saveChatHistory(existing);
          }
        }
        if (!savedHistory) {
          const title = message.length > 35 ? message.substring(0, 32) + '...' : message;
          const newId =
            conversationId && !dbStore.findChatHistoryById(conversationId)
              ? conversationId
              : `chat-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          savedHistory = dbStore.saveChatHistory({
            id: newId,
            userId,
            title,
            messages: [userMessage, assistantMessage],
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    res.json({
      success: true,
      text: aiResult.text,
      suggestions: aiResult.suggestions,
      modelUsed: aiResult.modelUsed,
      conversationId: savedHistory ? savedHistory.id : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to process chat message' });
  }
};

export const handleChatStream = async (req, res) => {
  let isClientConnected = true;
  req.on('close', () => {
    isClientConnected = false;
  });

  try {
    const { message, conversationId, history = [] } = chatSchema.parse(req.body);
    const userId = req.user ? req.user.id : 'anonymous';

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (res.flushHeaders) res.flushHeaders();

    let fullText = '';
    for await (const chunk of generateChatResponseStream(message, history)) {
      if (!isClientConnected) break;
      fullText += chunk;
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    if (isClientConnected) {
      if (req.user && fullText) {
        const userMessage = {
          id: `msg-${Date.now()}-u`,
          sender: 'user',
          text: message,
          timestamp: new Date().toISOString(),
        };
        const assistantMessage = {
          id: `msg-${Date.now()}-a`,
          sender: 'assistant',
          text: fullText,
          timestamp: new Date().toISOString(),
        };

        if (isDbConnected()) {
          if (conversationId) {
            const existing = await ChatHistory.findOne({ id: conversationId, userId });
            if (existing) {
              existing.messages.push(userMessage, assistantMessage);
              existing.lastUpdated = new Date().toISOString();
              await existing.save();
            }
          } else {
            const title = message.length > 35 ? message.substring(0, 32) + '...' : message;
            const newId = `chat-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            await ChatHistory.create({
              id: newId,
              userId,
              title,
              messages: [userMessage, assistantMessage],
              lastUpdated: new Date().toISOString(),
            });
          }
        } else {
          if (conversationId) {
            const existing = dbStore.findChatHistoryById(conversationId);
            if (existing && existing.userId === userId) {
              existing.messages.push(userMessage, assistantMessage);
              existing.lastUpdated = new Date().toISOString();
              dbStore.saveChatHistory(existing);
            }
          } else {
            const title = message.length > 35 ? message.substring(0, 32) + '...' : message;
            const newId = `chat-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            dbStore.saveChatHistory({
              id: newId,
              userId,
              title,
              messages: [userMessage, assistantMessage],
              lastUpdated: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (error) {
    if (!res.headersSent) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: error.errors[0].message });
      }
      return res.status(500).json({ success: false, message: error.message || 'Stream failed' });
    }
    res.write(`event: error\ndata: ${JSON.stringify({ message: error.message || 'Stream error' })}\n\n`);
    res.end();
  }
};

export const handleSymptomCheck = async (req, res) => {
  try {
    const {
      symptoms,
      severity = 'Mild',
      duration = 'A few days',
      bodyArea,
      additionalNotes,
    } = symptomCheckSchema.parse(req.body);
    const userId = req.user ? req.user.id : 'guest-user';

    const result = await analyzeSymptoms(
      userId,
      symptoms,
      severity,
      duration,
      bodyArea,
      additionalNotes
    );

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error('Symptom check error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze symptoms' });
  }
};

export const getChatHistories = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  if (isDbConnected()) {
    try {
      const histories = await ChatHistory.find({ userId: req.user.id })
        .sort({ lastUpdated: -1 })
        .lean();
      return res.json({ success: true, histories });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch chat history' });
    }
  }

  const histories = dbStore.getChatHistoriesByUserId(req.user.id);
  res.json({ success: true, histories });
};

export const getSymptomHistories = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  if (isDbConnected()) {
    try {
      const records = await SymptomCheck.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .lean();
      return res.json({ success: true, records });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch symptom history' });
    }
  }

  const symptomRecords = dbStore.getSymptomChecksByUserId(req.user.id);
  res.json({ success: true, records: symptomRecords });
};

export const getAiStatus = async (_req, res) => {
  const status = getAiConfig();
  res.json({ success: true, config: status });
};

export const updateAiConfig = async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string') {
      res.status(400).json({ success: false, message: 'Valid API key is required' });
      return;
    }
    setApiKey(apiKey);
    res.json({
      success: true,
      message: 'Google Gemini API Key configured successfully! Live AI is now active.',
      config: getAiConfig(),
    });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: error.message || 'Failed to update API configuration' });
  }
};
