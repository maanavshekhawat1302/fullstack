import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import API_ENDPOINTS from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const PhoneLogin: React.FC = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { loginWithOtp } = useAuth();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post(API_ENDPOINTS.REQUEST_OTP, { phone });
      setSuccess('OTP sent to your phone number.');
      setStep(2);
      enqueueSnackbar('OTP sent successfully!', { variant: 'success' });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send OTP');
      enqueueSnackbar(error.response?.data?.message || 'Failed to send OTP', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await loginWithOtp(phone, otp);
      enqueueSnackbar('Login successful!', { variant: 'success' });
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid OTP');
      enqueueSnackbar(error.response?.data?.message || 'Invalid OTP', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Phone Login
          </Typography>
          {success && <Alert severity="success">{success}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          {step === 1 && (
            <Box component="form" onSubmit={handleRequestOTP} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="phone"
                label="Phone Number"
                name="phone"
                autoComplete="tel"
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Request OTP'}
              </Button>
            </Box>
          )}
          {step === 2 && (
            <Box component="form" onSubmit={handleVerifyOTP} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="otp"
                label="Enter OTP"
                name="otp"
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default PhoneLogin; 