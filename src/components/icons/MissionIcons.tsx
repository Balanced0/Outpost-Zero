import React from 'react'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

export function RocketIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
}

export function AstronautIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="10" r="6" />
      <rect x="8.5" y="7.5" width="7" height="4.5" rx="2" fill="currentColor" fillOpacity="0.2" />
      <path d="M5.5 21a7 7 0 0 1 13 0" />
      <path d="M12 4V2" />
    </svg>
  )
}

export function MarsGlobeIcon({ size = 22, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9" fill="url(#marsGrad)" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.5 9.5c2.2-.8 4.8.5 7 0 1.8-.4 3.5-1.5 4.8-1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />
      <circle cx="9.5" cy="14" r="1.6" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
      <circle cx="15" cy="14.8" r="1" fill="currentColor" fillOpacity="0.45" />
      <defs>
        <radialGradient id="marsGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(9 8) rotate(45) scale(14)">
          <stop stopColor="#FB923C" stopOpacity="0.4" />
          <stop offset="1" stopColor="#9A3412" stopOpacity="0.2" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export function MoonGlobeIcon({ size = 22, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9" fill="url(#moonGrad)" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9.5" cy="9.5" r="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.55" />
      <circle cx="14.5" cy="14" r="2.4" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.55" />
      <circle cx="9" cy="15.2" r="1" fill="currentColor" fillOpacity="0.4" />
      <defs>
        <radialGradient id="moonGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(9 8) rotate(45) scale(14)">
          <stop stopColor="#E2E8F0" stopOpacity="0.35" />
          <stop offset="1" stopColor="#334155" stopOpacity="0.2" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export function AirLifeSupportIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 4v9" />
      <path d="M9.5 7.5C7 8 4 10 4 14.5 4 18 6.5 20 9 20c1.8 0 2.7-1.2 3-2.5.3 1.3 1.2 2.5 3 2.5 2.5 0 5-2 5-5.5 0-4.5-3-6.5-5.5-7" />
      <path d="M8 13.5c1-.5 2-.5 2.5.5" strokeOpacity="0.65" />
      <path d="M16 13.5c-1-.5-2-.5-2.5.5" strokeOpacity="0.65" />
    </svg>
  )
}

export function ShieldDefenseIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </svg>
  )
}

export function RoverVehicleIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="4" y="9" width="16" height="6" rx="2" fill="currentColor" fillOpacity="0.15" />
      <path d="M8 9V5l3-1" />
      <circle cx="11.5" cy="4" r="1.2" fill="currentColor" />
      <circle cx="6.5" cy="17.5" r="2.2" />
      <circle cx="12" cy="17.5" r="2.2" />
      <circle cx="17.5" cy="17.5" r="2.2" />
    </svg>
  )
}

export function BatteryBoltIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="2" y="6" width="17" height="12" rx="2.5" fill="currentColor" fillOpacity="0.12" />
      <path d="M22 10v4" />
      <path d="m11 9-2.5 3h4L10 15" />
    </svg>
  )
}

export function ZapBoltIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

export function CrystalSampleIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polygon
        points="12 2 19 8.5 16 21 8 21 5 8.5 12 2"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path d="M5 8.5h14" />
      <path d="M12 2 9.5 8.5 12 21l2.5-12.5L12 2z" strokeOpacity="0.65" />
    </svg>
  )
}

export function RadarDishIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4 10a7.31 7.31 0 0 0 10 10Z" fill="currentColor" fillOpacity="0.15" />
      <path d="m9 15 3-3" />
      <path d="M17 13a6 6 0 0 0-6-6" />
      <path d="M21 13A10 10 0 0 0 11 3" />
      <path d="M4 21h6" />
      <path d="M7 18v3" />
    </svg>
  )
}

export function HeartPulseIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <path d="M3.22 12H9.5l1.5-3 2 4.5 1.5-1.5h5.27" />
    </svg>
  )
}

export function ScannerReticleIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 6v2M12 16v2M6 12h2M16 12h2" />
    </svg>
  )
}

export function SunCalmIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

export function AlertTriangleIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path
        d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

export function CompassNeedleIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m12 3 6 16-6-4-6 4 6-16z" fill="currentColor" fillOpacity="0.25" />
    </svg>
  )
}

export function SoundWaveIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.2" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

export function SoundMuteIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.2" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  )
}

export function MusicNoteIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity="0.25" />
      <circle cx="18" cy="16" r="3" fill="currentColor" fillOpacity="0.25" />
    </svg>
  )
}

export function SlidersIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" />
      <line x1="10" x2="14" y1="8" y2="8" />
      <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  )
}

export function HomeBaseIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4 19a8 8 0 0 1 16 0" fill="currentColor" fillOpacity="0.16" />
      <path d="M2 19h20" />
      <path d="M12 11V6" />
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <rect x="9.5" y="14" width="5" height="5" rx="1.5" />
    </svg>
  )
}

export function StarRatingIcon({
  size = 28,
  filled = false,
  className = '',
  ...props
}: IconProps & { filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function DatabaseScienceIcon({ size = 18, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" fill="currentColor" fillOpacity="0.14" />
      <path d="M8.5 2h7" />
      <path d="M7 16h10" />
    </svg>
  )
}
