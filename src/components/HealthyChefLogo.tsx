import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  iconOnly?: boolean;
}

export default function HealthyChefLogo({ className = "", size = 40, iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        style={{ width: size, height: size }}
        className="relative group flex items-center justify-center"
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          {/* Background Shape - Rounded Organic Square */}
          <rect x="0" y="0" width="100" height="100" rx="24" className="fill-health-leaf" />
          
          {/* Stylized Chef's Hat & Leaf Combo */}
          {/* The top 'poof' of the hat is a leaf */}
          <path 
            d="M50 25C65 15 80 25 80 45C80 55 70 60 50 65C30 60 20 55 20 45C20 25 35 15 50 25Z" 
            className="fill-white"
          />
          
          {/* The band of the hat with a clinical pulse line */}
          <rect x="25" y="65" width="50" height="12" rx="4" className="fill-white" />
          
          {/* Pulse Line inside the band */}
          <path 
            d="M30 71H40L43 67L47 75L50 71H70" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-health-leaf"
          />

          {/* Small leaf detail at the top */}
          <path 
            d="M50 15C55 10 60 15 50 25C40 15 45 10 50 15Z" 
            className="fill-health-sage"
          />
        </svg>
      </div>
      {!iconOnly && (
        <span className="font-serif font-bold text-health-leaf tracking-tight" style={{ fontSize: size * 0.6 }}>
          HealthyChef
        </span>
      )}
    </div>
  );
}
