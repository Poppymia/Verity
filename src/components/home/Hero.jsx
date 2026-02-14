import React from 'react';
import { XCircle } from 'lucide-react';
import Button from '../Button';

const Hero = ({ onNavigate }) => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Navigate the web with confidence.
          <br />
          <span className="gradient-text">We verify the facts.</span>
        </h1>
        <p className="hero-subtitle">
          Stop second-guessing what's real. Verity automatically detects misinformation, 
          dark patterns, and misleading claims across the web—so you can browse with trust.
        </p>
        <div className="hero-actions">
          <Button variant="primary" size="large">
            Install Extension <span className="free-tag">Free</span>
          </Button>
          <Button variant="secondary" size="large" onClick={onNavigate}>
            See How It Works
          </Button>
        </div>
        <p className="trust-line">Trusted by students, researchers, and truth-seekers worldwide</p>
      </div>
      
      <div className="hero-visual">
        <div className="demo-card">
          <div className="demo-header">
            <div className="browser-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div className="demo-content">
            <p className="demo-text">
              "This revolutionary product will <span className="highlight red">change your life in 24 hours</span>"
            </p>
            <div className="verification-badge red">
              <XCircle size={16} />
              <span>Unverified Claim</span>
            </div>
            <div className="fact-box">
              <h4>Truth Check:</h4>
              <p>No scientific evidence supports this claim. Similar products have shown minimal effect.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;