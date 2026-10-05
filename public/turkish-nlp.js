/**
 * Turkish Natural Language Processing Module
 * Handles text normalization, spelling correction, and keyword extraction
 */

class TurkishNLP {
  constructor() {
    // Turkish character mappings for normalization
    this.charMap = {
      'ı': 'i', 'İ': 'I', 'ğ': 'g', 'Ğ': 'G',
      'ü': 'u', 'Ü': 'U', 'ş': 's', 'Ş': 'S',
      'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
    };

    // Common Turkish spelling mistakes and corrections
    this.spellingCorrections = {
      'gelmedı': 'gelmedi',
      'kargom ne zmn': 'kargom ne zaman',
      'ne zmn': 'ne zaman',
      'nasıl': 'nasıl',
      'nasil': 'nasıl',
      'nasılsın': 'nasılsın',
      'nasilsin': 'nasılsın',
      'teşekkür': 'teşekkür',
      'tesekkur': 'teşekkür',
      'teşekkürler': 'teşekkürler',
      'tesekkurler': 'teşekkürler',
      'merhaba': 'merhaba',
      'meraba': 'merhaba',
      'selam': 'selam',
      'selamun': 'selam',
      'aleyküm': 'aleyküm',
      'aleykum': 'aleyküm',
      'kargo': 'kargo',
      'kargo': 'kargo',
      'kargom': 'kargom',
      'kargom': 'kargom',
      'teslimat': 'teslimat',
      'teslimat': 'teslimat',
      'iade': 'iade',
      'iade': 'iade',
      'degisim': 'değişim',
      'degisim': 'değişim',
      'değişim': 'değişim',
      'beden': 'beden',
      'beden': 'beden',
      'ölçü': 'ölçü',
      'olcu': 'ölçü',
      'size': 'size',
      'size': 'size',
      'fiyat': 'fiyat',
      'fiyat': 'fiyat',
      'ücret': 'ücret',
      'ucret': 'ücret',
      'stok': 'stok',
      'stok': 'stok',
      'mevcut': 'mevcut',
      'mevcut': 'mevcut',
      'var': 'var',
      'var': 'var',
      'yok': 'yok',
      'yok': 'yok',
      'kaldı': 'kaldı',
      'kaldi': 'kaldı',
      'kaldı mı': 'kaldı mı',
      'kaldi mi': 'kaldı mı',
      'var mı': 'var mı',
      'var mi': 'var mı',
      'yok mu': 'yok mu',
      'yok mu': 'yok mu',
      'ne zaman': 'ne zaman',
      'ne zaman': 'ne zaman',
      'zaman': 'zaman',
      'zaman': 'zaman',
      'bugün': 'bugün',
      'bugun': 'bugün',
      'yarın': 'yarın',
      'yarin': 'yarın',
      'dün': 'dün',
      'dun': 'dün',
      'şimdi': 'şimdi',
      'simdi': 'şimdi',
      'hemen': 'hemen',
      'hemen': 'hemen',
      'acil': 'acil',
      'acil': 'acil',
      'hızlı': 'hızlı',
      'hizli': 'hızlı',
      'yavaş': 'yavaş',
      'yavas': 'yavaş',
      'güzel': 'güzel',
      'guzel': 'güzel',
      'kötü': 'kötü',
      'kotu': 'kötü',
      'iyi': 'iyi',
      'iyi': 'iyi',
      'kötü': 'kötü',
      'kotu': 'kötü',
      'büyük': 'büyük',
      'buyuk': 'büyük',
      'küçük': 'küçük',
      'kucuk': 'küçük',
      'uzun': 'uzun',
      'uzun': 'uzun',
      'kısa': 'kısa',
      'kisa': 'kısa',
      'geniş': 'geniş',
      'genis': 'geniş',
      'dar': 'dar',
      'dar': 'dar',
      'renk': 'renk',
      'renk': 'renk',
      'kırmızı': 'kırmızı',
      'kirmizi': 'kırmızı',
      'mavi': 'mavi',
      'mavi': 'mavi',
      'yeşil': 'yeşil',
      'yesil': 'yeşil',
      'sarı': 'sarı',
      'sari': 'sarı',
      'beyaz': 'beyaz',
      'beyaz': 'beyaz',
      'siyah': 'siyah',
      'siyah': 'siyah',
      'gri': 'gri',
      'gri': 'gri',
      'kahverengi': 'kahverengi',
      'kahverengi': 'kahverengi',
      'pembe': 'pembe',
      'pembe': 'pembe',
      'mor': 'mor',
      'mor': 'mor',
      'turuncu': 'turuncu',
      'turuncu': 'turuncu',
      'lacivert': 'lacivert',
      'lacivert': 'lacivert',
      'beden': 'beden',
      'beden': 'beden',
      'xs': 'XS',
      's': 'S',
      'm': 'M',
      'l': 'L',
      'xl': 'XL',
      'xxl': 'XXL',
      'xxxl': 'XXXL'
    };

    // Product-related keywords
    this.productKeywords = {
      'tişört': ['tişört', 'tişort', 't-shirt', 'tshirt', 'gömlek'],
      'pantolon': ['pantolon', 'pantolon', 'jean', 'jean', 'trouser'],
      'elbise': ['elbise', 'elbise', 'dress', 'dress'],
      'gömlek': ['gömlek', 'gomlek', 'shirt', 'shirt'],
      'kazak': ['kazak', 'kazak', 'sweater', 'sweater', 'hırka'],
      'etek': ['etek', 'etek', 'skirt', 'skirt'],
      'ceket': ['ceket', 'ceket', 'jacket', 'jacket'],
      'mont': ['mont', 'mont', 'coat', 'coat', 'palto'],
      'ayakkabı': ['ayakkabı', 'ayakkabi', 'shoe', 'shoes', 'bot'],
      'çanta': ['çanta', 'canta', 'bag', 'bag', 'sırt çantası'],
      'şapka': ['şapka', 'sapka', 'hat', 'cap', 'kep'],
      'eldiven': ['eldiven', 'eldiven', 'glove', 'gloves'],
      'atkı': ['atkı', 'atki', 'scarf', 'scarf'],
      'kemer': ['kemer', 'kemer', 'belt', 'belt']
    };

    // Size keywords
    this.sizeKeywords = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'beden', 'ölçü', 'size'];

