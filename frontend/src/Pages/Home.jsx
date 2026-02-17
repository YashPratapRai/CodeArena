import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';
import Footer from '../components/layout/Footer';


const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section - Full Screen */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-grid-pattern"></div>
          <div className="hero-floating-elements">
            <div className="floating-element el-1">⚡</div>
            <div className="floating-element el-2">🚀</div>
            <div className="floating-element el-3">💻</div>
            <div className="floating-element el-4">🎯</div>
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span>Trusted by 2M+ Developers Worldwide</span>
          </div>
          
          <h1 className="hero-title">
            <span className="title-line">Master <span className="text-gradient">Data Structures and Algorithms</span></span>
            <span className="title-line">Like Never Before</span>
          </h1>
          
          <p className="hero-description">
            Join the world's largest community of developers practicing coding skills, 
            mastering algorithms, and preparing for technical interviews at top tech companies.
          </p>

          <div className="hero-actions">
            <Link to="/problems" className="btn btn-primary">
              <span>Start Coding Now</span>
              <div className="btn-hover-effect"></div>
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-secondary">
                Join Free Today
              </Link>
            )}
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">25K+</div>
              <div className="stat-label">Coding Problems</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">2M+</div>
              <div className="stat-label">Active Coders</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">150+</div>
              <div className="stat-label">Tech Companies</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="code-platform-preview">
            <div className="platform-header">
              <div className="platform-tabs">
                <div className="tab active">two_sum.py</div>
                <div className="tab">solution.java</div>
                <div className="tab">explanation.md</div>
              </div>
              <div className="platform-actions">
                <button className="platform-btn run">▶ Run</button>
                <button className="platform-btn submit">✓ Submit</button>
              </div>
            </div>
            
            <div className="code-editor">
              <div className="line-numbers">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="line-number">{i + 1}</div>
                ))}
              </div>
              <div className="code-content">
                <div className="code-line">
                  <span className="keyword">class</span> <span className="class-name">Solution</span><span className="punctuation">:</span>
                </div>
                <div className="code-line">
                  <span className="indent"></span>
                  <span className="keyword">def</span> <span className="function">twoSum</span><span className="punctuation">(</span>
                  <span className="parameter">self</span><span className="punctuation">,</span> <span className="parameter">nums</span><span className="punctuation">:</span> <span className="type">List</span><span className="punctuation">[</span><span className="type">int</span><span className="punctuation">]</span><span className="punctuation">,</span> <span className="parameter">target</span><span className="punctuation">:</span> <span className="type">int</span><span className="punctuation">)</span> <span className="punctuation">-&gt;</span> <span className="type">List</span><span className="punctuation">[</span><span className="type">int</span><span className="punctuation">]</span><span className="punctuation">:</span>
                </div>
                <div className="code-line">
                  <span className="indent"></span><span className="indent"></span>
                  <span className="variable">hash_map</span> <span className="operator">=</span> <span className="punctuation">{}</span>
                </div>
                <div className="code-line">
                  <span className="indent"></span><span className="indent"></span>
                  <span className="keyword">for</span> <span className="parameter">i</span><span className="punctuation">,</span> <span className="parameter">num</span> <span className="keyword">in</span> <span className="function">enumerate</span><span className="punctuation">(</span><span className="parameter">nums</span><span className="punctuation">)</span><span className="punctuation">:</span>
                </div>
                <div className="code-line">
                  <span className="indent"></span><span className="indent"></span><span className="indent"></span>
                  <span className="variable">complement</span> <span className="operator">=</span> <span className="parameter">target</span> <span className="operator">-</span> <span className="parameter">num</span>
                </div>
                <div className="code-line">
                  <span className="indent"></span><span className="indent"></span><span className="indent"></span>
                  <span className="keyword">if</span> <span className="variable">complement</span> <span className="keyword">in</span> <span className="variable">hash_map</span><span className="punctuation">:</span>
                </div>
                <div className="code-line highlight">
                  <span className="indent"></span><span className="indent"></span><span className="indent"></span><span className="indent"></span>
                  <span className="keyword">return</span> <span className="punctuation">[</span><span className="variable">hash_map</span><span className="punctuation">[</span><span className="variable">complement</span><span className="punctuation">]</span><span className="punctuation">,</span> <span className="parameter">i</span><span className="punctuation">]</span>
                </div>
                <div className="code-line">
                  <span className="indent"></span><span className="indent"></span><span className="indent"></span>
                  <span className="variable">hash_map</span><span className="punctuation">[</span><span className="parameter">num</span><span className="punctuation">]</span> <span className="operator">=</span> <span className="parameter">i</span>
                </div>
                <div className="code-line">
                  <span className="indent"></span><span className="indent"></span>
                  <span className="keyword">return</span> <span className="punctuation">[]</span>
                </div>
              </div>
            </div>

            <div className="execution-result">
              <div className="result-header">
                <span>Test Results</span>
                <div className="status-badge success">All Tests Passed</div>
              </div>
              <div className="test-cases">
                <div className="test-case success">
                  <span>TestCase 1: Passed ✓</span>
                </div>
                <div className="test-case success">
                  <span>TestCase 2: Passed ✓</span>
                </div>
                <div className="test-case success">
                  <span>TestCase 3: Passed ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Why Developers Choose Us - Enhanced */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Top Developers Choose CodeMaster</h2>
            <p className="section-subtitle">
              Join millions of developers who have transformed their coding skills and landed their dream jobs
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-container">
                <div className="feature-icon">🏆</div>
                <div className="icon-background"></div>
              </div>
              <h3>Comprehensive Problem Library</h3>
              <p>Access 25,000+ coding problems from beginner to advanced levels, carefully curated by industry experts.</p>
              <div className="feature-stats">
                <span>25K+ Problems</span>
                <span>15+ Languages</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-container">
                <div className="feature-icon">⚡</div>
                <div className="icon-background"></div>
              </div>
              <h3>Real-time Code Execution</h3>
              <p>Execute code instantly in 15+ programming languages with detailed performance metrics and debugging tools.</p>
              <div className="feature-stats">
                <span>Instant Feedback</span>
                <span>Multi-language</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-container">
                <div className="feature-icon">📊</div>
                <div className="icon-background"></div>
              </div>
              <h3>Advanced Progress Analytics</h3>
              <p>Track your performance with detailed insights, skill assessments, and personalized improvement recommendations.</p>
              <div className="feature-stats">
                <span>Smart Analytics</span>
                <span>Progress Tracking</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-container">
                <div className="feature-icon">👥</div>
                <div className="icon-background"></div>
              </div>
              <h3>Vibrant Community</h3>
              <p>Learn from 2 million+ developers through discussions, solutions, and collaborative learning experiences.</p>
              <div className="feature-stats">
                <span>2M+ Developers</span>
                <span>Active Forums</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-container">
                <div className="feature-icon">💼</div>
                <div className="icon-background"></div>
              </div>
              <h3>Interview Preparation</h3>
              <p>Master company-specific questions, participate in mock interviews, and get ready for technical screenings.</p>
              <div className="feature-stats">
                <span>150+ Companies</span>
                <span>Mock Interviews</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-container">
                <div className="feature-icon">🚀</div>
                <div className="icon-background"></div>
              </div>
              <h3>Weekly Coding Contests</h3>
              <p>Compete in regular coding contests, climb the global leaderboard, and benchmark your skills worldwide.</p>
              <div className="feature-stats">
                <span>Global Ranking</span>
                <span>Regular Contests</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="achievement-section">
        <div className="container">
          <div className="achievement-grid">
            <div className="achievement-item">
              <div className="achievement-number">2,500,000+</div>
              <div className="achievement-label">Active Developers</div>
              <div className="achievement-desc">Growing community of passionate coders</div>
            </div>
            <div className="achievement-item">
              <div className="achievement-number">98%</div>
              <div className="achievement-label">Interview Success Rate</div>
              <div className="achievement-desc">Of dedicated users land their dream job</div>
            </div>
            <div className="achievement-item">
              <div className="achievement-number">50,000+</div>
              <div className="achievement-label">Daily Solutions</div>
              <div className="achievement-desc">Problems solved by our community every day</div>
            </div>
            <div className="achievement-item">
              <div className="achievement-number">4.9/5</div>
              <div className="achievement-label">User Rating</div>
              <div className="achievement-desc">Rated by developers worldwide</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background">
          <div className="cta-pattern"></div>
        </div>
        <div className="container">
          <div className="cta-content">
            <h2>Start Your Coding Journey Today</h2>
            <p>Join millions of developers who have transformed their careers with CodeMaster</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary large">
                Create Free Account
              </Link>
              <Link to="/problems" className="btn btn-secondary large">
                Explore Problems
              </Link>
            </div>
            <div className="cta-features">
              <span>✓ No credit card required</span>
              <span>✓ Free forever plan</span>
              <span>✓ Start coding instantly</span>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;