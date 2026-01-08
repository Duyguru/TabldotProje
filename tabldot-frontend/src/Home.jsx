import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import api from './api/axios';

function Home() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [dailyMenu, setDailyMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reviewStats, setReviewStats] = useState({});
  const [allReviews, setAllReviews] = useState([]);

  const [reviewDish, setReviewDish] = useState(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1024;
  });

  useEffect(() => {
    loadTodayMenuAndReviews();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateWidth = () => {
      setWindowWidth(window.innerWidth);
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    window.addEventListener('orientationchange', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
      window.removeEventListener('orientationchange', updateWidth);
    };
  }, []);

  const openReviewModal = (dish) => {
    setReviewDish(dish);
    setRating('5');
    setComment('');
  };

  const closeReviewModal = () => {
    setReviewDish(null);
    setRating('5');
    setComment('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewDish || !dailyMenu) return;

    try {
      setSubmittingReview(true);
      await api.post('/reviews', {
        dishId: reviewDish.id,
        dailyMenuId: dailyMenu.id,
        rating: Number(rating),
        comment: comment || undefined,
      });
      alert('Geri bildiriminiz için teşekkürler!');
      closeReviewModal();
      await loadTodayMenuAndReviews();
    } catch (err) {
      alert(err?.response?.data?.message || 'Yorum kaydedilemedi.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const loadTodayMenuAndReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const menuRes = await api.get('/daily-menus/date/today');
      setDailyMenu(menuRes.data);

      if (menuRes.data && menuRes.data.id) {
        const reviewsRes = await api.get(`/reviews?dailyMenuId=${menuRes.data.id}`);

        setAllReviews(reviewsRes.data || []);

        const stats = {};
        (reviewsRes.data || []).forEach((rev) => {
          const dishId = rev.dishId;
          if (!stats[dishId]) {
            stats[dishId] = { sum: 0, count: 0 };
          }
          stats[dishId].sum += rev.rating;
          stats[dishId].count += 1;
        });

        const normalized = {};
        Object.keys(stats).forEach((id) => {
          const { sum, count } = stats[id];
          normalized[id] = {
            avg: sum / count,
            count,
          };
        });

        setReviewStats(normalized);
      } else {
        setAllReviews([]);
        setReviewStats({});
      }
    } catch (e) {
      console.error('Yorumlar yüklenirken hata:', e);
      setError('Bugüne ait bir menü bulunamadı veya yüklenirken hata oluştu.');
      setAllReviews([]);
      setReviewStats({});
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
      await api.post('/users', { name, email, password });
      alert('Kullanıcı başarıyla eklendi.');
      setShowAddUserModal(false);
    } catch (err) {
      alert(err?.response?.data?.message || 'Kullanıcı eklenemedi.');
    }
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const description = form.description.value;
    const category = form.category.value;

    try {
      await api.post('/dishes', { name, description, category });
      alert('Yemek başarıyla eklendi.');
      setShowAddDishModal(false);
      await loadTodayMenuAndReviews();
    } catch (err) {
      alert(err?.response?.data?.message || 'Yemek eklenemedi.');
    }
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  
  const currentStyles = getStyles(windowWidth);
  
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100vw',
      background: "#f9f5f0",
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Playfair Display', serif",
      overflowX: 'hidden',
      position: 'relative',
    }}>
      <div style={currentStyles.topBar}>
        <div style={currentStyles.userInfo}>
          <span style={currentStyles.userName}>Hoş geldin, {user?.name || user?.email}</span>
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                style={currentStyles.adminButton}
              >
                {isMobile ? 'Admin' : 'Admin Paneli'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                style={{ ...currentStyles.adminButton, backgroundColor: '#2980b9', marginLeft: isMobile ? 4 : 8 }}
              >
                {isMobile ? 'Kullanıcı' : 'Kullanıcı Ekle'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddDishModal(true)}
                style={{ ...currentStyles.adminButton, backgroundColor: '#27ae60', marginLeft: isMobile ? 4 : 8 }}
              >
                {isMobile ? 'Yemek' : 'Yemek Ekle'}
              </button>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          style={currentStyles.logoutButton}
        >
          {isMobile ? 'Çıkış' : 'Çıkış Yap'}
        </button>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        padding: isMobile ? '12px 8px' : isTablet ? '24px 32px' : '40px 60px',
        overflowY: 'auto',
        overflowX: 'hidden',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        position: 'relative',
      }}>
        <div style={currentStyles.menuHeader}>
          <h2 style={currentStyles.menuTitle}>Günün Menüsü</h2>
          <p style={currentStyles.menuSubtitle}>Şirkette bugün servis edilen tabldot menü</p>
        </div>
        {loading && (
          <p style={{ fontSize: '14px', color: '#7f8c8d' }}>Günlük menü yükleniyor...</p>
        )}
        {!loading && error && (
          <p style={{ fontSize: '14px', color: '#e74c3c' }}>{error}</p>
        )}
        {!loading && !error && (!dailyMenu || !dailyMenu.dishes || dailyMenu.dishes.length === 0) && (
          <p style={{ fontSize: '14px', color: '#7f8c8d' }}>
            Bugün için tanımlı bir menü bulunmuyor.
          </p>
        )}
        {!loading && !error && dailyMenu && dailyMenu.dishes && dailyMenu.dishes.length > 0 && (
          <div style={getStyles(windowWidth).gridContainer}>
            {dailyMenu.dishes.map((dish) => (
              <div key={dish.id} style={getStyles(windowWidth).dishCard}>
                <img
                  src={dish.imageUrl || `https://source.unsplash.com/600x400/?food,${encodeURIComponent(
                    dish.name,
                  )}`}
                  alt={dish.name}
                  style={getStyles(windowWidth).dishImage}
                  onError={(e) => {
                    e.target.src = `https://source.unsplash.com/600x400/?food,${encodeURIComponent(dish.name)}`;
                  }}
                />
                <div style={getStyles(windowWidth).dishContent}>
                  <h3 style={getStyles(windowWidth).dishName}>{dish.name}</h3>
                  <p style={getStyles(windowWidth).dishDescription}>
                    {dish.description || 'Şefimizin özenle hazırladığı, günlük şirket menü yemeği.'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#999' }}>{dish.category?.name}</p>
                    {reviewStats[dish.id] && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#f39c12',
                          backgroundColor: '#fcf3cf',
                          borderRadius: '999px',
                          padding: '4px 8px',
                          fontWeight: 600,
                        }}
                      >
                        ⭐ {reviewStats[dish.id].avg.toFixed(1)} ({reviewStats[dish.id].count}{' '}
                        yorum)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    style={currentStyles.detailsButton}
                    onClick={() => openReviewModal(dish)}
                  >
                    YORUM YAP / PUAN VER
                  </button>
                  
                  {/* Yorumlar Bölümü */}
                  {(() => {
                    const dishReviews = allReviews.filter(rev => rev && rev.dishId === dish.id);
                    if (!dishReviews || dishReviews.length === 0) return null;
                    
                    return (
                      <div style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid #e0e0e0',
                      }}>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          marginBottom: '12px',
                          color: '#2c3e50',
                        }}>
                          Yorumlar ({dishReviews.length})
                        </h4>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                        }}>
                          {dishReviews.map((review) => (
                            <div
                              key={review.id}
                              style={{
                                padding: '12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                border: '1px solid #e9ecef',
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '6px',
                              }}>
                                <div>
                                  <div style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#495057',
                                  }}>
                                    {review.isAnonymous ? 'Anonim' : (review.user?.name || review.user?.email?.split('@')[0] || 'Kullanıcı')}
                                  </div>
                                  <div style={{
                                    fontSize: '11px',
                                    color: '#6c757d',
                                    marginTop: '2px',
                                  }}>
                                    {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </div>
                                </div>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}>
                                  <span style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#f39c12',
                                  }}>
                                    {'⭐'.repeat(review.rating)}
                                  </span>
                                  <span style={{
                                    fontSize: '12px',
                                    color: '#6c757d',
                                  }}>
                                    {review.rating}/5
                                  </span>
                                </div>
                              </div>
                              {review.comment && (
                                <p style={{
                                  fontSize: '13px',
                                  color: '#495057',
                                  margin: 0,
                                  lineHeight: '1.5',
                                }}>
                                  {review.comment}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Yorum modalı */}
      {reviewDish && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: isMobile ? '20px' : '24px',
              width: '100%',
              maxWidth: isMobile ? '95%' : '420px',
              margin: isMobile ? '16px' : '0',
              boxSizing: 'border-box',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#2c3e50',
              }}
            >
              {reviewDish.name} için geri bildirim
            </h2>
            <p
              style={{
                fontSize: '12px',
                color: '#7f8c8d',
                marginBottom: '16px',
              }}
            >
              Şirket yemek deneyimini iyileştirmemize yardımcı olmak için kısa bir yorum
              bırakabilirsin.
            </p>
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label
                  htmlFor="rating"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}
                >
                  Puan (1-5)
                </label>
                <select
                  id="rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #e0e0e0',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="5">5 - Harika</option>
                  <option value="4">4 - İyi</option>
                  <option value="3">3 - Orta</option>
                  <option value="2">2 - Zayıf</option>
                  <option value="1">1 - Kötü</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="comment"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}
                >
                  Yorum (opsiyonel)
                </label>
                <textarea
                  id="comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Lezzet, çeşitlilik, sunum vb. hakkında düşüncelerini yazabilirsin."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #e0e0e0',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  marginTop: '4px',
                }}
              >
                <button
                  type="button"
                  onClick={closeReviewModal}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: '#ecf0f1',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    color: '#7f8c8d',
                  }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: '#e67e22',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#fff',
                    opacity: submittingReview ? 0.7 : 1,
                  }}
                >
                  {submittingReview ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin: Kullanıcı Ekle Modalı */}
      {isAdmin && showAddUserModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '16px' : '0', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: isMobile ? '20px' : 32, width: isMobile ? '100%' : 'auto', minWidth: isMobile ? 'auto' : 340, maxWidth: isMobile ? '100%' : 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', boxSizing: 'border-box' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Kullanıcı Ekle</h2>
            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="text" placeholder="Ad Soyad" required name="name" style={modalInputStyle} />
              <input type="email" placeholder="E-posta" required name="email" style={modalInputStyle} />
              <input type="password" placeholder="Şifre" required name="password" style={modalInputStyle} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowAddUserModal(false)} style={modalCancelBtnStyle}>Vazgeç</button>
                <button type="submit" style={modalSubmitBtnStyle}>Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Admin: Yemek Ekle Modalı */}
      {isAdmin && showAddDishModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '16px' : '0', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: isMobile ? '20px' : 32, width: isMobile ? '100%' : 'auto', minWidth: isMobile ? 'auto' : 340, maxWidth: isMobile ? '100%' : 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', boxSizing: 'border-box' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Yemek Ekle</h2>
            <form onSubmit={handleAddDish} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="text" placeholder="Yemek Adı" required name="name" style={modalInputStyle} />
              <input type="text" placeholder="Açıklama" name="description" style={modalInputStyle} />
              <input type="text" placeholder="Kategori" name="category" style={modalInputStyle} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowAddDishModal(false)} style={modalCancelBtnStyle}>Vazgeç</button>
                <button type="submit" style={modalSubmitBtnStyle}>Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Estetik CSS Stilleri (windowWidth state'i kullanılarak dinamik olarak hesaplanır)
const getStyles = (windowWidth) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh', // Tüm ekranı kapla
    overflow: 'hidden', // Ana sayfada kaydırma çubuğunu gizle
    fontFamily: "'Playfair Display', serif",
    backgroundColor: '#f9f5f0',
  },

  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: windowWidth < 768 ? '10px 12px' : '12px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    fontFamily: "'Poppins', sans-serif",
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: windowWidth < 768 ? '6px' : '8px',
    width: '100%',
    boxSizing: 'border-box',
  },

  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    flex: 1,
    minWidth: 0,
  },

  userName: {
    fontSize: windowWidth < 768 ? '12px' : '14px',
    color: '#2c3e50',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: windowWidth < 768 ? '120px' : 'none',
  },

  adminButton: {
    padding: windowWidth < 768 ? '5px 8px' : '6px 12px',
    backgroundColor: '#e67e22',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: windowWidth < 768 ? '9px' : '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  logoutButton: {
    padding: '6px 16px',
    backgroundColor: '#ecf0f1',
    color: '#7f8c8d',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },

  contentWrapper: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  
  // SAĞ TARAF: Menü Alanı
  menuSection: {
    flex: 1.2,
    padding: '40px 60px',
    overflowY: 'auto', // Sadece bu alanın kaymasına izin ver
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
  },

  menuHeader: {
    marginBottom: '30px',
    borderBottom: '1px solid #eee',
    paddingBottom: '20px',
    textAlign: 'center',
  },

  menuTitle: {
    fontSize: windowWidth < 768 ? '24px' : '32px',
    color: '#1a1a1a',
    marginBottom: '5px',
  },

  menuSubtitle: {
    fontSize: '14px',
    color: '#7f8c8d',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontFamily: "'Poppins', sans-serif",
  },

  gridContainer: {
    display: 'grid',
    gridTemplateColumns: windowWidth < 768 
      ? '1fr' 
      : windowWidth < 1024 
        ? 'repeat(2, 1fr)' 
        : 'repeat(3, 1fr)',
    gap: windowWidth < 768 ? '12px' : windowWidth < 1024 ? '20px' : '24px',
    paddingBottom: '20px',
    alignItems: 'start',
    width: '100%',
    boxSizing: 'border-box',
  },

  dishCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    // İçeriğe göre otomatik boyutlanır, sabit yükseklik yok
  },

  dishImage: {
    width: '100%',
    height: windowWidth < 768 ? '200px' : '350px',
    objectFit: 'cover',
  },

  dishContent: {
    padding: windowWidth < 768 ? '16px' : '20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    boxSizing: 'border-box',
  },

  dishName: {
    fontSize: windowWidth < 768 ? '16px' : '18px',
    color: '#1a1a1a',
    fontWeight: '600',
    marginBottom: '10px',
    fontFamily: "'Poppins', sans-serif",
    wordBreak: 'break-word',
  },

  dishDescription: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '8px', // Açıklama ve buton arasındaki uzaklık azaltıldı
    fontFamily: "'Poppins', sans-serif",
    flex: 1, // Açıklama kısmının alanı doldurmasını sağla
  },

  detailsButton: {
    padding: windowWidth < 768 ? '8px 16px' : '10px 20px',
    backgroundColor: '#1a1a1a',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: windowWidth < 768 ? '11px' : '12px',
    fontWeight: '600',
    cursor: 'pointer',
    letterSpacing: '1px',
    alignSelf: 'center',
    textTransform: 'uppercase',
    transition: 'background-color 0.3s',
    width: windowWidth < 768 ? '100%' : 'auto',
    boxSizing: 'border-box',
  },
});

// Modal input ve buton stilleri
const modalInputStyle = {
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  fontSize: '14px',
  marginBottom: '4px',
};
const modalCancelBtnStyle = {
  padding: '8px 16px',
  borderRadius: '999px',
  border: 'none',
  backgroundColor: '#ecf0f1',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
  color: '#7f8c8d',
};
const modalSubmitBtnStyle = {
  padding: '8px 16px',
  borderRadius: '999px',
  border: 'none',
  backgroundColor: '#27ae60',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  color: '#fff',
};

export default Home;