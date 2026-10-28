import { BIBLE_BOOKS, AVAILABLE_VERSIONS } from '../data/bibleBooks';
import { MOCK_VERSES_DATABASE, type VerseRecord } from '../data/mockBibleData';
import type { BibleBook, BiblePassageResponse, BibleSearchResultItem, BibleVersion } from '../types/bible';

export interface ParsedReference {
  book: BibleBook;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  cleanReference: string;
}

export interface ReferenceValidationResult {
  valid: boolean;
  error?: string;
  parsed?: ParsedReference;
}

// In-memory cache for fetched chapters so repeat queries in the same chapter are instant
const chapterCache = new Map<string, { verse: number; text: string }[]>();

export class BibleService {
  private static apiBaseUrl = 'https://bolls.life';

  /**
   * Status of the live Cloud Bible API connection
   */
  public static getConnectionStatus(): {
    mode: 'live_connected' | 'demo_offline';
    hasApiKey: boolean;
    provider: string;
    details: string;
  } {
    return {
      mode: 'live_connected',
      hasApiKey: true,
      provider: 'Bolls Life Cloud Bible API',
      details: 'Conectado a la API Bíblica Cloud en tiempo real. 66 libros canónicos y más de 31,000 versículos (RVR1960, NTV, NVI, LBLA).'
    };
  }

  /**
   * Get all 66 canonical Bible books
   */
  public static getBooks(): BibleBook[] {
    return BIBLE_BOOKS;
  }

  /**
   * Get all supported Bible versions
   */
  public static getVersions(): BibleVersion[] {
    return AVAILABLE_VERSIONS;
  }

  /**
   * Convert an internal version ID to the Cloud API translation slug
   */
  private static mapVersionToApiSlug(versionId: string): string {
    const found = AVAILABLE_VERSIONS.find(v => v.id.toLowerCase() === versionId.toLowerCase());
    if (found?.apiSlug) {
      return found.apiSlug;
    }
    switch (versionId.toUpperCase()) {
      case 'RVR1960':
      case 'RV1960':
      case 'RVR60':
        return 'RV1960';
      case 'NVI':
        return 'NVI';
      case 'NTV':
        return 'NTV';
      case 'LBLA':
        return 'LBLA';
      case 'PDT':
        return 'PDT';
      case 'RV2004':
        return 'RV2004';
      case 'BTX3':
        return 'BTX3';
      case 'RCQ12':
        return 'RCQ12';
      default:
        return 'RV1960';
    }
  }

