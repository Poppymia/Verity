import React from 'react';
import Button from '../Button';

const CTA = () => {
  return (
    <section className="cta">
      <h2>Ready to browse with confidence?</h2>
      <p>Join thousands who've stopped falling for misinformation</p>
      <Button variant="primary" size="large">
        Get Started Free
      </Button>
    </section>
  );
};

export default CTA;