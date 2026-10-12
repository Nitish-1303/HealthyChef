interface LogoProps {
  className?: string;
  size?: number;
  iconOnly?: boolean;
}

export default function HealthyChefLogo({ className = "", size = 34, iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <circle cx="17" cy="17" r="17" fill="#E4572E" />
        <path d="M17 26c-6-2-7-8-1-13 7 4 7 11 1 13z" fill="#FFF3E0" />
        <path d="M17 25V15" stroke="#E4572E" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {!iconOnly && (
        <span className="font-display font-extrabold text-health-ink tracking-tight" style={{ fontSize: size * 0.74 }}>
          HealthyChef
        </span>
      )}
    </div>
  );
}
