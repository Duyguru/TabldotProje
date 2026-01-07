import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios';

function AdminPanel() {
  const navigate = useNavigate();
  const { logout, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('categories');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/home', { replace: true });
    }
  }, [isAdmin, authLoading, navigate]);

  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [catLoading, setCatLoading] = useState(false);

  const [dishes, setDishes] = useState([]);
  const [categoriesForDishes, setCategoriesForDishes] = useState([]);
  const [dishForm, setDishForm] = useState({ name: '', description: '', imageUrl: '', categoryId: '' });
  const [dishLoading, setDishLoading] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishEditForm, setDishEditForm] = useState({ name: '', description: '', imageUrl: '', categoryId: '' });
  const [dishEditLoading, setDishEditLoading] = useState(false);

  const [date, setDate] = useState('');
  const [selectedDishIds, setSelectedDishIds] = useState([]);
  const [savedMenus, setSavedMenus] = useState([]);
  const [menuSaving, setMenuSaving] = useState(false);
  const [menuMessage, setMenuMessage] = useState('');
  const [deletingMenuId, setDeletingMenuId] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userEditForm, setUserEditForm] = useState({ name: '', email: '', role: 'USER' });
  const [userEditLoading, setUserEditLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  useEffect(() => {
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'dishes') loadDishes();
    if (activeTab === 'menus') {
      loadDishes();
      loadMenus();
    }
    if (activeTab === 'reviews') loadReviews();
    if (activeTab === 'users') loadUsers();
  }, [activeTab]);
  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCatLoading(true);
    try {
      if (editingCatId) {
        await api.patch(`/categories/${editingCatId}`, { name: catName, description: catDescription });
      } else {
        await api.post('/categories', { name: catName, description: catDescription });
      }
      setCatName('');
      setCatDescription('');
      setEditingCatId(null);
      await loadCategories();
    } catch {
      alert('İşlem başarısız.');
    } finally {
      setCatLoading(false);
    }
  };

  const handleCategoryEdit = (cat) => {
    setCatName(cat.name);
    setCatDescription(cat.description || '');
    setEditingCatId(cat.id);
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/categories/${id}`);
      await loadCategories();
    } catch {
      alert('Silme başarısız.');
    }
  };

  // Dishes functions
  const loadDishes = async () => {
    try {
      const [d, c] = await Promise.all([api.get('/dishes'), api.get('/categories')]);
      setDishes(d.data);
      setCategoriesForDishes(c.data);
    } catch (err) {
      console.error(err);
    }
  };


  const handleDishSubmit = async (e) => {
    e.preventDefault();
    setDishLoading(true);
    try {
      let imageUrl = undefined;
      if (dishForm.imageUrl && dishForm.imageUrl.trim() !== '') {
        const trimmedUrl = dishForm.imageUrl.trim();
        if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
          imageUrl = trimmedUrl;
        } else {
          alert('Geçerli bir URL adresi girin (http:// veya https:// ile başlamalı)');
          setDishLoading(false);
          return;
        }
      }
      
      const createData = {
        name: dishForm.name,
        description: dishForm.description?.trim() || undefined,
        imageUrl: imageUrl, // undefined veya geçerli URL
        categoryId: Number(dishForm.categoryId),
      };
      
      await api.post('/dishes', createData);
      setDishForm({ name: '', description: '', imageUrl: '', categoryId: '' });
      await loadDishes();
      alert('Yemek başarıyla eklendi!');
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Hata oluştu');
    } finally {
      setDishLoading(false);
    }
  };

  const handleDishEdit = (dish) => {
    setEditingDish(dish);
    setDishEditForm({
      name: dish.name,
      description: dish.description || '',
      imageUrl: dish.imageUrl || '',
      categoryId: dish.categoryId.toString(),
    });
  };

  const handleDishEditCancel = () => {
    setEditingDish(null);
    setDishEditForm({ name: '', description: '', imageUrl: '', categoryId: '' });
  };

  const handleDishEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingDish) return;
    
    setDishEditLoading(true);
    try {
      let imageUrl = undefined;
      if (dishEditForm.imageUrl && dishEditForm.imageUrl.trim() !== '') {
        const trimmedUrl = dishEditForm.imageUrl.trim();
        if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
          imageUrl = trimmedUrl;
        } else {
          alert('Geçerli bir URL adresi girin (http:// veya https:// ile başlamalı)');
          setDishEditLoading(false);
          return;
        }
      }
      
      const updateData = {
        name: dishEditForm.name,
        description: dishEditForm.description?.trim() || undefined,
        imageUrl: imageUrl, // undefined veya geçerli URL
        categoryId: Number(dishEditForm.categoryId),
      };
      
      await api.patch(`/dishes/${editingDish.id}`, updateData);
      handleDishEditCancel();
      await loadDishes();
      alert('Yemek başarıyla güncellendi!');
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Güncelleme başarısız.');
    } finally {
      setDishEditLoading(false);
    }
  };

  const handleDishDelete = async (id) => {
    if (!window.confirm('Bu yemeği silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/dishes/${id}`);
      await loadDishes();
      alert('Yemek silindi.');
    } catch (err) {
      alert(err?.response?.data?.message || 'Silme başarısız.');
    }
  };

  const getCategoryName = (id) => {
    return categoriesForDishes.find(c => c.id === id)?.name || '-';
  };

  // Menus functions
  const loadMenus = async () => {
    try {
      const res = await api.get('/daily-menus');
      setSavedMenus(res.data);
    } catch (err) {
      console.error('Menüler yüklenemedi:', err);
    }
  };

  // Reviews functions
  const loadReviews = async () => {
    try {
      const res = await api.get('/reviews');
      console.log('Yorumlar yüklendi:', res.data);
      setAllReviews(res.data || []);
      filterReviewsByDate(res.data || [], selectedDate);
    } catch (err) {
      console.error('Yorumlar yüklenemedi:', err);
      alert('Yorumlar yüklenirken bir hata oluştu: ' + (err?.response?.data?.message || err.message));
      setAllReviews([]);
      setReviews([]);
    }
  };

  const filterReviewsByDate = (reviewsList, dateFilter) => {
    if (!dateFilter || dateFilter === '') {
      setReviews(reviewsList);
      return;
    }

    const filterDate = new Date(dateFilter);
    filterDate.setHours(0, 0, 0, 0);

    const filtered = reviewsList.filter((review) => {
      if (!review.dailyMenu?.date) return false;
      const reviewDate = new Date(review.dailyMenu.date);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate.getTime() === filterDate.getTime();
    });

    setReviews(filtered);
  };

  const handleDateFilterChange = (date) => {
    setSelectedDate(date);
    filterReviewsByDate(allReviews, date);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    
    setDeletingReviewId(reviewId);
    try {
      await api.delete(`/reviews/${reviewId}`);
      await loadReviews();
      alert('Yorum başarıyla silindi.');
    } catch (err) {
      alert(err?.response?.data?.message || 'Yorum silinemedi.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  // Users functions
  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Kullanıcılar yüklenemedi:', err);
      alert('Kullanıcılar yüklenirken bir hata oluştu: ' + (err?.response?.data?.message || err.message));
      setUsers([]);
    }
  };

  const handleUserEdit = (user) => {
    setEditingUserId(user.id);
    setUserEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'USER',
    });
  };

  const handleUserEditCancel = () => {
    setEditingUserId(null);
    setUserEditForm({ name: '', email: '', role: 'USER' });
  };

  const handleUserEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUserId) return;

    setUserEditLoading(true);
    try {
      await api.patch(`/users/${editingUserId}`, {
        name: userEditForm.name || undefined,
        email: userEditForm.email || undefined,
        role: userEditForm.role,
      });
      await loadUsers();
      handleUserEditCancel();
      alert('Kullanıcı başarıyla güncellendi!');
    } catch (err) {
      alert(err?.response?.data?.message || 'Kullanıcı güncellenemedi.');
    } finally {
      setUserEditLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
    
    setDeletingUserId(userId);
    try {
      await api.delete(`/users/${userId}`);
      await loadUsers();
      alert('Kullanıcı başarıyla silindi.');
    } catch (err) {
      alert(err?.response?.data?.message || 'Kullanıcı silinemedi.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const toggleDish = (dishId) => {
    setSelectedDishIds(prev =>
      prev.includes(dishId)
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId]
    );
  };

  const handleSaveMenu = async () => {
    if (!date) {
      setMenuMessage('Lütfen bir tarih seçin.');
      return;
    }
    if (selectedDishIds.length === 0) {
      setMenuMessage('Lütfen en az bir yemek seçin.');
      return;
    }

    setMenuSaving(true);
    setMenuMessage('');
    try {
      const dateObj = new Date(date);
      const isoDate = dateObj.toISOString();

      await api.post('/daily-menus', {
        date: isoDate,
        dishIds: selectedDishIds,
      });
      setMenuMessage('Menü başarıyla kaydedildi!');
      setDate('');
      setSelectedDishIds([]);
      await loadMenus();
    } catch (err) {
      setMenuMessage(err?.response?.data?.message || 'Menü kaydedilemedi.');
    } finally {
      setMenuSaving(false);
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Bu menüyü silmek istediğinize emin misiniz?')) return;
    setDeletingMenuId(id);
    try {
      await api.delete(`/daily-menus/${id}`);
      setMenuMessage('Menü silindi.');
      await loadMenus();
    } catch (err) {
      setMenuMessage(err?.response?.data?.message || 'Menü silinemedi.');
    } finally {
      setDeletingMenuId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    header: {
      backgroundColor: 'white',
      borderBottom: '1px solid #e2e8f0',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1e293b',
    },
    logoutBtn: {
      padding: '8px 16px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    tabs: {
      backgroundColor: 'white',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      padding: '0 24px',
      gap: '8px',
    },
    tab: {
      padding: '12px 20px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: '#64748b',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s',
    },
    tabActive: {
      color: '#3b82f6',
      borderBottomColor: '#3b82f6',
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      padding: '20px',
      marginBottom: '20px',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #cbd5e1',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box',
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '12px',
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: '600',
      color: '#64748b',
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
    },
    td: {
      padding: '12px',
      fontSize: '14px',
      color: '#1e293b',
      borderBottom: '1px solid #f1f5f9',
    },
  };

  // Loading durumunda veya admin değilse hiçbir şey gösterme
  if (authLoading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '14px', color: '#64748b' }}>Yükleniyor...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // AdminRoute zaten yönlendirecek
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>Tabldot Admin Panel</div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Çıkış Yap
        </button>
      </header>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'categories' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('categories')}
        >
          Kategoriler
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'dishes' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('dishes')}
        >
          Yemekler
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'menus' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('menus')}
        >
          Günlük Menüler
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'reviews' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('reviews')}
        >
          Yorumlar ve Puanlar
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'users' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('users')}
        >
          Kullanıcılar
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'categories' && (
          <div>
            <div style={styles.card}>
              <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                {editingCatId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
              </h2>
              <form onSubmit={handleCategorySubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Kategori Adı
                  </label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    style={styles.input}
                    placeholder="Örn: Tatlılar"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Açıklama
                  </label>
                  <textarea
                    value={catDescription}
                    onChange={(e) => setCatDescription(e.target.value)}
                    rows={3}
                    style={{ ...styles.input, resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" disabled={catLoading} style={styles.button}>
                    {editingCatId ? 'Güncelle' : 'Kaydet'}
                  </button>
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(null);
                        setCatName('');
                        setCatDescription('');
                      }}
                      style={{ ...styles.button, backgroundColor: '#64748b' }}
                    >
                      İptal
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={styles.card}>
              <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                Kategoriler ({categories.length})
              </h2>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Kategori</th>
                    <th style={styles.th}>Açıklama</th>
                    <th style={styles.th}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td style={styles.td}>{cat.id}</td>
                      <td style={styles.td}>{cat.name}</td>
                      <td style={styles.td}>{cat.description || '-'}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleCategoryEdit(cat)}
                            style={{ ...styles.button, padding: '6px 12px', fontSize: '12px', backgroundColor: '#3b82f6' }}
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleCategoryDelete(cat.id)}
                            style={{ ...styles.button, padding: '6px 12px', fontSize: '12px', backgroundColor: '#ef4444' }}
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>
                        Kategori bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'dishes' && (
          <div>
            <div style={styles.card}>
              <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                Yeni Yemek Ekle
              </h2>
              <form onSubmit={handleDishSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                        Yemek Adı *
                      </label>
                      <input
                        type="text"
                        required
                        value={dishForm.name}
                        onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                        style={styles.input}
                        placeholder="Yemek adı"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                        Kategori *
                      </label>
                      <select
                        required
                        value={dishForm.categoryId}
                        onChange={(e) => setDishForm({ ...dishForm, categoryId: e.target.value })}
                        style={styles.input}
                      >
                        <option value="">Seçiniz</option>
                        {categoriesForDishes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Fotoğraf URL (Opsiyonel)
                    </label>
                    <input
                      type="url"
                      value={dishForm.imageUrl}
                      onChange={(e) => setDishForm({ ...dishForm, imageUrl: e.target.value })}
                      style={styles.input}
                      placeholder="https://example.com/image.jpg"
                    />
                    {dishForm.imageUrl && (
                      <div style={{ marginTop: '8px' }}>
                        <img
                          src={dishForm.imageUrl}
                          alt="Önizleme"
                          style={{
                            width: '150px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Açıklama (Opsiyonel)
                    </label>
                    <textarea
                      value={dishForm.description}
                      onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                      rows={3}
                      style={{ ...styles.input, resize: 'vertical' }}
                      placeholder="Yemek açıklaması"
                    />
                  </div>
                  <div>
                    <button type="submit" disabled={dishLoading} style={styles.button}>
                      {dishLoading ? 'Ekleniyor...' : 'Yemek Ekle'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div style={styles.card}>
              <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                Yemekler ({dishes.length})
              </h2>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Fotoğraf</th>
                    <th style={styles.th}>Yemek Adı</th>
                    <th style={styles.th}>Kategori</th>
                    <th style={styles.th}>Açıklama</th>
                    <th style={styles.th}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {dishes.map((dish) => (
                    <tr key={dish.id}>
                      <td style={styles.td}>{dish.id}</td>
                      <td style={styles.td}>
                        {dish.imageUrl ? (
                          <img 
                            src={dish.imageUrl} 
                            alt={dish.name}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                            onError={(e) => {
                              e.target.src = `https://source.unsplash.com/600x400/?food,${encodeURIComponent(dish.name)}`;
                            }}
                          />
                        ) : (
                          <div style={{ width: '60px', height: '60px', backgroundColor: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8' }}>
                            Fotoğraf Yok
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>{dish.name}</td>
                      <td style={styles.td}>
                        <span style={{ padding: '4px 8px', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '12px' }}>
                          {getCategoryName(dish.categoryId)}
                        </span>
                      </td>
                      <td style={styles.td}>{dish.description || '-'}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleDishEdit(dish)}
                            style={{ ...styles.button, padding: '6px 12px', fontSize: '12px', backgroundColor: '#3b82f6' }}
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDishDelete(dish.id)}
                            style={{ ...styles.button, padding: '6px 12px', fontSize: '12px', backgroundColor: '#ef4444' }}
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {dishes.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>
                        Yemek bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'menus' && (
          <div>
            <div style={styles.card}>
              <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                Yeni Menü Oluştur
              </h2>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                  Tarih
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ ...styles.input, width: '200px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                  Yemek Seçimi ({selectedDishIds.length} seçildi)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', maxHeight: '300px', overflowY: 'auto', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  {dishes.map((dish) => (
                    <label
                      key={dish.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDishIds.includes(dish.id)}
                        onChange={() => toggleDish(dish.id)}
                      />
                      <span style={{ fontSize: '14px' }}>{dish.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              {menuMessage && (
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: menuMessage.includes('başarı') ? '#d1fae5' : '#fee2e2', color: menuMessage.includes('başarı') ? '#065f46' : '#991b1b', borderRadius: '6px', fontSize: '14px' }}>
                  {menuMessage}
                </div>
              )}
              <button
                onClick={handleSaveMenu}
                disabled={menuSaving || !date || selectedDishIds.length === 0}
                style={{ ...styles.button, opacity: (menuSaving || !date || selectedDishIds.length === 0) ? 0.5 : 1 }}
              >
                {menuSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>

            <div style={styles.card}>
              <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                Kayıtlı Menüler ({savedMenus.length})
              </h2>
              {savedMenus.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Kayıtlı menü yok.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {savedMenus.map((menu) => (
                    <div
                      key={menu.id}
                      style={{
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                          {new Date(menu.date).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b' }}>
                          {menu.dishes && menu.dishes.map((dish, i) => (
                            <li key={dish.id || i} style={{ marginBottom: '4px' }}>
                              {dish.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => handleDeleteMenu(menu.id)}
                        disabled={deletingMenuId === menu.id}
                        style={{ ...styles.button, backgroundColor: '#ef4444', padding: '6px 12px', fontSize: '12px' }}
                      >
                        {deletingMenuId === menu.id ? 'Siliniyor...' : 'Sil'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  Yorumlar ve Puanlar ({reviews.length} / {allReviews.length})
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>
                    Tarih Filtresi:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateFilterChange(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  />
                  {selectedDate && (
                    <button
                      onClick={() => handleDateFilterChange('')}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#64748b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >
                      Filtreyi Temizle
                    </button>
                  )}
                </div>
              </div>
              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Henüz yorum yapılmamış.
                </div>
              ) : (
                (() => {
                  const reviewsByDate = {};
                  reviews.forEach((review) => {
                    const dateKey = review.dailyMenu?.date 
                      ? new Date(review.dailyMenu.date).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Tarih Bilinmiyor';
                    
                    if (!reviewsByDate[dateKey]) {
                      reviewsByDate[dateKey] = [];
                    }
                    reviewsByDate[dateKey].push(review);
                  });

                  const sortedDates = Object.keys(reviewsByDate).sort((a, b) => {
                    const dateA = reviewsByDate[a][0]?.dailyMenu?.date;
                    const dateB = reviewsByDate[b][0]?.dailyMenu?.date;
                    if (!dateA || !dateB) return 0;
                    return new Date(dateB) - new Date(dateA);
                  });

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {sortedDates.map((dateKey) => {
                        const dateReviews = reviewsByDate[dateKey];
                        
                        const reviewsByDish = {};
                        dateReviews.forEach((review) => {
                          const dishName = review.dish?.name || 'Bilinmeyen Yemek';
                          if (!reviewsByDish[dishName]) {
                            reviewsByDish[dishName] = [];
                          }
                          reviewsByDish[dishName].push(review);
                        });

                        return (
                          <div
                            key={dateKey}
                            style={{
                              border: '2px solid #e2e8f0',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              backgroundColor: '#f8fafc',
                              }}
                            >
                              <div
                              style={{
                                padding: '16px 20px',
                                backgroundColor: '#1e293b',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '16px',
                              }}
                            >
                              📅 {dateKey} ({dateReviews.length} yorum)
                            </div>

                            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              {Object.keys(reviewsByDish).map((dishName) => {
                                const dishReviews = reviewsByDish[dishName];
                                return (
                                  <div
                                    key={dishName}
                                    style={{
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '8px',
                                      overflow: 'hidden',
                                      backgroundColor: 'white',
                                      }}
                                    >
                                      <div
                                      style={{
                                        padding: '12px 16px',
                                        backgroundColor: '#f1f5f9',
                                        borderBottom: '1px solid #e2e8f0',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        fontSize: '14px',
                                      }}
                                    >
                                      🍽️ {dishName} ({dishReviews.length} yorum)
                                    </div>

                                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                      {dishReviews.map((review) => (
                                        <div
                                          key={review.id}
                                          style={{
                                            padding: '12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            backgroundColor: '#fafafa',
                                          }}
                                        >
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div style={{ flex: 1 }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                                <div style={{ 
                                                  display: 'flex', 
                                                  alignItems: 'center', 
                                                  gap: '4px',
                                                  fontSize: '14px',
                                                  color: '#f39c12',
                                                  fontWeight: '600',
                                                }}>
                                                  {'⭐'.repeat(review.rating)}
                                                  <span style={{ color: '#64748b', marginLeft: '4px', fontSize: '13px' }}>
                                                    {review.rating}/5
                                                  </span>
                                                </div>
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                                  {review.isAnonymous ? '👤 Anonim' : `👤 ${review.user?.name || review.user?.email?.split('@')[0] || 'Kullanıcı'}`}
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                  {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                  })}
                                                </span>
                                              </div>
                                              {review.comment && (
                                                <div style={{ 
                                                  padding: '10px', 
                                                  backgroundColor: 'white', 
                                                  borderRadius: '6px',
                                                  fontSize: '13px',
                                                  color: '#475569',
                                                  lineHeight: '1.6',
                                                  border: '1px solid #e2e8f0',
                                                }}>
                                                  {review.comment}
                                                </div>
                                              )}
                                            </div>
                                            <button
                                              onClick={() => handleDeleteReview(review.id)}
                                              disabled={deletingReviewId === review.id}
                                              style={{ 
                                                ...styles.button, 
                                                backgroundColor: '#ef4444', 
                                                padding: '6px 12px', 
                                                fontSize: '11px',
                                                marginLeft: '12px',
                                                whiteSpace: 'nowrap',
                                              }}
                                            >
                                              {deletingReviewId === review.id ? 'Siliniyor...' : 'Sil'}
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div style={styles.card}>
              <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                Kullanıcılar ({users.length})
              </h2>
              {users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Kullanıcı bulunamadı.
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Ad</th>
                      <th style={styles.th}>E-posta</th>
                      <th style={styles.th}>Rol</th>
                      <th style={styles.th}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td style={styles.td}>{user.id}</td>
                        <td style={styles.td}>{user.name || '-'}</td>
                        <td style={styles.td}>{user.email}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: user.role === 'ADMIN' ? '#fef3c7' : '#e0e7ff',
                              color: user.role === 'ADMIN' ? '#92400e' : '#3730a3',
                            }}
                          >
                            {user.role === 'ADMIN' ? '👑 Admin' : '👤 Kullanıcı'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleUserEdit(user)}
                              style={{ ...styles.button, padding: '6px 12px', fontSize: '12px', backgroundColor: '#3b82f6' }}
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deletingUserId === user.id}
                              style={{ ...styles.button, padding: '6px 12px', fontSize: '12px', backgroundColor: '#ef4444' }}
                            >
                              {deletingUserId === user.id ? 'Siliniyor...' : 'Sil'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Kullanıcı Düzenleme Modalı */}
      {editingUserId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleUserEditCancel}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                Kullanıcı Düzenle
              </h2>
              <button
                onClick={handleUserEditCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUserEditSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Ad
                  </label>
                  <input
                    type="text"
                    value={userEditForm.name}
                    onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
                    style={styles.input}
                    placeholder="Kullanıcı adı"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={userEditForm.email}
                    onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                    style={styles.input}
                    placeholder="E-posta adresi"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Rol *
                  </label>
                  <select
                    required
                    value={userEditForm.role}
                    onChange={(e) => setUserEditForm({ ...userEditForm, role: e.target.value })}
                    style={styles.input}
                  >
                    <option value="USER">👤 Kullanıcı</option>
                    <option value="ADMIN">👑 Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="submit"
                    disabled={userEditLoading}
                    style={{ ...styles.button, flex: 1 }}
                  >
                    {userEditLoading ? 'Güncelleniyor...' : 'Güncelle'}
                  </button>
                  <button
                    type="button"
                    onClick={handleUserEditCancel}
                    style={{ ...styles.button, backgroundColor: '#64748b', flex: 1 }}
                  >
                    İptal
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yemek Düzenleme Modalı */}
      {editingDish && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleDishEditCancel}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                Yemek Düzenle: {editingDish.name}
              </h2>
              <button
                onClick={handleDishEditCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleDishEditSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Yemek Adı *
                    </label>
                    <input
                      type="text"
                      required
                      value={dishEditForm.name}
                      onChange={(e) => setDishEditForm({ ...dishEditForm, name: e.target.value })}
                      style={styles.input}
                      placeholder="Yemek adı"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                      Kategori *
                    </label>
                    <select
                      required
                      value={dishEditForm.categoryId}
                      onChange={(e) => setDishEditForm({ ...dishEditForm, categoryId: e.target.value })}
                      style={styles.input}
                    >
                      <option value="">Seçiniz</option>
                      {categoriesForDishes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Fotoğraf URL (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    value={dishEditForm.imageUrl}
                    onChange={(e) => setDishEditForm({ ...dishEditForm, imageUrl: e.target.value })}
                    style={styles.input}
                    placeholder="https://example.com/image.jpg"
                  />
                  {dishEditForm.imageUrl && (
                    <div style={{ marginTop: '8px' }}>
                      <img
                        src={dishEditForm.imageUrl}
                        alt="Önizleme"
                        style={{
                          width: '150px',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0',
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                    Açıklama (Opsiyonel)
                  </label>
                  <textarea
                    value={dishEditForm.description}
                    onChange={(e) => setDishEditForm({ ...dishEditForm, description: e.target.value })}
                    rows={3}
                    style={{ ...styles.input, resize: 'vertical' }}
                    placeholder="Yemek açıklaması"
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleDishEditCancel}
                    style={{ ...styles.button, backgroundColor: '#64748b' }}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={dishEditLoading}
                    style={styles.button}
                  >
                    {dishEditLoading ? 'Güncelleniyor...' : 'Güncelle'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;

