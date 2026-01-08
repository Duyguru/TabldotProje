# Tabldot Projesi - Detaylı Proje Raporu

## 1. Proje Özeti

Tabldot Projesi, şirket yemekhanesi yönetim sistemi için geliştirilmiş bir web uygulamasıdır. Bu proje, günlük menülerin yönetilmesi, yemeklerin kategorilendirilmesi ve kullanıcıların yemekler hakkında geri bildirim vermesi için kapsamlı bir çözüm sunmaktadır.

### Proje Linkleri

- **Frontend (Vercel)**: https://tabldot-proje.vercel.app
- **Backend (Railway)**: https://tabldotproje-production.up.railway.app/api

## 2. Teknoloji Yığını

### Backend
- **Framework**: NestJS (Node.js)
- **Veritabanı**: SQLite (Development ve Production - Railway Persistent Volume ile)
- **ORM**: Prisma
- **Kimlik Doğrulama**: JWT (JSON Web Token)
- **Şifreleme**: bcrypt
- **Dil**: TypeScript
- **Deployment Platform**: Railway

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Routing**: React Router
- **HTTP İstemcisi**: Axios
- **Form Yönetimi**: React Hook Form
- **Stil**: Inline CSS ve Tailwind CSS
- **Deployment Platform**: Vercel

## 3. Veritabanı Yapısı

### Veritabanı Diyagramı

```
┌─────────────┐
│    User     │
├─────────────┤
│ id (PK)     │
│ email (UK)  │
│ password    │
│ name        │
│ role        │
│ createdAt   │
│ updatedAt   │
└──────┬──────┘
       │
       │ 1
       │
       │ N
┌──────▼──────┐
│   Review    │
├─────────────┤
│ id (PK)     │
│ rating      │
│ comment     │
│ isAnonymous │
│ createdAt   │
│ updatedAt   │
│ userId (FK) │
│ dishId (FK) │
│ dailyMenuId (FK) │
└──────┬──────┘
       │
       │ N
       │
       │ 1
┌──────▼──────┐
│    Dish     │
├─────────────┤
│ id (PK)     │
│ name        │
│ description │
│ imageUrl    │
│ categoryId  │
│ createdAt   │
│ updatedAt   │
└──────┬──────┘
       │
       │ N
       │
       │ 1
┌──────▼──────┐
│  Category   │
├─────────────┤
│ id (PK)     │
│ name        │
│ description │
│ createdAt   │
│ updatedAt   │
└─────────────┘

┌─────────────┐
│ DailyMenu   │
├─────────────┤
│ id (PK)     │
│ date (UK)   │
│ name        │
└──────┬──────┘
       │
       │ N
       │
       │ N (Many-to-Many)
       │
┌──────▼──────┐
│    Dish     │
└─────────────┘
```

### Entity İlişkileri

1. **User - Review**: Bire-Çok İlişki
   - Bir kullanıcı birden fazla yorum yapabilir
   - Bir yorum sadece bir kullanıcıya aittir

2. **Dish - Review**: Bire-Çok İlişki
   - Bir yemek birden fazla yorum alabilir
   - Bir yorum sadece bir yemeğe aittir

3. **DailyMenu - Review**: Bire-Çok İlişki
   - Bir günlük menü birden fazla yorum alabilir
   - Bir yorum sadece bir günlük menüye aittir

4. **Category - Dish**: Bire-Çok İlişki
   - Bir kategori birden fazla yemek içerebilir
   - Bir yemek sadece bir kategoriye aittir

5. **DailyMenu - Dish**: Çoka-Çok İlişki
   - Bir günlük menü birden fazla yemek içerebilir
   - Bir yemek birden fazla günlük menüde yer alabilir

### Tablolar

#### User Tablosu
- **id**: Birincil anahtar (otomatik artan)
- **email**: Benzersiz e-posta adresi
- **password**: Hash'lenmiş şifre
- **name**: Kullanıcı adı (opsiyonel)
- **role**: Kullanıcı rolü (USER veya ADMIN)
- **createdAt**: Oluşturulma tarihi
- **updatedAt**: Güncellenme tarihi

#### Category Tablosu
- **id**: Birincil anahtar
- **name**: Kategori adı
- **description**: Kategori açıklaması (opsiyonel)
- **createdAt**: Oluşturulma tarihi
- **updatedAt**: Güncellenme tarihi

