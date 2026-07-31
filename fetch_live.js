async function testLiveApi() {
  const url = 'https://smart-replenish.vercel.app/api/chat';
  try {
    console.log(`Sending POST to ${url}...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Hello",
        history: [
          { role: "user", parts: [{ text: "Hello" }] },
          { role: "model", parts: [{ text: "Hello! I'm your SmartReplenish AI Assistant. I have analyzed your dataset. How can I help you?" }] }
        ],
        systemInstruction: "You are an AI assistant."
      })
    });
    
    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Body: ${text}`);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
testLiveApi();
