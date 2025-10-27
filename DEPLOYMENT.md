# 🚀 Vercel Deployment & Domain Setup Rehberi

Bu rehber, **Güler İnşaat** websitesini **Vercel**'de deploy etme ve **gulerinsaat.org** domainini bağlama adımlarını içerir.

---

## 📋 Gereksinimler

- ✅ GitHub hesabı (repo push edilmiş olmalı)
- ✅ Vercel hesabı ([vercel.com](https://vercel.com))
- ✅ Supabase projesi (database + storage kurulu)
- ✅ gulerinsaat.org domain erişimi

---

## 1️⃣ GitHub'a Push

### 1.1. Git Repo Oluşturun

\`\`\`bash
cd /Users/kemalglrr/Desktop/gulerinsaat.org

# Git başlat
git init

# .gitignore kontrolü (.env.local, .next, node_modules gitignore'da olmalı)
cat .gitignore

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit - Güler İnşaat Portfolio"
\`\`\`

### 1.2. GitHub Repo Oluşturun

1. [GitHub](https://github.com) → "New Repository"
2. Repo adı: \`gulerinsaat-portfolio\` (veya istediğiniz isim)
3. Private/Public seçin
4. "Create repository"

### 1.3. Remote Ekle ve Push

\`\`\`bash
# Remote ekle (repo URL'inizi kullanın)
git remote add origin https://github.com/USERNAME/gulerinsaat-portfolio.git

# Push
git branch -M main
git push -u origin main
\`\`\`

---

## 2️⃣ Vercel'e Deploy

### 2.1. Vercel Hesabı Oluşturun

1. [vercel.com](https://vercel.com) → "Sign Up"
2. "Continue with GitHub" ile GitHub hesabınızla bağlanın
3. Vercel'e GitHub repo erişim izni verin

### 2.2. Projeyi Import Edin

1. Vercel Dashboard → "Add New" → "Project"
2. GitHub repo listesinden \`gulerinsaat-portfolio\` seçin
3. "Import" tıklayın

### 2.3. Build Settings (Otomatik Algılanır)

Vercel Next.js projesini otomatik algılar:

\`\`\`
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
\`\`\`

**✅ Değiştirmeyin, default ayarlar yeterli.**

### 2.4. Environment Variables Ekleyin

**ÖNEMLİ:** Deploy etmeden önce environment variables ekleyin!

Vercel Dashboard → Settings → Environment Variables:

| Key | Value | Environment |
|-----|-------|-------------|
| \`NEXT_PUBLIC_SUPABASE_URL\` | \`https://xxxxx.supabase.co\` | Production, Preview, Development |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\` | Production, Preview, Development |
| \`SUPABASE_SERVICE_ROLE_KEY\` | \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\` | Production, Preview, Development |
| \`NEXT_PUBLIC_SITE_URL\` | \`https://gulerinsaat.org\` | Production |
| \`NEXT_PUBLIC_SITE_URL\` | \`http://localhost:3000\` | Development |

**Supabase Keys Nereden Alınır:**
1. Supabase Dashboard → Settings → API
2. \`URL\` → \`NEXT_PUBLIC_SUPABASE_URL\`
3. \`anon public\` → \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
4. \`service_role\` (Show & Copy) → \`SUPABASE_SERVICE_ROLE_KEY\`

### 2.5. Deploy

1. "Deploy" butonuna tıklayın
2. Build logs izleyin (~2-3 dakika)
3. Deploy tamamlandığında: \`https://gulerinsaat-portfolio-xxx.vercel.app\`

🎉 **İlk deployment tamamlandı!**

---

## 3️⃣ Domain Bağlama (gulerinsaat.org)

### 3.1. Vercel'de Domain Ekleyin

1. Vercel Dashboard → Projeniz → Settings → Domains
2. "Add Domain" butonuna tıklayın
3. \`gulerinsaat.org\` yazın → "Add"
4. Vercel size DNS kayıtlarını gösterecek

**Vercel'in DNS Bilgileri:**

\`\`\`
A Record:    76.76.21.21
CNAME:       cname.vercel-dns.com
\`\`\`

### 3.2. Domain Sağlayıcınızda DNS Ayarları

Domain sağlayıcınızın paneline gidin (örn: GoDaddy, Namecheap, Cloudflare):

#### 3.2.1. **Root Domain** (gulerinsaat.org)

**A Record Ekleyin:**

\`\`\`
Type:   A
Name:   @ (veya boş bırakın)
Value:  76.76.21.21
TTL:    Automatic (veya 3600)
\`\`\`

#### 3.2.2. **www Subdomain** (www.gulerinsaat.org)

**CNAME Record Ekleyin:**

\`\`\`
Type:   CNAME
Name:   www
Value:  cname.vercel-dns.com
TTL:    Automatic (veya 3600)
\`\`\`

### 3.3. DNS Propagation Bekleyin

DNS değişikliklerinin yayılması **5 dakika - 48 saat** sürebilir (genelde 10-30 dakika).

**DNS Kontrol:**

\`\`\`bash
# A Record kontrol
dig gulerinsaat.org +short
# Çıktı: 76.76.21.21

# CNAME kontrol
dig www.gulerinsaat.org +short
# Çıktı: cname.vercel-dns.com
\`\`\`

Veya online araç: [whatsmydns.net](https://www.whatsmydns.net/)

### 3.4. SSL Sertifikası (Otomatik)

Vercel, domain doğrulandıktan sonra otomatik olarak **Let's Encrypt SSL** sertifikası oluşturur:

- ✅ HTTPS otomatik aktif olur
- ✅ HTTP → HTTPS yönlendirme otomatik
- ✅ Sertifika otomatik yenilenir

**Kontrol:**
- Vercel Dashboard → Domains → \`gulerinsaat.org\` → ✅ Valid Configuration

---

## 4️⃣ Environment Variables Güncelleme

Domain bağlandıktan sonra \`NEXT_PUBLIC_SITE_URL\` güncelleyin:

1. Vercel Dashboard → Settings → Environment Variables
2. \`NEXT_PUBLIC_SITE_URL\` → Edit
3. Production: \`https://gulerinsaat.org\` (değiştirin)
4. "Save"
5. "Redeploy" butonuna tıklayın (yeni deploy tetiklenir)

---

## 5️⃣ Supabase Redirect URL'leri

Supabase Auth için redirect URL'leri ekleyin:

1. Supabase Dashboard → Authentication → URL Configuration
2. **Site URL**: \`https://gulerinsaat.org\`
3. **Redirect URLs**:
   - \`https://gulerinsaat.org/admin/dashboard\`
   - \`https://gulerinsaat.org/**\` (wildcard)
4. "Save"

---

## 6️⃣ Test

### Public Site

\`\`\`
https://gulerinsaat.org
\`\`\`

✅ Hero section
✅ Hakkımızda
✅ Projeler (Supabase'den geliyor mu?)
✅ İletişim formu (mesaj gönderimi)

### Admin Panel

\`\`\`
https://gulerinsaat.org/admin/login
\`\`\`

✅ Login (Supabase Auth)
✅ Dashboard (stats)
✅ Proje ekleme/düzenleme
✅ Medya upload (HEIC/MOV)

---

## 7️⃣ Otomatik Deployments

GitHub'a her push'ta Vercel otomatik deploy eder:

\`\`\`bash
# Kod değişikliği yapın
git add .
git commit -m "Update: Hero section"
git push origin main

# Vercel otomatik deploy başlatır
# Dashboard → Deployments'tan takip edebilirsiniz
\`\`\`

**Preview Deployments:**
- Her branch için otomatik preview URL oluşturulur
- Pull request'lerde otomatik preview

---

## 8️⃣ Domain Yönlendirmeleri

### www → gulerinsaat.org Yönlendirme

Vercel otomatik yapar. Alternatif olarak domain sağlayıcınızda:

**GoDaddy:**
- Domain Settings → Forwarding → Add Forwarding
- \`www.gulerinsaat.org\` → \`https://gulerinsaat.org\` (301 Permanent)

### HTTP → HTTPS

Vercel otomatik yapar.

---

## 🎉 Deployment Tamamlandı!

✅ **Site**: https://gulerinsaat.org  
✅ **Admin**: https://gulerinsaat.org/admin/login  
✅ **SSL**: Aktif (HTTPS)  
✅ **Otomatik Deploy**: GitHub push'ta  

---

## 🔧 Troubleshooting

### Domain Görünmüyor

1. DNS propagation bekleniyor olabilir (48 saat'e kadar)
2. DNS kayıtlarını kontrol edin: \`dig gulerinsaat.org\`
3. Vercel Dashboard → Domains → "Refresh" tıklayın

### SSL Hatası

1. DNS doğru ayarlanmış mı?
2. Vercel'de "Valid Configuration" yazıyor mu?
3. 24 saat bekleyin (SSL sertifikası oluşması zaman alır)

### Supabase Bağlantı Hatası

1. Environment variables doğru mu?
2. Supabase'de Redirect URLs eklenmiş mi?
3. Vercel'de "Redeploy" yapın

### Build Hatası

\`\`\`bash
# Local'de test edin
npm run build

# Başarılı olursa Vercel'de de çalışır
\`\`\`

---

## 📚 Ek Kaynaklar

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [DNS Checker](https://www.whatsmydns.net/)

---

## 📧 Destek

Sorularınız için: info@gulerinsaat.org

