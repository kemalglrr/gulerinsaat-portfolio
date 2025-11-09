# Supabase Kurulum Rehberi

## 1. Supabase Projesini Oluşturun

1. [supabase.com](https://supabase.com) adresine gidin
2. "New Project" butonuna tıklayın
3. Proje adı: `gulerinsaat`
4. Database şifresini kaydedin
5. Region: Europe (Frankfurt) önerilir

## 2. Environment Variables

`.env.local` dosyanızı oluşturun ve şu bilgileri ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://gulerinsaat.org
```

**Bu bilgileri nereden bulabilirsiniz:**
- Supabase Dashboard → Settings → API
- URL ve Keys burada görünecek

## 3. Database Tabloları Oluşturma

Supabase Dashboard → SQL Editor'a gidin ve aşağıdaki SQL'i çalıştırın:

```sql
-- Projeler tablosu
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  completion_date DATE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Medya tablosu
CREATE TABLE project_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- İletişim mesajları
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes (performans için)
CREATE INDEX idx_projects_order ON projects(display_order);
CREATE INDEX idx_projects_published ON projects(is_published);
CREATE INDEX idx_project_media_project ON project_media(project_id);
CREATE INDEX idx_project_media_order ON project_media(display_order);

-- Updated at trigger (Güvenlik: search_path parametresi eklendi)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 4. Row Level Security (RLS) Policies

SQL Editor'da aşağıdaki güvenlik politikalarını çalıştırın:

```sql
-- RLS'i aktifleştir
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public: Yayında olan projeleri görüntüleme
CREATE POLICY "Public can view published projects"
  ON projects FOR SELECT
  USING (is_published = true);

-- Public: Yayında projelerin medyalarını görüntüleme
CREATE POLICY "Public can view media of published projects"
  ON project_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_media.project_id 
      AND projects.is_published = true
    )
  );

-- Admin: Tüm projeler üzerinde tam yetki
CREATE POLICY "Authenticated users full access projects"
  ON projects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admin: Tüm medyalar üzerinde tam yetki
CREATE POLICY "Authenticated users full access media"
  ON project_media FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- İletişim: Herkes mesaj gönderebilir
CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- İletişim: Sadece admin mesajları görebilir
CREATE POLICY "Authenticated users can view messages"
  ON contact_messages FOR SELECT
  USING (auth.role() = 'authenticated');
```

## 5. Storage Buckets Oluşturma

### 5.1 project-images Bucket

Supabase Dashboard → Storage → "New bucket"

```
Bucket name: project-images
Public: ✅ YES
File size limit: 10 MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

### 5.2 project-videos Bucket

```
Bucket name: project-videos
Public: ✅ YES
File size limit: 500 MB
Allowed MIME types: video/quicktime, video/mp4, video/x-m4v
```

## 6. İlk Admin Kullanıcı Oluşturma

Supabase Dashboard → Authentication → Users → "Add user"

```
Email: admin@gulerinsaat.org (veya istediğiniz email)
Password: [Güçlü şifre]
Auto Confirm User: ✅ YES
```

## 7. Email Template Ayarları (Opsiyonel)

Authentication → Email Templates → Customize

## 8. Güvenlik Düzeltmeleri

### 8.1. Function Search Path Düzeltmesi

Eğer `update_updated_at_column` fonksiyonu zaten oluşturulmuşsa, güvenlik açığını kapatmak için aşağıdaki SQL'i çalıştırın:

```sql
-- Mevcut fonksiyonu güvenli hale getir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$;
```

### 8.2. Auth Güvenlik Ayarları

Supabase Dashboard → Authentication → Settings'e gidin ve şu ayarları yapın:

#### Leaked Password Protection (Sızdırılmış Şifre Koruması)
1. **Authentication → Attack Protection** bölümüne gidin
2. **"Prevent use of leaked passwords"** seçeneğini bulun
3. Eğer "Disabled" yazıyorsa ve "Configure email provider" butonu varsa:
   - **"Configure email provider"** butonuna tıklayın
   - Supabase'in kendi SMTP'sini kullanabilirsiniz (ücretsiz, sınırlı)
   - Veya Resend, SendGrid gibi bir email provider yapılandırabilirsiniz
4. Email provider yapılandırıldıktan sonra, **"Prevent use of leaked passwords"** toggle'ını **✅ AÇIN**
5. **"Save changes"** butonuna tıklayın
6. Bu özellik, kullanıcıların bilinen sızdırılmış şifreleri kullanmasını engeller

**Not:** Email provider yapılandırması zorunlu değilse, direkt olarak toggle'ı açabilirsiniz. Supabase bazı durumlarda kendi email servisini kullanabilir.

#### Multi-Factor Authentication (MFA)
1. **Authentication → Settings → Multi-Factor Authentication** bölümüne gidin
2. **"Enable MFA"** seçeneğini **✅ AÇIN**
3. En az bir MFA yöntemi seçin:
   - **TOTP (Time-based One-Time Password)** - Authenticator uygulamaları (Google Authenticator, Authy, vb.)
   - **SMS** (opsiyonel, ücretli olabilir)
4. **"Save"** butonuna tıklayın

**Not:** MFA'yı açtıktan sonra, admin kullanıcılarınızın bir sonraki girişinde MFA kurulumu yapmaları gerekecek.

## 9. Test

Database'i test etmek için:

```sql
-- Test verisi ekleyin
INSERT INTO projects (title, description, display_order, is_published) 
VALUES ('Test Projesi', 'Bu bir test projesidir.', 0, true);
```

## 10. Performans Optimizasyonları

### 10.1. Cache Hit Rate Açıklaması

**Cache Hit Rate %99.93** - Bu çok iyi bir değer! 

**Ne Anlama Geliyor?**
- Cache Hit Rate, veritabanının verileri disk yerine RAM'den (cache) okuma oranını gösterir
- %99.93 = Neredeyse tüm sorgular RAM'den çalışıyor (çok hızlı!)
- %90'ın üzeri = Mükemmel performans
- %80'in altı = Performans sorunları olabilir

**Sonuç:** Cache performansınız mükemmel, herhangi bir iyileştirme gerekmiyor! ✅

### 10.2. RLS Performans Optimizasyonları

Performance Advisor'da görünen uyarıları çözmek için RLS politikalarını optimize edin:

#### Sorun 1: Auth RLS Initialization Plan
`auth.role()` kullanımı her sorguda `current_setting()` çağrısı yapar, bu performans sorunlarına yol açabilir.

#### Sorun 2: Multiple Permissive Policies
Aynı tabloda birden fazla permissive policy var, bu da performans sorunlarına yol açabilir.

**Çözüm:** Mevcut politikaları silip optimize edilmiş versiyonları oluşturun:

```sql
-- Önce mevcut authenticated politikaları sil
DROP POLICY IF EXISTS "Authenticated users full access projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users full access media" ON project_media;
DROP POLICY IF EXISTS "Authenticated users can view messages" ON contact_messages;

-- Public policy'leri authenticated kullanıcılar için devre dışı bırak
-- (Sadece anon kullanıcılar için çalışacak)
DROP POLICY IF EXISTS "Public can view published projects" ON projects;
DROP POLICY IF EXISTS "Public can view media of published projects" ON project_media;

-- Public: Sadece anon kullanıcılar için yayında olan projeleri görüntüleme
CREATE POLICY "Public can view published projects"
  ON projects FOR SELECT
  TO anon
  USING (is_published = true);

-- Public: Sadece anon kullanıcılar için yayında projelerin medyalarını görüntüleme
CREATE POLICY "Public can view media of published projects"
  ON project_media FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_media.project_id 
      AND projects.is_published = true
    )
  );

