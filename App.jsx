import React, { useState } from 'react';

function App() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [readingList, setReadingList] = useState([]);
    const [finishedList, setFinishedList] = useState([]);
    const [activeTab, setActiveTab] = useState('home');

    const searchBooks = async (e) => {
        e.preventDefault();
        if (!query) return;
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
        const data = await res.json();
        setResults(data.items || []);
    };

    const addToReading = (book) => {
        if (!readingList.find(b => b.id === book.id)) {
            setReadingList([...readingList, book]);
            alert("Dodano do czytanych!");
        }
    };

    const moveToFinished = (book) => {
        const rating = prompt("Oceń książkę w skali 1-10:");
        if (rating !== null) {
            const ratedBook = { ...book, rating };
            setFinishedList([...finishedList, ratedBook]);
            setReadingList(readingList.filter(b => b.id !== book.id));
        }
    };

    return (
        <div style={{ backgroundColor: '#14181c', color: '#9ab', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <header style={{ backgroundColor: '#2c3440', padding: '20px', display: 'flex', justifyContent: 'center', gap: '30px' }}>
                <button onClick={() => setActiveTab('home')} style={navButtonStyle}>Szukaj</button>
                <button onClick={() => setActiveTab('reading')} style={navButtonStyle}>Czytam ({readingList.length})</button>
                <button onClick={() => setActiveTab('finished')} style={navButtonStyle}>Przeczytane ({finishedList.length})</button>
            </header>

            <main style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
                {activeTab === 'home' && (
                    <div>
                        <form onSubmit={searchBooks} style={{ marginBottom: '30px', textAlign: 'center' }}>
                            <input
                                type="text"
                                placeholder="Wpisz tytuł książki..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                style={{ padding: '12px', width: '60%', borderRadius: '4px', border: 'none' }}
                            />
                            <button type="submit" style={{ padding: '12px 20px', marginLeft: '10px', backgroundColor: '#00b020', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Szukaj</button>
                        </form>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
                            {results.map(book => (
                                <div key={book.id} style={cardStyle}>
                                    <img src={book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=Brak+Okładki'} alt="okładka" style={{ width: '100%', borderRadius: '4px' }} />
                                    <h3 style={{ fontSize: '14px', color: '#fff', margin: '10px 0' }}>{book.volumeInfo.title}</h3>
                                    <button onClick={() => addToReading(book)} style={addButtonStyle}>+ Czytam</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'reading' && (
                    <div>
                        <h2>Aktualnie czytane</h2>
                        {readingList.length === 0 && <p>Nie czytasz obecnie żadnej książki.</p>}
                        {readingList.map(book => (
                            <div key={book.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', maxWidth: '500px', marginBottom: '10px' }}>
                                <img src={book.volumeInfo.imageLinks?.thumbnail} style={{ width: '60px' }} />
                                <p style={{ flexGrow: 1 }}>{book.volumeInfo.title}</p>
                                <button onClick={() => moveToFinished(book)} style={addButtonStyle}>Skończone</button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'finished' && (
                    <div>
                        <h2>Twoja biblioteka</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
                            {finishedList.map(book => (
                                <div key={book.id} style={cardStyle}>
                                    <img src={book.volumeInfo.imageLinks?.thumbnail} style={{ width: '100%', opacity: '0.7' }} />
                                    <h3 style={{ fontSize: '14px' }}>{book.volumeInfo.title}</h3>
                                    <div style={{ backgroundColor: '#456', color: 'white', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                        ★ {book.rating}/10
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

const navButtonStyle = { background: 'none', border: 'none', color: '#9ab', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' };
const cardStyle = { backgroundColor: '#2c3440', padding: '15px', borderRadius: '8px', textAlign: 'center' };
const addButtonStyle = { backgroundColor: '#456', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', width: '100%' };

export default App;