import { useId } from 'react'
import type { MetalSymbol } from '@fund-monitor/shared'

interface MetalIconProps {
  symbol: MetalSymbol
  className?: string
  size?: number
}

/**
 * 贵金属 SVG 图标组件
 * 使用金属质感渐变 + 光影效果，替代不稳定的 emoji 渲染
 */
export function MetalIcon({ symbol, className = '', size = 32 }: MetalIconProps) {
  const uid = useId().replace(/:/g, '')

  const renderIcon = () => {
    switch (symbol) {
      case 'XAU':
        return <GoldIcon uid={uid} />
      case 'XAG':
        return <SilverIcon uid={uid} />
      case 'XPT':
        return <PlatinumIcon uid={uid} />
      case 'XPD':
        return <PalladiumIcon uid={uid} />
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {renderIcon()}
    </svg>
  )
}

/** 金币 — 圆形硬币，中心金条图案 */
function GoldIcon({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-gold`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="80%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </radialGradient>
        <radialGradient id={`${uid}-gold-shine`} cx="30%" cy="25%" r="40%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-gold-shadow`}>
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#92400E" floodOpacity="0.4" />
        </filter>
      </defs>
      {/* 硬币主体 */}
      <circle
        cx="20"
        cy="20"
        r="16"
        fill={`url(#${uid}-gold)`}
        filter={`url(#${uid}-gold-shadow)`}
      />
      {/* 硬币边框 */}
      <circle cx="20" cy="20" r="16" stroke="#B45309" strokeWidth="0.8" fill="none" />
      <circle cx="20" cy="20" r="14" stroke="#FDE68A" strokeWidth="0.4" fill="none" opacity="0.5" />
      {/* 金条图案 */}
      <rect x="14" y="14" width="12" height="12" rx="1.5" fill="#B45309" opacity="0.35" />
      <rect x="15.5" y="15.5" width="9" height="9" rx="1" fill="#D97706" opacity="0.5" />
      <rect x="17" y="17" width="6" height="6" rx="0.5" fill="#FDE68A" opacity="0.4" />
      {/* 高光 */}
      <circle cx="20" cy="20" r="16" fill={`url(#${uid}-gold-shine)`} />
    </>
  )
}

/** 银币 — 圆形硬币，中心月牙反光 */
function SilverIcon({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-silver`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="35%" stopColor="#E2E8F0" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>
        <radialGradient id={`${uid}-silver-shine`} cx="28%" cy="22%" r="35%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F1F5F9" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-silver-shadow`}>
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#334155" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* 硬币主体 */}
      <circle
        cx="20"
        cy="20"
        r="16"
        fill={`url(#${uid}-silver)`}
        filter={`url(#${uid}-silver-shadow)`}
      />
      {/* 边框 */}
      <circle cx="20" cy="20" r="16" stroke="#64748B" strokeWidth="0.8" fill="none" />
      <circle cx="20" cy="20" r="14" stroke="#CBD5E1" strokeWidth="0.4" fill="none" opacity="0.5" />
      {/* 月牙反光 */}
      <circle cx="17" cy="17" r="7" fill="#475569" opacity="0.25" />
      <circle cx="15.5" cy="15.5" r="7" fill="#F8FAFC" opacity="0.15" />
      {/* 高光 */}
      <circle cx="20" cy="20" r="16" fill={`url(#${uid}-silver-shine)`} />
    </>
  )
}

/** 铂金 — 菱形宝石切面 */
function PlatinumIcon({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <linearGradient
          id={`${uid}-pt`}
          x1="20"
          y1="4"
          x2="20"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="30%" stopColor="#CBD5E1" />
          <stop offset="60%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <linearGradient
          id={`${uid}-pt-left`}
          x1="4"
          y1="20"
          x2="20"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient
          id={`${uid}-pt-right`}
          x1="20"
          y1="20"
          x2="36"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <filter id={`${uid}-pt-shadow`}>
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#334155" floodOpacity="0.4" />
        </filter>
        <filter id={`${uid}-pt-glow`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>
      {/* 宝石底部光晕 */}
      <polygon
        points="20,6 34,20 20,34 6,20"
        fill="#CBD5E1"
        opacity="0.15"
        filter={`url(#${uid}-pt-glow)`}
      />
      {/* 宝石主体 */}
      <polygon
        points="20,5 35,20 20,35 5,20"
        fill={`url(#${uid}-pt)`}
        filter={`url(#${uid}-pt-shadow)`}
      />
      {/* 左上切面 */}
      <polygon points="20,5 5,20 20,20" fill={`url(#${uid}-pt-left)`} opacity="0.7" />
      {/* 右下切面 */}
      <polygon points="20,20 35,20 20,35" fill={`url(#${uid}-pt-right)`} opacity="0.7" />
      {/* 顶部高光 */}
      <polygon points="20,5 28,12 20,16 12,12" fill="#FFFFFF" opacity="0.25" />
      {/* 中心折射线 */}
      <line x1="20" y1="8" x2="20" y2="32" stroke="#E2E8F0" strokeWidth="0.3" opacity="0.4" />
      <line x1="8" y1="20" x2="32" y2="20" stroke="#E2E8F0" strokeWidth="0.3" opacity="0.3" />
      {/* 边框 */}
      <polygon points="20,5 35,20 20,35 5,20" stroke="#94A3B8" strokeWidth="0.6" fill="none" />
    </>
  )
}

/** 钯金 — 六边形金属块 */
function PalladiumIcon({ uid }: { uid: string }) {
  const hex = '20,4 33,11 33,29 20,36 7,29 7,11'
  return (
    <>
      <defs>
        <linearGradient
          id={`${uid}-pd`}
          x1="7"
          y1="4"
          x2="33"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#EDE9FE" />
          <stop offset="40%" stopColor="#C4B5FD" />
          <stop offset="70%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <radialGradient id={`${uid}-pd-shine`} cx="35%" cy="30%" r="40%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-pd-shadow`}>
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#4C1D95" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* 主体 */}
      <polygon points={hex} fill={`url(#${uid}-pd)`} filter={`url(#${uid}-pd-shadow)`} />
      {/* 上半部高光 */}
      <polygon points="20,4 33,11 20,20 7,11" fill="#EDE9FE" opacity="0.25" />
      {/* 中心高光 */}
      <polygon points={hex} fill={`url(#${uid}-pd-shine)`} />
      {/* 边框 */}
      <polygon points={hex} stroke="#8B5CF6" strokeWidth="0.6" fill="none" />
      {/* 内部线条 */}
      <line x1="20" y1="4" x2="20" y2="36" stroke="#C4B5FD" strokeWidth="0.3" opacity="0.3" />
      <line x1="7" y1="11" x2="33" y2="29" stroke="#C4B5FD" strokeWidth="0.3" opacity="0.2" />
      <line x1="33" y1="11" x2="7" y2="29" stroke="#C4B5FD" strokeWidth="0.3" opacity="0.2" />
    </>
  )
}
