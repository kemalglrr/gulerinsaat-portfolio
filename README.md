# Güler Yapı Proje

Profesyonel inşaat ve taşeronluk hizmetleri portföy websitesi.

## 🚀 Teknolojiler

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL, Storage, Auth)
- **UI Bileşenleri:** Lucide React, Yet Another React Lightbox
- **Form Yönetimi:** React Hook Form + Zod
- **Drag & Drop:** @dnd-kit
- **Image Processing:** heic2any (HEIC to JPEG conversion)

## ✨ Özellikler

### Frontend (Public)
- 🏠 Modern ve responsive ana sayfa
- 📋 Hakkımızda bölümü
- 🏗️ Dinamik proje galerisi (fotoğraf ve video desteği)
- 📞 İletişim formu
- 📱 Mobil uyumlu tasarım
- 🎨 Corporate orange & gray teması

### Admin Panel
- 🔐 Güvenli giriş sistemi (Supabase Auth)
- ➕ Proje ekleme, düzenleme, silme
- 📸 Sürükle-bırak ile medya yükleme (HEIC, JPG, PNG, MP4, MOV, M4V)
- 🔄 Proje sıralaması (drag & drop)
- 👁️ Yayınlama/Taslak durumu
- 🖼️ Otomatik kapak fotoğrafı seçimi
- 📊 İstatistikler (toplam proje, yayınlanan)

## 📦 Kurulum

1. Depoyu klonlayın:
```bash
git clone https://github.com/YOUR_USERNAME/gulerinsaat.org.git
cd gulerinsaat.org
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Çevre değişkenlerini ayarlayın:
`.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Supabase veritabanını kurun:
`SUPABASE_SETUP.md` dosyasındaki talimatları takip edin.

5. Development sunucusunu başlatın:
```bash
npm run dev
```

Site http://localhost:3000 adresinde çalışacak.

## 🏗️ Build & Deploy

### Production Build
```bash
npm run build
npm start
```

### Vercel'e Deploy
1. Projeyi GitHub'a push edin
2. [Vercel Dashboard](https://vercel.com/new)'a gidin
3. Repository'yi import edin
4. Environment variables ekleyin
5. Deploy edin

## 📁 Proje Yapısı

```
├── app/
│   ├── (public)/          # Ana site (frontend)
│   │   └── components/    # Public bileşenler
│   ├── admin/             # Admin panel
│   │   ├── login/         # Giriş sayfası
│   │   └── dashboard/     # Dashboard ve proje yönetimi
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── lib/
│   ├── supabase/          # Supabase client & server
│   ├── types/             # TypeScript type tanımları
│   └── utils/             # Utility fonksiyonlar
└── public/                # Statik dosyalar (logo, favicon)
```

## 🔒 Güvenlik

- Admin paneli Supabase Auth ile korumalı
- RLS (Row Level Security) politikaları aktif
- Service Role Key sadece server-side kullanılıyor
- .env dosyaları Git'e commit edilmiyor

## 📝 Lisans

Private project - Güler Yapı Proje © 2025

## 🤝 İletişim

- **Website:** [gulerinsaat.org](https://gulerinsaat.org)
- **Email:** guleryapiproje@gmail.com
- **Telefon:** +90 532 437 22 64
- **Adres:** Havaalanı, Gülyüzü Sk. 36 A, 34230 Esenler/İstanbul