#### Dish Tablosu
- **id**: Birincil anahtar
- **name**: Yemek adı
- **description**: Yemek açıklaması (opsiyonel)
- **imageUrl**: Yemek fotoğrafı URL'i (opsiyonel - harici URL girişi)
- **categoryId**: Kategori referansı (yabancı anahtar)
- **createdAt**: Oluşturulma tarihi
- **updatedAt**: Güncellenme tarihi

#### DailyMenu Tablosu
- **id**: Birincil anahtar
- **date**: Menü tarihi (benzersiz)
- **name**: Menü adı (opsiyonel)

#### Review Tablosu
- **id**: Birincil anahtar
- **rating**: Puan (1-5)
- **comment**: Yorum metni (opsiyonel)
- **isAnonymous**: Gizli yorum mu? (varsayılan: false)
- **userId**: Kullanıcı referansı (yabancı anahtar)
- **dishId**: Yemek referansı (yabancı anahtar)
- **dailyMenuId**: Günlük menü referansı (yabancı anahtar)
- **createdAt**: Oluşturulma tarihi
- **updatedAt**: Güncellenme tarihi
- **Unique Constraint**: (userId, dishId, dailyMenuId) - Bir kullanıcı bir yemeğe bir günün menüsünde sadece bir kez yorum yapabilir

## 4. Backend Endpoint'leri

### 4.1. Authentication Endpoint'leri (`/api/auth`)

#### POST `/api/auth/register`
- **Açıklama**: Yeni kullanıcı kaydı oluşturur
- **Yetkilendirme**: Gerekmez
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: Kayıt başarı mesajı ve kullanıcı ID'si
- **Hata Durumları**: 
  - E-posta zaten kayıtlıysa 409 Conflict
  - Geçersiz veri gönderilirse 400 Bad Request

#### POST `/api/auth/login`
- **Açıklama**: Kullanıcı girişi yapar ve JWT token döner
- **Yetkilendirme**: Gerekmez
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: JWT access token ve kullanıcı bilgileri
- **Hata Durumları**: 
  - E-posta veya şifre hatalıysa 401 Unauthorized

### 4.2. Categories Endpoint'leri (`/api/categories`)

#### GET `/api/categories`
- **Açıklama**: Tüm kategorileri listeler
- **Yetkilendirme**: Gerekmez
- **Response**: Kategori listesi (id, name, description)

#### GET `/api/categories/:id`
- **Açıklama**: Belirli bir kategoriyi getirir
- **Yetkilendirme**: Gerekmez
- **Response**: Kategori detayları

#### POST `/api/categories`
- **Açıklama**: Yeni kategori oluşturur
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string (opsiyonel)"
  }
  ```
- **Response**: Oluşturulan kategori bilgileri

#### PATCH `/api/categories/:id`
- **Açıklama**: Mevcut kategoriyi günceller
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Request Body**:
  ```json
  {
    "name": "string (opsiyonel)",
    "description": "string (opsiyonel)"
  }
  ```
- **Response**: Güncellenmiş kategori bilgileri

#### DELETE `/api/categories/:id`
- **Açıklama**: Kategoriyi siler
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Response**: Silme başarı mesajı

### 4.3. Dishes Endpoint'leri (`/api/dishes`)

#### GET `/api/dishes`
- **Açıklama**: Tüm yemekleri listeler (kategori bilgileriyle birlikte)
- **Yetkilendirme**: Gerekmez
- **Response**: Yemek listesi (id, name, description, category, imageUrl)

#### GET `/api/dishes/:id`
- **Açıklama**: Belirli bir yemeği getirir
- **Yetkilendirme**: Gerekmez
- **Response**: Yemek detayları

#### POST `/api/dishes`
- **Açıklama**: Yeni yemek oluşturur
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string (opsiyonel)",
    "imageUrl": "string (opsiyonel - geçerli URL formatında)",
    "categoryId": "number"
  }
  ```
