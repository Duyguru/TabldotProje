import { useEffect, useState } from 'react';
import api from '../api/axios';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) await api.patch(`/categories/${editingId}`, { name, description });
      else await api.post('/categories', { name, description });
      setName(''); setDescription(''); setEditingId(null);
      await loadCategories();
    } catch { alert('İşlem başarısız.'); }
    finally { setLoading(false); }
  };

  const handleEdit = (cat) => {
    setName(cat.name); setDescription(cat.description); setEditingId(cat.id);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sol: Ekleme/Düzenleme Formu */}
      <div className="w-full lg:w-1/3">
        <div className="bg-white border border-slate-200 rounded-lg p-5 sticky top-20">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
            {editingId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Adı</label>
              {/* Tailwind Forms sorunu yaşamamak için manuel ring/border tanımları */}
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 h-9"
                placeholder="Örn: Tatlılar"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Açıklama</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 resize-none"
              />
            </div>
            <div className="pt-2 flex gap-2">
              <button
                disabled={loading}
                className="flex-1 h-9 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-colors"
              >
                {editingId ? 'Güncelle' : 'Kaydet'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setName(''); setDescription(''); }}
                  className="h-9 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
                >
                  İptal
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Sağ: Liste */}
      <div className="w-full lg:w-2/3">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Açıklama</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-slate-400 font-mono">{cat.id}</td>
                  <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{cat.name}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-500">{cat.description || '-'}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:underline"
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan="4" className="px-4 py-8 text-center text-sm text-slate-500">Kayıt yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CategoriesPage;