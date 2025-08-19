import React, { useState, useEffect } from 'react';
import mountain from '../assets/forest-waterfall.jpg';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Login({ open, onOpenChange, onLogin, onSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Close modal when `open` changes to false
  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      onOpenChange(false); // Close modal
      navigate('/dashboard'); // Redirect to dashboard
    } catch (error) {
      setError('Failed to log in. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      onOpenChange(false); // Close modal
      navigate('/dashboard'); // Redirect to dashboard
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Google sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null; // Only render when open

  return (
    <div style={styles.overlay}>
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

            {error && <div style={styles.error}>{error}</div>}

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In to Dashboard'}
            </button>

            <h3 style={styles.message2}>
              --------------------- Or Continue With ---------------------
            </h3>
            <div style={styles.socialButtons}>
              <button
                style={styles.socialButton}
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <i className="fa-brands fa-google"></i> Google
              </button>
              <button style={styles.socialButton} type="button" disabled>
                <i className="fa-brands fa-facebook"></i> Facebook
              </button>
            </div>

            <p style={styles.signP}>Don't have an account?</p>
            <button
              style={styles.signup}
              type="button"
              onClick={() => {
                if (typeof onOpenChange === 'function') onOpenChange(false);
                if (typeof onSignup === 'function') onSignup();
              }}
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

//USED PLAIN CSS INSTEAD OF TAILWINDCSS
const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  container: {
    display: 'flex',
    inset: '0px',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    position: 'fixed',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: 'rgba(17, 16, 16, 0.4)',
  },
  //THE WELCOME BACK
  title: {
    margin: '0',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    left: '24px',
  },
  //cCONTINUE YOUR JOURNEY
  message: {
    fontSize: '14px',
    marginTop: '4px',
    color: 'rgba(255,255,255,0.9)',
  },
  //THE IMAGE
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
    bottom: '3.9%',
    left: '-4.8%',
  },
  //THE WHITE BOX
  form: {
    display: 'flex',
    flexDirection: 'column',
    backgroundPosition: 'center',
    width: '450px',
    height: '560px',
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
  //SIGNIN DASHBOARD
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
  //THE EMAIL, PASSWORD ON TOP OF THE INPUTS
  label: {
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    textAlign: 'left',
  },
  //OR CONTINUE WITH
  message2: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  //BOTH GOOGLE AND FACEBOOK
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
  //SIGNUP BUTTON
  signup: {
    background: 'none',
    border: 'none',
    color: '#15803d',
    cursor: 'pointer',
    fontWeight: '600',
    padding: '3px',
  },
  //DON'T HAVE AN ACCOUNT?
  signP: {
    color: '#666',
    fontWeight: '600',
    fontSize: '14px',
  },
  error: {
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '14px',
    textAlign: 'center',
    margin: '0 20px',
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
