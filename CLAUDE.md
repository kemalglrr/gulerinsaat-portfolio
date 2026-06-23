# CLAUDE.md — Güler Yapı Proje (gulerinsaat.org)

Bu dosya bu repoda çalışan Claude (Claude Code) içindir. Her oturumda önce bunu oku.

## Proje
Aile inşaat şirketi "Güler Yapı Proje" için kurumsal/portföy sitesi.
- Domain: gulerinsaat.org (Namecheap)
- Stack: Next.js + TypeScript + Tailwind, Vercel'de deploy (free tier)
- İçerik: şirket tanıtımı, proje portföyü (foto/video galerisi), iletişim formu
- Mail: Resend (free), iletişim formundan mail
- Admin: sadece Kemal kullanıyor

## İletişim tarzı (ZORUNLU)
- Türkçe konuş.
- Direkt ve pratik ol. "Yapabilirsin" deyip geçme; kod gerekiyorsa direkt yaz.
- Açıklarken inşaat hayatından benzetme kullanabilirsin ama abartma/uzatma (Kemal sektörde).
- Eksik bilgi varsa TAHMİN YAPMA, sor.
- Maliyet konusunda dürüst ol: hangisi bedava, hangisi paralı, alternatif ne.
- Terminal komutu veriyorsan ne yaptığını kısaca açıkla.
- Migration'da veri kaybı riski varsa "hadi yapalım" deme; önce yedek/test adımını söyle.

## NE YAPMA
- Bedavaya yapılabilecek şeye paralı servis önerme.
- Gereksiz bağımlılık ekleme.
- Kemal'i gereksiz teknik detaya boğma.

## Teknik tercihler
- Dil: TypeScript | Framework: Next.js | UI: Tailwind
- Storage hedefi: Cloudflare R2
- Mail: Resend (mevcut) | Deploy: Vercel (mevcut)
- DB gerekirse: Neon (Postgres) ya da Cloudflare D1 — kararı henüz verilmedi
- Bunlar Kemal'in şu anki tercihleri; daha iyi/güncel bir yol varsa haber ver.

## YAZILIM GELİŞTİRME ESASLARI (ZORUNLU)
Bu esaslar işe HİZMET eder; amaç değil. Bu, tek kullanıcılı küçük bir portföy
sitesi — **KISS her zaman önce gelir.** Aşağıdakileri dogma olarak değil, kaliteyi
ve güvenliği korumak için uygula. Şüphedeysen en basit çözümü seç ve sebebini söyle.

### Süreç (SDLC mantığı)
- Sırayı koru: planla → keşfet → küçük adım → test et → deploy → doğrula.
- Büyük değişikliği tek seferde yapma; küçük, anlamlı commit'lerle ilerle.
- Riskli/yıkıcı işlemden (silme, taşıma, şema değişikliği) ÖNCE yedek al ve söyle.
- Önce feature branch aç, ana dalı (main) doğrudan bozma; deploy öncesi diff'i Kemal görsün.

### Tasarım prensipleri
- **KISS**: En sade çözüm. Gereksiz soyutlama, gereksiz bağımlılık, "ileride lazım
  olur" diye fazladan katman EKLEME.
- **DRY**: Aynı işi yapan kodu tekrarlama; ortak mantığı tek yerde topla.
- **Katmanlı ayrım**: Veri erişimi / iş mantığı / arayüz birbirine karışmasın.
  Örn. R2 ve Supabase erişimini bileşenlerin içine dağıtma; tek bir servis/util
  modülünde topla (ileride storage'ı değiştirmek tek dosyayı düzeltmek olsun).
- **SOLID**: Yönlendirici olarak akılda tut (tek sorumluluk, bağımlılığı dışarıdan
  ver) ama bu ölçekte aşırıya kaçıp over-engineering yapma.

### Güvenlik (secure coding)
- **En az ayrıcalık**: R2/Supabase token'larını en dar izinle üret (gerekiyorsa
  sadece o bucket, sadece gereken işlem). Geniş/master key kullanma.
- **Sırlar koda girmez**: Tüm key/secret `.env`'de; `.env` `.gitignore`'da olmalı,
  repoya ASLA commit'lenmez. Kemal'e key içeriğini ekrana basma.
