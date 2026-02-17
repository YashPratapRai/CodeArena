import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AboutUs.css';

const AboutUs = () => {
  const stats = [
    { value: '500+', label: 'Coding Problems', icon: '💻' },
    { value: '5K+', label: 'Active Users', icon: '👥' },
    { value: '10K+', label: 'Submissions', icon: '🚀' },
    { value: '15+', label: 'Companies', icon: '🏢' }
  ];

  const features = [
    {
      icon: '📚',
      title: 'Comprehensive DSA Coverage',
      description: 'From Arrays to Graphs, master all Data Structures and Algorithms with our curated problem set.'
    },
    {
      icon: '⚡',
      title: 'Real-time Code Execution',
      description: 'Write, run, and test your code instantly with our powerful online judge system.'
    },
    {
      icon: '📊',
      title: 'Detailed Analytics',
      description: 'Track your progress with comprehensive statistics and performance insights.'
    },
    {
      icon: '🏆',
      title: 'Weekly Contests',
      description: 'Compete with developers worldwide in our regular coding competitions.'
    },
    {
      icon: '💬',
      title: 'Community Discussions',
      description: 'Learn from others, share solutions, and grow together with our active community.'
    },
    {
      icon: '🎯',
      title: 'Company-specific Preparation',
      description: 'Practice problems asked by top tech companies with curated company-wise lists.'
    }
  ];

  const developer = {
    name: 'Yash Pratap Rai',
    role: 'Full Stack Developer & Creator of CodeArena',
    bio: 'Passionate developer dedicated to making DSA learning accessible and enjoyable for everyone. Building tools that help developers crack their dream jobs.',
    avatar: '👨‍💻',
    github: 'https://github.com/YashPratapRai',
    linkedin: 'https://www.linkedin.com/in/yashprataprai',
    twitter: '#',
    website: 'https://my-portfolio-kappa-one-29.vercel.app/'
  };

  const milestones = [
    { year: 'Jan-2026', event: 'CodeArena launched with 100+ problems' },
    { year: 'Feb-2026', event: 'Reached 500 active users' },
    { year: 'Feb-2026', event: 'Introduced weekly coding contests' },
    { year: 'April-2026', event: 'Partnered with 10+ tech companies' },
    { year: '2027', event: 'Planning to Launch mobile app (Coming Soon)' }
  ];

  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">
            Empowering Developers to{' '}
            <span className="about-gradient-text">Master DSA</span>
          </h1>
          <p className="about-hero-subtitle">
            CodeArena is more than just a coding platform - it's a community of passionate developers 
            helping each other grow, one problem at a time.
          </p>
          <div className="about-hero-buttons">
            <Link to="/register" className="about-btn-primary">
              Start Coding Now
            </Link>
            <Link to="/problems" className="about-btn-secondary">
              Explore Problems
            </Link>
          </div>
        </div>
        <div className="about-hero-image">
          <div className="about-floating-elements">
            <span className="about-float-1">{'{ }'}</span>
            <span className="about-float-2">{'</>'}</span>
            <span className="about-float-3">{'#include'}</span>
          </div>
        </div>
      </div>

      <div className="about-stats-section">
        <div className="about-stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="about-stat-card">
              <span className="about-stat-icon">{stat.icon}</span>
              <div className="about-stat-info">
                <span className="about-stat-value">{stat.value}</span>
                <span className="about-stat-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="about-mission-section">
        <div className="about-mission-content">
          <h2 className="about-section-title">Our Mission</h2>
          <p className="about-mission-text">
            At CodeArena, we believe that every developer deserves the opportunity to master 
            Data Structures and Algorithms. Our mission is to provide a platform that makes 
            learning DSA accessible, engaging, and effective for developers at all levels.
          </p>
          <div className="about-mission-cards">
            <div className="about-mission-card">
              <span className="about-mission-card-icon">🎯</span>
              <h3>Learn by Doing</h3>
              <p>Practice with real coding problems and get instant feedback</p>
            </div>
            <div className="about-mission-card">
              <span className="about-mission-card-icon">📈</span>
              <h3>Track Progress</h3>
              <p>Monitor your improvement with detailed analytics</p>
            </div>
            <div className="about-mission-card">
              <span className="about-mission-card-icon">🤝</span>
              <h3>Grow Together</h3>
              <p>Learn from the community and share your knowledge</p>
            </div>
          </div>
        </div>
      </div>

      <div className="about-features-section">
        <h2 className="about-section-title">Why Choose CodeArena?</h2>
        <div className="about-features-grid">
          {features.map((feature, index) => (
            <div key={index} className="about-feature-card">
              <span className="about-feature-icon">{feature.icon}</span>
              <h3 className="about-feature-title">{feature.title}</h3>
              <p className="about-feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="about-timeline-section">
        <h2 className="about-section-title">Our Journey</h2>
        <div className="about-timeline">
          {milestones.map((milestone, index) => (
            <div key={index} className={`about-timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
              <div className="about-timeline-content">
                <span className="about-timeline-year">{milestone.year}</span>
                <p className="about-timeline-event">{milestone.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="about-developer-section">
        <h2 className="about-section-title">Meet the Developer</h2>
        <p className="about-developer-subtitle">The mind behind CodeArena</p>
        <div className="about-developer-card">
          <div className="about-developer-avatar">{developer.avatar}</div>
          <h3 className="about-developer-name">{developer.name}</h3>
          <p className="about-developer-role">{developer.role}</p>
          <p className="about-developer-bio">{developer.bio}</p>
          <div className="about-developer-social">
            <a 
              href={developer.github} 
              className="about-developer-social-link" 
              target="_blank" 
              rel="noopener noreferrer"
              title="GitHub"
            >
              <span className="about-developer-social-icon">🐙</span>
              <span className="about-developer-social-text">GitHub</span>
            </a>
            <a 
              href={developer.linkedin} 
              className="about-developer-social-link" 
              target="_blank" 
              rel="noopener noreferrer"
              title="LinkedIn"
            >
              <span className="about-developer-social-icon">🔗</span>
              <span className="about-developer-social-text">LinkedIn</span>
            </a>
            
            <a 
              href={developer.website} 
              className="about-developer-social-link" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Website"
            >
              <span className="about-developer-social-icon">🌐</span>
              <span className="about-developer-social-text">Website</span>
            </a>
          </div>
        </div>
      </div>

      <div className="about-testimonials-section">
        <h2 className="about-section-title">What Our Users Say</h2>
        <div className="about-testimonials-grid">
          <div className="about-testimonial-card">
            <div className="about-testimonial-quote">"</div>
            <p className="about-testimonial-text">
              CodeArena helped me crack my dream job at Google. The problem quality and 
              detailed explanations are simply amazing!
            </p>
            <div className="about-testimonial-author">
              <span className="about-author-avatar">👨‍💻</span>
              <div className="about-author-info">
                <span className="about-author-name">Rahul Sharma</span>
                <span className="about-author-title">Software Engineer</span>
              </div>
            </div>
          </div>

          <div className="about-testimonial-card">
            <div className="about-testimonial-quote">"</div>
            <p className="about-testimonial-text">
              The best platform for DSA practice. The community discussions and contest 
              experience is top-notch!
            </p>
            <div className="about-testimonial-author">
              <span className="about-author-avatar">👩‍💻</span>
              <div className="about-author-info">
                <span className="about-author-name">Priya Patel</span>
                <span className="about-author-title">Software Developer</span>
              </div>
            </div>
          </div>

          <div className="about-testimonial-card">
            <div className="about-testimonial-quote">"</div>
            <p className="about-testimonial-text">
              From a beginner to now mentoring others, CodeArena has been my constant companion 
              in this coding journey.
            </p>
            <div className="about-testimonial-author">
              <span className="about-author-avatar">🧑‍💻</span>
              <div className="about-author-info">
                <span className="about-author-name">Arjun Kumar</span>
                <span className="about-author-title">Open Source Contributor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="about-cta-section">
        <div className="about-cta-content">
          <h2 className="about-cta-title">Ready to Start Your DSA Journey?</h2>
          <p className="about-cta-text">
            Join thousands of developers mastering Data Structures and Algorithms on CodeArena.
          </p>
          <div className="about-cta-buttons">
            <Link to="/register" className="about-btn-primary about-btn-large">
              Create Free Account
            </Link>
            <Link to="/problems" className="about-btn-secondary about-btn-large">
              Browse Problems
            </Link>
          </div>
        </div>
      </div>

      <div className="about-footer">
        <p>
          Have questions? Reach out to us at{' '}
          <a href="mailto:hello@codearena.com">hello@codearena.com</a>
        </p>
        
      </div>
    </div>
  );
};

export default AboutUs;