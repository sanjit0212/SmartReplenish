import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, history, systemInstruction } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API Key is not configured on the server.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let responseText = '';

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction || "You are an AI assistant."
      });
      const chat = model.startChat({ history: history || [] });
      const result = await chat.sendMessage(message);
      responseText = result.response.text();
    } catch (e) {
      console.log('gemini-1.5-flash failed, fetching available models:', e.message);
      
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        const modelNames = data.models ? data.models.map(m => m.name) : 'No models returned';
        
        return res.status(500).json({ 
          error: 'Failed to communicate with AI', 
          details: `Model 404. Available models for your key: ${JSON.stringify(modelNames)}`
        });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to communicate with AI', details: 'Failed to fetch model list' });
      }
    }

    res.status(200).json({ text: responseText });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI', details: error.message });
  }
}
