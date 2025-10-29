import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login, logout } from './redux/authSlice';

import Auth from './pages/Auth';
import Home from './pages/Home';
import Watchlist from './pages/WatchList';
import History from './pages/History';
import Navbar from './components/Navbar';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        dispatch(login({ user: JSON.parse(user), token }));
      } catch {
        dispatch(logout());
      }
    }
  }, [dispatch]);

  return (
    <div style={styles.page}>
      <Router>
        <Navbar />
        <div style={styles.content}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#0d1b2a', // 🌌 Midnight navy
    minHeight: '100vh',
    color: '#ffffff',
    fontFamily: 'Segoe UI, sans-serif',
  },
  content: {
    padding: '2rem',
    borderRadius: '12px', // ✅ Soft edges for content container
  },
};

export default App;
