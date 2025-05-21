import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formLoading, setFormLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await register(username, email, password, phone, dateOfBirth);
      enqueueSnackbar('Registration successful!', { variant: 'success' });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration');
      enqueueSnackbar(err.response?.data?.message || 'An error occurred during registration', { variant: 'error' });
    } finally {
      setFormLoading(false);
    }
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
            Register
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
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Phone Number"
              name="phone"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="dateOfBirth"
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={formLoading}
            >
              {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/login" variant="body2">
                {"Already have an account? Sign In"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 