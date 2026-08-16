import { useCallback, useState } from "react";
import { Search, Pill, User, LogIn, Menu, X } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChatModal } from "../features/chat/components/ChatModal";
import { useNotificationSocket } from "../features/notifications/useNotificationSocket";
import { NotificationToast } from "./NotificationToast";
import { ThemeToggle } from "./ThemeToggle";
import "./AppShell.css";

export function AppShell() {
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

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
      navigate("/pharmacies/mine/inbox");
    } else if (toast.target_url) {
      const match = toast.target_url.match(/\/conversations\/(\d+)/);

      if (match) {
        const conversationId = Number(match[1]);

        const pharmacyName =
          toast.title.replace(/^New message from\s*/i, "") || "Pharmacy Chat";

        setActiveChat({
          conversationId,
          pharmacyName,
        });
      }
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
          {/* Brand */}
          <NavLink
            to="/"
            className="app-shell__brand"
            onClick={closeMenu}
            aria-label="MedFinder home"
          >
            <span className="app-shell__brand-icon" aria-hidden="true">
              {/* Custom MedFinder pharmacy logo */}
              <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Pharmacy mortar */}
                <path
                  d="M15 31C15 43.2 24.8 52 32 52C39.2 52 49 43.2 49 31H15Z"
                  fill="currentColor"
                />

                <path
                  d="M13 29H51"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Pestle */}
                <path
                  d="M39 13L48 22"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                <path
                  d="M34 18L45 29"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Medical cross */}
                <path
                  d="M27 32V43M21.5 37.5H32.5"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Leaf */}
                <path
                  d="M35 14C40 8 47 9 49 10C48 17 44 22 37 22"
                  fill="white"
                  fillOpacity=".9"
                />
              </svg>
            </span>

            <span className="app-shell__brand-copy">
              <span className="app-shell__brand-name">
                <span className="app-shell__brand-med">Med</span>
                <span className="app-shell__brand-finder">Finder</span>
              </span>

              <span className="app-shell__tagline">
                YOUR HEALTH, OUR PRIORITY
              </span>
            </span>
          </NavLink>

          {/* Mobile menu */}
          <button
            type="button"
            className="app-shell__menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="app-shell-nav"
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X size={22} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Menu size={22} strokeWidth={2} aria-hidden="true" />
            )}
          </button>

          {/* Navigation */}
          <nav
            id="app-shell-nav"
            className={`app-shell__nav${
              menuOpen ? " app-shell__nav--open" : ""
            }`}
          >
            {/* Search */}
            <NavLink
              to="/"
              end
              className="app-shell__link app-shell__link--search"
              onClick={closeMenu}
            >
              <Search size={21} strokeWidth={2} aria-hidden="true" />

              <span>Search</span>
            </NavLink>

            {/* Medicines */}
            <NavLink
              to="/medicines"
              className="app-shell__link app-shell__link--medicines"
              onClick={closeMenu}
            >
              <Pill size={23} strokeWidth={1.9} aria-hidden="true" />

              <span>Medicines</span>
            </NavLink>

            {/* Pharmacist only */}
            {status === "authenticated" && user?.role === "pharmacist" && (
              <NavLink
                to="/pharmacies/mine"
                className="app-shell__link"
                onClick={closeMenu}
              >
                My pharmacies
              </NavLink>
            )}

            <div className="app-shell__nav-divider" aria-hidden="true" />

            {/* Authentication */}
            {status === "authenticated" ? (
              <>
                <NavLink
                  to="/account"
                  className="app-shell__link app-shell__link--account"
                  onClick={closeMenu}
                >
                  <User size={22} strokeWidth={1.9} aria-hidden="true" />

                  <span>Account</span>
                </NavLink>

                <button
                  type="button"
                  className="app-shell__link app-shell__link--button"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </>
            ) : (
              status !== "loading" && (
                <NavLink
                  to="/login"
                  className="app-shell__link app-shell__link--signin"
                  onClick={closeMenu}
                >
                  <LogIn size={21} strokeWidth={2} aria-hidden="true" />

                  <span>Sign in</span>
                </NavLink>
              )
            )}

            {/* Theme toggle */}
            <div className="app-shell__theme">
              <ThemeToggle />
            </div>
          </nav>
        </div>

        {/* Pharmacy wave */}
        <div className="app-shell__wave" aria-hidden="true">
          <svg
            viewBox="0 0 1280 70"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="app-shell__wave-back"
              d="M0 48C180 40 280 57 430 46C580 35 690 21 820 31C960 42 1040 60 1160 43C1215 35 1250 34 1280 38V70H0Z"
            />

            <path
              className="app-shell__wave-line"
              d="M0 45C175 37 285 55 430 44C580 33 690 19 820 29C960 40 1040 58 1160 41C1215 33 1250 32 1280 36"
            />
          </svg>
        </div>
      </header>

      {/* Global Real-Time Toast Notifications */}
      <NotificationToast
        toasts={toasts}
        onDismiss={handleDismissToast}
        onAction={handleToastAction}
      />

      {/* Global Patient Chat Modal on Toast Action */}
      {activeChat && (
        <ChatModal
          conversationId={activeChat.conversationId}
          pharmacyName={activeChat.pharmacyName}
          onClose={() => setActiveChat(null)}
        />
      )}

      <Outlet />
    </div>
  );
}
