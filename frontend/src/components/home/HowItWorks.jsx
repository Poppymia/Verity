import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: 'Scan Every Claim',
      description: 'Our NLP engine extracts and analyzes factual claims from any webpage.'
    },
    {
      number: 2,
      title: 'Cross-Reference Sources',
      description: 'We verify against academic databases, fact-checkers, and authoritative sources.'
    },
    {
      number: 3,
      title: 'Show You the Truth',
      description: 'Get instant, color-coded feedback with sources and evidence backing every rating.'
    }
  ];

  const ratingExamples = [
    {
      icon: <CheckCircle size={20} />,
      text: 'Verified: 94% Accurate',
      className: 'green'
    },
    {
      icon: <AlertTriangle size={20} />,
      text: 'Questionable: Needs Review',
      className: 'yellow'
    },
    {
      icon: <XCircle size={20} />,
      text: 'False: Contradicts Evidence',
      className: 'red'
    }
  ];

  return (
    <section className="how-it-works">
      <div className="how-container">
        <div className="how-visual">
          <div className="rating-demo">
            {ratingExamples.map((rating, index) => (
              <div key={index} className={`rating-item ${rating.className}`}>
                {rating.icon}
                <span>{rating.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="how-content">
          <h2>How Verity protects you</h2>
          <div className="how-steps">
            {steps.map((step) => (
              <div key={step.number} className="step">
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;