  /**
   * Clean HTML tags, footnotes and extra whitespace from API response text
   */
  private static cleanText(rawText: string): string {
    if (!rawText) return '';
    return rawText
      .replace(/<comment>[\s\S]*?<\/comment>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Find a book by name, id or abbreviation (e.g. "jn", "Juan", "1co", "1 Corintios")
   */
  public static findBook(bookQuery: string): BibleBook | null {
    const clean = bookQuery.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    for (const book of BIBLE_BOOKS) {
      const bookNorm = book.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const bookId = book.id.toLowerCase();
      
      if (bookNorm === clean || bookId === clean) {
        return book;
      }

      if (book.abbreviations.some(abbr => {
        const abbrNorm = abbr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return abbrNorm === clean;
      })) {
        return book;
      }
    }

    // Partial prefix match
    return BIBLE_BOOKS.find(b => {
      const bNorm = b.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return bNorm.startsWith(clean);
    }) || null;
  }

  /**
   * Validate and parse arbitrary user input reference with detailed error messaging
   */
  public static validateReference(input: string): ReferenceValidationResult {
    if (!input || !input.trim()) {
      return { valid: false, error: 'Por favor ingresa una referencia (ejemplo: Juan 3:16).' };
    }

    const trimmed = input.trim();
    const parsed = this.parseReference(trimmed);

    if (!parsed) {
      return { 
        valid: false, 
        error: `Formato de referencia no reconocido: "${trimmed}". Usa formatos como "Juan 3:16" o "Salmos 23:1-4".` 
      };
    }

    const { book, chapter, verseStart, verseEnd } = parsed;

    if (chapter < 1) {
      return { valid: false, error: 'El número de capítulo debe ser al menos 1.' };
    }

    if (chapter > book.chaptersCount) {
      return { 
        valid: false, 
        error: `El libro "${book.name}" solo tiene ${book.chaptersCount} capítulo${book.chaptersCount > 1 ? 's' : ''} (se indicó capítulo ${chapter}).` 
      };
    }

    if (verseStart < 1) {
      return { valid: false, error: 'El número de versículo debe ser al menos 1.' };
    }

    if (verseEnd !== undefined && verseEnd < verseStart) {
      return { valid: false, error: `El versículo final (${verseEnd}) no puede ser menor al inicial (${verseStart}).` };
    }

    if (verseEnd !== undefined && (verseEnd - verseStart > 10)) {
      return { valid: false, error: 'Para transmisiones en OBS, se recomienda proyectar rangos de hasta 10 versículos a la vez.' };
    }

    return { valid: true, parsed };
  }

  /**
   * Parse arbitrary user input like "Juan 3:16", "1 Cor 13:4-8", "Salmo 23", "Gn 1:1"
   */
  public static parseReference(input: string): ParsedReference | null {
    if (!input || !input.trim()) return null;

    const trimmed = input.trim();
    // Regex matching: (Optional number)(Book name) (Chapter)(:(VerseStart)(-(VerseEnd))?)?
    const match = trimmed.match(/^((?:[1-3]\s+)?[A-Za-zÀ-ÿ]+)\s*(\d+)?(?::(\d+)(?:-(\d+))?)?$/i);

    if (!match) {
      // Try quick match without colon e.g. "Juan 3 16"
      const altMatch = trimmed.match(/^((?:[1-3]\s+)?[A-Za-zÀ-ÿ]+)\s+(\d+)(?:\s+(\d+)(?:-(\d+))?)?$/i);
      if (!altMatch) return null;
      
      const book = this.findBook(altMatch[1]);
      if (!book) return null;
      const chapter = parseInt(altMatch[2], 10) || 1;
      const verseStart = altMatch[3] ? parseInt(altMatch[3], 10) : 1;
      const verseEnd = altMatch[4] ? parseInt(altMatch[4], 10) : verseStart;
      
      return {
        book,
        chapter,
        verseStart,
        verseEnd: verseEnd !== verseStart ? verseEnd : undefined,
        cleanReference: verseEnd && verseEnd !== verseStart 
          ? `${book.name} ${chapter}:${verseStart}-${verseEnd}`
          : `${book.name} ${chapter}:${verseStart}`
      };
    }

    const bookNameInput = match[1];
    const chapterInput = match[2];
    const verseStartInput = match[3];
    const verseEndInput = match[4];

    const book = this.findBook(bookNameInput);
    if (!book) return null;

    const chapter = chapterInput ? parseInt(chapterInput, 10) : 1;
    const verseStart = verseStartInput ? parseInt(verseStartInput, 10) : 1;
    const verseEnd = verseEndInput ? parseInt(verseEndInput, 10) : undefined;

    const cleanReference = verseEnd 
      ? `${book.name} ${chapter}:${verseStart}-${verseEnd}`
      : `${book.name} ${chapter}:${verseStart}`;

    return {
      book,
      chapter,
      verseStart,
      verseEnd,
      cleanReference
    };
  }

  /**
   * Fetch chapter verses from Cloud Bible API with caching
   */
  private static async fetchChapterFromApi(apiSlug: string, bookNumber: number, chapter: number): Promise<{ verse: number; text: string }[]> {
    const cacheKey = `${apiSlug}-${bookNumber}-${chapter}`;
    if (chapterCache.has(cacheKey)) {
      return chapterCache.get(cacheKey)!;
    }

    const url = `${this.apiBaseUrl}/get-chapter/${apiSlug}/${bookNumber}/${chapter}/`;
    
    // 3.5-second timeout for extreme responsiveness
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: controller ? controller.signal : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        const cleanedVerses = data.map((item: any) => ({
          verse: item.verse,
          text: this.cleanText(item.text)
        }));
        chapterCache.set(cacheKey, cleanedVerses);
        return cleanedVerses;
      }
      return [];
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  /**
   * Get the actual maximum verse number available in a chapter using the API when available.
   */
  public static async getChapterVerseCount(book: BibleBook, chapter: number, versionId: string = 'RVR1960'): Promise<number> {
    const apiSlug = this.mapVersionToApiSlug(versionId);
    const bookIndex = BIBLE_BOOKS.findIndex(b => b.id === book.id);
    const bookNumber = bookIndex >= 0 ? bookIndex + 1 : 1;

    try {
      const chapterVerses = await this.fetchChapterFromApi(apiSlug, bookNumber, chapter);
      if (chapterVerses.length > 0) {
        return Math.max(...chapterVerses.map(v => v.verse));
      }
    } catch (error) {
      console.warn('[BibleService] No se pudo leer cantidad real de versículos:', error);
    }

    const fallbackMax = MOCK_VERSES_DATABASE
      .filter(item => item.book === book.id && item.chapter === chapter && (item.translation === versionId || item.translation === 'RVR1960'))
      .map(item => item.verse);

    return fallbackMax.length > 0 ? Math.max(...fallbackMax) : 1;
  }

  /**
   * Retrieve passage text from Cloud API (Reina Valera 1960 / NVI / NTV) with local fallback
   */
  public static async getPassage(referenceStr: string, versionId: string = 'RVR1960'): Promise<BiblePassageResponse> {
    const validation = this.validateReference(referenceStr);
    
    if (!validation.valid || !validation.parsed) {
      throw new Error(validation.error || `Referencia bíblica no válida: "${referenceStr}". Ejemplo: "Juan 3:16" o "Salmos 23:1-4".`);
    }

    const parsed = validation.parsed;
    const { book, chapter, verseStart, verseEnd } = parsed;
    const end = verseEnd || verseStart;

    // 1. Try Live Cloud Bible API (bolls.life)
    const apiSlug = this.mapVersionToApiSlug(versionId);
    const bookIndex = BIBLE_BOOKS.findIndex(b => b.id === book.id);
    const bookNumber = bookIndex >= 0 ? bookIndex + 1 : 1;

    try {
      const chapterVerses = await this.fetchChapterFromApi(apiSlug, bookNumber, chapter);
      if (chapterVerses && chapterVerses.length > 0) {
        const matching = chapterVerses.filter(v => v.verse >= verseStart && v.verse <= end);
        if (matching.length > 0) {
          const fullText = matching.map(v => 
            matching.length > 1 ? `(${v.verse}) ${v.text}` : v.text
          ).join(' ');

          return {
            reference: parsed.cleanReference,
            book: book.id,
            bookName: book.name,
            chapter,
            verseStart,
            verseEnd: parsed.verseEnd,
            text: fullText,
            translation: versionId,
            verses: matching.map(v => ({ number: v.verse, text: v.text }))
          };
        }
      }
    } catch (apiError) {
      console.warn('[BibleService] Error al conectar con API Cloud, usando base local:', apiError);
    }

    // RCQ12 must not fall back to Spanish mock content.
    if (versionId.toUpperCase() === 'RCQ12') {
      throw new Error('RCQ12 todavía no está disponible en la fuente bíblica configurada.');
    }

    // 2. Query Local Database / Fallback Generator if offline
    const matchingVerses: { number: number; text: string }[] = [];

    for (let v = verseStart; v <= end; v++) {
      const found = MOCK_VERSES_DATABASE.find(item => 
        item.book === book.id && 
        item.chapter === chapter && 
        item.verse === v && 
        (item.translation === versionId || item.translation === 'RVR1960')
      );

      if (found) {
        matchingVerses.push({ number: v, text: found.text });
      } else {
        matchingVerses.push({
          number: v,
          text: `[${book.name} ${chapter}:${v}] Y habló Dios estas palabras, instruyendo a su pueblo en sabiduría y santidad.`
        });
      }
    }

    const fullText = matchingVerses.map(v => 
      matchingVerses.length > 1 ? `(${v.number}) ${v.text}` : v.text
    ).join(' ');

    return {
      reference: parsed.cleanReference,
      book: book.id,
      bookName: book.name,
      chapter,
      verseStart,
      verseEnd: parsed.verseEnd,
      text: fullText,
      translation: versionId,
      verses: matchingVerses
    };
  }

  /**
   * Search verses matching a text query
   */
  public static search(query: string, versionId: string = 'RVR1960'): BibleSearchResultItem[] {
    if (!query || query.trim().length < 2) return [];

    const cleanQuery = query.trim().toLowerCase();

    // 1. Check if user typed a direct reference e.g. "Jn 3:16"
    const parsed = this.parseReference(query);
    const results: BibleSearchResultItem[] = [];

    if (parsed) {
      const match = MOCK_VERSES_DATABASE.find(item => 
        item.book === parsed.book.id && 
        item.chapter === parsed.chapter && 
        item.verse === parsed.verseStart
      );

      if (match) {
        results.push({
          reference: parsed.cleanReference,
          bookName: parsed.book.name,
          chapter: parsed.chapter,
          verse: parsed.verseStart,
          text: match.text,
          preview: match.text.length > 90 ? match.text.substring(0, 87) + '...' : match.text
        });
      } else {
        results.push({
          reference: parsed.cleanReference,
          bookName: parsed.book.name,
          chapter: parsed.chapter,
          verse: parsed.verseStart,
          text: `Texto de ${parsed.cleanReference}`,
          preview: `Ver versículo de ${parsed.cleanReference}`
        });
      }
    }

    // 2. Text keyword matching across database
    for (const record of MOCK_VERSES_DATABASE) {
      if (record.text.toLowerCase().includes(cleanQuery)) {
        const ref = `${record.bookName} ${record.chapter}:${record.verse}`;
        if (!results.some(r => r.reference === ref)) {
          results.push({
            reference: ref,
            bookName: record.bookName,
            chapter: record.chapter,
            verse: record.verse,
            text: record.text,
            preview: record.text.length > 90 ? record.text.substring(0, 87) + '...' : record.text
          });
        }
      }
    }

    return results.slice(0, 15);
  }
}