import React, { useState, useMemo } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { BIBLE_BOOKS, AVAILABLE_VERSIONS } from '../../data/bibleBooks';
import { POPULAR_PASSAGES, MOCK_VERSES_DATABASE } from '../../data/mockBibleData';
import { BibleService } from '../../services/bibleService';
import type { BibleBook, BiblePassageResponse } from '../../types/bible';
import type { BibleContentPayload } from '../../types/overlay';

interface BibleSearchPanelProps {
  currentPayload: BibleContentPayload | null;
  onPreviewVerse: (payload: BibleContentPayload) => void;
  onLiveVerse: (payload: BibleContentPayload) => void;
}

export const BibleSearchPanel: React.FC<BibleSearchPanelProps> = ({
  currentPayload,
  onPreviewVerse,
  onLiveVerse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('RVR1960');
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'OT' | 'NT'>('NT');
  const [selectedBook, setSelectedBook] = useState<BibleBook>(() => {
    return BIBLE_BOOKS.find(b => b.id === 'JHN') || BIBLE_BOOKS[0];
  });
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [selectedVerse, setSelectedVerse] = useState(16);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'NAVIGATOR' | 'POPULAR'>('NAVIGATOR');
  const [verseCount, setVerseCount] = useState<number>(Math.min(selectedBook.id === 'PSA' && selectedChapter === 119 ? 176 : 50, 50));

  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS.filter(book => {
      if (testamentFilter !== 'ALL' && book.testament !== testamentFilter) {
        return false;
      }
      if (searchQuery.trim() && activeTab === 'NAVIGATOR') {
        const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const nameNorm = book.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return nameNorm.includes(q) || book.abbreviations.some(a => a.includes(q));
      }
      return true;
    });
  }, [testamentFilter, searchQuery, activeTab]);

  React.useEffect(() => {
    let active = true;

    const loadVerseCount = async () => {
      const total = await BibleService.getChapterVerseCount(selectedBook, selectedChapter, selectedVersion);
      if (active) {
        setVerseCount(total);
      }
    };

    loadVerseCount();
    return () => {
      active = false;
    };
  }, [selectedBook, selectedChapter, selectedVersion]);

  // Load verse passage with validation
  const handleLoadPassage = async (book: BibleBook, chapter: number, verse: number, autoLive: boolean = false) => {
    setValidationError(null);
    setLoading(true);
    const refStr = `${book.name} ${chapter}:${verse}`;
    try {
      const passage: BiblePassageResponse = await BibleService.getPassage(refStr, selectedVersion);
      const payload: BibleContentPayload = {
        book: book.id,
        bookName: book.name,
        chapter,
        verseStart: verse,
        reference: passage.reference,
        text: passage.text,
        translation: selectedVersion,
        testament: book.testament
      };

      if (autoLive) {
        onLiveVerse(payload);
      } else {
        onPreviewVerse(payload);
      }
    } catch (err: any) {
      setValidationError(err?.message || 'Error cargando pasaje bíblico');
    } finally {
      setLoading(false);
    }
  };

  // Quick search submission with validation
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setValidationError('Ingresa una referencia bíblica (ej: Juan 3:16, Sal 23).');
      return;
    }

    setLoading(true);
    setValidationError(null);

    try {
      // 1. Try parsing & validating reference
      const validation = BibleService.validateReference(query);
      if (validation.valid && validation.parsed) {
        const parsed = validation.parsed;
        setSelectedBook(parsed.book);
        setSelectedChapter(parsed.chapter);
        setSelectedVerse(parsed.verseStart);
        await handleLoadPassage(parsed.book, parsed.chapter, parsed.verseStart, false);
        return;
      }

      // 2. Fallback to keyword search across scriptures
      const results = BibleService.search(query, selectedVersion);
      if (results.length > 0) {
        const first = results[0];
        const bookObj = BIBLE_BOOKS.find(b => b.name === first.bookName) || selectedBook;
        setSelectedBook(bookObj);
        setSelectedChapter(first.chapter);
        setSelectedVerse(first.verse);
        await handleLoadPassage(bookObj, first.chapter, first.verse, false);
      } else {
        setValidationError(validation.error || `No se encontraron versículos para "${query}".`);
      }
    } catch (err: any) {
      setValidationError(err?.message || 'Error al procesar la búsqueda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-studio-surface border-r border-studio-border text-slate-200">
      <div className="p-3 border-b border-studio-border space-y-2.5">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Buscar referencia (ej: Juan 3:16, Sal 23)..."
            className="w-full bg-studio-bg border border-studio-border rounded-lg pl-8 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
          {loading && (
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin absolute right-2.5 top-2.5" />
          )}
        </form>

        {validationError && (
          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive-foreground text-[11px] leading-tight animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-destructive mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">Versión:</span>
            <select
              value={selectedVersion}
              onChange={(e) => {
                const newVersion = e.target.value;
                setSelectedVersion(newVersion);
                if (currentPayload) {
                  BibleService.getPassage(currentPayload.reference, newVersion).then((res) => {
                    onPreviewVerse({
                      ...currentPayload,
                      text: res.text,
                      translation: newVersion,
                    });
                  }).catch((err: Error) => {
                    setValidationError(err.message);
                  });
                }
              }}
              className="bg-studio-panel border border-studio-border rounded-md text-xs text-foreground px-2 py-1 outline-none focus:border-primary cursor-pointer flex-1 min-w-0"
            >
              {AVAILABLE_VERSIONS.map((v) => (
                <option key={v.id} value={v.id} className="bg-slate-900 text-slate-100">
                  {v.abbreviation} - {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeTab === 'NAVIGATOR' && (
          <div className="flex gap-1">
            <button
              onClick={() => setTestamentFilter('ALL')}
              className={`flex-1 text-[11px] py-1 rounded-md font-medium transition-all ${
                testamentFilter === 'ALL'
                  ? 'bg-primary/20 border border-primary/40 text-primary font-bold'
                  : 'bg-studio-panel text-muted-foreground hover:bg-studio-hover border border-transparent'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTestamentFilter('OT')}
              className={`flex-1 text-[11px] py-1 rounded-md font-medium transition-all ${
                testamentFilter === 'OT'
                  ? 'bg-primary/20 border border-primary/40 text-primary font-bold'
                  : 'bg-studio-panel text-muted-foreground hover:bg-studio-hover border border-transparent'
              }`}
            >
              AT
            </button>
            <button
              onClick={() => setTestamentFilter('NT')}
              className={`flex-1 text-[11px] py-1 rounded-md font-medium transition-all ${
                testamentFilter === 'NT'
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                  : 'bg-studio-panel text-muted-foreground hover:bg-studio-hover border border-transparent'
              }`}
            >
              NT
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'POPULAR' ? (
          <div className="p-3 space-y-1.5">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">
              Pasajes recientes
            </span>
            {POPULAR_PASSAGES.map((item, idx) => (
              <div
                key={idx}
                onClick={async () => {
                  setValidationError(null);
                  setSearchQuery(item.ref);
                  const parsed = BibleService.parseReference(item.ref);
                  if (parsed) {
                    setSelectedBook(parsed.book);
                    setSelectedChapter(parsed.chapter);
                    setSelectedVerse(parsed.verseStart);
                    await handleLoadPassage(parsed.book, parsed.chapter, parsed.verseStart, false);
                  }
                }}
                className="group p-2.5 rounded-lg bg-studio-panel hover:bg-studio-hover border border-studio-border hover:border-primary/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.ref}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">{item.title}</p>
                </div>
                <span className="text-[10px] text-muted-foreground group-hover:text-primary font-mono transition-colors">
                  Ver →
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full">
            {/* Column 1: Books List */}
            <div className="w-1/2 border-r border-studio-border overflow-y-auto p-1.5 space-y-0.5">
              {filteredBooks.map((book) => {
                const isSelected = selectedBook.id === book.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => {
                      setSelectedBook(book);
                      setSelectedChapter(1);
                      setSelectedVerse(1);
                      handleLoadPassage(book, 1, 1, false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                        : 'text-foreground hover:bg-studio-panel'
                    }`}
                  >
                    <span className="truncate">{book.name}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {book.chaptersCount}c
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Column 2: Chapters & Verses Grid */}
            <div className="w-1/2 flex flex-col overflow-hidden">
              {/* Chapters Grid */}
              <div className="p-2 border-b border-studio-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Capítulos ({selectedBook.name})
                </span>
                <div className="grid grid-cols-4 gap-1 max-h-36 overflow-y-auto pr-1">
                  {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => {
                        setSelectedChapter(ch);
                        setSelectedVerse(1);
                        handleLoadPassage(selectedBook, ch, 1, false);
                      }}
                      className={`h-7 rounded-md text-xs font-bold transition-all ${
                        selectedChapter === ch
                          ? 'bg-primary text-primary-foreground ring-1 ring-primary'
                          : 'bg-studio-panel text-foreground hover:bg-studio-hover'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verses Grid */}
              <div className="p-2 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Versículos ({selectedBook.name} {selectedChapter})
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {Array.from({ length: verseCount }, (_, i) => i + 1).map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        setSelectedVerse(v);
                        handleLoadPassage(selectedBook, selectedChapter, v, false);
                      }}
                      className={`h-8 rounded-md text-xs font-bold transition-all ${
                        selectedVerse === v
                          ? 'bg-emerald-600 text-white ring-1 ring-emerald-400'
                          : 'bg-studio-panel text-foreground hover:bg-studio-hover'
                      }`}
                      title={`Seleccionar versículo ${v}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};