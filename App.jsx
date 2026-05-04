import React, { useState } from 'react';
import './App.css';

function App() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [readingList, setReadingList] = useState([]);
    const [finishedList, setFinishedList] = useState([]);
    const [activeTab, setActiveTab] = useState('home');
    const [error, setError] = useState('');
    const [ratingBookId, setRatingBookId] = useState(null);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);

    const searchBooks = async (e) => {
        e.preventDefault();
        if (!query) return;
        setError('');

        try {
            // Google Books without a key throws 429. OpenLibrary is free and unlimited.
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
            setError('Error connecting to the OpenLibrary API.');
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
        if (confirm(`Are you sure you want to remove "${book.volumeInfo.title}" from the reading list?`)) {
            setReadingList(readingList.filter(b => b.id !== book.id));
        }
    };

    const toggleRating = (book) => {
        if (ratingBookId === book.id && selectedRating > 0) {
            // Second click with a selected rating → move to shelf
            confirmFinish(book, selectedRating);
        } else if (ratingBookId === book.id) {
            // Second click without a rating → close picker
            setRatingBookId(null);
            setSelectedRating(0);
            setHoverRating(0);
        } else {
            // First click → open picker
            setRatingBookId(book.id);
            setSelectedRating(0);
            setHoverRating(0);
        }
    };

    const confirmFinish = (book, rating) => {
        setFinishedList([...finishedList, { ...book, rating }]);
        setReadingList(readingList.filter(b => b.id !== book.id));
        setRatingBookId(null);
        setSelectedRating(0);
        setHoverRating(0);
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
                        <button onClick={() => setActiveTab('home')} className={`nav-link ${activeTab === 'home' ? 'nav-link--active' : ''}`}>Search</button>
                        <button onClick={() => setActiveTab('reading')} className={`nav-link ${activeTab === 'reading' ? 'nav-link--active' : ''}`}>Reading</button>
                        <button onClick={() => setActiveTab('finished')} className={`nav-link ${activeTab === 'finished' ? 'nav-link--active' : ''}`}>Shelf</button>
                    </div>
                </div>
            </nav>

            <main className="main-content">
                {/* ===== SEARCH ===== */}
                {activeTab === 'home' && (
                    <section className="section-animated">
                        <div className="search-header">
                            <h2 className="search-title">What are you going to read?</h2>
                            <form onSubmit={searchBooks} className="search-form">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search by title, author or ISBN..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <button type="submit" className="search-btn">SEARCH</button>
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
                                                    ADDED
                                                </div>
                                            ) : (
                                                <button onClick={() => addToReading(book)} className="book-card-add-btn">
                                                    ADD TO LIST
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="book-card-title">{book.volumeInfo.title}</h3>
                                    <p className="book-card-author">{book.volumeInfo.authors?.[0] || 'Unknown author'}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ===== READING ===== */}
                {activeTab === 'reading' && (
                    <section className="section-animated">
                        <h2 className="reading-title">Current reads</h2>
                        {readingList.length === 0 ? (
                            <p className="reading-empty">No books on the list</p>
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
                                            <p className="reading-card-author">{book.volumeInfo.authors?.[0] || 'Unknown author'}</p>
                                            <div className="reading-card-meta">
                                                <span className="reading-card-genre">{book.volumeInfo.categories?.[0] || ''}</span>
                                                <div className="reading-card-page-box">
                                                    <span className="reading-card-page-label">PAGE:</span>
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
                                            <button onClick={() => toggleRating(book)} className={`btn-finish ${ratingBookId === book.id ? 'btn-finish--active' : ''}`}>FINISH</button>
                                            {ratingBookId === book.id && (
                                                <div className="star-rating-picker">
                                                    <div className="star-rating-stars">
                                                        {[1, 2, 3, 4, 5].map(star => {
                                                            const displayRating = hoverRating || selectedRating;
                                                            const isFull = displayRating >= star;
                                                            const isHalf = !isFull && displayRating >= star - 0.5;
                                                            return (
                                                                <span key={star} className="star-rating-star">
                                                                    <span
                                                                        className="star-half star-half--left"
                                                                        onMouseEnter={() => setHoverRating(star - 0.5)}
                                                                        onMouseLeave={() => setHoverRating(0)}
                                                                        onClick={() => setSelectedRating(star - 0.5)}
                                                                    />
                                                                    <span
                                                                        className="star-half star-half--right"
                                                                        onMouseEnter={() => setHoverRating(star)}
                                                                        onMouseLeave={() => setHoverRating(0)}
                                                                        onClick={() => setSelectedRating(star)}
                                                                    />
                                                                    <svg className={`star-icon ${isFull ? 'star--full' : isHalf ? 'star--half-display' : 'star--empty'}`} viewBox="0 0 24 24">
                                                                        {isHalf ? (
                                                                            <>
                                                                                <defs>
                                                                                    <linearGradient id={`half-${book.id}-${star}`}>
                                                                                        <stop offset="50%" stopColor="#facc15" />
                                                                                        <stop offset="50%" stopColor="#3d4856" />
                                                                                    </linearGradient>
                                                                                </defs>
                                                                                <path fill={`url(#half-${book.id}-${star})`} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                                            </>
                                                                        ) : (
                                                                            <path fill={isFull ? '#facc15' : '#3d4856'} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                                        )}
                                                                    </svg>
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                    {selectedRating > 0 && (
                                                        <button
                                                            className="star-rating-confirm"
                                                            onClick={() => confirmFinish(book, selectedRating)}
                                                        >
                                                            ✓ {selectedRating}/5
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            <button onClick={() => removeFromReading(book)} className="btn-remove">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                REMOVE
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* ===== SHELF ===== */}
                {activeTab === 'finished' && (
                    <section className="shelf-section">
                        <div className="shelf-counter">
                            <span className="shelf-counter-label">In my library:</span>
                            <span className="shelf-counter-number">{finishedList.length}</span> <span className="text-3xl">📖</span>
                        </div>

                        <h2 className="shelf-title">My digital shelf</h2>

                        {finishedList.length === 0 ? (
                            <p className="shelf-empty">Your digital shelf is empty for now. Finish reading some books!</p>
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