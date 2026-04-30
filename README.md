# Hi Future — Мэргэжлийн зөвлөгөөний вэб

## Технологи
- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** — стайл
- **Nodemailer** — Gmail SMTP имэйл
- **Jose** — JWT admin auth
- **bcryptjs** — нууц үг hash
- **JSON файл** — хялбар storage (`data/submissions.json`)

## Хурдан эхлэх

### 1. Суулгах
```bash
npm install
```

### 2. .env.local үүсгэх
```bash
cp .env.example .env.local
```

`.env.local` файлд дараах утгуудыг оруулна:

```env
# Gmail App Password авах: Google Account → Security → 2FA → App passwords
GMAIL_USER=your@gmail.com
GMAIL_PASS=xxxx_xxxx_xxxx_xxxx

# Claude API (үр дүн генерацид)
ANTHROPIC_API_KEY=sk-ant-...

# Admin нууц үг hash үүсгэх:
#   node -e "const b=require('bcryptjs');console.log(b.hashSync('mynewpassword',10))"
ADMIN_PASSWORD_HASH=$2a$10$...

# Random 32+ тэмдэгт
JWT_SECRET=some_very_long_random_secret_string

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Ажиллуулах
```bash
npm run dev
```

Хаяг: http://localhost:3000

## Хуудасны бүтэц

| URL | Тайлбар |
|-----|---------|
| `/` | Landing page |
| `/student-form` | Сурагчийн форм |
| `/parent-form` | Эцэг эхийн форм |
| `/payment/[id]` | QPay төлбөр |
| `/result/[id]` | Үр дүн |
| `/admin` | Админ нэвтрэх |
| `/admin/dashboard` | Dashboard |
| `/admin/submissions` | Формуудын жагсаалт |

## Админ нэвтрэх

Анхдагч нууц үг: `admin123`

**Үйлдвэрлэлд заавал өөрчил:**
```bash
node -e "const b=require('bcryptjs');console.log(b.hashSync('шинэнуутүг',10))"
```
Гарсан hash-г `ADMIN_PASSWORD_HASH` env-д тохируул.

## QPay тохируулах

QPay тохируулаагүй үед **stub горим** ажилладаг:
- Хуурамч QR харагдана
- "Тест: Төлбөр баталгаажуулах" товч гарна
- Товчийг дарвал шууд үр дүн рүү шилждэг

**Бодит QPay:**
1. https://merchant.qpay.mn дээр бүртгүүл
2. `QPAY_USERNAME`, `QPAY_PASSWORD`, `QPAY_INVOICE_CODE` авна
3. `.env.local`-д тохируулна

## Claude API тохируулах

API key байхгүй үед **fallback зөвлөгөө** ашиглана.

**Бодит Claude:**
1. https://console.anthropic.com дээр бүртгүүл
2. API key авна
3. `ANTHROPIC_API_KEY=sk-ant-...` тохируулна

## Vercel-д deploy хийх

```bash
npm install -g vercel
vercel
```

⚠️ **Анхааруулга:** JSON файл storage нь Vercel-д **restart болгон устдаг**.
Байнгын хадгалалтын тулд Supabase/PlanetScale-тэй холбоно.

## Хавтасны бүтэц

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── student-form/page.tsx
│   ├── parent-form/page.tsx
│   ├── payment/[id]/page.tsx
│   ├── result/[id]/page.tsx
│   ├── admin/
│   │   ├── page.tsx                # Login
│   │   ├── dashboard/page.tsx
│   │   └── submissions/page.tsx
│   └── api/
│       ├── submit/route.ts
│       ├── payment/route.ts
│       ├── payment/check/route.ts
│       ├── payment/callback/route.ts
│       ├── result/route.ts
│       └── admin/...
├── components/form/FormWizard.tsx
├── lib/
│   ├── storage.ts    # JSON file storage
│   ├── auth.ts       # JWT admin auth
│   ├── email.ts      # Gmail SMTP
│   ├── claude.ts     # Claude API
│   ├── qpay.ts       # QPay (stub + real)
│   ├── questions.ts  # All form questions
│   └── stats.ts      # Admin statistics
└── types/index.ts
```
