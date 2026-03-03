import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Product from './pages/Product';
import Resources from './pages/Resources';
import HowItWorksPage from './pages/HowItWorksPage';
import './styles/global.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'product':
        return <Product />;
      case 'resources':
        return <Resources />;
      case 'how-it-works':
        return <HowItWorksPage />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;