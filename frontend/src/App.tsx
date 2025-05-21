import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, CircularProgress, Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import PhoneLogin from './components/PhoneLogin';
import { SnackbarProvider } from 'notistack';

const theme = createTheme();

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/phone-login" element={<PhoneLogin />} />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
 