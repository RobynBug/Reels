import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWatchlist } from '../redux/watchlistSlice';

function Watchlist() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.watchlist);
  
  // Custom toast notification state
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    dispatch(fetchWatchlist());
  }, [dispatch]);
  
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRemove = async (tmdbId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/watchlist/${tmdbId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      dispatch(fetchWatchlist());
      showToast('Removed from Watchlist');
    } catch (err) {
      console.error('Failed to remove item:', err);
      showToast('Failed to remove item');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Watchlist</h2>
      
      {/* Custom Toast Notification */}
      {toastMessage && (
        <div style={styles.toast}>
          {toastMessage}
        </div>
      )}

      {status === 'loading' && <p style={styles.message}>Loading...</p>}
      {status === 'failed' && <p style={styles.message}>Failed to load your watchlist.</p>}
      {status === 'succeeded' && items.length === 0 && (
        <p style={styles.message}>Your watchlist is empty. Start adding some favorites!</p>
      )}

      {status === 'succeeded' && items.length > 0 && (
        <div style={styles.grid}>
          {items.map((item) => (
            <div key={item.tmdbId} style={styles.card}>
              <div style={styles.imageContainer}>
                <img
                  src={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : '/download.jpeg'}
                  alt={item.title || item.name}
                  style={styles.image}
                />
              </div>
              <p style={styles.itemTitle}>{item.title || item.name}</p>
              
              <div style={styles.buttonContainer}>
                <button onClick={() => handleRemove(item.tmdbId)} style={styles.remove}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    textAlign: 'center',
    position: 'relative', // for absolute toast positioning
  },
  toast: {
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#2ecc71',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    zIndex: 2000,
    fontWeight: 'bold',
    animation: 'fadeInOut 3s ease-in-out',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '1rem',
    color: '#bbb',
    marginTop: '1rem',
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
    marginBottom: '1rem',
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: 'auto',
    width: '100%',
  },
  remove: {
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  },
};

export default Watchlist;