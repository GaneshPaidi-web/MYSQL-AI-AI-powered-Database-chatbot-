import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../ThemeContext';
import axios from 'axios';
import './Settings.css';

function Settings() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [name, setName] = useState(user.name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Handle hardcoded admin locally
    if (user.isAdmin || user.id === "507f1f77bcf86cd799439011") {
      const updatedUser = { ...user, name: name.trim() };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage({ type: 'success', text: 'Admin name updated successfully!' });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/profile`, {
        userId: user.id,
        name: name.trim()
      });

      if (response.data.success) {
        const updatedUser = { ...user, name: response.data.user.name };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setMessage({ type: 'success', text: 'Name updated successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update name' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <p>Manage your account preferences here.</p>
      
      {message.text && (
        <div className={`settings-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Profile Settings */}
      <div className="settings-section">
        <h3>Profile Settings</h3>
        <p className="section-desc">Update your display name.</p>
        <div className="profile-edit-field">
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Your Name"
            disabled={loading}
          />
          <button 
            className="save-btn" 
            onClick={handleSaveName}
            disabled={loading || !name.trim() || name === user.name}
          >
            {loading ? 'Saving...' : 'Save Name'}
          </button>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Theme Preferences</h3>
        <div className="theme-toggle">
          <label>
            <input 
              type="radio" 
              name="theme" 
              value="light" 
              checked={theme === 'light'} 
              onChange={() => toggleTheme('light')} 
            />
            Light Theme
          </label>
          <label>
            <input 
              type="radio" 
              name="theme" 
              value="dark" 
              checked={theme === 'dark'} 
              onChange={() => toggleTheme('dark')} 
            />
            Dark Theme
          </label>
        </div>
      </div>

    </div>
  );
}

export default Settings;
