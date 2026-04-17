export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { messages } = await req.json();
  const key = process.env.GOOGLE_API_KEY;
  
  if (!key) return new Response(JSON.stringify({ error: 'Missing GOOGLE_API_KEY in Vercel' }), { status: 500 });

  // Gemini doesn't support 'system' role in the contents array. 
  // We filter it out and rely on the model understanding context, 
  // or you can prepend it to the first user message if needed.
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  return new Response(response.body, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
