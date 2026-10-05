# 🤖 Akıllı Türkçe Chatbot

E-ticaret sitelerine embed edilebilen, stok yönetimi yapabilen, Türkçe kullanıcıların yazım hatalarını anlayıp düzeltebilen ve müşteri temsilcisi işlevi gören akıllı bir chatbot.

## ✨ Özellikler

### 🌐 Web Sitesi Entegrasyonu
- `<script src="/chatbot.js"></script>` ile kolayca embed edilebilir
- CSS tasarımını "inherit" eder (mevcut sitenin CSS renk paleti ile uyumlu)
- Varsayılan modern dark theme desteği
- Responsive tasarım

### 🗄️ Veritabanı Geliştirmeleri (SQLite)
- **products** tablosu: id, name, stock, price, category, description, size, color, updated_at
- Stok kontrolü yapabilen chatbot
- Admin paneline ürün ekleme/düzenleme/silme özelliği

### 🇹🇷 Türkçe Doğal Dil İşleme
- Kullanıcı mesajlarını normalize eder
- Yazım hatalarını düzeltir (ör: "gelmedı" → "gelmedi", "kargom ne zmn" → "kargom ne zaman")
- Levenshtein distance algoritması ile akıllı düzeltme
- Türkçe karakter düzeltmeleri

### 🛠️ Müşteri Destek Fonksiyonları
- **Sipariş/kargo durumu**: "kargom nerede", "kargo takip"
- **İade & değişim politikaları**: 14 günlük iade süresi bilgisi
- **Beden tablosu bilgisi**: XS-XXXL beden ölçüleri
- **Teknik destek**: "site açılmıyor", "şifreyi unuttum"
- **Fallback**: Anlayamadığında müşteri temsilcisine yönlendirme

### 🔧 Admin Paneli İyileştirmeleri
- Çalışan login sistemi (username/password doğrulama)
- CRUD işlemleri (yanıt ekleme/silme/düzenleme, ürün stok yönetimi)
- Toast mesajları ile kullanıcı geri bildirimi
- Tab-based arayüz (Bot Yanıtları / Ürün Yönetimi)

### 🔒 Güvenlik
- SQL injection koruması
- XSS koruması
- Rate limiting (15 dakikada 100 istek)
- Input sanitization
- Güvenli header'lar

## 🚀 Kurulum

### Gereksinimler
- Node.js 16+
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd chat-bot
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Sunucuyu başlatın:**
```bash
npm start
```

4. **Tarayıcıda açın:**
```
http://localhost:3000
```

## 📖 Kullanım

### Chatbot'u Embed Etme

Web sitenize chatbot'u eklemek için:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Benim Sitem</title>
  <!-- CSS değişkenlerini tanımlayın (opsiyonel) -->
  <style>
    :root {
      --chatbot-primary: #your-color;
      --chatbot-bg: #your-bg-color;
      /* diğer değişkenler... */
    }
  </style>
</head>
<body>
  <!-- Sitenizin içeriği -->
  
  <!-- Chatbot'u embed edin -->
  <script src="https://yourdomain.com/config.js"></script>
  <script src="https://yourdomain.com/chatbot.js"></script>
</body>
</html>
```

### CSS Değişkenleri

Chatbot, aşağıdaki CSS değişkenlerini kullanarak sitenizin tasarımına uyum sağlar:

```css
:root {
  --chatbot-primary: #2dd4bf;           /* Ana renk */
  --chatbot-primary-text: #0b0f14;      /* Ana renk üzerindeki yazı */
  --chatbot-primary-hover: #20b5a0;     /* Hover rengi */
  --chatbot-bg: #11161d;                /* Arka plan */
  --chatbot-text: #e6edf3;              /* Yazı rengi */
  --chatbot-muted: #9aa4b2;             /* Soluk yazı */
  --chatbot-border: #1f2937;            /* Kenarlık */
  --chatbot-header-bg: #0f1720;         /* Header arka planı */
  --chatbot-message-bg: #0b1220;        /* Mesaj arka planı */
  --chatbot-input-bg: #0b1220;          /* Input arka planı */
  --chatbot-input-border: #243041;      /* Input kenarlığı */
}
```

### Admin Paneli

Admin paneline erişim:
```
http://localhost:3000/admin
```

**Varsayılan giriş bilgileri:**
- Kullanıcı adı: `admin`
- Şifre: `admin123`

## 🎯 API Endpoints

### Chat API
```
POST /api/chat
Content-Type: application/json

{
  "message": "kırmızı tişört var mı?"
}
```

### Ürün Arama API
```
GET /api/products/search?q=kırmızı
```

### Admin API'leri
- `GET /api/admin/responses` - Bot yanıtlarını listele
- `POST /api/admin/responses` - Yeni yanıt ekle
- `PUT /api/admin/responses/:id` - Yanıt güncelle
- `DELETE /api/admin/responses/:id` - Yanıt sil
- `GET /api/admin/products` - Ürünleri listele
- `POST /api/admin/products` - Yeni ürün ekle
- `PUT /api/admin/products/:id` - Ürün güncelle
- `DELETE /api/admin/products/:id` - Ürün sil

## 🔧 Konfigürasyon

### Environment Variables

`.env` dosyası oluşturun:

```env
PORT=3000
BASE_PATH=/
```

### Subdirectory Deployment

Chatbot'u `/chat` gibi bir alt dizinde çalıştırmak için:

```env
BASE_PATH=/chat/
```

## 📝 Örnek Kullanım Senaryoları

### Stok Sorgulama
- "kırmızı tişört var mı?"
- "L beden kaldı mı?"
- "mavi jean stokta var mı?"

### Kargo Takibi
- "kargom nerede?"
- "kargo takip numarası"
- "teslimat ne zaman?"

### İade/Değişim
- "iade nasıl yapılır?"
- "değişim politikası nedir?"
- "14 gün içinde iade edebilir miyim?"

### Beden Bilgisi
- "beden tablosu"
- "ölçü nasıl alınır?"
- "M beden kaç numara?"

## 🛠️ Geliştirme

### Proje Yapısı
```
chat-bot/
├── server.js              # Ana sunucu dosyası
├── package.json           # Bağımlılıklar
├── chatbot.db            # SQLite veritabanı
└── public/
    ├── index.html         # Ana sayfa
    ├── admin.html         # Admin paneli
    ├── chatbot.js         # Embed edilebilir widget
    ├── app.js            # Ana sayfa JavaScript
    ├── style.css         # CSS stilleri
    ├── turkish-nlp.js    # Türkçe NLP modülü
    └── embed-example.html # Embed örneği
```

### Veritabanı Şeması

**bot_responses tablosu:**
- id (INTEGER PRIMARY KEY)
- category (TEXT)
- keywords (TEXT)
- response (TEXT)
- created_at (DATETIME)

**products tablosu:**
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- stock (INTEGER)
- price (DECIMAL)
- category (TEXT)
- description (TEXT)
- size (TEXT)
- color (TEXT)
- updated_at (DATETIME)

**admin_users tablosu:**
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- password (TEXT)
- created_at (DATETIME)

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Herhangi bir sorunuz varsa:
- GitHub Issues kullanın
- Admin panelinden bot yanıtlarını düzenleyin
- Türkçe NLP modülünü özelleştirin

---

**Not:** Bu chatbot, e-ticaret sitelerine özel olarak tasarlanmıştır ve Türkçe kullanıcılar için optimize edilmiştir.
