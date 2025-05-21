import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import API_ENDPOINTS from '../config/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      setSuccess('Password reset instructions sent to your email.');
      enqueueSnackbar('Password reset instructions sent!', { variant: 'success' });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send reset instructions');
      enqueueSnackbar(error.response?.data?.message || 'Failed to send reset instructions', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Forgot Password
          </Typography>
          {success && <Alert severity="success">{success}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 