import React, { useEffect, useState } from 'react';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const tmdbKey = import.meta.env.VITE_TMDB_API_KEY;

const History = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [detailedItems, setDetailedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/history`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load history');
        setLoading(false);
        return;
      }

      setHistoryItems(data);
      fetchDetailsForHistory(data);
    } catch (err) {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  const fetchDetailsForHistory = async (items) => {
    try {
      const detailPromises = items.map(async (item) => {
        // Default to movie if mediaType is missing in older history entries
        const mediaType = item.mediaType || 'movie'; 
        const tmdbId = item.tmdbId;

        const res = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${tmdbKey}`
        );
        
        if (!res.ok) return null;
        
        const details = await res.json();
        return {
          ...item,
          ...details,
          mediaType, // ensure mediaType is attached for the modal
          imageUrl: details.poster_path 
            ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
            : null
        };
      });

      const results = await Promise.all(detailPromises);
      setDetailedItems(results.filter(item => item !== null));
    } catch (err) {
      console.error('Error fetching TMDB details for history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async (item) => {
    const tmdbId = item.tmdbId;
    const mediaType = item.mediaType;

    if (!tmdbId || !mediaType) {
      console.error('Missing tmdbId or mediaType for watchlist item');
      return;
    }

    try {
      await fetch(`${baseUrl}/api/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tmdbId, mediaType }),
      });
      alert('Added to Watchlist!');
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  };

  const handleShowDetails = async (tmdbId, mediaType) => {
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

  if (loading) return <div style={styles.container}>Loading history...</div>;
  if (error) return <div style={styles.container}><p style={styles.error}>{error}</p></div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Recently Viewed</h1>
      {detailedItems.length === 0 ? (
        <p>No history yet. Search for some movies to get started!</p>
      ) : (
        <div style={styles.grid}>
          {detailedItems.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.imageContainer}>
                <img
                  src={item.imageUrl || '/download.jpeg'}
                  alt={item.title || item.name}
                  style={styles.image}
                />
              </div>
              <p style={styles.itemTitle}>{item.title || item.name}</p>
              <p style={styles.dateText}>
                Viewed: {new Date(item.watchedAt).toLocaleDateString()}
              </p>
              
              <div style={styles.buttonContainer}>
                <button
                  onClick={() => handleShowDetails(item.tmdbId, item.mediaType)}
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
            </div>
          ))}
        </div>
      )}

      {/* Reused Modal from Home.jsx */}
      {showModal && selectedMovie && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalScrollableContent}>
              <h2>{selectedMovie.title || selectedMovie.name} ({selectedMovie.mediaType === 'tv' ? 'TV Show' : 'Movie'})</h2>
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

              {selectedMovie.streaming && selectedMovie.streaming.length > 0 ? (
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
            </div>
            
            <div style={styles.modalActions}>
              <button onClick={() => setShowModal(false)} style={styles.close}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '2rem',
  },
  error: {
    color: 'red',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginTop: '1rem',
  },
  card: {
    backgroundColor: '#172a3bff',
    border: '1px solid #2c3e50',
    padding: '1rem',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
    height: '100%',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: '2/3',
    overflow: 'hidden',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1b2a',
    borderRadius: '4px',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemTitle: {
    fontWeight: 'bold',
    marginBottom: '0.2rem',
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: '0.8rem',
    color: '#aaa',
    marginBottom: '1rem',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: 'auto',
    width: '100%',
  },
  add: {
    background: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  },
  details: {
    background: '#2ecc71',
    color: '#fff',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  },
  /* Modal Styles */
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContent: {
    background: '#0d1b2a',
    color: '#fff',
    borderRadius: '8px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  modalScrollableContent: {
    padding: '2rem',
    overflowY: 'auto',
  },
  modalActions: {
    padding: '1rem 2rem',
    borderTop: '1px solid #2c3e50',
    background: '#0d1b2a',
    borderRadius: '0 0 8px 8px',
  },
  close: {
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    fontSize: '1rem',
  },
};

export default History;