# 🚀 دليل النشر الشامل - علوق الثانوية

## 📋 جدول المحتويات
1. [متطلبات ما قبل البدء](#متطلبات-ما-قبل-البدء)
2. [الحصول على مفاتيح API](#الحصول-على-مفاتيح-api)
3. [النشر على Vercel](#النشر-على-vercel)
4. [التكوين والإعدادات](#التكوين-والإعدادات)
5. [اختبار المشروع](#اختبار-المشروع)
6. [حل المشاكل الشائعة](#حل-المشاكل-الشائعة)

---

## 1️⃣ متطلبات ما قبل البدء

### ما تحتاجه:
- ✅ حساب GitHub (مجاني)
- ✅ حساب Vercel (مجاني)
- ✅ واحد على الأقل من مفاتيح API التالية:
  - Google Gemini API (موصى به - مجاني)
  - Groq API (موصى به - مجاني)
  - OpenRouter API (اختياري)
  - Together AI API (اختياري)

### الوقت المتوقع:
⏱️ **15-30 دقيقة** (للمرة الأولى)

---

## 2️⃣ الحصول على مفاتيح API

### 🔑 Google Gemini API (موصى به بشدة)

**لماذا Gemini؟**
- ✅ مجاني بحد سخي جداً (60 طلب/دقيقة)
- ✅ يدعم الصور (مهم لحل المسائل)
- ✅ سريع وموثوق
- ✅ نماذج متعددة متاحة

**خطوات الحصول على المفتاح:**

1. اذهب إلى: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

2. سجل الدخول بحساب Google الخاص بك

3. انقر على "Create API Key"

4. اختر "Create API key in new project" (أو استخدم مشروع موجود)

5. انسخ المفتاح وحفظه في مكان آمن

**مثال على المفتاح:**
```
AIzaSyAbc123XYZ...
```

**معدل الطلبات المجاني:**
- 60 طلب/دقيقة
- 1500 طلب/يوم
- كافي جداً لمئات الطلاب!

---

### ⚡ Groq API (موصى به للسرعة)

**لماذا Groq؟**
- ✅ أسرع استجابة في العالم (< 1 ثانية)
- ✅ مجاني بالكامل حالياً
- ✅ نماذج Llama 3 القوية
- ✅ موثوق جداً

**خطوات الحصول على المفتاح:**

1. اذهب إلى: [https://console.groq.com/keys](https://console.groq.com/keys)

2. انقر "Sign Up" أو "Sign In"

3. أكمل التسجيل (بريد إلكتروني فقط)

4. انقر "Create API Key"

5. اختر اسم للمفتاح (مثلاً: "Alouq Thanawya")

6. انسخ المفتاح

**مثال على المفتاح:**
```
gsk_abc123XYZ...
```

**معدل الطلبات المجاني:**
- 30 طلب/دقيقة (Llama 3.3 70B)
- 14,400 طلب/يوم

---

### 🌐 OpenRouter API (اختياري - للتنوع)

**لماذا OpenRouter؟**
- ✅ وصول لـ GPT-4, Claude, Gemma وأكثر
- ✅ نظام Credits (مجانية عند التسجيل)
- ✅ تنوع كبير في النماذج
- ✅ مفيد كاحتياطي إضافي

**خطوات الحصول على المفتاح:**

1. اذهب إلى: [https://openrouter.ai/keys](https://openrouter.ai/keys)

2. سجل حساب جديد

3. انقر "Create Key"

4. انسخ المفتاح

**ملاحظة:** OpenRouter يعطيك credits مجانية عند التسجيل، لكن سيحتاج لإضافة رصيد لاحقاً.

---

### 🤝 Together AI API (اختياري)

**لماذا Together؟**
- ✅ نماذج مفتوحة المصدر قوية
- ✅ Llama 405B, Qwen 2.5
- ✅ Credits مجانية عند التسجيل

**خطوات الحصول على المفتاح:**

1. اذهب إلى: [https://api.together.xyz/settings/api-keys](https://api.together.xyz/settings/api-keys)

2. سجل حساب جديد

3. انشئ API Key

4. انسخ المفتاح

---

## 3️⃣ النشر على Vercel

### الطريقة الأولى: من خلال GitHub (موصى بها)

#### الخطوة 1: رفع المشروع على GitHub

1. سجل الدخول إلى [GitHub](https://github.com)

2. انقر "New Repository"

3. اختر اسم للمستودع (مثلاً: `alouq-thanawya`)

4. اجعله Public أو Private (حسب رغبتك)

5. انقر "Create Repository"

6. ارفع ملفات المشروع:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Alouq Thanawya v2.0"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/alouq-thanawya.git
   git push -u origin main
   ```

#### الخطوة 2: ربط Vercel بـ GitHub

1. اذهب إلى [Vercel](https://vercel.com)

2. انقر "Sign Up" أو "Log In"

3. اختر "Continue with GitHub"

4. امنح Vercel الأذونات المطلوبة

#### الخطوة 3: استيراد المشروع

1. من لوحة تحكم Vercel، انقر "Add New Project"

2. اختر "Import Git Repository"

3. ابحث عن مستودع `alouq-thanawya` وانقر "Import"

4. **لا تضغط Deploy بعد!** - أولاً أضف متغيرات البيئة

#### الخطوة 4: إضافة متغيرات البيئة

في صفحة Import، قبل الضغط على Deploy:

1. افتح قسم "Environment Variables"

2. أضف المتغيرات التالية:

**المتغيرات المطلوبة (واحد على الأقل):**

| الاسم | القيمة | ملاحظات |
|------|--------|----------|
| `GEMINI_API_KEY` | مفتاح Gemini الخاص بك | موصى به |
| `GROQ_API_KEY` | مفتاح Groq الخاص بك | موصى به |
| `OPENROUTER_API_KEY` | مفتاح OpenRouter | اختياري |
| `TOGETHER_API_KEY` | مفتاح Together | اختياري |

**مثال:**
```
Name: GEMINI_API_KEY
Value: AIzaSyAbc123XYZ...
Environment: Production, Preview, Development (اختر الثلاثة)
```

3. كرر لكل مفتاح متوفر لديك

#### الخطوة 5: النشر

1. بعد إضافة المتغيرات، انقر "Deploy"

2. انتظر 1-2 دقيقة حتى يكتمل النشر

3. ستظهر رسالة "Congratulations!" عند النجاح

4. انقر على رابط الموقع لفتحه

---

### الطريقة الثانية: من خلال Vercel CLI

إذا كنت مطور وتفضل سطر الأوامر:

```bash
# تثبيت Vercel CLI
npm install -g vercel

# تسجيل الدخول
vercel login

# نشر المشروع
vercel

# إضافة متغيرات البيئة
vercel env add GEMINI_API_KEY
# أدخل القيمة عندما يُطلب منك
# كرر لكل مفتاح

# نشر إنتاجي
vercel --prod
```

---

## 4️⃣ التكوين والإعدادات

### إعدادات Vercel الموصى بها

1. **Build Settings**
   - Framework Preset: Other
   - Build Command: (اتركه فارغاً)
   - Output Directory: (اتركه فارغاً)

2. **Function Settings**
   - Region: Washington, D.C., USA (اختر الأقرب لمصر)
   - Max Duration: 10s (قد تحتاج لزيادة في الخطة المدفوعة)

3. **Environment Variables**
   - تأكد من إضافة المتغيرات للبيئات الثلاث:
     - Production ✅
     - Preview ✅
     - Development ✅

### تخصيص النطاق (اختياري)

1. في لوحة تحكم Vercel، اذهب إلى Settings > Domains

2. أضف نطاقك المخصص:
   ```
   alouq-thanawya.com
   www.alouq-thanawya.com
   ```

3. اتبع التعليمات لتوجيه DNS

4. انتظر التحقق (قد يستغرق 24-48 ساعة)

---

## 5️⃣ اختبار المشروع

### اختبارات أساسية:

#### ✅ اختبار المحادثة الأساسية

1. افتح الموقع
2. اسحب شريط "اسحب للبدء"
3. اكتب سؤال بسيط: "مرحباً، من أنت؟"
4. انتظر الرد (يجب أن يرد خلال 1-3 ثوان)

**الرد المتوقع:** رد بالعامية المصرية يعرّف نفسه كـ "علوق الثانوية"

#### ✅ اختبار رفع الصور

1. انقر زر "رفع صورة" (🖼️)
2. ارفع صورة مسألة رياضية أو فيزيائية
3. اكتب: "حل هذه المسألة"
4. انتظر التحليل والرد

**ملاحظة:** يحتاج مفتاح Gemini لهذا الاختبار

#### ✅ اختبار الأدوات

1. انقر زر "الأدوات" (🛠️)
2. جرب فتح:
   - الآلة الحاسبة
   - مؤقت بومودورو
   - متابعة التقدم

**المتوقع:** جميع الأدوات تفتح بسلاسة

#### ✅ اختبار الوضع الصوتي

1. انقر زر "صوتي" (🎤)
2. امنح الموقع إذن الميكروفون
3. تكلم بسؤال
4. انتظر التحليل والرد

**ملاحظة:** يعمل فقط على HTTPS (Vercel توفر HTTPS تلقائياً)

#### ✅ اختبار التخزين المحلي

1. أنشئ محادثة جديدة
2. اكتب عدة رسائل
3. أغلق المتصفح
4. افتح الموقع مرة أخرى

**المتوقع:** جميع المحادثات والرسائل موجودة

---

## 6️⃣ حل المشاكل الشائعة

### ❌ المشكلة: "لا يمكن التواصل مع الذكاء الاصطناعي"

**الأسباب المحتملة:**
1. لم تضف أي مفتاح API
2. المفتاح خاطئ أو منتهي
3. وصلت لحد الطلبات
4. مشكلة في الشبكة

**الحلول:**
```bash
# 1. تحقق من وجود المتغيرات
# في Vercel Dashboard > Settings > Environment Variables
# يجب أن ترى واحد على الأقل من:
# - GEMINI_API_KEY
# - GROQ_API_KEY

# 2. تحقق من صحة المفاتيح
# جرب المفتاح في موقع المزود نفسه

# 3. انتظر دقيقة وحاول مرة أخرى

# 4. افتح Developer Console (F12) وابحث عن أخطاء
```

---

### ❌ المشكلة: "429 - Too Many Requests"

**السبب:** وصلت لحد 30 طلب/دقيقة

**الحل:**
```
- انتظر 60 ثانية
- أضف المزيد من مفاتيح API لتوزيع الحمل
- راجع إعدادات معدل الطلبات في server.js
```

---

### ❌ المشكلة: الصور لا تُحلل

**السبب:** تحتاج مفتاح Gemini (الوحيد الذي يدعم الصور)

**الحل:**
```bash
# تأكد من إضافة:
GEMINI_API_KEY=your_key_here
```

---

### ❌ المشكلة: الوضع الصوتي لا يعمل

**الأسباب المحتملة:**
1. الموقع ليس على HTTPS
2. لم تمنح إذن الميكروفون
3. متصفح غير مدعوم

**الحلول:**
```
1. Vercel توفر HTTPS تلقائياً - تأكد من الرابط يبدأ بـ https://
2. اضغط "Allow" عند طلب إذن الميكروفون
3. استخدم Chrome أو Edge (موصى بهما)
```

---

### ❌ المشكلة: Build فشل على Vercel

**السبب الشائع:** ملفات ناقصة أو خطأ في التكوين

**الحل:**
```bash
# تحقق من وجود الملفات المطلوبة:
✅ index.html
✅ api/server.js
✅ package.json
✅ vercel.json

# تحقق من package.json:
{
  "name": "alouq-althanawya",
  "version": "2.0.0",
  ...
}

# تحقق من vercel.json:
{
  "version": 2,
  "builds": [...],
  "routes": [...]
}
```

---

### ❌ المشكلة: "Cannot find module"

**السبب:** ملف مفقود أو مسار خاطئ

**الحل:**
```bash
# تأكد من البنية الصحيحة:
project/
├── index.html
├── api/
│   └── server.js
├── package.json
└── vercel.json

# تأكد من المسارات في vercel.json:
"src": "api/server.js" ✅
"src": "server.js" ❌ (خطأ)
```

---

## 📊 مراقبة الأداء

### Vercel Analytics (مجاني)

1. في Vercel Dashboard، انقر "Analytics"
2. شاهد:
   - عدد الزيارات
   - أوقات التحميل
   - معدلات الخطأ

### الأخطاء والسجلات

1. انقر "Functions" في Vercel Dashboard
2. اختر `api/server.js`
3. شاهد السجلات في الوقت الفعلي
4. ابحث عن أخطاء وأصلحها

---

## 🎯 نصائح للأداء الأمثل

### 1. استخدم عدة مفاتيح API
```bash
# ✅ الأفضل (جميع المفاتيح)
GEMINI_API_KEY=...
GROQ_API_KEY=...
OPENROUTER_API_KEY=...
TOGETHER_API_KEY=...

# ⚠️ جيد (2 مفاتيح)
GEMINI_API_KEY=...
GROQ_API_KEY=...

# ❌ مقبول (مفتاح واحد - قد يتوقف أحياناً)
GEMINI_API_KEY=...
```

### 2. مراقبة الاستخدام
- Gemini: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- Groq: [https://console.groq.com/](https://console.groq.com/)

### 3. تحسين التحميل
```javascript
// صور محسّنة
// استخدم WebP بدلاً من PNG/JPG حيث ممكن

// تحميل lazy للصور
<img loading="lazy" src="..." />
```

### 4. نسخ احتياطية
```bash
# اعمل backup للمتغيرات
vercel env pull .env.backup

# اعمل backup للكود
git tag v2.0.0
git push --tags
```

---

## 🔄 التحديثات المستقبلية

### كيفية التحديث:

```bash
# 1. جلب التحديثات
git pull origin main

# 2. اختبار محلياً
vercel dev

# 3. نشر التحديث
git push origin main
# Vercel ينشر تلقائياً!
```

---

## 📞 الدعم والمساعدة

### الحصول على المساعدة:
1. 📖 اقرأ [README.md](README.md)
2. 🔍 ابحث في [Issues](https://github.com/your-repo/issues)
3. 💬 افتح Issue جديد
4. 📧 راسلنا على: support@alouq.com

### موارد مفيدة:
- [Vercel Documentation](https://vercel.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Groq Documentation](https://console.groq.com/docs)

---

<div dir="rtl" align="center">

## 🎉 مبروك! موقعك جاهز الآن!

**الخطوات التالية:**
1. ✅ شارك الرابط مع الطلاب
2. ✅ راقب الأداء والأخطاء
3. ✅ جمّع ملاحظات المستخدمين
4. ✅ حدّث وحسّن باستمرار

**🚀 بالتوفيق في مساعدة طلاب الثانوية!**

</div>
