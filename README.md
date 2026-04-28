# TaskFlow – Project Management (Kanban)

## Canlı Demo
- **Vercel**: `https://projectmanagement-main-5wmpnhqcn-bartus-projects-013bac45.vercel.app`

TaskFlow, küçük ekiplerin Trello benzeri bir akışta **board → sütun → kart** yapısı ile görev yönetmesini sağlayan Kanban tabanlı bir web uygulamasıdır. Kartlar **sürükle-bırak** ile sütunlar arasında taşınır; **sıralama** DB’de tutulduğu için sayfa yenilense bile korunur.

## Kapsam ve hedefler (teknik değerlendirme)

- **Auth**: Kullanıcı kayıt/giriş, JWT cookie ile oturum yönetimi
- **CRUD**: Proje/board, sütun ve kart yönetimi
- **Drag & drop**: Kartların sütunlar arası taşınması + sıralama güncellemesi
- **Kalıcılık**: Sıralama verisinin DB’de saklanması ve API ile güncellenmesi
- **Deploy**: Uygulamanın Vercel üzerinde çalışır durumda olması (Supabase Postgres ile)

## Teknik rapor – Tasarım kararları ve analiz

### 1) Sürükle‑bırak (Drag & Drop) kütüphanesi

- **Seçim**: `@dnd-kit`
- **Gerekçe**:
  - **Modern & aktif**: Next/React ekosistemiyle uyumlu ve güncel bir API.
  - **Performans**: Büyük listelerde akıcılık için optimize edilebilir bir yaklaşım.
  - **Esneklik**: “Aynı sütunda reorder” + “sütunlar arası taşıma” senaryolarını temiz biçimde modelleyebilme.
- **Trade‑off / risk**:
  - Mobilde long‑press, auto‑scroll gibi UX detayları projeye göre ek ayar isteyebilir.
- **Uygulama notu**:
  - Taşıma sonrası hem **UI state** hem de **DB sıralaması** güncellenerek tutarlılık korunur.

### 2) Sıralama verisi nasıl saklandı?

- **Seçim**: Kartlarda `order: Int` ile deterministik sıralama
- **Gerekçe**:
  - **Yenilemede kalıcılık**: Sıralama DB’de tutulduğu için refresh sonrası kaybolmaz.
  - **Basit ve güvenilir**: 48 saatlik scope’ta hataya dayanıklı, kolay doğrulanabilir bir yöntem.
- **Trade‑off / alternatifler**:
  - “Fractional ordering” daha az update ile insert kolaylığı sağlar; ancak ek karmaşıklık getirir.
  - Çok büyük listelerde tüm `order` değerlerini yeniden yazmak maliyetli olabilir; bu projede kabul edildi.
- **Uygulama notu**:
  - Kart taşındığında hedef sütundaki kartların `order` değerleri yeniden hesaplanıp API üzerinden DB’ye yazılır.

### 3) Mobil kullanılabilirlik

- **Yaklaşım**: Responsive UI + dnd-kit’in touch senaryolarına uygunluğu
- **Not**: Mobile‑first “uzun basma ile sürükleme” gibi ek etkileşimler artırılabilir; timebox nedeniyle çekirdek akış önceliklendirildi.

### 4) 48 saatlik odak ve kapsam yönetimi

- Öncelik: **sorunsuz drag & drop**, **sağlam sıralama kalıcılığı**, **deploy edilebilirlik**.
- Ertelenenler: sütun reorder, etiket/due date/aktivite geçmişi gibi genişletmeler (mevcut modele doğal şekilde eklenebilir).

## Özellikler

- **Auth**: Kayıt / giriş (JWT cookie ile oturum)
- **Proje yönetimi**: Proje oluşturma, listeleme
- **Kanban board**: Kolonlar & kartlar, sıralama/akış
- **Görev atama**: Kartlara kullanıcı atama (model seviyesinde)
- **Alt görevler**: Subtask oluşturma ve takip

## Tasarım kararları (kısa)

- **Drag & drop kütüphanesi**: `@dnd-kit`
  - **Artılar**: modern, aktif geliştiriliyor, iyi performans, mobil/touch senaryolarında esnek
  - **Eksiler**: bazı UX detayları (long-press, auto-scroll) projeye göre ayrıca ince ayar isteyebilir
- **Sıralama stratejisi**: kartlarda `order: Int`
  - Kart taşındığında hedef sütundaki kartların `order` değerleri tekrar hesaplanıp DB’ye yazılır.
  - 48 saatlik scope için “her insertte fractional ordering” yerine daha deterministik bir yaklaşım tercih edildi.

## Teknolojiler

- **Next.js 16.2.4** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **Prisma 7.8** + **PostgreSQL (Supabase)**
- **bcryptjs** (şifre hash)
- **jsonwebtoken** (JWT)
- **@dnd-kit** (drag & drop)

## Projede yapılan önemli düzeltmeler / notlar

### Prisma Client import & generate

- Prisma Client artık standart şekilde `@prisma/client` üzerinden kullanılıyor.
- `postinstall` script’i ile her kurulumda `prisma generate` çalışıyor.

### Prisma 7.8 config sistemi

Prisma 7.8 ile bağlantı URL’leri artık `schema.prisma` içinde tutulmuyor.
Bu projede DB bağlantısı **`prisma.config.ts`** üzerinden yönetilir:

- `DATABASE_URL`
- `DIRECT_URL`

### Vercel + Supabase bağlantı notu (IPv4/TLS)

- Supabase Direct DB bağlantıları bazı ortamlarda **IPv6** ve/veya TLS zinciri nedeniyle problem çıkarabilir.
- Bu projede üretim ortamında stabilite için Supabase **pooler** kullanımı önerilir.

### Turbopack (Windows + Türkçe karakter) problemi

Windows’ta proje yolu içinde **Türkçe karakter** (ör. `Masaüstü`) varken Turbopack bazı durumlarda panic atabiliyor.
Bu repo, local geliştirmede stabilite için **webpack** ile çalışacak şekilde ayarlanmıştır:

- `npm run dev` → `next dev --webpack`
- `npm run build` → `next build --webpack`

## Kurulum (Local)

### 1) Bağımlılıklar

```bash
npm install
```

### 2) Environment variables

Kök dizinde `.env` oluştur.
Örnek dosya: `.env.example`

Gerekli değişkenler:

```env
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
JWT_SECRET="uzun-rastgele-bir-secret"
```

> Not: Localde “`self-signed certificate in certificate chain`” hatası alırsan (kurumsal proxy/antivirüs TLS inspection), **sadece local test için** URL sonuna `sslmode=no-verify` ekleyebilirsin.

### 3) Prisma (generate + migrations)

```bash
npx prisma generate
npx prisma migrate dev
```

### 4) Uygulamayı çalıştır

```bash
npm run dev
```

## Supabase ile kullanım

1. Supabase’te yeni bir Postgres projesi oluştur.
2. `Project Settings → Database → Connection string` kısmından **Direct (5432)** bağlantı string’ini al.
3. `.env` içindeki `DIRECT_URL` ve `DATABASE_URL` değerlerini doldur.
4. Migration’ları DB’ye uygula:

```bash
npx prisma migrate deploy

```

### Login

![login.png](docs/screenshots/login.png)

### Register

![register.png](docs/screenshots/register.png)

### Board

![board.png](docs/screenshots/board.png)