-- Optimize edilmiş authenticated politikalar
-- 1. (select auth.uid()) kullanımı - initialization plan sorununu çözer
-- 2. TO authenticated kullanımı - multiple permissive policies sorununu çözer

-- Admin: Tüm projeler üzerinde tam yetki (authenticated kullanıcılar için)
CREATE POLICY "Authenticated users full access projects"
  ON projects FOR ALL
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Admin: Tüm medyalar üzerinde tam yetki (authenticated kullanıcılar için)
CREATE POLICY "Authenticated users full access media"
  ON project_media FOR ALL
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- İletişim: Sadece admin mesajları görebilir (authenticated kullanıcılar için)
CREATE POLICY "Authenticated users can view messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);
```

**Notlar:**
- `(select auth.uid())` kullanımı, initialization plan sorununu çözer (her satır için yeniden değerlendirme yapmaz)
- `TO anon` ve `TO authenticated` kullanımı, multiple permissive policies sorununu çözer (her role için ayrı policy)
- Authenticated kullanıcılar artık tüm projeleri görebilir (published + unpublished)
- Anon kullanıcılar sadece published projeleri görebilir

### 10.3. Performans Kontrolü

Optimizasyonları yaptıktan sonra:
1. Supabase Dashboard → Performance Advisor'a gidin
2. "Rerun linter" butonuna tıklayın
3. Uyarıların kaybolduğunu kontrol edin

## ✅ Kurulum Tamamlandı!

Artık projeniz Supabase ile çalışmaya hazır.

**Sonraki Adımlar:**
- `.env.local` dosyasını güncelleyin
- Development server'ı başlatın: `npm run dev`
- Admin paneline giriş yapın: `http://localhost:3000/admin/login`

