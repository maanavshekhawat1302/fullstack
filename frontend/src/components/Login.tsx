import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import API_ENDPOINTS from '../config/api';
import GoogleIcon from '../assets/GoogleIcon';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [formLoading, setFormLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  // Show error from Google OAuth or other redirects
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setError(errorParam);
      enqueueSnackbar(errorParam, { variant: 'error' });
    }
  }, [location.search, enqueueSnackbar]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await login(email, password);
      enqueueSnackbar('Login successful!', { variant: 'success' });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
      enqueueSnackbar(err.response?.data?.message || 'An error occurred during login', { variant: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // Let the browser follow the link
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Login
          </Typography>
          {error && (
            <Typography color="error" align="center" gutterBottom>
              {error}
            </Typography>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={formLoading}
            >
              {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link href="/forgot-password" variant="body2">
                Forgot Password?
              </Link>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link href="/phone-login" variant="body2">
                Login with Phone
              </Link>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <a
                href={API_ENDPOINTS.GOOGLE_AUTH}
                onClick={handleGoogleLogin}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '10px 0',
                  border: '1px solid #dadce0',
                  borderRadius: 4,
                  background: '#fff',
                  color: '#3c4043',
                  fontWeight: 500,
                  fontSize: 16,
                  textDecoration: 'none',
                  boxShadow: 'none',
                  transition: 'box-shadow 0.2s',
                  margin: '16px 0',
                  pointerEvents: googleLoading ? 'none' : 'auto',
                  opacity: googleLoading ? 0.7 : 1,
                }}
              >
                {googleLoading ? (
                  <CircularProgress size={24} color="inherit" style={{ marginRight: 8 }} />
                ) : (
                  <>
                    <span style={{ display: 'flex', alignItems: 'center', marginRight: 12 }}>
                      <GoogleIcon />
                    </span>
                    <span style={{ color: '#3c4043' }}>Sign in with Google</span>
                  </>
                )}
              </a>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 