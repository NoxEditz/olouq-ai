// Simple in-memory rate limiter: max 10 requests per minute per IP
const rateLimitMap = new Map();
const RATE_LIMIT = 10;      // max requests
const RATE_WINDOW = 60000;  // per 60 seconds

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, reset: now + RATE_WINDOW };
  
  // Reset window if expired
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + RATE_WINDOW;
  }
  
  entry.count++;
  rateLimitMap.set(ip, entry);
  
  return entry.count <= RATE_LIMIT;
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  // Rate Limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ 
      error: "تجاوزت الحد المسموح به (10 رسائل/دقيقة). انتظر قليلاً وحاول تاني." 
    });
  }

  const { messages } = req.body;
  const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "Missing API Key on Vercel." });
  }

  // Safety check
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Invalid messages format." });
  }

  // Format message history (already limited on frontend, double-check here)
  const userMessages = messages
    .filter(m => m.role !== 'system')
    .slice(-12) // Max 12 messages in history = controls token usage
    .map(m => {
      let parts = [];
      if (Array.isArray(m.content)) {
        // Normalize any camelCase from frontend to snake_case for the API
        parts = m.content.map(p => {
          if (p.inlineData) {
            return { inline_data: { mime_type: p.inlineData.mimeType, data: p.inlineData.data } };
          }
          if (p.inline_data) {
            return { inline_data: { mime_type: p.inline_data.mime_type || p.inline_data.mimeType, data: p.inline_data.data } };
          }
          return p;
        });
      } else {
        parts = [{ text: m.content }];
      }
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts
      };
    });

  // Inject personality as first message (context without system_instruction)
  const contents = [
    { role: 'user', parts: [{ text: `Instruction: أنت علوق النخل - مساعد ذكاء اصطناعي مصري متخصص في شرح الكود والثانوية العامة. رد بالعامية المصرية دايماً بشكل ودود ومختصر.` }] },
    { role: 'model', parts: [{ text: "فهمتك تماماً! أنا علوق النخل، جاهز أساعدك بالعامية المصرية. اتفضل اسألني في أي حاجة." }] },
    ...userMessages
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 600,  // Shorter answers = less quota used
          temperature: 0.85,
          topP: 0.9
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || "Google API Error";
      // Friendly quota error message
      if (errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({ 
          error: "الـ API Quota خلص للحظة. انتظر دقيقة وحاول تاني." 
        });
      }
      console.error("API Error:", data);
      return res.status(500).json({ error: errMsg });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أستطع فهم ذلك.";
    res.status(200).json({ reply });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
