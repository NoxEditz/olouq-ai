/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          BADR AI — Core API Communication Module            ║
 * ║          Updated for Vercel Backend (No Key Required)       ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// 1. حافظنا على هويتك وشخصية المساعد هنا
export const SYSTEM_PROMPT = `أنت "بدر AI" - مساعد ذكاء اصطناعي متطور ومتخصص في المنهج المصري ومساعدة بدر وصحابه في الإنتاج الموسيقي (Mixing/Mastering/Lyrics).
بترد بالعامية المصرية وبطريقة ودودة جداً.`;

// 2. دالة الربط مع Vercel (بدل ما نكلم جوجل مباشرة من المتصفح)
export async function* streamChat({ messages }) {
  const response = await fetch('/api/server', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      messages, 
      system: SYSTEM_PROMPT 
    }),
  });

  if (!response.ok) throw new Error('فشل الاتصال بالسيرفر');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data:')) {
        try {
          const data = JSON.parse(line.substring(5));
          // استخراج النص من رد Gemini
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text;
        } catch (e) {
          console.error("Error parsing chunk", e);
        }
      }
    }
  }
}

// 3. تنظيم التخزين (شيلنا منها جزء الـ API Key لأنه ملوش لزمة دلوقتي)
export const Storage = {
  saveChats: arr  => { try { localStorage.setItem(`badr_chats`, JSON.stringify(arr.slice(-50))); } catch {} },
  loadChats: ()   => { try { return JSON.parse(localStorage.getItem(`badr_chats`) ?? '[]'); } catch { return []; } },
  clearAll:  ()   => { try { localStorage.clear(); } catch {} },
};