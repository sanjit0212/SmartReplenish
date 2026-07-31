import { GoogleGenerativeAI } from '@google/generative-ai';

async function run() {
  const apiKey = "DUMMY_KEY";
  const genAI = new GoogleGenerativeAI(apiKey);
  let responseText = '';

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are an AI assistant."
    });
    const chat = model.startChat({ history: [] });
    // This will fail due to dummy key
    const result = await chat.sendMessage("test");
    responseText = result.response.text();
  } catch (e) {
    console.log('gemini-1.5-flash failed, falling back to gemini-pro. Error:', e.message);
    try {
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
      const fallbackChat = fallbackModel.startChat({ history: [] });
      // This will also fail due to dummy key
      const fallbackResult = await fallbackChat.sendMessage("test");
      responseText = fallbackResult.response.text();
    } catch (e2) {
      console.log('gemini-pro also failed:', e2.message);
    }
  }
}
run();
