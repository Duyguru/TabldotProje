import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from './context/AuthContext.jsx';

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  
  const bgImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.0.3";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/home', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const onSubmit = async (data) => {
    try {
      setErrorMessage('');
      const user = await login(data.email, data.password);
      navigate(user.role === 'ADMIN' ? '/admin' : '/home', { replace: true });
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Giriş başarısız.');
    }
  };

  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#222',
      zIndex: 9999,
      fontFamily: 'sans-serif'
    },
    bgImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: -1
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 0
    },
    box: {
      position: 'relative',
      zIndex: 10,
      width: '380px',
      padding: '40px',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      border: '2px solid rgba(255, 255, 255, 0.6)',
      borderRadius: '8px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    title: {
      color: 'white',
      textAlign: 'center',
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    subtitle: {
      color: '#FFA500',
      textAlign: 'center',
      fontSize: '12px',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      marginBottom: '20px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px'
    },
    label: {
      color: '#ccc',
      fontSize: '12px',
      marginLeft: '5px'
    },
    input: {
      width: '100%',
      padding: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '4px',
      color: 'white',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#FFA500',
      border: 'none',
      borderRadius: '4px',
      color: 'white',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px'
    },
    error: {
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      border: '1px solid red',
      color: '#ffcccc',
      padding: '10px',
      fontSize: '12px',
      textAlign: 'center',
      borderRadius: '4px'
    }
  };

  return (
    <div style={styles.container}>
      <img src={bgImage} alt="Background" style={styles.bgImage} />
      <div style={styles.overlay}></div>

      <div style={styles.box}>
        <div>
          <h1 style={styles.title}>Giriş Yap</h1>
          <p style={styles.subtitle}>Kurumsal Menü Sistemi</p>
        </div>

        {errorMessage && (
          <div style={styles.error}>{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-posta</label>
            <input
              type="email"
              {...register('email', { required: true })}
              style={styles.input}
              placeholder="mail@sirket.com"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Şifre</label>
            <input
              type="password"
              {...register('password', { required: true })}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={isSubmitting} style={styles.button}>
            {isSubmitting ? '...' : 'GİRİŞ YAP'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <span style={{ color: '#ccc', fontSize: '12px' }}>
            Hesabınız yok mu?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFA500',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '12px',
                padding: 0,
              }}
            >
              Kayıt Ol
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;