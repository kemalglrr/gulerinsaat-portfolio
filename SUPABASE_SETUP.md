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

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

## 8. Test

Database'i test etmek için:

```sql
-- Test verisi ekleyin
INSERT INTO projects (title, description, display_order, is_published) 
VALUES ('Test Projesi', 'Bu bir test projesidir.', 0, true);
```

## ✅ Kurulum Tamamlandı!

Artık projeniz Supabase ile çalışmaya hazır.

**Sonraki Adımlar:**
- `.env.local` dosyasını güncelleyin
- Development server'ı başlatın: `npm run dev`
- Admin paneline giriş yapın: `http://localhost:3000/admin/login`

