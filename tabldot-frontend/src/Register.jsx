import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from './api/axios';

function Register() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  
  const bgImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.0.3";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      adminKey: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setErrorMessage('');
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        adminKey: data.adminKey || undefined, // Boşsa gönderme
      });
      
      const roleMessage = response.data.role === 'ADMIN' 
        ? 'Admin olarak kayıt başarılı! Şimdi giriş yapabilirsiniz.' 
        : 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.';
      alert(roleMessage);
      navigate('/login', { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.';
      setErrorMessage(message);
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
    },
    fieldError: {
      color: '#ff9999',
      fontSize: '11px',
      marginTop: '3px',
      marginLeft: '5px'
    }
  };

  return (
    <div style={styles.container}>
      <img src={bgImage} alt="Background" style={styles.bgImage} />
      <div style={styles.overlay}></div>

      <div style={styles.box}>
        <div>
          <h1 style={styles.title}>Hesap Oluştur</h1>
          <p style={styles.subtitle}>Kurumsal Menü Sistemi</p>
        </div>

        {errorMessage && (
          <div style={styles.error}>{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Ad Soyad</label>
            <input
              type="text"
              {...register('name', {
                required: 'Ad soyad zorunludur.',
                minLength: {
                  value: 2,
                  message: 'En az 2 karakter olmalıdır.',
                },
              })}
              style={styles.input}
              placeholder="Örn: Ayşe Yılmaz"
            />
            {errors.name && (
              <div style={styles.fieldError}>{errors.name.message}</div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>E-posta</label>
            <input
              type="email"
              {...register('email', {
                required: 'E-posta zorunludur.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Geçerli bir e-posta adresi girin.',
                },
              })}
              style={styles.input}
              placeholder="mail@sirket.com"
            />
            {errors.email && (
              <div style={styles.fieldError}>{errors.email.message}</div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Şifre</label>
            <input
              type="password"
              {...register('password', {
                required: 'Şifre zorunludur.',
                minLength: {
                  value: 6,
                  message: 'Şifre en az 6 karakter olmalıdır.',
                },
              })}
              style={styles.input}
              placeholder="••••••••"
            />
            {errors.password && (
              <div style={styles.fieldError}>{errors.password.message}</div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Admin Key <span style={{ color: '#888', fontSize: '10px' }}>(Opsiyonel)</span>
            </label>
            <input
              type="password"
              {...register('adminKey')}
              style={styles.input}
              placeholder="Admin olmak için özel anahtar"
            />
            <div style={{ color: '#888', fontSize: '10px', marginTop: '3px', marginLeft: '5px' }}>
              Admin olarak kayıt olmak için özel anahtarı girin
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} style={styles.button}>
            {isSubmitting ? 'Kayıt yapılıyor...' : 'KAYIT OL'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <span style={{ color: '#ccc', fontSize: '12px' }}>
            Zaten hesabınız var mı?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
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
              Giriş Yap
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;


