const API_BASE_URL = 'http://localhost:5000';
// const API_BASE_URL = 'https://auth-system-2f5y.onrender.com'

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  GOOGLE_AUTH: `${API_BASE_URL}/api/auth/google`,
  REQUEST_OTP: `${API_BASE_URL}/api/auth/request-otp`,
  VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/request-reset`,
  
  // User endpoints
  USER_PROFILE: `${API_BASE_URL}/api/users/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/users/profile`,
};

export default API_ENDPOINTS; 