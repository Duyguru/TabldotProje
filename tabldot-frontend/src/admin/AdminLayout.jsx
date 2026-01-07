import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // 🔴 KRİTİK

  const handleLogout = () => {
    logout();          // ✅ token + user temizlenir
    navigate("/login"); // ✅ login sayfasına atar
  };

  return (
    <div className="admin-root">
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo">Tabldot.Admin</div>

          <nav className="top-nav">
            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Kategoriler
            </NavLink>

            <NavLink
              to="/admin/dishes"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Yemekler
            </NavLink>

            <NavLink
              to="/admin/menus"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Günlük Menüler
            </NavLink>
          </nav>
        </div>

        {/* ✅ GERÇEK ÇIKIŞ */}
        <button className="logout-btn" onClick={handleLogout}>
          Çıkış Yap
        </button>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
