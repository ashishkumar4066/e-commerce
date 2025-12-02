import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'hsl(0, 0%, 8%)',
      paper: 'hsl(0, 0%, 9.4%)',
    },
  },
  typography: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },
});

const SignUp = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    setLoading(true);

    try {
      const success = signup(formData.username, formData.password);
      if (success) {
        navigate('/');
      } else {
        setError('Username already exists');
      }
    } catch (err: any) {
      setError('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, hsl(0, 0%, 8%) 0%, hsl(0, 0%, 12%) 100%)',
          position: 'relative',
          overflow: 'hidden',
          py: 4,
        }}
      >
        {/* Background gradient effect */}
        <Box
          sx={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, hsl(0 86% 47% / 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box
              sx={{
                backgroundColor: 'hsl(0, 0%, 9.4%)',
                borderRadius: 2,
                p: { xs: 3, sm: 5 },
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                border: '1px solid hsl(0, 0%, 15%)',
              }}
            >
              {/* Logo/Title */}
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: 'hsl(var(--netflix-red))',
                  textAlign: 'center',
                  mb: 1,
                  letterSpacing: '-0.5px',
                  textShadow: '0 0 20px hsl(var(--netflix-red-glow) / 0.3)',
                }}
              >
                STREAMSHOP
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: 'hsl(var(--foreground))',
                  textAlign: 'center',
                  mb: 4,
                }}
              >
                Create Account
              </Typography>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    backgroundColor: 'hsl(0 84.2% 60.2% / 0.1)',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(0 84.2% 60.2% / 0.3)',
                  }}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'hsl(0, 0%, 15%)',
                      '& fieldset': {
                        borderColor: 'hsl(0, 0%, 20%)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'hsl(0, 0%, 30%)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'hsl(var(--netflix-red))',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'hsl(var(--muted-foreground))',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'hsl(var(--netflix-red))',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'hsl(0, 0%, 15%)',
                      '& fieldset': {
                        borderColor: 'hsl(0, 0%, 20%)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'hsl(0, 0%, 30%)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'hsl(var(--netflix-red))',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'hsl(var(--muted-foreground))',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'hsl(var(--netflix-red))',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'hsl(0, 0%, 15%)',
                      '& fieldset': {
                        borderColor: 'hsl(0, 0%, 20%)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'hsl(0, 0%, 30%)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'hsl(var(--netflix-red))',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'hsl(var(--muted-foreground))',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'hsl(var(--netflix-red))',
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    backgroundColor: 'hsl(var(--netflix-red))',
                    color: 'hsl(var(--foreground))',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    textTransform: 'none',
                    boxShadow: '0 0 20px hsl(var(--netflix-red-glow) / 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'hsl(var(--netflix-red-hover))',
                      boxShadow: '0 0 30px hsl(var(--netflix-red-glow) / 0.6)',
                    },
                    '&:disabled': {
                      backgroundColor: 'hsl(0, 0%, 20%)',
                      color: 'hsl(0, 0%, 50%)',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'hsl(var(--muted-foreground))',
                  }}
                >
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: 'hsl(var(--netflix-red))',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default SignUp;
