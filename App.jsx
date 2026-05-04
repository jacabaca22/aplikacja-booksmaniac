import React, { useState } from 'react';

function App() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [readingList, setReadingList] = useState([]);
    const [finishedList, setFinishedList] = useState([]);
    const [activeTab, setActiveTab] = useState('home');
    const [error, setError] = useState('');

    const searchBooks = async (e) => {
        e.preventDefault();
        if (!query) return;
        setError('');

        try {
            // Google Books bez klucza wyrzuca 429. OpenLibrary jest darmowe i nielimitowane w ten sam sposób.
            const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`);
            if (!res.ok) throw new Error("API Error");
            const data = await res.json();

            const mappedResults = (data.docs || []).map(doc => ({
                id: doc.key,
                volumeInfo: {
                    title: doc.title,
                    authors: doc.author_name,
                    categories: doc.subject ? [doc.subject[0]] : null,
                    imageLinks: doc.cover_i ? {
                        thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                    } : null
                }
            }));

            setResults(mappedResults);
        } catch (err) {
            setError('Błąd połączenia z API OpenLibrary lub przekroczono inny limit.');
            setResults([]);
        }
    };

    const addToReading = (book) => {
        if (!readingList.find(b => b.id === book.id)) {
            setReadingList([...readingList, { ...book, currentPage: 1 }]);
        }
    };

    const updatePage = (bookId, pageString) => {
        const page = parseInt(pageString, 10) || 0;
        setReadingList(readingList.map(b => b.id === bookId ? { ...b, currentPage: page } : b));
    };

    const removeFromReading = (book) => {
        if (confirm(`Czy na pewno chcesz usunąć "${book.volumeInfo.title}" z listy czytanych wpisów?`)) {
            setReadingList(readingList.filter(b => b.id !== book.id));
        }
    };

    const moveToFinished = (book) => {
        const rating = prompt("Oceń książkę (1-10):");
        if (rating) {
            setFinishedList([...finishedList, { ...book, rating }]);
            setReadingList(readingList.filter(b => b.id !== book.id));
        }
    };

    return (
        <div className="min-h-screen bg-[#14181c] text-[#9ab] font-sans selection:bg-green-500 selection:text-white">
            {/* NAVBAR */}
            <nav className="bg-[#2c3440] border-b border-[#456] sticky top-0 z-50 shadow-2xl">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center">
                        <img src="/booksmaniac-logo.png" alt="Booksmaniac Logo" className="height = 100 px h-10 cursor-pointer hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex gap-8 text-xs font-bold uppercase tracking-[0.2em]">
                        <button onClick={() => setActiveTab('home')} className={`hover:text-white transition-all ${activeTab === 'home' ? 'text-white border-b-2 border-green-500 pb-1' : ''}`}>Szukaj</button>
                        <button onClick={() => setActiveTab('reading')} className={`hover:text-white transition-all ${activeTab === 'reading' ? 'text-white border-b-2 border-green-500 pb-1' : ''}`}>Czytam</button>
                        <button onClick={() => setActiveTab('finished')} className={`hover:text-white transition-all ${activeTab === 'finished' ? 'text-white border-b-2 border-green-500 pb-1' : ''}`}>Półka</button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-8">
                {activeTab === 'home' && (
                    <section className="animate-in fade-in duration-700">
                        <div className="flex flex-col items-center mb-16">
                            <h2 className="text-4xl text-white font-serif mb-6">Co dziś przeczytasz?</h2>
                            <form onSubmit={searchBooks} className="relative w-full max-w-2xl group">
                                <input
                                    type="text"
                                    className="w-full bg-[#445566] text-white rounded-md py-4 px-6 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-[#9ab] shadow-inner"
                                    placeholder="Wyszukaj tytuł, autora lub ISBN..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <button type="submit" className="absolute right-3 top-2 bg-green-600 text-white px-8 py-2 rounded font-bold hover:bg-green-500 active:scale-95 transition-all">
                                    SZUKAJ
                                </button>
                            </form>
                            {error && <p className="mt-8 text-red-400 font-medium font-sans animate-pulse">{error}</p>}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
                            {results.map(book => (
                                <div key={book.id} className="group relative flex flex-col">
                                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg border-[3px] border-transparent group-hover:border-green-500 transition-all duration-300 shadow-2xl bg-[#2c3440]">
                                        <img
                                            src={book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://placehold.co/300x450/445566/FFF?text=Brak+Okladki'}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:opacity-40"
                                            alt={book.volumeInfo.title}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {readingList.some(b => b.id === book.id) ? (
                                                <div className="bg-green-500 text-white font-bold py-2 px-4 rounded flex items-center gap-2 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                    DODANO
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => addToReading(book)}
                                                    className="bg-green-600 text-white font-bold py-2 px-4 rounded transform translate-y-4 group-hover:translate-y-0 transition-transform hover:bg-green-500 shadow-xl"
                                                >
                                                    DODAJ DO LISTY
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="mt-3 text-white font-semibold text-sm leading-tight line-clamp-2">{book.volumeInfo.title}</h3>
                                    <p className="text-xs mt-1 font-medium text-[#678] uppercase tracking-wider">{book.volumeInfo.authors?.[0] || 'Autor nieznany'}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'reading' && (
                    <section className="animate-in fade-in duration-700">
                        <h2 className="text-4xl text-white font-serif mb-10 text-center">Aktualnie czytam</h2>
                        {readingList.length === 0 ? (
                            <p className="text-center text-[#678] font-medium text-lg mt-10">Brak książek na liście. Wyszukaj i dodaj pierwszą pozycję!</p>
                        ) : (
                            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                                {readingList.map(book => (
                                    <div key={book.id} className="group flex bg-[#2c3440] p-4 rounded-xl items-center shadow-xl border border-[#3d4856] hover:border-green-500 transition-all duration-300">
                                        <div className="w-24 shrink-0 aspect-[2/3] overflow-hidden rounded border border-black/40 bg-black/20">
                                            <img
                                                src={book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://placehold.co/300x450/445566/FFF?text=Brak+Okladki'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                alt={book.volumeInfo.title}
                                            />
                                        </div>
                                        <div className="flex-1 ml-6 flex flex-col justify-center">
                                            <h3 className="text-2xl text-white font-bold leading-tight line-clamp-2">{book.volumeInfo.title}</h3>
                                            <p className="text-sm mt-1 font-medium text-green-500 uppercase tracking-widest">{book.volumeInfo.authors?.[0] || 'Autor nieznany'}</p>
                                            <div className="mt-3 flex flex-wrap items-center gap-4">
                                                <span className="bg-[#445566] text-white text-xs px-3 py-1 rounded-full shadow-inner border border-[#567]">{book.volumeInfo.categories?.[0] || 'Gatunek niesklasyfikowany'}</span>
                                                <div className="flex items-center gap-2 bg-[#1e242c] px-3 py-1 rounded shadow-inner border border-[#3d4856]">
                                                    <span className="text-xs text-[#89a] font-bold uppercase tracking-wider">STRONA:</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="1000"
                                                        value={book.currentPage || 1}
                                                        onChange={(e) => updatePage(book.id, e.target.value)}
                                                        className="w-16 bg-transparent text-green-400 font-bold text-center focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-4 shrink-0 flex flex-col gap-2">
                                            <button onClick={() => moveToFinished(book)} className="w-full bg-transparent border-2 border-green-600 text-green-500 hover:bg-green-600 hover:text-white font-bold px-6 py-2.5 rounded transition-colors active:scale-95 shadow-sm">
                                                ZAKOŃCZ
                                            </button>
                                            <button onClick={() => removeFromReading(book)} className="w-full flex items-center justify-center gap-1 text-[#678] hover:text-red-400 font-medium px-4 py-1.5 rounded transition-colors active:scale-95 text-xs tracking-wider border border-transparent hover:border-red-900/30">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                USUŃ
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
                {activeTab === 'finished' && (
                    <section className="animate-in fade-in duration-700 relative">
                        <div className="absolute top-0 left-0 bg-[#2c3440] text-green-400 font-bold px-4 py-2 rounded-lg shadow-md border border-[#3d4856]">
                            <span className="text-[#89a] text-xs uppercase tracking-wider block mb-0.5">W bibliotece:</span>
                            <span className="text-2xl">{finishedList.length}</span> <span className="text-sm">książek</span>
                        </div>

                        <h2 className="text-4xl text-white font-serif mb-12 text-center pt-2">Moja cyfrowa półka</h2>

                        {finishedList.length === 0 ? (
                            <p className="text-center text-[#678] font-medium text-lg mt-10">Twoja cyfrowa półka jest na razie pusta. Zakończ czytanie jakiejś książki!</p>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-x-3 gap-y-6">
                                {finishedList.map(book => (
                                    <div key={book.id} className="group relative flex flex-col items-center">
                                        <div className="relative w-full aspect-[2/3] overflow-hidden rounded border border-black/40 shadow hover:border-green-500 transition-colors bg-[#2c3440]">
                                            <img
                                                src={book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://placehold.co/150x225/445566/FFF?text=Brak'}
                                                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                                                alt={book.volumeInfo.title}
                                            />
                                            {book.rating && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-yellow-400 text-center text-xs font-bold py-1">
                                                    ⭐ {book.rating}/10
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="mt-2 text-white font-medium text-[10px] text-center leading-tight line-clamp-2 w-full opacity-80 group-hover:opacity-100 transition-opacity">{book.volumeInfo.title}</h3>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}


export default App;