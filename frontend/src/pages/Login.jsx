import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Mountain, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // const { login, error, setError } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      // await login(email, password);
      console.log('Login attempt:', { email, password });
      navigate('/dashboard');
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md mx-auto transform transition-all duration-200">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">Sign In</h1>

        {error && (
          <Alert variant="destructive" className="mb-4 sm:mb-6">
            <AlertDescription className="text-sm sm:text-base">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base min-h-[44px]"
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base min-h-[44px]"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 sm:py-4 rounded-xl hover:bg-blue-600 transition duration-200 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="text-sm sm:text-base text-center mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
