import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import rateLimit from "express-rate-limit";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Veritabanı bağlantısı
const db = new sqlite3.Database('./chatbot.db');

// Veritabanı tablolarını oluştur
db.serialize(() => {
  // Bot yanıtları tablosu
  db.run(`CREATE TABLE IF NOT EXISTS bot_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    keywords TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Admin kullanıcıları tablosu
  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Ürünler tablosu
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0.00,
    category TEXT NOT NULL,
    description TEXT,
    size TEXT,
    color TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Varsayılan verileri ekle
  const defaultResponses = [
    ['greeting', 'merhaba,selam,iyi günler,hello,hi', 'Merhaba! Size nasıl yardımcı olabilirim?'],
    ['greeting', 'günaydın,iyi sabahlar,good morning', 'Günaydın! Bugün nasıl yardımcı olabilirim?'],
    ['greeting', 'iyi akşamlar,good evening', 'İyi akşamlar! Size nasıl yardımcı olabilirim?'],
    ['greeting', 'teşekkürler,teşekkür,thanks,thank you', 'Rica ederim! Başka bir konuda yardımcı olabilir miyim?'],
    ['kargo', 'kargo,teslimat,kargom,shipping,delivery', 'Kargo takibi için sipariş numaranızı iletiniz.'],
    ['iade', 'iade,degisim,değişim,return,exchange', 'İade/Değişim süremiz 14 gündür. Detay için: /iade'],
    ['beden', 'beden,ölçü,size,size chart', 'Beden tablosu: /beden-tablosu'],
    ['general', 'yardım,help,ne yapabilirsin,what can you do', 'Size şu konularda yardımcı olabilirim: kargo takibi, iade/değişim, beden tablosu ve genel sorularınız.'],
    ['general', 'fiyat,price,ücret,cost', 'Fiyat bilgileri için ürün sayfasını kontrol edebilir veya müşteri hizmetlerimizle iletişime geçebilirsiniz.'],
    ['general', 'stok,stock,mevcut,available', 'Stok durumu için ürün sayfasını kontrol edebilir veya müşteri hizmetlerimizle iletişime geçebilirsiniz.']
  ];

  const stmt = db.prepare("INSERT OR IGNORE INTO bot_responses (category, keywords, response) VALUES (?, ?, ?)");
  defaultResponses.forEach(([category, keywords, response]) => {
    stmt.run(category, keywords, response);
  });
  stmt.finalize();

  // Varsayılan admin kullanıcısı (username: admin, password: admin123)
  db.run(`INSERT OR IGNORE INTO admin_users (username, password) VALUES 
    ('admin', 'admin123')
  `);

  // Varsayılan ürün verileri
  const defaultProducts = [
    ['Kırmızı Tişört', 15, 89.99, 'Tişört', 'Rahat kesim pamuklu tişört', 'L', 'Kırmızı'],
    ['Mavi Jean', 8, 199.99, 'Pantolon', 'Klasik mavi jean pantolon', 'M', 'Mavi'],
    ['Siyah Elbise', 12, 299.99, 'Elbise', 'Şık siyah elbise', 'S', 'Siyah'],
    ['Beyaz Gömlek', 20, 149.99, 'Gömlek', 'Klasik beyaz gömlek', 'L', 'Beyaz'],
    ['Gri Kazak', 5, 179.99, 'Kazak', 'Yumuşak gri kazak', 'XL', 'Gri']
  ];

  const productStmt = db.prepare("INSERT OR IGNORE INTO products (name, stock, price, category, description, size, color) VALUES (?, ?, ?, ?, ?, ?, ?)");
  defaultProducts.forEach(([name, stock, price, category, description, size, color]) => {
    productStmt.run(name, stock, price, category, description, size, color);
  });
  productStmt.finalize();
});

// Mount path support (for subdirectory deployments like /chat)
let BASE = process.env.BASE_PATH || "/";
if (!BASE.startsWith("/")) BASE = "/" + BASE;
if (!BASE.endsWith("/")) BASE = BASE + "/";

// Security middleware
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// XSS protection
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Input sanitization
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// SQL injection protection
function escapeSqlString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/'/g, "''");
}

const publicDir = path.join(__dirname, "public");
app.use(BASE, express.static(publicDir));

// Turkish NLP functions
function normalizeText(text) {
  if (!text) return '';
  const charMap = {
    'ı': 'i', 'İ': 'I', 'ğ': 'g', 'Ğ': 'G',
    'ü': 'u', 'Ü': 'U', 'ş': 's', 'Ş': 'S',
    'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
  };
  
  let normalized = text.toLowerCase().trim();
  for (const [turkish, english] of Object.entries(charMap)) {
    normalized = normalized.replace(new RegExp(turkish, 'g'), english);
  }
  return normalized;
}

function correctSpelling(text) {
  const corrections = {
    'gelmedı': 'gelmedi', 'kargom ne zmn': 'kargom ne zaman',
    'ne zmn': 'ne zaman', 'nasil': 'nasıl', 'tesekkur': 'teşekkür',
    'meraba': 'merhaba', 'degisim': 'değişim', 'olcu': 'ölçü',
    'ucret': 'ücret', 'kaldi': 'kaldı', 'bugun': 'bugün',
    'simdi': 'şimdi', 'guzel': 'güzel', 'kirmizi': 'kırmızı',
    'yesil': 'yeşil', 'sari': 'sarı', 'buyuk': 'büyük',
    'kucuk': 'küçük', 'kisa': 'kısa', 'genis': 'geniş'
  };
  
  let corrected = text.toLowerCase().trim();
  for (const [wrong, correct] of Object.entries(corrections)) {
    const regex = new RegExp('\\b' + wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    corrected = corrected.replace(regex, correct);
  }
  return corrected;
}

function extractProductInfo(text) {
  const normalized = normalizeText(text);
  const products = [];
  const colors = [];
  const sizes = [];
  
  // Product categories
  const productKeywords = {
    'tişört': ['tişört', 'tişort', 't-shirt', 'tshirt', 'gömlek'],
    'pantolon': ['pantolon', 'jean', 'trouser'],
    'elbise': ['elbise', 'dress'],
    'gömlek': ['gömlek', 'gomlek', 'shirt'],
    'kazak': ['kazak', 'sweater', 'hırka'],
    'etek': ['etek', 'skirt'],
    'ceket': ['ceket', 'jacket'],
    'mont': ['mont', 'coat', 'palto']
  };
  
  for (const [category, keywords] of Object.entries(productKeywords)) {
    for (const keyword of keywords) {
      if (normalized.includes(normalizeText(keyword))) {
        products.push(category);
        break;
      }
    }
  }
  
  // Colors
  const colorKeywords = ['kırmızı', 'mavi', 'yeşil', 'sarı', 'beyaz', 'siyah', 'gri', 'kahverengi', 'pembe', 'mor'];
  for (const color of colorKeywords) {
    if (normalized.includes(normalizeText(color))) {
      colors.push(color);
    }
  }
  
  // Sizes
  const sizeKeywords = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'beden', 'ölçü', 'size'];
  for (const size of sizeKeywords) {
    if (normalized.includes(normalizeText(size))) {
      sizes.push(size.toUpperCase());
    }
  }
  
  return { products, colors, sizes };
}

function hasStockKeywords(text) {
  const stockKeywords = ['stok', 'mevcut', 'var', 'yok', 'kaldı', 'kaldı mı', 'var mı', 'yok mu'];
  const normalized = normalizeText(text);
  return stockKeywords.some(keyword => normalized.includes(normalizeText(keyword)));
}

function botReply(userText) {
  return new Promise((resolve, reject) => {
    const t = (userText || "").toLowerCase().trim();
    
    if (!t) {
      resolve("Merhaba! Size nasıl yardımcı olabilirim?");
      return;
    }

    // Correct spelling and normalize
    const corrected = correctSpelling(userText);
    const normalized = normalizeText(corrected);
    
    // Check for stock queries
    if (hasStockKeywords(corrected)) {
      const productInfo = extractProductInfo(corrected);
      const searchTerms = [...productInfo.products, ...productInfo.colors, ...productInfo.sizes];
      
      console.log('Stock query detected:', corrected);
      console.log('Product info:', productInfo);
      console.log('Search terms:', searchTerms);
      
      if (searchTerms.length > 0) {
        const searchQuery = searchTerms.join(' ');
        console.log('Search query:', searchQuery);
        db.all(`SELECT * FROM products WHERE 
          LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'), 'İ', 'I'), 'Ğ', 'G')) LIKE ? OR 
          LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(category, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'), 'İ', 'I'), 'Ğ', 'G')) LIKE ? OR 
          LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(color, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'), 'İ', 'I'), 'Ğ', 'G')) LIKE ? OR 
          LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(size, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'), 'ç', 'c'), 'İ', 'I'), 'Ğ', 'G')) LIKE ? 
          ORDER BY stock DESC, name`, 
          [`%${searchQuery.toLowerCase()}%`, `%${searchQuery.toLowerCase()}%`, `%${searchQuery.toLowerCase()}%`, `%${searchQuery.toLowerCase()}%`], 
          (err, rows) => {
          if (err) {
            console.error('Database error:', err);
            resolve("Stok kontrolü sırasında bir hata oluştu.");
            return;
          }
          
          if (rows.length === 0) {
            resolve("Aradığınız ürün bulunamadı. Farklı bir arama yapmayı deneyin.");
            return;
          }
          
          let response = "Stok durumu:\n\n";
          rows.forEach(product => {
            const stockStatus = product.stock > 0 ? `✅ Stokta (${product.stock} adet)` : "❌ Stokta yok";
            response += `• ${product.name} (${product.color}, ${product.size}) - ${stockStatus}\n`;
            response += `  Fiyat: ${product.price}₺\n\n`;
          });
          
          resolve(response);
        });
        return;
      }
    }

    // Check for specific customer support scenarios
    if (normalized.includes('kargo') || normalized.includes('teslimat')) {
      if (normalized.includes('nerede') || normalized.includes('takip')) {
        resolve("Kargo takibi için sipariş numaranızı paylaşır mısınız? Size detaylı bilgi verebilirim.");
        return;
      }
      resolve("Kargo ile ilgili sorularınız için sipariş numaranızı iletiniz veya müşteri hizmetlerimizle iletişime geçiniz.");
      return;
    }
    
    if (normalized.includes('iade') || normalized.includes('degisim') || normalized.includes('değişim')) {
      resolve("İade/Değişim politikamız:\n• 14 gün içinde iade/değişim yapabilirsiniz\n• Ürün orijinal ambalajında olmalı\n• Etiketler çıkarılmamış olmalı\n\nDetaylı bilgi için: /iade-politikasi");
      return;
    }
    
    if (normalized.includes('beden') || normalized.includes('olcu') || normalized.includes('ölçü')) {
      resolve("Beden tablosu:\n• XS: 32-34\n• S: 36-38\n• M: 40-42\n• L: 44-46\n• XL: 48-50\n• XXL: 52-54\n\nDetaylı ölçü tablosu için: /beden-tablosu");
      return;
    }
    
    if (normalized.includes('site') && (normalized.includes('acilmiyor') || normalized.includes('açılmıyor'))) {
      resolve("Site sorunları için:\n• Tarayıcı önbelleğini temizleyin\n• Farklı tarayıcı deneyin\n• İnternet bağlantınızı kontrol edin\n\nSorun devam ederse teknik destek ekibimizle iletişime geçin.");
      return;
    }
    
    if (normalized.includes('sifre') || normalized.includes('şifre')) {
      resolve("Şifre sıfırlama için:\n• Giriş sayfasında 'Şifremi Unuttum' linkine tıklayın\n• E-posta adresinizi girin\n• Gelen e-postadaki linki takip edin\n\nSorun devam ederse müşteri hizmetlerimizle iletişime geçin.");
      return;
    }

    // Veritabanından uygun yanıtı bul
    db.all("SELECT * FROM bot_responses", (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        reject(err);
        return;
      }

      // Her yanıt için anahtar kelimeleri kontrol et
      for (const row of rows) {
        const keywords = row.keywords.split(',').map(k => k.trim().toLowerCase());
        const hasKeyword = keywords.some(keyword => normalized.includes(keyword));
        
        if (hasKeyword) {
          resolve(row.response);
          return;
        }
      }

      // Eşleşme bulunamazsa fallback yanıt
      resolve("Anlayamadım, bu konuda size daha iyi yardımcı olabilmem için müşteri temsilcimize yönlendiriyorum. Kısa süre içinde size dönüş yapacağız.");
    });
  });
}

app.post(`${BASE}api/chat`, async (req, res) => {
  try {
    const { message } = req.body || {};
    
    // Sanitize input
    const sanitizedMessage = sanitizeInput(message);
    
    if (!sanitizedMessage || sanitizedMessage.length > 1000) {
      return res.status(400).json({ reply: 'Geçersiz mesaj.' });
    }
    
    const reply = await botReply(sanitizedMessage);
    res.json({ reply: sanitizeInput(reply) });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ reply: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

// Admin paneli API'leri
app.get(`${BASE}admin`, (req, res) => {
  res.sendFile(path.join(publicDir, "admin.html"));
});

// Admin girişi
app.post(`${BASE}api/admin/login`, (req, res) => {
  const { username, password } = req.body;
  
  // Sanitize inputs
  const sanitizedUsername = sanitizeInput(username);
  const sanitizedPassword = sanitizeInput(password);
  
  if (!sanitizedUsername || !sanitizedPassword) {
    return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gerekli' });
  }
  
  db.get("SELECT * FROM admin_users WHERE username = ? AND password = ?", 
    [sanitizedUsername, sanitizedPassword], (err, row) => {
    if (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Veritabanı hatası' });
      return;
    }
    
    if (row) {
      res.json({ success: true, message: 'Giriş başarılı' });
    } else {
      res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı' });
    }
  });
});

// Bot yanıtlarını getir
app.get(`${BASE}api/admin/responses`, (req, res) => {
  db.all("SELECT * FROM bot_responses ORDER BY category, id", (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json(rows);
  });
});

// Yeni bot yanıtı ekle
app.post(`${BASE}api/admin/responses`, (req, res) => {
  const { category, keywords, response } = req.body;
  
  db.run("INSERT INTO bot_responses (category, keywords, response) VALUES (?, ?, ?)",
    [category, keywords, response], function(err) {
    if (err) {
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json({ success: true, id: this.lastID });
  });
});

// Bot yanıtını güncelle
app.put(`${BASE}api/admin/responses/:id`, (req, res) => {
  const { id } = req.params;
  const { category, keywords, response } = req.body;
  
  db.run("UPDATE bot_responses SET category = ?, keywords = ?, response = ? WHERE id = ?",
    [category, keywords, response, id], function(err) {
    if (err) {
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json({ success: true, changes: this.changes });
  });
});

// Bot yanıtını sil
app.delete(`${BASE}api/admin/responses/:id`, (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM bot_responses WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json({ success: true, changes: this.changes });
  });
});

// Ürün API'leri
// Tüm ürünleri getir
app.get(`${BASE}api/admin/products`, (req, res) => {
  db.all("SELECT * FROM products ORDER BY category, name", (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json(rows);
  });
});

// Yeni ürün ekle
app.post(`${BASE}api/admin/products`, (req, res) => {
  const { name, stock, price, category, description, size, color } = req.body;
  
  db.run("INSERT INTO products (name, stock, price, category, description, size, color) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, stock, price, category, description, size, color], function(err) {
    if (err) {
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json({ success: true, id: this.lastID });
  });
});

// Ürün güncelle
app.put(`${BASE}api/admin/products/:id`, (req, res) => {
  const { id } = req.params;
  const { name, stock, price, category, description, size, color } = req.body;
  
  db.run("UPDATE products SET name = ?, stock = ?, price = ?, category = ?, description = ?, size = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, stock, price, category, description, size, color, id], function(err) {
    if (err) {
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json({ success: true, changes: this.changes });
  });
});

// Ürün sil
app.delete(`${BASE}api/admin/products/:id`, (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM products WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json({ success: true, changes: this.changes });
  });
});

// Stok kontrolü için ürün arama
app.get(`${BASE}api/products/search`, (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    res.json([]);
    return;
  }
  
  const searchTerm = `%${q.toLowerCase()}%`;
  db.all(`SELECT * FROM products WHERE 
    LOWER(name) LIKE ? OR 
    LOWER(category) LIKE ? OR 
    LOWER(color) LIKE ? OR 
    LOWER(size) LIKE ? 
    ORDER BY stock DESC, name`, 
    [searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Veritabanı hatası' });
      return;
    }
    res.json(rows);
  });
});

app.get(`${BASE}health`, (_, res) => res.send("ok"));

app.get(`${BASE}config.js`, (_, res) => {
  res.type("application/javascript").send(`window.BASE_PATH = "${BASE}";`);
});

app.get(BASE, (_, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/", (_, res) => res.redirect(BASE));

app.listen(PORT, () => {
  console.log(`Chat bot running on http://localhost:${PORT} at BASE_PATH ${BASE}`);
});
