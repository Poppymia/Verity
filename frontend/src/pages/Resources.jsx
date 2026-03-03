import React from 'react';
import Button from '../components/Button';
import '../styles/Resources.css';

const Resources = () => {
  const resourceCategories = [
    {
      title: 'Understanding Misinformation',
      resources: [
        {
          tag: 'Guide',
          title: 'What is Misinformation?',
          description: 'Learn the difference between misinformation, disinformation, and malinformation.',
          link: '#'
        },
        {
          tag: 'Research',
          title: 'How Social Media Spreads False Info',
          description: 'Understanding algorithms, echo chambers, and the 24-hour news cycle.',
          link: '#'
        },
        {
          tag: 'Framework',
          title: 'Media Literacy Framework',
          description: 'Key questions to ask when analyzing any piece of content online.',
          link: '#'
        }
      ]
    },
    {
      title: 'Using Verity Effectively',
      resources: [
        {
          tag: 'Tutorial',
          title: 'Getting Started with Verity',
          description: 'Installation, setup, and your first verification in 5 minutes.',
          link: '#'
        },
        {
          tag: 'Guide',
          title: 'Understanding Trust Scores',
          description: 'How we calculate credibility and what the color codes mean.',
          link: '#'
        },
        {
          tag: 'Best Practices',
          title: 'Fact-Checking for Students',
          description: 'How to use Verity for academic research and writing papers.',
          link: '#'
        }
      ]
    },
    {
      title: 'Dark Patterns & E-commerce',
      resources: [
        {
          tag: 'Article',
          title: 'Common Dark Patterns to Watch For',
          description: 'Fake urgency, hidden costs, and other deceptive design tactics.',
          link: '#'
        },
        {
          tag: 'Case Study',
          title: 'Black Friday Scams Exposed',
          description: 'How retailers use false discounts and artificial scarcity.',
          link: '#'
        }
      ]
    }
  ];

  const ResourceCard = ({ tag, title, description, link }) => (
    <div className="resource-card">
      <div className="resource-tag">{tag}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <a href={link} className="resource-link">
        {tag === 'Tutorial' ? 'Watch tutorial' : 
         tag === 'Research' ? 'View research' : 
         tag === 'Case Study' ? 'View case study' :
         tag === 'Article' ? 'Read article' :
         'Learn more'} →
      </a>
    </div>
  );

  return (
    <div className="page">
      <section className="resources-hero">
        <h1 className="page-title">Learn to identify misinformation</h1>
        <p className="page-subtitle">
          Tools, guides, and research to help you become a more critical consumer of online information.
        </p>
      </section>

      <section className="resources-content">
        <div className="resources-grid">
          {resourceCategories.map((category, index) => (
            <div key={index} className="resource-category">
              <h2>{category.title}</h2>
              <div className="resource-list">
                {category.resources.map((resource, idx) => (
                  <ResourceCard key={idx} {...resource} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="help-section">
          <h2>Need help?</h2>
          <p>Can't find what you're looking for? Our support team is here to help.</p>
          <Button variant="secondary">Contact Support</Button>
        </div>
      </section>
    </div>
  );
};

export default Resources;