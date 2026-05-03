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
            setReadingList([...readingList, book]);
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
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-sm rotate-12"></div>
                        <h1 className="text-white font-black text-2xl tracking-tighter italic">BOOKSMANIAC</h1>
                    </div>
                    <div className="flex gap-8 text-xs font-bold uppercase tracking-[0.2em]">
                        <button onClick={() => setActiveTab('home')} className={`hover:text-white transition-all ${activeTab === 'home' ? 'text-white border-b-2 border-green-500 pb-1' : ''}`}>Szukaj</button>
                        <button onClick={() => setActiveTab('reading')} className={`hover:text-white transition-all ${activeTab === 'reading' ? 'text-white border-b-2 border-green-500 pb-1' : ''}`}>Czytam</button>
                        <button onClick={() => setActiveTab('finished')} className={`hover:text-white transition-all ${activeTab === 'finished' ? 'text-white border-b-2 border-green-500 pb-1' : ''}`}>Biblioteka</button>
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
                                            <button
                                                onClick={() => addToReading(book)}
                                                className="bg-green-600 text-white font-bold py-2 px-4 rounded transform translate-y-4 group-hover:translate-y-0 transition-transform"
                                            >
                                                DODAJ DO LISTY
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="mt-3 text-white font-semibold text-sm leading-tight line-clamp-2">{book.volumeInfo.title}</h3>
                                    <p className="text-xs mt-1 font-medium text-[#678] uppercase tracking-wider">{book.volumeInfo.authors?.[0] || 'Autor nieznany'}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Tutaj możesz dodać widoki dla 'reading' i 'finished' w podobnym stylu */}
            </main>
        </div>
    );
}


export default App;