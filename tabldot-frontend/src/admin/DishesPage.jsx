import { useEffect, useState } from 'react';
import api from '../api/axios';

function DishesPage() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', categoryId: '' });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const [d, c] = await Promise.all([api.get('/dishes'), api.get('/categories')]);
    setDishes(d.data); setCategories(c.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/dishes', { ...form, categoryId: Number(form.categoryId) });
      setForm({ name: '', description: '', categoryId: '' });
      const res = await api.get('/dishes');
      setDishes(res.data);
    } catch { alert('Hata oluştu'); }
    finally { setLoading(false); }
  };

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || '-';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-slate-800">Yemek Yönetimi</h1>
        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded border border-slate-200">
          Toplam: {dishes.length}
        </span>
      </div>

      {/* Compact Ekleme Formu */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-slate-600 mb-1">Yemek Adı</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 h-9"
              placeholder="Yemek adı giriniz"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-medium text-slate-600 mb-1">Kategori</label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 h-9 bg-white"
            >
              <option value="">Seçiniz</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex-[2] w-full">
            <label className="block text-xs font-medium text-slate-600 mb-1">Açıklama (Opsiyonel)</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 h-9"
            />
          </div>
          <button
            disabled={loading}
            className="w-full md:w-auto h-9 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 whitespace-nowrap"
          >
            Ekle
          </button>
        </form>
      </div>

      {/* Tablo */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-16">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Yemek Adı</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kategori</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Açıklama</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {dishes.map((dish) => (
              <tr key={dish.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 text-xs text-slate-400 font-mono">{dish.id}</td>
                <td className="px-4 py-2 text-sm font-medium text-slate-800">{dish.name}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                    {getCategoryName(dish.categoryId)}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-slate-500">{dish.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DishesPage;