# Güler Yapı Proje

Bir inşaat/taşeronluk firması için geliştirdiğim, canlıda yayında olan kurumsal web sitesi: [gulerinsaat.org](https://gulerinsaat.org)

Proje portföyü, iletişim formu ve medya galerisi içeriyor.

## Teknolojiler

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Storage:** Cloudflare R2 (medya), statik JSON (proje verisi)
- **Mail:** Resend (iletişim formu)
- **Hosting:** Vercel
- **Form:** React Hook Form + Zod

## Mimari

- Proje verisi `data/projects.json` dosyasında (build-time'da yüklenir).
- Foto ve video Cloudflare R2'de; URL'ler `NEXT_PUBLIC_R2_URL` env'inden üretilir.
- İletişim formu mesajları DB'ye yazılmaz; doğrudan Resend ile maile gider.

## Kurulum

```bash
git clone <repo-url>
cd gulerinsaat.org
npm install
```

`.env.local` oluştur:

```env
NEXT_PUBLIC_R2_URL=https://media.gulerinsaat.org
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=re_xxx
```

```bash
npm run dev
```

Site http://localhost:3000 adresinde çalışır.

## Build & Deploy

```bash
npm run build
npm start
```

Vercel'e push edildiğinde auto-deploy tetiklenir. Production env'leri Vercel dashboard'da yönetilir.

## Proje Yapısı

```
├── app/
│   ├── (public)/components/   # Ana site bileşenleri
│   ├── api/contact/            # İletişim formu API
│   └── layout.tsx
├── data/projects.json          # Proje verisi (kaynak)
├── lib/
│   ├── projects.ts             # JSON → ProjectWithMedia
│   ├── types/                  # TS tipleri
│   └── utils.ts                # Helper fonksiyonlar
└── public/                     # Statik dosyalar
```

## İletişim

- **Website:** [gulerinsaat.org](https://gulerinsaat.org)
- **Email:** guleryapiproje@gmail.com
- **Telefon:** +90 532 437 22 64
- **Adres:** Havaalanı, Gülyüzü Sk. 36 A, 34230 Esenler/İstanbul
