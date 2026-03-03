import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Search, Zap, Shield, Globe, Eye, Code } from 'lucide-react';
import Button from '../components/Button';
import '../styles/HowItWorksPage.css';

const HowItWorksPage = () => {
  return (
    <div className="page">
      {/* Hero Section */}
      <section className="how-works-hero">
        <h1 className="page-title">How Verity Works</h1>
        <p className="page-subtitle">
          A complete breakdown of our technology, process, and how we help you navigate the web with confidence.
        </p>
      </section>

      {/* The Process */}
      <section className="process-section">
        <div className="process-container">
          <h2 className="section-title">The Verification Process</h2>
          
          <div className="process-steps">
            <div className="process-step">
              <div className="step-icon step-1">
                <Eye />
              </div>
              <div className="step-content">
                <h3>Step 1: Detection</h3>
                <p>
                  Our NLP (Natural Language Processing) engine scans every webpage you visit, automatically extracting 
                  factual claims, product specifications, and statistical statements. The system identifies atomic claims 
                  - individual statements that can be verified independently.
                </p>
                <div className="example-box">
                  <strong>Example:</strong> From the sentence "This battery lasts 48 hours and charges in 30 minutes," 
                  we extract two separate claims to verify.
                </div>
              </div>
            </div>

            <div className="process-step">
              <div className="step-icon step-2">
                <Search />
              </div>
              <div className="step-content">
                <h3>Step 2: Cross-Reference</h3>
                <p>
                  Each claim is cross-referenced against our evidence corpus, which includes academic databases (PubMed, 
                  Google Scholar), fact-checking organizations (Snopes, FactCheck.org), official product manuals, and 
                  verified historical records.
                </p>
                <div className="example-box">
                  <strong>Example:</strong> Battery claim → Check manufacturer specifications, independent reviews, 
                  and consumer reports.
                </div>
              </div>
            </div>

            <div className="process-step">
              <div className="step-icon step-3">
                <Zap />
              </div>
              <div className="step-content">
                <h3>Step 3: Rating & Display</h3>
                <p>
                  Based on the evidence, we assign a color-coded rating: Green (verified), Yellow (questionable), 
                  or Red (false). The claim is highlighted on the page with a hover tooltip showing sources and reasoning.
                </p>
                <div className="rating-examples">
                  <div className="rating-badge green">
                    <CheckCircle size={16} />
                    <span>Verified - Matches Evidence</span>
                  </div>
                  <div className="rating-badge yellow">
                    <AlertTriangle size={16} />
                    <span>Questionable - Needs Review</span>
                  </div>
                  <div className="rating-badge red">
                    <XCircle size={16} />
                    <span>False - Contradicts Evidence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="tech-section">
        <div className="tech-container">
          <h2 className="section-title">Our Technology</h2>
          
          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-icon">
                <Code />
              </div>
              <h3>NLP Engine</h3>
              <p>
                Advanced natural language processing powered by transformer models to understand context, 
                identify claims, and distinguish facts from opinions.
              </p>
              <ul>
                <li>90%+ accuracy in claim extraction</li>
                <li>Context-aware processing</li>
                <li>Multi-language support</li>
              </ul>
            </div>

            <div className="tech-card">
              <div className="tech-icon">
                <Shield />
              </div>
              <h3>Evidence Database</h3>
              <p>
                Curated collection of authoritative sources continuously updated with verified information 
                from academic, governmental, and journalistic sources.
              </p>
              <ul>
                <li>10M+ verified facts</li>
                <li>Real-time API connections</li>
                <li>Peer-reviewed sources</li>
              </ul>
            </div>

            <div className="tech-card">
              <div className="tech-icon">
                <Globe />
              </div>
              <h3>Domain Reputation</h3>
              <p>
                Machine learning model that tracks historical accuracy of websites, building trust scores 
                based on past performance and fact-checking results.
              </p>
              <ul>
                <li>5M+ domains tracked</li>
                <li>Historical accuracy data</li>
                <li>Dynamic scoring</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="use-cases-section">
        <div className="use-cases-container">
          <h2 className="section-title">Real-World Examples</h2>
          
          <div className="use-case">
            <div className="use-case-header">
              <h3>Scenario 1: E-Commerce Shopping</h3>
            </div>
            <div className="use-case-content">
              <div className="use-case-problem">
                <h4>❌ The Problem:</h4>
                <p>
                  You're shopping on Amazon and see a phone claiming "5-day battery life" and "waterproof to 100 meters."
                </p>
              </div>
              <div className="use-case-solution">
                <h4>✅ Verity's Solution:</h4>
                <p>
                  Our extension highlights these claims. Hovering shows: Battery claim is <span className="red-text">FALSE</span> 
                  (manufacturer specs show 2-day battery). Waterproof claim is <span className="yellow-text">MISLEADING</span> 
                  (rated for 50 meters, not 100).
                </p>
              </div>
            </div>
          </div>

          <div className="use-case">
            <div className="use-case-header">
              <h3>Scenario 2: Social Media News</h3>
            </div>
            <div className="use-case-content">
              <div className="use-case-problem">
                <h4>❌ The Problem:</h4>
                <p>
                  You see a viral tweet claiming "New study shows coffee causes cancer in 90% of cases."
                </p>
              </div>
              <div className="use-case-solution">
                <h4>✅ Verity's Solution:</h4>
                <p>
                  Extension flags this as <span className="red-text">FALSE</span>. Cross-referencing shows the actual study 
                  found no significant cancer link. The 90% statistic is completely fabricated.
                </p>
              </div>
            </div>
          </div>

          <div className="use-case">
            <div className="use-case-header">
              <h3>Scenario 3: Academic Research</h3>
            </div>
            <div className="use-case-content">
              <div className="use-case-problem">
                <h4>❌ The Problem:</h4>
                <p>
                  You're writing a paper and found an article citing "Studies show 85% improvement with this method."
                </p>
              </div>
              <div className="use-case-solution">
                <h4>✅ Verity's Solution:</h4>
                <p>
                  Upload the article to our web app. We verify each citation, finding that one study is misquoted 
                  (actual result was 45%, not 85%). You get a detailed report with corrected information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Breakdown */}
      <section className="features-breakdown">
        <div className="breakdown-container">
          <h2 className="section-title">Feature Deep Dive</h2>
          
          <div className="feature-detail">
            <h3>🔍 Automatic Detection</h3>
            <p>
              Runs silently in the background as you browse. Uses minimal resources (less than 50MB RAM). 
              Processes pages in under 2 seconds. No manual intervention required.
            </p>
            <div className="tech-specs">
              <span className="spec-tag">Background Processing</span>
              <span className="spec-tag">Low Resource Usage</span>
              <span className="spec-tag">Real-time Analysis</span>
            </div>
          </div>

          <div className="feature-detail">
            <h3>✋ Manual Verification</h3>
            <p>
              Highlight any text, press Ctrl+Shift+V (customizable). Get instant verification with the "Truth Sandwich" 
              format: Fact → Misinformation → Reiterated Fact. Helps reinforce accurate information.
            </p>
            <div className="tech-specs">
              <span className="spec-tag">Custom Shortcuts</span>
              <span className="spec-tag">Truth Sandwich Format</span>
              <span className="spec-tag">Source Citations</span>
            </div>
          </div>

          <div className="feature-detail">
            <h3>🛒 Dark Pattern Recognition</h3>
            <p>
              Scans JavaScript code to detect fake countdown timers (timers that reset), hidden subscription auto-renewals, 
              and artificial scarcity ("Only 2 left!" when there are thousands in stock).
            </p>
            <div className="tech-specs">
              <span className="spec-tag">Code Analysis</span>
              <span className="spec-tag">Pattern Detection</span>
              <span className="spec-tag">Real-time Alerts</span>
            </div>
          </div>

          <div className="feature-detail">
            <h3>🌐 Domain Trust Score</h3>
            <p>
              Every website gets a score (0-100) based on historical accuracy. Sites that frequently publish 
              misinformation get lower scores. Updated daily based on new fact-checks.
            </p>
            <div className="tech-specs">
              <span className="spec-tag">0-100 Scale</span>
              <span className="spec-tag">Daily Updates</span>
              <span className="spec-tag">Historical Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="privacy-section">
        <div className="privacy-container">
          <h2 className="section-title">Privacy & Security</h2>
          
          <div className="privacy-grid">
            <div className="privacy-item">
              <h3>🔒 Your Data is Private</h3>
              <p>
                We don't track your browsing history. All verification happens locally in your browser or via 
                anonymous API calls. We never sell or share your data.
              </p>
            </div>

            <div className="privacy-item">
              <h3>⚡ Fast & Efficient</h3>
              <p>
                Claims are cached to avoid redundant checks. Most verifications complete in under 1 second. 
                Minimal battery and data usage.
              </p>
            </div>

            <div className="privacy-item">
              <h3>🛡️ Open Source</h3>
              <p>
                Our core algorithms are open source and auditable. Community contributions welcome. 
                Transparent methodology available on GitHub.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-final">
        <h2>Ready to Start Verifying?</h2>
        <p>Install the Verity extension and browse with confidence</p>
        <Button variant="primary" size="large">
          Install Free Extension
        </Button>
      </section>
    </div>
  );
};

export default HowItWorksPage;