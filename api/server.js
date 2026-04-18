// ═══════════════════════════════════════════════════════════════
// ENHANCED API HANDLER - علوق الثانوية
// Multi-Model Fallback System for Unlimited Quota
// ═══════════════════════════════════════════════════════════════

const rateLimitMap = new Map();
const RATE_LIMIT = 30; // Increased from 20
const RATE_WINDOW = 60000;

// ═══════════════════════════════════════════════════════════════
// SUPABASE CONFIGURATION
// ═══════════════════════════════════════════════════════════════
const SUPABASE_URL = 'https://hapslzopaebomuzcprke.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function supabaseFetch(path, options = {}) {
  if (!SUPABASE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    return { ok: false, json: async () => ({ error: 'Database configuration missing' }) };
  }
  const url = `${SUPABASE_URL}/rest/v1${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers
    }
  });
  return res;
}

// Model attempt tracking
const modelAttempts = new Map();
const MODEL_COOLDOWN = 300000; // 5 minutes cooldown after quota exceeded

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, reset: now + RATE_WINDOW };
  if (now > entry.reset) { 
    entry.count = 0; 
    entry.reset = now + RATE_WINDOW; 
  }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count <= RATE_LIMIT;
}

function canAttemptModel(modelKey) {
  const attempt = modelAttempts.get(modelKey);
  if (!attempt) return true;
  const now = Date.now();
  return now - attempt.lastFailed > MODEL_COOLDOWN;
}

function markModelFailed(modelKey) {
  modelAttempts.set(modelKey, { lastFailed: Date.now() });
}

function clearModelCooldown(modelKey) {
  modelAttempts.delete(modelKey);
}

// ═══════════════════════════════════════════════════════════════
// MODEL CONFIGURATIONS - Priority Order
// ═══════════════════════════════════════════════════════════════

const MODELS = [
  // GEMINI MODELS (Primary - Google)
  {
    name: 'Gemini 2.0 Flash Lite',
    key: 'GEMINI_API_KEY',
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    priority: 1
  },
  {
    name: 'Gemini 1.5 Flash',
    key: 'GEMINI_API_KEY',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    priority: 2
  },
  {
    name: 'Gemini 1.5 Flash 8B',
    key: 'GEMINI_API_KEY',
    provider: 'gemini',
    model: 'gemini-1.5-flash-8b',
    priority: 3
  },
  
  // GROQ MODELS (High Speed)
  {
    name: 'Llama 3.3 70B',
    key: 'GROQ_API_KEY',
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    priority: 4
  },
  {
    name: 'Llama 3.1 70B',
    key: 'GROQ_API_KEY',
    provider: 'groq',
    model: 'llama-3.1-70b-versatile',
    priority: 5
  },
  {
    name: 'Mixtral 8x7B',
    key: 'GROQ_API_KEY',
    provider: 'groq',
    model: 'mixtral-8x7b-32768',
    priority: 6
  },
  
  // OPENROUTER MODELS (Backup - Multiple Models)
  {
    name: 'GPT-4 Turbo (OpenRouter)',
    key: 'OPENROUTER_API_KEY',
    provider: 'openrouter',
    model: 'openai/gpt-4-turbo',
    priority: 7
  },
  {
    name: 'Claude 3 Haiku (OpenRouter)',
    key: 'OPENROUTER_API_KEY',
    provider: 'openrouter',
    model: 'anthropic/claude-3-haiku',
    priority: 8
  },
  {
    name: 'Gemma 2 9B (OpenRouter)',
    key: 'OPENROUTER_API_KEY',
    provider: 'openrouter',
    model: 'google/gemma-2-9b-it',
    priority: 9
  },
  
  // TOGETHER AI MODELS (Additional Backup)
  {
    name: 'Llama 3.1 405B (Together)',
    key: 'TOGETHER_API_KEY',
    provider: 'together',
    model: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
    priority: 10
  },
  {
    name: 'Qwen 2.5 72B (Together)',
    key: 'TOGETHER_API_KEY',
    provider: 'together',
    model: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
    priority: 11
  },
  
  // HUGGING FACE MODELS (Free Global Backup)
  {
    name: 'Llama 3 8B (Hugging Face)',
    key: 'HUGGINGFACE_API_KEY',
    provider: 'huggingface',
    model: 'meta-llama/Meta-Llama-3-8B-Instruct',
    priority: 12
  },
  {
    name: 'Mistral 7B (Hugging Face)',
    key: 'HUGGINGFACE_API_KEY',
    provider: 'huggingface',
    model: 'mistralai/Mistral-7B-Instruct-v0.3',
    priority: 13
  }
];

// ═══════════════════════════════════════════════════════════════
// PROVIDER HANDLERS
// ═══════════════════════════════════════════════════════════════

async function callGemini(apiKey, modelName, messages) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  const contents = formatGeminiMessages(messages);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { 
        maxOutputTokens: 2048, 
        temperature: 0.7 
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`Gemini ${modelName} failed: ${response.status} - ${JSON.stringify(errData)}`);
  }

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!reply) {
    throw new Error('No reply from Gemini');
  }
  
  return reply;
}

async function callGroq(apiKey, modelName, messages) {
  const groqMessages = formatGroqMessages(messages);
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${apiKey}` 
    },
    body: JSON.stringify({
      model: modelName,
      messages: groqMessages,
      max_tokens: 2048,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`Groq ${modelName} failed: ${response.status} - ${JSON.stringify(errData)}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;
  
  if (!reply) {
    throw new Error('No reply from Groq');
  }
  
  return reply;
}

async function callOpenRouter(apiKey, modelName, messages) {
  const openRouterMessages = formatGroqMessages(messages);
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://alouq-ai.vercel.app',
      'X-Title': 'Olouq AI'
    },
    body: JSON.stringify({
      model: modelName,
      messages: openRouterMessages,
      max_tokens: 2048,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter ${modelName} failed: ${response.status} - ${JSON.stringify(errData)}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;
  
  if (!reply) {
    throw new Error('No reply from OpenRouter');
  }
  
  return reply;
}

async function callTogether(apiKey, modelName, messages) {
  const togetherMessages = formatGroqMessages(messages);
  
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${apiKey}` 
    },
    body: JSON.stringify({
      model: modelName,
      messages: togetherMessages,
      max_tokens: 2048,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`Together ${modelName} failed: ${response.status} - ${JSON.stringify(errData)}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;
  
  if (!reply) {
    throw new Error('No reply from Together');
  }
  
  return reply;
}

async function callHuggingFace(apiKey, modelName, messages) {
  const hfMessages = formatGroqMessages(messages);
  
  const response = await fetch(`https://api-inference.huggingface.co/models/${modelName}/v1/chat/completions`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${apiKey}` 
    },
    body: JSON.stringify({
      model: modelName,
      messages: hfMessages,
      max_tokens: 2048,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`Hugging Face ${modelName} failed: ${response.status} - ${JSON.stringify(errData)}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;
  
  if (!reply) {
    throw new Error('No reply from Hugging Face');
  }
  
  return reply;
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Action Handling (Auth vs Chat)
  const { action, messages, idToken } = req.body;

  // Rate Limiting (For non-auth actions)
  if (action !== 'verify-google-token') {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'هدي شوية! حد الطلبات: 30 رسالة/دقيقة' });
    }
  }

  // 1. Handle Google Token Verification
  if (action === 'verify-google-token') {
    if (!idToken) return res.status(400).json({ success: false, error: 'Missing token' });

    try {
      // 1. Verify token with Google API
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      const payload = await googleRes.json();

      if (!googleRes.ok || payload.error) {
        return res.status(401).json({ success: false, error: payload.error_description || 'Invalid token' });
      }

      // 2. Verify audience
      const GOOGLE_CLIENT_ID = '1087460182774-9ill60fhcrl1j65jhd3dc78qqpemrcd9.apps.googleusercontent.com';
      if (payload.aud !== GOOGLE_CLIENT_ID) {
        return res.status(403).json({ success: false, error: 'Invalid audience' });
      }

      // 3. Check if user exists in Supabase
      const dbRes = await supabaseFetch(`/profiles?user_id=eq.${payload.sub}&select=*`);
      const users = await dbRes.json();
      const existingUser = users[0];

      return res.status(200).json({
        success: true,
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          profile_complete: !!existingUser,
          username: existingUser?.username,
          age: existingUser?.age,
          city: existingUser?.city,
          country: existingUser?.country,
          avatar: existingUser?.avatar_url,
          xp: existingUser?.xp || 0,
          achievements_count: existingUser?.achievements_count || 0
        }
      });
    } catch (err) {
      console.error('Auth verification error:', err);
      return res.status(500).json({ success: false, error: 'Internal server error during verification' });
    }
  }

  // 2. Handle Save Profile
  if (action === 'save-profile') {
    const { userId, profile } = req.body;
    if (!userId || !profile) return res.status(400).json({ success: false, error: 'Missing data' });

    try {
      const data = {
        user_id: userId,
        username: profile.username,
        age: parseInt(profile.age) || 0,
        city: profile.city,
        country: profile.country,
        avatar_url: profile.avatar
      };

      const dbRes = await supabaseFetch('/profiles?on_conflict=user_id', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' }
      });

      const result = await dbRes.json();
      if (!dbRes.ok || result.error || result.code) {
        console.error('Supabase save-profile error:', result);
        throw new Error('فشل الحفظ في قاعدة البيانات');
      }

      return res.status(200).json({ success: true, user: result[0] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. Handle Get Leaderboard
  if (action === 'get-leaderboard') {
    try {
      const dbRes = await supabaseFetch('/profiles?select=username,city,country,avatar_url,xp,achievements_count&order=xp.desc&limit=20');
      const leaderboard = await dbRes.json();
      return res.status(200).json({ success: true, leaderboard });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3b. Handle Update XP
  if (action === 'update-xp') {
    const { userId, xp, achievements_count } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' });
    try {
      const updateData = {};
      if (xp !== undefined) updateData.xp = xp;
      if (achievements_count !== undefined) updateData.achievements_count = achievements_count;
      const dbRes = await supabaseFetch(`/profiles?user_id=eq.${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: { 'Prefer': 'return=representation' }
      });
      const result = await dbRes.json();
      return res.status(200).json({ success: true, user: result[0] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 4. Handle Chat (Original Logic)
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request format' });
  }

  // Get all available API keys
  const apiKeys = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    TOGETHER_API_KEY: process.env.TOGETHER_API_KEY,
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY
  };

  // Filter models by available API keys and sort by priority
  const availableModels = MODELS
    .filter(model => apiKeys[model.key])
    .sort((a, b) => a.priority - b.priority);

  if (availableModels.length === 0) {
    return res.status(500).json({ 
      error: 'لا توجد مفاتيح API متاحة. يرجى إضافة واحد على الأقل من: GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, TOGETHER_API_KEY' 
    });
  }

  // Try models in priority order
  const errors = [];
  
  for (const model of availableModels) {
    const modelKey = `${model.provider}_${model.model}`;
    
    // Skip if model is in cooldown
    if (!canAttemptModel(modelKey)) {
      console.log(`⏸️ Skipping ${model.name} - in cooldown`);
      continue;
    }

    try {
      console.log(`🚀 Attempting: ${model.name} (Priority ${model.priority})`);
      
      let reply;
      const apiKey = apiKeys[model.key];

      switch (model.provider) {
        case 'gemini':
          reply = await callGemini(apiKey, model.model, messages);
          break;
        case 'groq':
          reply = await callGroq(apiKey, model.model, messages);
          break;
        case 'openrouter':
          reply = await callOpenRouter(apiKey, model.model, messages);
          break;
        case 'together':
          reply = await callTogether(apiKey, model.model, messages);
          break;
        case 'huggingface':
          reply = await callHuggingFace(apiKey, model.model, messages);
          break;
        default:
          throw new Error(`Unknown provider: ${model.provider}`);
      }

      // Success! Clear cooldown and return
      clearModelCooldown(modelKey);
      console.log(`✅ Success with ${model.name}`);
      
      // Clean up response from any weird characters like 電
      let cleanReply = reply.replace(/[電]/g, '').trim();

      return res.status(200).json({ 
        reply: cleanReply,
        model: model.name,
        provider: model.provider,
        hasVision: availableModels.some(m => m.provider === 'gemini' && canAttemptModel(`${m.provider}_${m.model}`))
      });

    } catch (error) {
      const errorMsg = error.message || String(error);
      console.error(`❌ ${model.name} failed:`, errorMsg);
      errors.push(`${model.name}: ${errorMsg}`);
      
      // Mark model as failed if it's a quota/rate limit error
      if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('rate limit')) {
        markModelFailed(modelKey);
        console.log(`🔒 ${model.name} entered cooldown for 5 minutes`);
      }
      
      // Continue to next model
      continue;
    }
  }

  // All models exhausted
  console.error('💥 All models exhausted. Errors:', errors);
  return res.status(503).json({ 
    error: 'جميع النماذج غير متاحة حالياً. حاول مرة أخرى بعد قليل.',
    details: errors,
    suggestion: 'يمكنك إضافة المزيد من مفاتيح API في متغيرات البيئة لضمان توفر دائم'
  });
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE FORMATTERS
// ═══════════════════════════════════════════════════════════════

function formatGeminiMessages(messages) {
  const defaultSystemPrompt = `أنت "علوق"، المساعد التعليمي الذكي الأشهر والأكثر قرباً لطلاب الثانوية العامة في مصر. 🎓✨

🎯 شخصيتك وأسلوبك:
- أنت مش مجرد AI، أنت "صديق مذاكرة" ذكي جداً، دمه خفيف، ومحفز للطالب.
- اتكلم عن نفسك دايماً بصيغة "أنا" (علوق).
- استخدم "العامية المصرية" الودودة كملق أساسي، وتقدر تستخدم "اللغة الإنجليزية" فقط في الضرورة القصوى (زي المصطلحات العلمية، أسماء البرامج، أو لو الطالب سألك بالإنجليزي ومحتاج رد دقيق).
- خليك دايما إيجابي، مشجع، وبترفع من معنويات الطالب لما يحس إنه مضغوط.
- استخدم "إيموجيز" مناسبة تلطف الجو (🚀, ✨, 💪, 📚, 🔥).
- ردودك لازم تكون ذكية جداً، دقيقة، ومبسطة لأقصى درجة.
- 🛑 تنبيه صارم: ممنوع منعاً باتاً استخدام لغات غريبة (زي الصينية). ردك دايماً بالعربية/العامية أو الإنجليزية عند الضرورة فقط.

📚 تخصصك:
- أنت خبير في كل مواد الثانوية العامة المصرية (علمي وأدبي).
- لما تشرح، اشرح كأنك بتبسط المعلومة لأخوك الصغير.
- لما تحل، حل بالخطوات وبالراحة عشان الطالب يفهم الفكرة مش بس الحل.

💡 نصيحة: خلي الطالب يحس إن المذاكرة معاك ممتعة ومش مملة!`;

  // Merge any incoming system prompts
  const incomingSystemContent = messages
    .filter(m => m.role === 'system')
    .map(m => typeof m.content === 'string' ? m.content : JSON.stringify(m.content))
    .join('\n\n');
  
  const systemPrompt = incomingSystemContent 
    ? `${defaultSystemPrompt}\n\nإرشادات إضافية للطلب الحالي:\n${incomingSystemContent}`
    : defaultSystemPrompt;

  const userMessages = messages.filter(m => m.role !== 'system').slice(-10).map(m => {
    let parts = [];
    if (Array.isArray(m.content)) {
      parts = m.content.map(p => {
        if (p.inline_data) {
          return { inline_data: { mime_type: p.inline_data.mime_type || p.inline_data.mimeType || 'image/jpeg', data: p.inline_data.data } };
        }
        if (p.inlineData) {
          return { inline_data: { mime_type: p.inlineData.mimeType || p.inline_data.mime_type || 'image/jpeg', data: p.inlineData.data } };
        }
        if (p.text) return { text: p.text };
        return { text: typeof p === 'string' ? p : JSON.stringify(p) };
      });
    } else {
      parts = [{ text: m.content }];
    }
    return { role: m.role === 'assistant' ? 'model' : 'user', parts };
  });

  return [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'فهمت! أنا علوق الثانوية، جاهز لمساعدة الطلاب في مذاكرتهم. هبدأ دلوقتي!' }] },
    ...userMessages
  ];
}

