import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import HowItWorks from '../components/home/HowItWorks';
import CTA from '../components/home/CTA';
import '../styles/Home.css';

const Home = ({ onNavigate }) => {
  const handleNavigateToHowItWorks = () => {
    onNavigate('how-it-works');
  };

  return (
    <div className="page">
      <Hero onNavigate={handleNavigateToHowItWorks} />
      <Features />
      <HowItWorks />
      <CTA />
    </div>
  );
};

export default Home;