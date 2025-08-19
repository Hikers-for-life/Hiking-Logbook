import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import mountain from '../components/assets/forest-waterfall.jpg';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [hoverStates, setHoverStates] = useState({
    backButton: false,
    submitButton: false,
    signupButton: false,
    socialButtons: [false, false],
  });
  const [focusStates, setFocusStates] = useState({
    name: false,
    email: false,
    password: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signup, signInWithGoogle } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signup(form.email, form.password, form.name);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create account. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/?auth=login');
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Google sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = (buttonType, index = null) => {
    if (index !== null) {
      setHoverStates((prev) => ({
        ...prev,
        [buttonType]: prev[buttonType].map((_, i) =>
          i === index ? true : false
        ),
      }));
    } else {
      setHoverStates((prev) => ({ ...prev, [buttonType]: true }));
    }
  };

  const handleMouseLeave = (buttonType, index = null) => {
    if (index !== null) {
      setHoverStates((prev) => ({
        ...prev,
        [buttonType]: prev[buttonType].map((_, i) =>
          i === index ? false : false
        ),
      }));
    } else {
      setHoverStates((prev) => ({ ...prev, [buttonType]: false }));
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        {/* Back Button */}
        <div style={styles.backButtonContainer}>
          <button
            style={{
              ...styles.backButton,
              ...(hoverStates.backButton && styles.backButtonHover),
            }}
            onClick={() => navigate('/')}
            onMouseEnter={() => handleMouseEnter('backButton')}
            onMouseLeave={() => handleMouseLeave('backButton')}
            type="button"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>

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
                <h2 style={styles.title}>Create Account</h2>
                <p style={styles.message}>Start your hiking journey today</p>
              </div>
            </div>

            <label style={styles.label} htmlFor="name">
              Full Name
            </label>
            <input
              style={{
                ...styles.input,
                ...(focusStates.name && styles.inputFocus),
              }}
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              onFocus={() =>
                setFocusStates((prev) => ({ ...prev, name: true }))
              }
              onBlur={() =>
                setFocusStates((prev) => ({ ...prev, name: false }))
              }
              required
            />

            <label style={styles.label} htmlFor="email">
              Email
            </label>
            <input
              style={{
                ...styles.input,
                ...(focusStates.email && styles.inputFocus),
              }}
              type="email"
              name="email"
              placeholder="your@gmail.com"
              value={form.email}
              onChange={handleChange}
              onFocus={() =>
                setFocusStates((prev) => ({ ...prev, email: true }))
              }
              onBlur={() =>
                setFocusStates((prev) => ({ ...prev, email: false }))
              }
              required
            />

            <label style={styles.label} htmlFor="password">
              Password
            </label>
            <input
              style={{
                ...styles.input,
                ...(focusStates.password && styles.inputFocus),
              }}
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              onFocus={() =>
                setFocusStates((prev) => ({ ...prev, password: true }))
              }
              onBlur={() =>
                setFocusStates((prev) => ({ ...prev, password: false }))
              }
              required
            />

            {error && <div style={styles.error}>{error}</div>}

            <button
              style={{
                ...styles.button,
                ...(hoverStates.submitButton && styles.buttonHover),
              }}
              onMouseEnter={() => handleMouseEnter('submitButton')}
              onMouseLeave={() => handleMouseLeave('submitButton')}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <h3 style={styles.message2}>
              --------------------- Or Continue With ---------------------
            </h3>
            <div style={styles.socialButtons}>
              <button
                style={{
                  ...styles.socialButton,
                  ...(hoverStates.socialButtons[0] && styles.socialButtonHover),
                }}
                onMouseEnter={() => handleMouseEnter('socialButtons', 0)}
                onMouseLeave={() => handleMouseLeave('socialButtons', 0)}
                type="button"
                onClick={async () => {
                  try {
                    setError('');
                    setLoading(true);
                    await signInWithGoogle();
                    navigate('/dashboard');
                  } catch (error) {
                    setError(
                      'Failed to sign in with Google. Please try again.'
                    );
                    console.error('Google sign-in error:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <i className="fa-brands fa-google"></i> Google
              </button>
              <button
                style={{
                  ...styles.socialButton,
                  ...(hoverStates.socialButtons[1] && styles.socialButtonHover),
                }}
                onMouseEnter={() => handleMouseEnter('socialButtons', 1)}
                onMouseLeave={() => handleMouseLeave('socialButtons', 1)}
                type="button"
                disabled
              >
                <i className="fa-brands fa-facebook"></i> Facebook
              </button>
            </div>

            <p style={styles.signP}>Already have an account?</p>
            <button
              style={{
                ...styles.signup,
                ...(hoverStates.signupButton && styles.signupHover),
              }}
              onMouseEnter={() => handleMouseEnter('signupButton')}
              onMouseLeave={() => handleMouseLeave('signupButton')}
              type="button"
              onClick={handleBackToLogin}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

//USED PLAIN CSS INSTEAD OF TAILWIND
const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: '20px',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow:
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    width: '100%',
    maxWidth: '400px',
  },
  formContainer: {
    padding: '0',
  },
  backButtonContainer: {
    padding: '20px 20px 0 20px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    color: '#6B7280',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'color 0.2s, background-color 0.2s',
  },
  backButtonHover: {
    color: '#374151',
    backgroundColor: '#F3F4F6',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  banner: {
    height: '200px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerText: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    color: 'white',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
  },
  message: {
    fontSize: '16px',
    margin: 0,
    opacity: 0.9,
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginLeft: '20px',
    marginRight: '20px',
  },
  input: {
    marginLeft: '20px',
    marginRight: '20px',
    padding: '12px 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: '#F9FAFB',
    transition: 'border-color 0.2s',
  },
  inputFocus: {
    border: '1px solid #15803d',
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(21, 128, 61, 0.15)',
  },
  button: {
    marginLeft: '20px',
    marginRight: '20px',
    padding: '14px 20px',
    background: 'linear-gradient(60deg, #b35a07, #16a34a)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonHover: {
    background: 'linear-gradient(60deg, #9a4a05, #15803d)',
  },
  message2: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 20px',
    fontWeight: '500',
  },
  socialButtons: {
    display: 'flex',
    gap: '12px',
    marginLeft: '20px',
    marginRight: '20px',
  },
  socialButton: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background-color 0.2s',
  },
  socialButtonDisabled: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'not-allowed',
    transition: 'border-color 0.2s, background-color 0.2s',
  },
  socialButtonHover: {
    borderColor: '#9CA3AF',
    backgroundColor: '#F9FAFB',
  },
  signP: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 20px',
  },
  signup: {
    marginLeft: '20px',
    marginRight: '20px',
    padding: '12px 20px',
    backgroundColor: 'transparent',
    color: '#15803d',
    border: '1px solid #15803d',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
  },
  signupHover: {
    backgroundColor: '#15803d',
    color: 'white',
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
};
