import { useState, useEffect } from "react";
import api from '../api/axios';

export default function DailyMenusPage() {
  const [date, setDate] = useState("");
  const [dishes, setDishes] = useState([]);
  const [selectedDishIds, setSelectedDishIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [savedMenus, setSavedMenus] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  // Yemekleri ve menüleri yükle
  useEffect(() => {
    loadDishes();
    loadMenus();
  }, []);

  const loadDishes = async () => {
    try {
      const res = await api.get('/dishes');
      setDishes(res.data);
    } catch (err) {
      console.error('Yemekler yüklenemedi:', err);
    }
  };

  const loadMenus = async () => {
    try {
      const res = await api.get('/daily-menus');
      setSavedMenus(res.data);
    } catch (err) {
      console.error('Menüler yüklenemedi:', err);
    }
  };

  // Yemek seçimi toggle
  const toggleDish = (dishId) => {
    setSelectedDishIds(prev => 
      prev.includes(dishId) 
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId]
    );
  };

  // Menü kaydet fonksiyonu
  const handleSaveMenu = async () => {
    if (!date) {
      setMessage("Lütfen bir tarih seçin.");
      return;
    }
    if (selectedDishIds.length === 0) {
      setMessage("Lütfen en az bir yemek seçin.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      // Tarihi ISO 8601 formatına çevir (YYYY-MM-DD -> YYYY-MM-DDTHH:mm:ss.sssZ)
      const dateObj = new Date(date);
      const isoDate = dateObj.toISOString();
      
      await api.post('/daily-menus', {
        date: isoDate,
        dishIds: selectedDishIds,
      });
      setMessage("Menü başarıyla kaydedildi!");
      setDate("");
      setSelectedDishIds([]);
      await loadMenus();
    } catch (err) {
      setMessage(err?.response?.data?.message || "Menü kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  // Menü sil fonksiyonu
  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Bu menüyü silmek istediğinize emin misiniz?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/daily-menus/${id}`);
      setMessage("Menü silindi.");
      await loadMenus();
    } catch (err) {
      setMessage(err?.response?.data?.message || "Menü silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <h1 className="text-xl font-semibold text-slate-800">
        Yeni Menü Oluştur
      </h1>

      {/* TARİH */}
      <div className="max-w-sm">
        <label className="block mb-1 text-sm font-medium">Tarih</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full h-9 rounded-md border px-3"
        />
      </div>

      {/* YEMEK SEÇİMİ */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Yemek Seçimi</h2>
        {dishes.length === 0 ? (
          <div className="text-slate-500">Yemek bulunamadı. Önce yemek ekleyin.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dishes.map((dish) => (
              <label
                key={dish.id}
                className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selectedDishIds.includes(dish.id)}
                  onChange={() => toggleDish(dish.id)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-slate-800">{dish.name}</div>
                  {dish.description && (
                    <div className="text-xs text-slate-500">{dish.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
        {selectedDishIds.length > 0 && (
          <div className="text-sm text-slate-600">
            {selectedDishIds.length} yemek seçildi
          </div>
        )}
      </div>

      {/* SAVE */}
      <div className="flex justify-end">
        <button
          className="h-9 px-6 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500"
          onClick={handleSaveMenu}
          disabled={saving || !date || selectedDishIds.length === 0}
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>

      {message && (
        <div className="text-sm mt-2 text-center text-green-700 font-medium">
          {message}
        </div>
      )}

      {/* KAYITLI MENÜLER */}
      <div className="pt-8 border-t">
        <h2 className="text-lg font-semibold mb-3">
          Kayıtlı Menüler
        </h2>

        {savedMenus.length === 0 ? (
          <div className="text-slate-500">Kayıtlı menü yok.</div>
        ) : (
          <div className="space-y-4">
            {savedMenus.map((menu) => (
              <div key={menu.id} className="bg-white border rounded-md p-4 max-w-xl flex justify-between items-center">
                <div>
                  <div className="font-medium mb-2">
                    {new Date(menu.date).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <ul className="list-disc ml-5 text-sm text-slate-700">
                    {menu.dishes && menu.dishes.map((dish, i) => (
                      <li key={dish.id || i}>{dish.name}</li>
                    ))}
                  </ul>
                </div>
                <button
                  className="ml-4 px-4 py-2 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
                  onClick={() => handleDeleteMenu(menu.id)}
                  disabled={deletingId === menu.id}
                >
                  {deletingId === menu.id ? 'Siliniyor...' : 'Sil'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

