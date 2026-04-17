export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { messages } = req.body;
  
  /**
   * SMART FALLBACK:
   * Works with both 'GOOGLE_API_KEY' and 'GEMINI_API_KEY' variable names on Vercel.
   */
  const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "Missing API Key on Vercel. Please add GOOGLE_API_KEY in Settings." });
  }

  // Format message history
  const userMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => {
      let parts = [];
      if (Array.isArray(m.content)) {
        parts = m.content;
      } else {
        parts = [{ text: m.content }];
      }
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts
      };
    });

  /**
   * THE "SOS RECORDS" MODEL NAME:
   * Since this repo is confirmed working for you, we use its specific model string.
   */
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: userMessages
      })
    });

    const data = await response.json();

    if (!response.ok) {
       console.error("API Error:", data);
       return res.status(500).json({ error: data.error?.message || "Google API Error" });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أستطع فهم ذلك.";
    res.status(200).json({ reply });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
