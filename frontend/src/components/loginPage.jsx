import React, { useState } from 'react';
import mountain from './forest-waterfall.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Logging in with:', { email, password });
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <form style={styles.form} onSubmit={handleSubmit}>
          <div
            style={{
              ...styles.banner,
              backgroundImage: `url(${mountain})`,
            }}
          >
            <div style={styles.gradientOverlay} />
            <div style={styles.headerText}>
              <h2 style={styles.title}>Welcome Back</h2>
              <p style={styles.message}>Continue your hiking journey</p>
            </div>
          </div>
          <label style={styles.label} htmlFor="email">
            Email
          </label>
          <input
            style={styles.input}
            type="email"
            placeholder="your@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label style={styles.label} htmlFor="password">
            Password
          </label>
          <input
            style={styles.input}
            type="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit">
            Sign In to Dashboard
          </button>
          <h3 style={styles.message2}>
            --------------------- Or Continue With ---------------------
          </h3>
          <div style={styles.socialButtons}>
            <button style={styles.socialButton} type="button">
              <i class="fa-brands fa-google"></i> Google
            </button>
            <button style={styles.socialButton} type="button">
              {' '}
              <i class="fa-brands fa-facebook"></i> Facebook
            </button>
          </div>
          <p style={styles.signP}>Don't have an account?</p>
          <button style={styles.signup}>Sign Up</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    inset: 0,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100vh',
    position:'fixed',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: 'rgba(17, 16, 16, 0.4)',
  },
  title: {
    margin: '0',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    left: '24px',
  },
  message: {
    fontSize: '14px',
    marginTop: '4px',
    color: 'rgba(255,255,255,0.9)',
  },
  banner: {
    height: '500px',
    width: '494px',
    position: 'relative',
    padding: '0px',
    boxShadow: '0 2px 8px black',
    backgroundSize: 'cover',
    borderRadius: '8px',
    border: 'white',
    backgroundPosition: 'center',
    right: '3%',
    bottom: '3.6%',
    left: '-4.8%',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    backgroundPosition: 'center',
    width: '450px',
    height: '600px',
    padding: '24px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px black',
  },
  input: {
    marginBottom: '15px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '8px',
    maxWidth: '100%',
    border: '2px solid #ccc',
    boxSizing: 'border-box',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    width: '100%',
    background: 'linear-gradient(60deg, #b35a07ff, #16a34a)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  label: {
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    textAlign: 'left',
  },

  message2: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  socialButtons: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  socialButton: {
    flex: 1,
    padding: 10,
    border: '1px solid #ccc',
    background: 'white',
    cursor: 'pointer',
    borderRadius: 8,
    fontWeight: 'bold',
  },
  signup: {
    background: 'none',
    border: 'none',
    color: '#15803d',
    cursor: 'pointer',
    fontWeight: '600',
    padding: 0,
  },
  signP: {
    color: '#666',
    fontWeight: '600',
    fontSize: '14px',
  },

  gradientOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
  },
  headerText: {
    position: 'absolute',
    bottom: 16,
    left: 24,
  },
};
