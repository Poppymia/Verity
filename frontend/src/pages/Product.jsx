import React from 'react';
import { Zap, FileText } from 'lucide-react';
import Button from '../components/Button';
import '../styles/Product.css';

const Product = () => {
  const extensionFeatures = [
    {
      title: 'Automatic Claim Detection',
      description: 'Verity runs in the background, automatically scanning and highlighting questionable claims on any webpage.',
      features: [
        'Real-time analysis under 2 seconds',
        'Color-coded trust indicators (Red/Yellow/Green)',
        'Hover to see detailed verification'
      ]
    },
    {
      title: 'Manual Verification',
      description: 'Highlight any text and verify it instantly with a keyboard shortcut.',
      features: [
        'Select text → Press Ctrl+Shift+V',
        'Instant truth sandwich format',
        'Source citations included'
      ]
    },
    {
      title: 'E-commerce Spec Check',
      description: 'Shopping on Amazon? We verify product claims against official specifications.',
      features: [
        'Detects false battery life claims',
        'Compares specs to manufacturer data',
        'Flags misleading measurements'
      ]
    },
    {
      title: 'Dark Pattern Recognition',
      description: 'Protect yourself from deceptive design tactics.',
      features: [
        'Fake countdown timer detection',
        'Hidden subscription warnings',
        'False scarcity alerts'
      ]
    }
  ];

  const webAppFeatures = [
    {
      title: 'Domain Scanner',
      description: 'Enter any URL to get a comprehensive trust analysis and historical accuracy rating.',
      features: [
        'Trust score (0-100)',
        'Domain reputation history',
        'Past accuracy on claims'
      ]
    },
    {
      title: 'Article Analyzer',
      description: 'Upload PDFs or paste URLs for deep-dive verification of long-form content.',
      features: [
        'Comprehensive veracity scorecard',
        'Claim-by-claim breakdown',
        'Perfect for academic research'
      ]
    },
    {
      title: 'Search Results Rating',
      description: 'When you search, we rate all results based on source trustworthiness.',
      features: [
        'Inline trust badges',
        'Domain credibility scores',
        'Filter by reliability'
      ]
    }
  ];

  const ProductItem = ({ title, description, features }) => (
    <div className="product-item">
      <h3>{title}</h3>
      <p>{description}</p>
      <ul>
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="page">
      <section className="product-hero">
        <h1 className="page-title">The complete truth verification toolkit</h1>
        <p className="page-subtitle">
          Everything you need to identify misinformation, dark patterns, and misleading claims across the entire web.
        </p>
      </section>

      <section className="product-features">
        <div className="product-category">
          <div className="category-header">
            <Zap className="category-icon" />
            <h2>Browser Extension</h2>
          </div>
          <div className="product-grid">
            {extensionFeatures.map((feature, index) => (
              <ProductItem key={index} {...feature} />
            ))}
          </div>
        </div>

        <div className="product-category">
          <div className="category-header">
            <FileText className="category-icon" />
            <h2>Web Application</h2>
          </div>
          <div className="product-grid">
            {webAppFeatures.map((feature, index) => (
              <ProductItem key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="product-cta">
        <div className="cta-box">
          <h2>Experience the full power of Verity</h2>
          <Button variant="white" size="large">
            Install Free Extension
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Product;