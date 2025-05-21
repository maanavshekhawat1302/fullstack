import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
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
            Welcome to Dashboard
          </Typography>
          <Typography variant="body1" align="center" gutterBottom>
            Hello, {user?.username}!
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" paragraph>
            You are successfully logged in.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1"><b>Email:</b> {user?.email}</Typography>
            <Typography variant="subtitle1"><b>Username:</b> {user?.username}</Typography>
            {user?.phone && user.phone !== '' && (
              <Typography variant="subtitle1"><b>Phone:</b> {user.phone}</Typography>
            )}
            {user?.dateOfBirth && user.dateOfBirth !== '' && user.dateOfBirth !== '1970-01-01T00:00:00.000Z' && (
              <Typography variant="subtitle1"><b>Date of Birth:</b> {new Date(user.dateOfBirth).toLocaleDateString()}</Typography>
            )}
          </Box>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Logout'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 