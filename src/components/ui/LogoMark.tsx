/** نشان فروشگاه: مانیتور آیفون تصویری به‌همراه موج صدا */
export function LogoMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="4" width="18" height="24" rx="4" fill="currentColor" opacity=".18" />
      <rect x="4" y="4" width="18" height="24" rx="4" stroke="currentColor" strokeWidth="2.1" />
      <circle cx="13" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="2.1" />
      <path d="M8.6 22.4c1.3-2 7.5-2 8.8 0" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M25.4 11.2a7 7 0 0 1 0 9.6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M28.4 8a11 11 0 0 1 0 16" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}
