import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Careers = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email) {
      setSubmitted(true);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem',
      fontFamily: 'Arial, sans-serif'
    },
    card: {
      maxWidth: '500px',
      width: '100%',
      background: 'white',
      borderRadius: '10px',
      padding: '2rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    logo: {
      color: 'white',
      fontSize: '2rem',
      fontWeight: 'bold',
      textDecoration: 'none',
      display: 'block',
      marginBottom: '1rem'
    },
    title: {
      color: '#333',
      fontSize: '1.8rem',
      marginBottom: '0.5rem'
    },
    emoji: {
      fontSize: '4rem',
      textAlign: 'center',
      marginBottom: '1rem'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    input: {
      padding: '0.8rem',
      border: '1px solid #ddd',
      borderRadius: '5px',
      fontSize: '1rem',
      width: '100%',
      boxSizing: 'border-box'
    },
    button: {
      padding: '0.8rem',
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer'
    },
    message: {
      textAlign: 'center',
      color: '#666',
      lineHeight: '1.6'
    },
    footer: {
      marginTop: '2rem',
      color: 'white',
      textAlign: 'center'
    },
    link: {
      color: 'white',
      textDecoration: 'none',
      margin: '0 0.5rem'
    }
  };

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.logo}>⚡ CodeArena</Link>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Join Our Team</h1>
          <p style={{ color: '#666' }}>Help us build the future of coding</p>
        </div>

        {!submitted ? (
          <>
            <div style={styles.emoji}>😔</div>
            <h2 style={{ textAlign: 'center', color: '#333' }}>No Current Openings</h2>
            <p style={styles.message}>
              We're not hiring right now, but we'd love to know you're interested!
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
              <button type="submit" style={styles.button}>
                Notify Me When Openings Arise
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={styles.emoji}>🎉</div>
            <h2 style={{ textAlign: 'center', color: '#333' }}>Thank You, {name}!</h2>
            <p style={styles.message}>
              We'll notify you at <strong>{email}</strong> when positions become available.
            </p>
            <button 
              onClick={() => {
                setSubmitted(false);
                setName('');
                setEmail('');
              }}
              style={{ ...styles.button, background: '#666', marginTop: '1rem' }}
            >
              ← Back
            </button>
          </>
        )}
      </div>

      <div style={styles.footer}>
        <p>
          © 2026 CodeArena | 
          <Link to="/about" style={styles.link}> About</Link> | 
          <Link to="/contact" style={styles.link}> Contact</Link>
        </p>
      </div>
    </div>
  );
};

export default Careers;