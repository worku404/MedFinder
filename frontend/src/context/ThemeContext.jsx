import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "medfinder-theme";
const ThemeContext = createContext(null);

// Keep this in sync with the inline script in index.html — that script
// picks the *first-paint* theme (before React exists) using the exact
// same rule: explicit stored choice wins, otherwise fall back to the OS
// preference. This function just re-derives the same value so React's
// state matches what's already on the page.
function getInitialTheme() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
