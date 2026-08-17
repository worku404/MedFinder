import { useCallback, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotificationSocket } from "../features/notifications/useNotificationSocket";
import { NotificationToast } from "./NotificationToast";
import { ThemeToggle } from "./ThemeToggle";
import "./AppShell.css";

export function AppShell() {
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const handleNotification = useCallback((notification) => {
    setToasts((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        title: notification.title,
        body: notification.body,
        target_url: notification.target_url,
      },
    ]);
  }, []);

  useNotificationSocket(status, handleNotification);

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToastAction = (toast) => {
    handleDismissToast(toast.id);
    if (user?.role === "pharmacist") {
      navigate("/pharmacies/mine");
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/", { replace: true });
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__row">
          <NavLink to="/" className="app-shell__brand" onClick={closeMenu}>
            <span className="app-shell__brand-mark" aria-hidden="true" />
            MedFinder
          </NavLink>

          <button
            type="button"
            className="app-shell__menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="app-shell-nav"
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>

          <nav id="app-shell-nav" className={`app-shell__nav${menuOpen ? " app-shell__nav--open" : ""}`}>
            <NavLink to="/" end className="app-shell__link" onClick={closeMenu}>
              Search
            </NavLink>
            <NavLink to="/medicines" className="app-shell__link" onClick={closeMenu}>
              Medicines
            </NavLink>

            {status === "authenticated" && user?.role === "pharmacist" && (
              <NavLink to="/pharmacies/mine" className="app-shell__link" onClick={closeMenu}>
                My pharmacies
              </NavLink>
            )}

            <div className="app-shell__nav-divider" aria-hidden="true" />

            {status === "authenticated" ? (
              <>
                <NavLink to="/account" className="app-shell__link" onClick={closeMenu}>
                  Account
                </NavLink>
                <button type="button" className="app-shell__link app-shell__link--button" onClick={handleLogout}>
                  Sign out
                </button>
              </>
            ) : (
              status !== "loading" && (
                <NavLink to="/login" className="app-shell__link" onClick={closeMenu}>
                  Sign in
                </NavLink>
              )
            )}

            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Global Real-Time Toast Notifications */}
      <NotificationToast
        toasts={toasts}
        onDismiss={handleDismissToast}
        onAction={handleToastAction}
      />

      <Outlet />
    </div>
  );
}
