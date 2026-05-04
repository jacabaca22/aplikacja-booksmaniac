import React, { useState } from 'react';
import './App.css';

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
        const rating = prompt("Oceń książkę (1-5):");
        if (rating) {
            setFinishedList([...finishedList, { ...book, rating }]);
            setReadingList(readingList.filter(b => b.id !== book.id));
        }
    };

    const coverFallback = (size = '300x450') =>
        `https://placehold.co/${size}/445566/FFF?text=Brak+Okladki`;

    const getCover = (book, size) =>
        book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || coverFallback(size);

    return (
        <div className="app-container">
            {/* NAVBAR */}
            <nav className="navbar">
                <div className="navbar-inner">
                    <div className="flex items-center">
                        <img src="/booksmaniac-logo.png" alt="Booksmaniac Logo" className="navbar-logo" />
                    </div>
                    <div className="navbar-links">
                        <button onClick={() => setActiveTab('home')} className={`nav-link ${activeTab === 'home' ? 'nav-link--active' : ''}`}>Szukaj</button>
                        <button onClick={() => setActiveTab('reading')} className={`nav-link ${activeTab === 'reading' ? 'nav-link--active' : ''}`}>Czytam</button>
                        <button onClick={() => setActiveTab('finished')} className={`nav-link ${activeTab === 'finished' ? 'nav-link--active' : ''}`}>Półka</button>
                    </div>
                </div>
            </nav>

            <main className="main-content">
                {/* ===== SZUKAJ ===== */}
                {activeTab === 'home' && (
                    <section className="section-animated">
                        <div className="search-header">
                            <h2 className="search-title">Co dziś przeczytasz?</h2>
                            <form onSubmit={searchBooks} className="search-form">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Wyszukaj tytuł, autora lub ISBN..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <button type="submit" className="search-btn">SZUKAJ</button>
                            </form>
                            {error && <p className="search-error">{error}</p>}
                        </div>

                        <div className="book-grid">
                            {results.map(book => (
                                <div key={book.id} className="book-card">
                                    <div className="book-card-cover">
                                        <img
                                            src={getCover(book)}
                                            className="book-card-img"
                                            alt={book.volumeInfo.title}
                                        />
                                        <div className="book-card-overlay">
                                            {readingList.some(b => b.id === book.id) ? (
                                                <div className="book-card-added-badge">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                    DODANO
                                                </div>
                                            ) : (
                                                <button onClick={() => addToReading(book)} className="book-card-add-btn">
                                                    DODAJ DO LISTY
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="book-card-title">{book.volumeInfo.title}</h3>
                                    <p className="book-card-author">{book.volumeInfo.authors?.[0] || 'Autor nieznany'}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ===== CZYTAM ===== */}
                {activeTab === 'reading' && (
                    <section className="section-animated">
                        <h2 className="reading-title">Aktualnie czytam</h2>
                        {readingList.length === 0 ? (
                            <p className="reading-empty">Brak książek na liście. Wyszukaj i dodaj pierwszą pozycję!</p>
                        ) : (
                            <div className="reading-list">
                                {readingList.map(book => (
                                    <div key={book.id} className="reading-card">
                                        <div className="reading-card-cover">
                                            <img
                                                src={getCover(book)}
                                                className="reading-card-img"
                                                alt={book.volumeInfo.title}
                                            />
                                        </div>
                                        <div className="reading-card-info">
                                            <h3 className="reading-card-title">{book.volumeInfo.title}</h3>
                                            <p className="reading-card-author">{book.volumeInfo.authors?.[0] || 'Autor nieznany'}</p>
                                            <div className="reading-card-meta">
                                                <span className="reading-card-genre">{book.volumeInfo.categories?.[0] || 'Gatunek niesklasyfikowany'}</span>
                                                <div className="reading-card-page-box">
                                                    <span className="reading-card-page-label">STRONA:</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="1000"
                                                        value={book.currentPage || null}
                                                        onChange={(e) => updatePage(book.id, e.target.value)}
                                                        className="reading-card-page-input"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="reading-card-actions">
                                            <button onClick={() => moveToFinished(book)} className="btn-finish">ZAKOŃCZ</button>
                                            <button onClick={() => removeFromReading(book)} className="btn-remove">
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

                {/* ===== PÓŁKA ===== */}
                {activeTab === 'finished' && (
                    <section className="shelf-section">
                        <div className="shelf-counter">
                            <span className="shelf-counter-label">W bibliotece:</span>
                            <span className="shelf-counter-number">{finishedList.length}</span> <span className="text-sm">📖</span>
                        </div>

                        <h2 className="shelf-title">Moja cyfrowa półka</h2>

                        {finishedList.length === 0 ? (
                            <p className="shelf-empty">Twoja cyfrowa półka jest na razie pusta. Zakończ czytanie jakiejś książki!</p>
                        ) : (
                            <div className="shelf-grid">
                                {finishedList.map(book => (
                                    <div key={book.id} className="shelf-book">
                                        <div className="shelf-book-cover">
                                            <img
                                                src={getCover(book, '150x225')}
                                                className="shelf-book-img"
                                                alt={book.volumeInfo.title}
                                            />
                                            {book.rating && (
                                                <div className="shelf-book-rating">⭐ {book.rating}/5</div>
                                            )}
                                        </div>
                                        <h3 className="shelf-book-title">{book.volumeInfo.title}</h3>
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