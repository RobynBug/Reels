import { useState } from 'react';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const tmdbKey = import.meta.env.VITE_TMDB_API_KEY;

function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);

    try {
      const res = await fetch(`${baseUrl}/api/content/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Search failed');
        return;
      }

      setResults(data);
    } catch {
      setError('Something went wrong');
    }
  };

const handleAddToWatchlist = async (item) => {
  const tmdbId = item.tmdbId || item.id;
  const mediaType =
    item.mediaType ||
    item.media_type ||
    (item.first_air_date ? 'tv' : item.release_date ? 'movie' : null);

  if (!tmdbId || !mediaType) {
    console.error('Missing tmdbId or mediaType for watchlist item:', item);
    return;
  }

  await fetch(`${baseUrl}/api/watchlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ tmdbId, mediaType }),
  });
};



  const guessMediaType = (item) => {
    if (item.mediaType || item.media_type) return item.mediaType || item.media_type;
    if (item.first_air_date) return 'tv';
    if (item.release_date) return 'movie';
    return null;
  };

  const handleShowDetails = async (tmdbId, mediaType) => {
    if (!mediaType) {
      console.error('Missing media type for TMDB item');
      return;
    }

    try {
      const [detailsRes, videosRes, providersRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${tmdbKey}`),
        fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}/videos?api_key=${tmdbKey}`),
        fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}/watch/providers?api_key=${tmdbKey}`),
      ]);

      const details = await detailsRes.json();
      const videos = await videosRes.json();
      const providers = await providersRes.json();

      const trailer = videos.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      const streaming = providers.results?.US?.flatrate ?? [];

      setSelectedMovie({
        ...details,
        mediaType,
        trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : null,
        streaming,
      });
      setShowModal(true);
    } catch (err) {
      console.error('Failed to fetch movie details:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>ReelRover</h1>
      <form onSubmit={handleSearch} style={styles.form}>
        <input
          type="text"
          placeholder="Search movies or shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Search</button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      {results.length > 0 && (
        <div style={styles.grid}>
          {results.map((item) => (
            <div key={item.id} style={styles.card}>
              <img
                src={item.imageUrl || '/download.jpeg'}
                alt={item.title || item.name}
                style={styles.image}
              />
              <p>{item.title || item.name}</p>
              <button
                onClick={() => handleShowDetails(item.tmdbId || item.id, guessMediaType(item))}
                style={styles.details}
              >
                Details
              </button>
              <button
                onClick={() => handleAddToWatchlist(item)}
                style={styles.add}
              >
                Add to Watchlist
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedMovie && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>{selectedMovie.title} ({selectedMovie.mediaType === 'tv' ? 'TV Show' : 'Movie'})</h2>
            <p>{selectedMovie.overview}</p>

            {selectedMovie.trailerUrl && (
              <iframe
                width="100%"
                height="315"
                src={selectedMovie.trailerUrl}
                title="Trailer"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}

            {selectedMovie.streaming.length > 0 ? (
              <div>
                <h4>Available on:</h4>
                <ul>
                  {selectedMovie.streaming.map((provider) => (
                    <li key={provider.provider_id}>{provider.provider_name}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>Not currently available to stream in the US.</p>
            )}

            <button onClick={() => setShowModal(false)} style={styles.close}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  },
  input: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    width: '300px',
  },
  button: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1.5rem',
    marginTop: '1rem',
  },
  card: {
    backgroundColor: '#172a3bff',
    border: '1px solid #2c3e50',
    padding: '1rem',
    borderRadius: '8px',
    transition: 'transform 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#fff',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '4px',
  },
  add: {
    marginTop: '0.5rem',
    background: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  details: {
    marginTop: '0.5rem',
    background: '#2ecc71',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#0d1b2a',
    color: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    maxWidth: '600px',
    width: '90%',
    textAlign: 'left',
  },
  close: {
    marginTop: '1rem',
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Home;
