import {
  generateChatResponse,
  analyzeSymptoms,
  setApiKey,
  getAiConfig,
} from '../services/aiService.js';
import { dbStore } from '../store/inMemoryStore.js';
export const handleChat = async (req, res) => {
  try {
    const { message, conversationId, history = [] } = req.body;
    const userId = req.user ? req.user.id : 'anonymous';
    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }
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
    res.json({
      success: true,
      text: aiResult.text,
      suggestions: aiResult.suggestions,
      modelUsed: aiResult.modelUsed,
      conversationId: savedHistory ? savedHistory.id : undefined,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to process chat message' });
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
    } = req.body;
    const userId = req.user ? req.user.id : 'guest-user';
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide at least one symptom' });
      return;
    }
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
    console.error('Symptom check error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze symptoms' });
  }
};
export const getChatHistories = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const histories = dbStore.getChatHistoriesByUserId(req.user.id);
  res.json({ success: true, histories });
};
export const getSymptomHistories = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
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
