import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import API_ENDPOINTS from '../config/api';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(API_ENDPOINTS.RESET_PASSWORD, { token, password });
      setSuccess('Password reset successful!');
      enqueueSnackbar('Password reset successful!', { variant: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
      enqueueSnackbar(err.response?.data?.message || 'An error occurred.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Reset Password
          </Typography>
          {success && <Alert severity="success">{success}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword; 