export function PillGlyph({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="4" y="13" width="24" height="6" rx="3" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="13" x2="16" y2="19" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
