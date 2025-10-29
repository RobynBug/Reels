import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = Boolean(user && user.email);

  const handleLogout = async () => {
    try {
      await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      dispatch(logout());
      navigate('/auth');
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/history" style={styles.link}>History</Link>
        <Link to="/watchlist" style={styles.link}>Watchlist</Link>
      </div>
      <div style={styles.right}>
        {isLoggedIn && <span style={styles.greeting}>Hello, {user.email}</span>}
        {!isLoggedIn && <Link to="/auth" style={styles.button}>Login</Link>}
        {isLoggedIn && <button onClick={handleLogout} style={styles.button}>Logout</button>}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    backgroundColor: '#2f2f2f', // 🩶 Medium-dark gray for contrast
    color: '#fff',
    borderRadius: '0 0 12px 12px', // ✅ Soft bottom corners
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  },
  left: {
    display: 'flex',
    gap: '1rem',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    transition: 'background 0.3s',
  },
  greeting: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#444', // 🩶 Slightly lighter gray for buttons
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background 0.3s',
  },
};



export default Navbar;