    // Color keywords
    this.colorKeywords = [
      'kırmızı', 'mavi', 'yeşil', 'sarı', 'beyaz', 'siyah', 'gri', 'kahverengi',
      'pembe', 'mor', 'turuncu', 'lacivert', 'bordo', 'turkuaz', 'altın', 'gümüş'
    ];

    // Stock-related keywords
    this.stockKeywords = ['stok', 'mevcut', 'var', 'yok', 'kaldı', 'kaldı mı', 'var mı', 'yok mu', 'bulunuyor', 'bulunmuyor'];
  }

  /**
   * Normalize text by removing Turkish characters and converting to lowercase
   */
  normalize(text) {
    if (!text) return '';
    
    let normalized = text.toLowerCase().trim();
    
    // Replace Turkish characters
    for (const [turkish, english] of Object.entries(this.charMap)) {
      normalized = normalized.replace(new RegExp(turkish, 'g'), english);
    }
    
    return normalized;
  }

  /**
   * Correct common spelling mistakes
   */
  correctSpelling(text) {
    if (!text) return '';
    
    let corrected = text.toLowerCase().trim();
    
    // Apply spelling corrections
    for (const [wrong, correct] of Object.entries(this.spellingCorrections)) {
      const regex = new RegExp('\\b' + wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
      corrected = corrected.replace(regex, correct);
    }
    
    return corrected;
  }

  /**
   * Extract product-related keywords from text
   */
  extractProductKeywords(text) {
    const normalized = this.normalize(text);
    const found = [];
    
    for (const [category, keywords] of Object.entries(this.productKeywords)) {
      for (const keyword of keywords) {
        if (normalized.includes(this.normalize(keyword))) {
          found.push(category);
          break;
        }
      }
    }
    
    return [...new Set(found)];
  }

  /**
   * Extract size information from text
   */
  extractSize(text) {
    const normalized = this.normalize(text);
    const found = [];
    
    for (const size of this.sizeKeywords) {
      if (normalized.includes(this.normalize(size))) {
        found.push(size.toUpperCase());
      }
    }
    
    return [...new Set(found)];
  }

  /**
   * Extract color information from text
   */
  extractColor(text) {
    const normalized = this.normalize(text);
    const found = [];
    
    for (const color of this.colorKeywords) {
      if (normalized.includes(this.normalize(color))) {
        found.push(color);
      }
    }
    
    return [...new Set(found)];
  }

  /**
   * Check if text contains stock-related keywords
   */
  hasStockKeywords(text) {
    const normalized = this.normalize(text);
    
    return this.stockKeywords.some(keyword => 
      normalized.includes(this.normalize(keyword))
    );
  }

  /**
   * Extract all relevant information from text
   */
  analyze(text) {
    const corrected = this.correctSpelling(text);
    const normalized = this.normalize(corrected);
    
    return {
      original: text,
      corrected: corrected,
      normalized: normalized,
      products: this.extractProductKeywords(corrected),
      sizes: this.extractSize(corrected),
      colors: this.extractColor(corrected),
      hasStockQuery: this.hasStockKeywords(corrected),
      isQuestion: corrected.includes('?') || corrected.includes('mi') || corrected.includes('mı'),
      isGreeting: this.isGreeting(corrected),
      isThankYou: this.isThankYou(corrected)
    };
  }

  /**
   * Check if text is a greeting
   */
  isGreeting(text) {
    const greetings = ['merhaba', 'selam', 'hello', 'hi', 'günaydın', 'iyi günler', 'iyi akşamlar'];
    const normalized = this.normalize(text);
    
    return greetings.some(greeting => normalized.includes(greeting));
  }

  /**
   * Check if text is a thank you
   */
  isThankYou(text) {
    const thanks = ['teşekkür', 'thanks', 'thank you', 'sağol', 'sağolun'];
    const normalized = this.normalize(text);
    
    return thanks.some(thank => normalized.includes(thank));
  }

  /**
   * Generate search query for product search
   */
  generateSearchQuery(analysis) {
    const terms = [];
    
    // Add product categories
    terms.push(...analysis.products);
    
    // Add colors
    terms.push(...analysis.colors);
    
    // Add sizes
    terms.push(...analysis.sizes);
    
    return terms.join(' ');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TurkishNLP;
} else if (typeof window !== 'undefined') {
  window.TurkishNLP = TurkishNLP;
}
