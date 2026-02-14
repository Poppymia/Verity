import React from 'react';
import { Eye, ShoppingCart, Globe } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Eye />,
      iconClass: 'shield',
      title: 'Real-Time Detection',
      description: 'Automatically highlights misleading claims as you browse, with color-coded trust indicators.'
    },
    {
      icon: <ShoppingCart />,
      iconClass: 'commerce',
      title: 'Dark Pattern Alerts',
      description: 'Detects fake urgency, hidden subscriptions, and deceptive e-commerce tactics instantly.'
    },
    {
      icon: <Globe />,
      iconClass: 'domain',
      title: 'Domain Trust Scores',
      description: 'View the credibility history and accuracy rating of any website before you trust it.'
    }
  ];

  return (
    <section className="features">
      <h2 className="section-title">Three powerful ways to verify truth</h2>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className={`feature-icon ${feature.iconClass}`}>
              {feature.icon}
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;