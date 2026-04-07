import React from 'react';
import { Shield } from 'lucide-react';
import Button from './Button';
import { EXTENSION_ZIP_HREF } from '../constants/extensionDownload';
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
            onClick={() => onNavigate('history')} 
            className={`nav-link ${currentPage === 'history' ? 'active' : ''}`}
          >
            History
          </button>
          <button 
            onClick={() => onNavigate('resources')} 
            className={`nav-link ${currentPage === 'resources' ? 'active' : ''}`}
          >
            Resources
          </button>
        </div>
        
        <div className="nav-actions">
          <Button
            variant="primary"
            href={EXTENSION_ZIP_HREF}
            download="verity-extension.zip"
            title="Unzip, then Chrome → Extensions → Developer mode → Load unpacked → verity-extension folder."
          >
            Download extension <span className="free-tag">It's free</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;