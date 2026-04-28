# TaskFlow – Project Management (Kanban)

## Canlı Demo
- **Vercel**: `https://projectmanagement-main-....vercel.app`
TaskFlow, ekiplerin proje ve görevlerini **Kanban board** üzerinde yönetmesi için geliştirilmiş bir web uygulamasıdır.

## Özellikler

- **Auth**: Kayıt / giriş (JWT cookie ile oturum)
- **Proje yönetimi**: Proje oluşturma, listeleme
- **Kanban board**: Kolonlar & kartlar, sıralama/akış
- **Görev atama**: Kartlara kullanıcı atama (model seviyesinde)
- **Alt görevler**: Subtask oluşturma ve takip

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
