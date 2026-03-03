import React from 'react';
import { Shield } from 'lucide-react';
import Button from './Button';
import '../styles/Navigation.css';

const Navigation = ({ currentPage, onNavigate }) => {
  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => onNavigate('home')}>
          <Shield className="logo-icon" />
          <span className="brand-name">Verity</span>
        </div>
        
        <div className="nav-links">
          <button 
            onClick={() => onNavigate('home')} 
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('product')} 
            className={`nav-link ${currentPage === 'product' ? 'active' : ''}`}
          >
            Product
          </button>
          <button 
            onClick={() => onNavigate('resources')} 
            className={`nav-link ${currentPage === 'resources' ? 'active' : ''}`}
          >
            Resources
          </button>
        </div>
        
        <div className="nav-actions">
          <Button variant="secondary">
            Log in
          </Button>
          <Button variant="primary">
            Get Verity <span className="free-tag">It's free</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;