- **Response**: Oluşturulan yemek bilgileri
- **Not**: `imageUrl` opsiyoneldir ve geçerli bir URL formatında olmalıdır (http:// veya https:// ile başlamalı). Local dosya yükleme desteği kaldırılmıştır.

#### PATCH `/api/dishes/:id`
- **Açıklama**: Mevcut yemeği günceller
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Request Body**:
  ```json
  {
    "name": "string (opsiyonel)",
    "description": "string (opsiyonel)",
    "imageUrl": "string (opsiyonel - geçerli URL formatında)",
    "categoryId": "number (opsiyonel)"
  }
  ```
- **Response**: Güncellenmiş yemek bilgileri

#### DELETE `/api/dishes/:id`
- **Açıklama**: Yemeği siler
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Response**: Silme başarı mesajı

### 4.4. Daily Menus Endpoint'leri (`/api/daily-menus`)

#### GET `/api/daily-menus`
- **Açıklama**: Tüm günlük menüleri listeler (yemek bilgileriyle birlikte)
- **Yetkilendirme**: Gerekmez
- **Response**: Günlük menü listesi

#### GET `/api/daily-menus/:id`
- **Açıklama**: Belirli bir günlük menüyü getirir
- **Yetkilendirme**: Gerekmez
- **Response**: Günlük menü detayları

#### GET `/api/daily-menus/date/today`
- **Açıklama**: Bugünün tarihine ait günlük menüyü getirir
- **Yetkilendirme**: Gerekmez
- **Response**: Bugünün menüsü (yemek listesiyle birlikte)
- **Özel Durum**: Bugün için menü yoksa null döner

#### POST `/api/daily-menus`
- **Açıklama**: Yeni günlük menü oluşturur
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Request Body**:
  ```json
  {
    "date": "ISO 8601 date string",
    "dishIds": [1, 2, 3]
  }
  ```
- **Response**: Oluşturulan menü bilgileri

#### PATCH `/api/daily-menus/:id`
- **Açıklama**: Mevcut günlük menüyü günceller
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Request Body**:
  ```json
  {
    "date": "ISO 8601 date string (opsiyonel)",
    "dishIds": [1, 2, 3] (opsiyonel)
  }
  ```
- **Response**: Güncellenmiş menü bilgileri

#### DELETE `/api/daily-menus/:id`
- **Açıklama**: Günlük menüyü siler
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Response**: Silme başarı mesajı

### 4.5. Reviews Endpoint'leri (`/api/reviews`)

#### GET `/api/reviews`
- **Açıklama**: Tüm yorumları listeler (yemek, kullanıcı ve günlük menü bilgileriyle birlikte)
- **Yetkilendirme**: Gerekmez
- **Query Parametreleri**:
  - `dailyMenuId` (opsiyonel): Belirli bir günün menüsüne ait yorumları filtreler
- **Response**: Yorum listesi (en yeni yorumlar önce)
- **İçerik**: rating, comment, dish bilgisi, user bilgisi, dailyMenu bilgisi, createdAt

#### POST `/api/reviews`
- **Açıklama**: Yeni yorum oluşturur
- **Yetkilendirme**: JWT Token gerekli (herhangi bir rol)
- **Request Body**:
  ```json
  {
    "dishId": "number",
    "dailyMenuId": "number",
    "rating": "number (1-5)",
    "comment": "string (opsiyonel)"
  }
  ```
- **Response**: Oluşturulan yorum bilgileri
- **Kısıtlama**: Bir kullanıcı bir yemeğe bir günün menüsünde sadece bir kez yorum yapabilir
- **Hata Durumları**: 
  - Yemek bulunamazsa 404 Not Found
  - Günlük menü bulunamazsa 404 Not Found
  - Yemek seçilen günün menüsünde yoksa 404 Not Found
  - Kullanıcı daha önce yorum yaptıysa 409 Conflict

#### DELETE `/api/reviews/:id`
- **Açıklama**: Yorumu siler
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Response**: Silme başarı mesajı
- **Hata Durumları**: 
  - Yorum bulunamazsa 404 Not Found
  - Yetki yoksa 403 Forbidden

### 4.6. Users Endpoint'leri (`/api/users`)

#### GET `/api/users`
- **Açıklama**: Tüm kullanıcıları listeler
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Response**: Kullanıcı listesi (id, email, name, role, createdAt)
- **Not**: Şifre bilgileri response'da yer almaz

#### GET `/api/users/:id`
- **Açıklama**: Belirli bir kullanıcıyı getirir
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Response**: Kullanıcı detayları

#### PATCH `/api/users/:id`
- **Açıklama**: Kullanıcı bilgilerini günceller (ad, e-posta, rol)
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Request Body**:
  ```json
  {
    "name": "string (opsiyonel)",
    "email": "string (opsiyonel)",
    "role": "string (USER veya ADMIN)"
  }
  ```
- **Response**: Güncellenmiş kullanıcı bilgileri
- **Not**: Şifre güncellemesi bu endpoint üzerinden yapılamaz

#### DELETE `/api/users/:id`
- **Açıklama**: Kullanıcıyı siler
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Response**: Silme başarı mesajı
- **Hata Durumları**: 
  - Kullanıcı bulunamazsa 404 Not Found
  - Yetki yoksa 403 Forbidden

### 4.7. Upload Endpoint'leri (`/api/upload`)

**Not:** Bu endpoint mevcut ancak frontend'de aktif olarak kullanılmamaktadır. Yemek fotoğrafları için sadece URL ile ekleme yapılmaktadır.

#### POST `/api/upload/image`
- **Açıklama**: Resim dosyası yükler (yemek fotoğrafları için - opsiyonel, şu an kullanılmıyor)
- **Yetkilendirme**: JWT Token + ADMIN rolü gerekli
- **Request Type**: `multipart/form-data`
- **Request Body**:
  - `file`: Resim dosyası (JPG, PNG, GIF, WEBP)
  - Maksimum dosya boyutu: 5MB
- **Response**:
  ```json
  {
    "url": "http://localhost:3000/uploads/dish-1234567890-abc123.jpg",
    "filename": "dish-1234567890-abc123.jpg",
    "originalName": "yemek.jpg",
    "size": 123456
  }
  ```
- **Hata Durumları**: 
  - Geçersiz dosya formatı: 400 Bad Request
  - Dosya boyutu limiti aşıldı: 400 Bad Request
  - Dosya yüklenemedi: 500 Internal Server Error
- **Kullanım**: Frontend'de yemek fotoğrafları için sadece URL input'u kullanılmaktadır. Bu endpoint gelecekte kullanılabilir.

## 5. Frontend Component'leri

### 5.1. Ana Uygulama Yapısı

#### App.jsx
- **Açıklama**: Uygulamanın ana routing yapısını yönetir
- **Özellikler**:
  - React Router ile sayfa yönlendirmelerini yönetir
  - Public route'lar (login, register)
  - Protected route'lar (home - sadece giriş yapmış kullanıcılar)
  - Admin route'lar (admin paneli - sadece ADMIN rolü)
- **Route Yapısı**:
  - `/login` → Login sayfası
  - `/register` → Kayıt sayfası
  - `/home` → Ana sayfa (korumalı)
  - `/admin/*` → Admin paneli (ADMIN korumalı)

### 5.2. Authentication Component'leri

#### Login.jsx
- **Açıklama**: Kullanıcı giriş sayfası
- **Özellikler**:
  - E-posta ve şifre ile giriş formu
  - Form validasyonu (React Hook Form)
  - Başarılı girişte role göre yönlendirme (ADMIN → /admin, USER → /home)
  - Kayıt sayfasına yönlendirme linki
- **Kullanıcı Deneyimi**: Modern gradient arka plan ve glassmorphism tasarım

#### Register.jsx
- **Açıklama**: Yeni kullanıcı kayıt sayfası
- **Özellikler**:
  - Ad, e-posta ve şifre kayıt formu
  - Form validasyonu (minimum şifre uzunluğu, e-posta formatı)
  - Başarılı kayıt sonrası login sayfasına yönlendirme
  - Giriş sayfasına yönlendirme linki

### 5.3. Context API

#### AuthContext.jsx
- **Açıklama**: Uygulama genelinde kimlik doğrulama durumunu yönetir
- **Özellikler**:
  - Kullanıcı bilgilerini ve token'ı localStorage'da saklar
  - Login/logout fonksiyonları
  - Kullanıcı rolü kontrolü (isAdmin)
  - Authentication durumu (isAuthenticated)
- **Kullanım**: Tüm component'lerde `useAuth()` hook'u ile erişilebilir

### 5.4. Route Guard Component'leri

#### ProtectedRoute.jsx
- **Açıklama**: Sadece giriş yapmış kullanıcıların erişebileceği sayfaları korur
- **Özellikler**:
  - Authentication kontrolü yapar
  - Giriş yapmamış kullanıcıları `/login` sayfasına yönlendirir
  - Loading durumunu yönetir

#### AdminRoute.jsx
- **Açıklama**: Sadece ADMIN rolündeki kullanıcıların erişebileceği sayfaları korur
- **Özellikler**:
  - Authentication ve role kontrolü yapar
  - Giriş yapmamış kullanıcıları `/login` sayfasına yönlendirir
  - USER rolündeki kullanıcıları `/home` sayfasına yönlendirir

### 5.5. Ana Sayfa Component'leri

#### Home.jsx
- **Açıklama**: Kullanıcıların günlük menüyü görüntüleyip yorum yapabileceği ana sayfa
- **Özellikler**:
  - Bugünün menüsünü API'den çeker ve gösterir
  - Her yemek için ortalama puan ve yorum sayısını hesaplar ve gösterir
  - Yemek kartları üzerinden yorum yapma modal'ı açar
  - Yorum gönderme işlevi (puan ve opsiyonel yorum metni)
  - Yorum gönderildikten sonra istatistikleri otomatik yeniler
  - Üst bar'da kullanıcı bilgisi, admin paneli linki (ADMIN için) ve çıkış butonu
- **Layout**: Split-screen tasarım (sol: hero section, sağ: menü listesi)
- **Kullanıcı Deneyimi**: 
  - Responsive grid layout (2 sütun)
  - Yemek görselleri (URL'den veya Unsplash API)
  - Yıldız puanlama gösterimi
  - Modal ile yorum formu

### 5.6. Admin Panel Component'leri

#### AdminPanel.jsx
- **Açıklama**: Admin panelinin ana yönetim sayfası (tüm CRUD işlemleri tek sayfada)
- **Özellikler**:
  - Tab-based navigation (Kategoriler, Yemekler, Günlük Menüler, Yorumlar, Kullanıcılar)
  - Her tab için tam CRUD işlemleri
  - Resim URL'i ekleme (yemekler için - opsiyonel)
  - Modal'lar ile düzenleme formları
  - Tarih filtreleme (yorumlar için)
  - Kullanıcı rol yönetimi (USER ↔ ADMIN)
- **Tab'lar**:
  - **Kategoriler**: Kategori ekleme, düzenleme, silme
  - **Yemekler**: Yemek ekleme, düzenleme, silme, resim URL'i ekleme (opsiyonel)
  - **Günlük Menüler**: Menü oluşturma, düzenleme, silme, yemek seçimi
  - **Yorumlar**: Yorumları görüntüleme, tarihe göre filtreleme, günlere göre gruplama, yemeklere göre gruplama, yorum silme
  - **Kullanıcılar**: Kullanıcı listesi, rol değiştirme (USER ↔ ADMIN), kullanıcı silme
- **CRUD İşlemleri**: Tüm entity'ler için Create, Read, Update, Delete işlemleri frontend'den yapılabilir
- **Resim Yönetimi**: Yemek fotoğrafları için sadece URL input'u kullanılır. Kullanıcılar harici bir URL (örn: Unsplash, Imgur) girebilir.
- **Yorum Yönetimi**: 
  - Yorumlar günlere göre gruplandırılır
  - Her gün içinde yorumlar yemeklere göre gruplandırılır
  - Tarih seçici ile belirli bir güne ait yorumlar filtrelenebilir
  - Her yorum için kullanıcı bilgisi, puan, yorum metni ve tarih gösterilir

#### AdminLayout.jsx
- **Açıklama**: Admin panelinin ana layout yapısı (kullanılmıyor, AdminPanel.jsx tek sayfa olarak çalışıyor)
- **Not**: Proje yapısında mevcut ancak aktif olarak kullanılmamaktadır

#### CategoriesPage.jsx
- **Açıklama**: Kategori yönetim sayfası
- **Özellikler**:
  - Kategori listesi (tablo formatında)
  - Yeni kategori ekleme formu
  - Kategori düzenleme (inline form)
  - Kategori silme (onay ile)
  - Form validasyonu
- **CRUD İşlemleri**: Tüm işlemler frontend'den yapılabilir

#### DishesPage.jsx
- **Açıklama**: Yemek yönetim sayfası (AdminPanel içinde tab olarak kullanılıyor)
- **Özellikler**:
  - Yemek listesi (kategori bilgileriyle birlikte)
  - Yeni yemek ekleme formu (kategori seçimi ile)
  - Yemek düzenleme (modal ile)
  - Yemek silme (onay ile)
  - Resim URL'i ekleme (opsiyonel - harici URL girişi)
  - Form validasyonu
- **CRUD İşlemleri**: Tüm işlemler frontend'den yapılabilir
- **Resim Yönetimi**: Yemek fotoğrafları için sadece URL input'u kullanılır. Kullanıcılar harici bir URL (örn: Unsplash, Imgur) girebilir.

#### DailyMenusPage.jsx
- **Açıklama**: Günlük menü yönetim sayfası (AdminPanel içinde tab olarak kullanılıyor)
- **Özellikler**:
  - Mevcut menülerin listesi (tarih ve yemek listesiyle)
  - Yeni menü oluşturma formu (tarih seçimi ve çoklu yemek seçimi)
  - Menü düzenleme (mevcut menüyü forma yükleme)
  - Menü silme (onay ile)
  - Checkbox ile çoklu yemek seçimi
- **CRUD İşlemleri**: Tüm işlemler frontend'den yapılabilir
- **Özel Özellikler**: Tarih bazlı menü yönetimi, çoka-çok ilişki yönetimi

### 5.7. API İletişimi

#### axios.js
- **Açıklama**: HTTP istekleri için yapılandırılmış Axios instance
- **Özellikler**:
  - Base URL yapılandırması (environment variable ile)
  - Request interceptor ile JWT token ekleme
  - Response/error handling
  - Token'ı localStorage'dan otomatik alır
- **Environment Variable**: `VITE_API_URL` (production'da Railway backend URL'i)

## 6. Güvenlik Özellikleri

### Backend Güvenliği
- **JWT Token**: Tüm korumalı endpoint'ler JWT token gerektirir
- **Role-Based Access Control (RBAC)**: ADMIN ve USER rolleri ile yetkilendirme
- **Password Hashing**: bcrypt ile şifreler hash'lenerek saklanır
- **Input Validation**: class-validator ile tüm input'lar validate edilir
- **CORS**: Cross-Origin Resource Sharing yapılandırılmıştır (Vercel frontend URL'i dahil)

### Frontend Güvenliği
- **Token Storage**: JWT token localStorage'da saklanır
- **Route Protection**: ProtectedRoute ve AdminRoute ile sayfa erişim kontrolü
- **Automatic Token Injection**: Axios interceptor ile token otomatik eklenir

## 7. Proje Gereksinimleri Karşılanması

✅ **Çalışan kullanıcı sistemi**: User entity ve authentication sistemi mevcut
✅ **En az iki rol**: USER ve ADMIN rolleri tanımlı ve çalışıyor
✅ **Kullanıcı kayıt, giriş ve yetkilendirme**: Tam implementasyon yapılmış (JWT token, bcrypt hash)
✅ **Rollere göre farklı sayfalar**: Admin paneli (ADMIN) ve kullanıcı sayfası (USER) ayrı
✅ **En az 4 entity**: User, Category, Dish, DailyMenu, Review (5 entity - gereksinimi aşıyor)
✅ **Bire-çok ilişki**: Category-Dish, User-Review, Dish-Review, DailyMenu-Review (4 adet - gereksinimi aşıyor)
✅ **Çoka-çok ilişki**: DailyMenu-Dish (many-to-many) - Prisma implicit many-to-many kullanılıyor
✅ **Frontend'den CRUD işlemleri**: Tüm entity'ler için Create, Read, Update, Delete işlemleri frontend'den yapılabilir
✅ **Bulut deployment**: Railway (backend) ve Vercel (frontend) üzerinde deploy edilmiştir
✅ **Detaylı rapor**: Bu rapor hazırlanmıştır ve tüm endpoint'ler, component'ler açıklanmıştır
✅ **Veritabanı diyagramı**: Rapor içinde mevcut
✅ **Endpoint açıklamaları**: Tüm backend endpoint'leri detaylı açıklanmıştır
✅ **Component açıklamaları**: Tüm frontend component'leri kısaca açıklanmıştır

## 8. Deployment Detayları

### Backend Deployment (Railway)

- **Platform**: Railway
- **URL**: https://tabldotproje-production.up.railway.app/api
- **Veritabanı**: SQLite (Persistent Volume ile)
- **Build Komutu**: `npm install --include=dev && npx prisma generate && npx prisma db push && npm run build`
- **Start Komutu**: `npm run start:prod`
- **Environment Variables**:
  - `DATABASE_URL`: `file:./prisma/dev.db`
  - `JWT_SECRET`: JWT token şifreleme anahtarı
  - `FRONTEND_URL`: `https://tabldot-proje.vercel.app`
- **Not**: SQLite kullanıldığı için Persistent Volume eklendi. Production için PostgreSQL önerilir ancak şu an SQLite ile çalışmaktadır.

### Frontend Deployment (Vercel)

- **Platform**: Vercel
- **URL**: https://tabldot-proje.vercel.app
- **Build Komutu**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://tabldotproje-production.up.railway.app/api`
- **Routing**: `vercel.json` ile SPA routing yapılandırılmıştır

### Environment Variables

#### Backend (.env - Railway)
```
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=your-secret-key
FRONTEND_URL=https://tabldot-proje.vercel.app
```

#### Frontend (.env - Vercel)
```
VITE_API_URL=https://tabldotproje-production.up.railway.app/api
```

## 9. Proje Yapısı

```
TabldotProje/
├── PROJE_RAPORU.md          # Proje raporu
├── tabldot-backend/         # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Kimlik doğrulama modülü
│   │   ├── categories/     # Kategori modülü
│   │   ├── daily-menus/    # Günlük menü modülü
│   │   ├── dishes/         # Yemek modülü
│   │   ├── reviews/        # Yorum modülü
│   │   ├── users/          # Kullanıcı modülü
│   │   ├── upload/         # Dosya yükleme modülü
│   │   └── prisma/         # Prisma servisi
│   ├── prisma/
│   │   ├── schema.prisma   # Veritabanı şeması
│   │   └── migrations/     # Migrasyonlar
│   ├── railway.json        # Railway deploy config
│   └── package.json        # Dependencies
│
└── tabldot-frontend/        # React Frontend
    ├── src/
    │   ├── admin/          # Admin panel component'leri
    │   ├── api/            # API yapılandırması
    │   ├── context/        # Context API
    │   ├── routes/         # Route guard'lar
    │   ├── App.jsx         # Ana routing
    │   ├── Home.jsx        # Ana sayfa
    │   ├── Login.jsx       # Giriş sayfası
    │   └── Register.jsx    # Kayıt sayfası
    ├── vercel.json         # Vercel deploy config
    └── package.json        # Dependencies
```

## 10. Önemli Notlar

### Kod Temizliği
- Projede tüm yorum satırları kaldırılmıştır
- Gereksiz dosyalar temizlenmiştir (eski Express route'ları, boş dosyalar)
- Proje yapısı NestJS ve React best practice'lerine uygundur

### Resim Yönetimi
- Local dosya yükleme desteği kaldırılmıştır
- Yemek fotoğrafları için sadece harici URL girişi kullanılmaktadır
- Kullanıcılar Unsplash, Imgur gibi servislerden URL girebilir

### Veritabanı
- Şu anda SQLite kullanılmaktadır (Railway Persistent Volume ile)
- Production için PostgreSQL önerilir ancak SQLite ile de çalışmaktadır
- Veriler Persistent Volume sayesinde deploy'lar arasında korunur

### Deployment
- Backend Railway üzerinde çalışmaktadır
- Frontend Vercel üzerinde çalışmaktadır
- CORS yapılandırması Vercel URL'i için yapılmıştır
- Environment variable'lar her iki platformda da yapılandırılmıştır

## 11. Sonuç

Tabldot Projesi, modern web teknolojileri kullanılarak geliştirilmiş, tam fonksiyonel bir yemekhane yönetim sistemidir. Proje, tüm belirtilen gereksinimleri karşılamakta ve production-ready bir yapıya sahiptir. Backend ve frontend arasındaki iletişim RESTful API prensiplerine uygun olarak tasarlanmıştır. Güvenlik, kullanıcı deneyimi ve kod kalitesi açısından best practice'ler uygulanmıştır. Proje başarıyla Railway ve Vercel üzerinde deploy edilmiştir ve public olarak erişilebilir durumdadır.