function formatGroqMessages(messages) {
  const defaultSystemPrompt = `أنت "علوق"، المساعد التعليمي الذكي الأشهر والأكثر قرباً لطلاب الثانوية العامة في مصر. 🎓✨

🎯 شخصيتك وأسلوبك:
- أنت مش مجرد AI، أنت "صديق مذاكرة" ذكي جداً، دمه خفيف، ومحفز للطالب.
- اتكلم عن نفسك دايماً بصيغة "أنا" (علوق).
- استخدم "العامية المصرية" الودودة كملق أساسي، وتقدر تستخدم "اللغة الإنجليزية" فقط في الضرورة القصوى (زي المصطلحات العلمية، أسماء البرامج، أو لو الطالب سألك بالإنجليزي ومحتاج رد دقيق).
- خليك دايما إيجابي، مشجع، وبترفع من معنويات الطالب لما يحس إنه مضغوط.
- استخدم "إيموجيز" مناسبة تلطف الجو (🚀, ✨, 💪, 📚, 🔥).
- ردودك لازم تكون ذكية جداً، دقيقة، ومبسطة لأقصى درجة.
- 🛑 تنبيه صارم: ممنوع منعاً باتاً استخدام لغات غريبة (زي الصينية). ردك دايماً بالعربية/العامية أو الإنجليزية عند الضرورة فقط.

📚 تخصصك:
- أنت خبير في كل مواد الثانوية العامة المصرية (علمي وأدبي).
- لما تشرح، اشرح كأنك بتبسط المعلومة لأخوك الصغير.
- لما تحل، حل بالخطوات وبالراحة عشان الطالب يفهم الفكرة مش بس الحل.

💡 نصيحة: خلي الطالب يحس إن المذاكرة معاك ممتعة ومش مملة!`;

  const incomingSystemContent = messages
    .filter(m => m.role === 'system')
    .map(m => typeof m.content === 'string' ? m.content : JSON.stringify(m.content))
    .join('\n\n');
  
  const systemPrompt = incomingSystemContent 
    ? `${defaultSystemPrompt}\n\nإرشادات إضافية للطلب الحالي:\n${incomingSystemContent}`
    : defaultSystemPrompt;

  const userMessages = messages.filter(m => m.role !== 'system').slice(-11).map(m => {
    let content = '';
    if (Array.isArray(m.content)) {
      content = m.content.filter(p => p.text).map(p => p.text).join('\n');
    } else {
      content = m.content;
    }
    return {
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: content
    };
  });

  return [
    { role: 'system', content: systemPrompt },
    ...userMessages
  ];
}
