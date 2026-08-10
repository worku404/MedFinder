export function StatusBanner({ tone = "info", children }) {
  return (
    <div className={`status-banner status-banner--${tone}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