- **Girdi doğrulama**: Kullanıcıdan gelen her şeyi (iletişim formu, admin upload)
  işlemeden önce doğrula ve sınırla — dosya tipi (yalnız izinli MIME), dosya boyutu,
  metin alanları. Doğrulanmamış veriyi storage'a/DB'ye yazma.

## ŞU ANKİ ÖNCELİK — Faz 1: Supabase'den çıkış
Hedef: tüm foto/video'yu Cloudflare R2'ye taşımak, Supabase'i tamamen kapatmak
(ya da Free'de bırakmak). Site Supabase Pro'da gereksiz ~$25/ay yüküyordu; ödeme
alınamayınca Free'ye düştü ve içerik servis edilemez oldu.

### Supabase'in mevcut durumu (bu sohbette keşfedildi)
- Org Pro'dan FREE'ye düştü. Foto/video Free storage kotasını aştığı için
  **"service restrictions" (Fair Use) AKTİF** → API/storage request'leri
  bloklanıyor/402 dönebiliyor. Site görselleri bu yüzden gelmiyor.
- Proje STATUS: Healthy (uyumuyor, pause değil). Sorun kota aşımı, restore çözmez.
- Free limitleri: 500MB DB, 1GB dosya depolama, 5GB/ay egress.

### Supabase yapısı
İki PUBLIC bucket:
- `project-videos` (video/quicktime, mp4, x-m4v)
- `project-images`
Üç tablo (schema: public):
- `projects` — id, title, description, location, start_date, end_date,
  is_published, display_order, created_at, updated_at
- `project_media` — id, project_id (FK→projects), media_type, storage_path,
  public_url, thumbnail_url, file_size (int8), display_order, created_at
- `contact_messages` — id, name, email, phone, message, created_at

ÖNEMLİ: Supabase sadece storage değil; site galeriyi `projects` + `project_media`
tablolarından çiziyor. Yani "Supabase'i kapatmak" = bu 3 tabloyu da taşımak.
Sadece dosyaları R2'ye atmak yetmez; hangi dosya hangi projeye ait/sırası ne
bilgisi bu tablolarda.

### Plan
1. **Boyutu öğren** (bedava). Supabase SQL Editor'da:
   ```sql
   SELECT media_type, count(*) AS adet, pg_size_pretty(sum(file_size)) AS toplam
   FROM project_media GROUP BY media_type;
   ```
2. **Yedek** (taşımadan ÖNCE). 3 tabloyu CSV/JSON dışa aktar. Bucket'lar PUBLIC
   olduğu için medya, `project_media.public_url` listesinden service key'siz
   toplu indirilebilir. Hepsini lokale indir.
3. **R2 kurulumu.** Kemal'in Cloudflare hesabı YOK → açılacak (bedava). R2 bucket
   oluştur. 10GB'a kadar depolama + egress bedava.
4. **Yükle** medyayı R2'ye (S3 uyumlu API / rclone / wrangler).
5. **DB taşı.** `projects` + `project_media` için karar: Neon (Postgres, neredeyse
   direkt) mi, yoksa veriyi repo'ya statik JSON olarak gömmek mi. Kararı, sitenin
   bu veriyi NASIL çektiğine göre ver (runtime fetch mi, build-time mi) — repoyu
   incele. `contact_messages`: Resend maili zaten var; kayıtları taşımak şart mı
   Kemal'e sor.
6. **Kodu güncelle**: okuma (galeri) R2'den, admin upload R2'ye, admin auth için
   Supabase Auth yerine basit çözüm (tek kullanıcı: env şifre + cookie / basic auth).
7. **Test → deploy → Supabase'i en son kapat.**

### Açık riskler / notlar
- Free egress 5GB/ay. Toplam medya bunu aşıyorsa indirme yarıda 402 ile kilitlenir.
  O durumda tek seferlik çözüm: 1 ay Pro'ya yükselt ($25) → kısıtlama anında kalkar
  → her şeyi indir → HEMEN iptal. Sadece güvenli veri çıkışı için, abonelik için değil.
- Admin panel hem auth hem upload için Supabase'e bağlı olabilir — repodan teyit et.

## Sonraki fazlar (şimdi değil)
- Faz 2: portföy iyileştirme (proje detay sayfaları, before/after, video oynatıcı)
- Faz 3: SEO (TR inşaat sektörü organik görünürlük)
- Faz 4: müteahhitliğe geçince "Satılık Daireler" bölümü
