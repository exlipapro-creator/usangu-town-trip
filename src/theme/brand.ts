/**
 * Usangu Logistics Brand & Design System Tokens
 * Defines standardized corporate colors, semantic status treatments,
 * and unified button hierarchies for desktop & mobile viewports.
 */

export const USANGU_BRAND = {
  name: 'Usangu Logistics (T) Ltd',
  shortName: 'Usangu Logistics',
  tagline: 'Town Trip Fleet Operations',
  location: 'Dar es Salaam Hub, Tanzania',
  
  // Official Brand Palette
  colors: {
    primaryBlue: '#1e3a8a',       // Deep Royal/Navy Blue
    primaryBlueLight: '#2563eb',
    accentRed: '#dc2626',         // Corporate Crimson Red
    accentRedDark: '#b91c1c',
    industrialAmber: '#f59e0b',   // Heavy Transport Amber/Gold
    industrialAmberDark: '#d97706',
    
    // Canvas & Surfaces
    canvas: '#080d16',
    surface: '#0f172a',
    surfaceElevated: '#1e293b',
    sidebar: '#05080f',
  }
} as const;

/**
 * Standard button class mappings ensuring consistent heights,
 * horizontal padding (py-2 px-3.5 or py-2.5 px-4), and accessibility rings.
 */
export const BUTTON_VARIANTS = {
  primary: 'inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0',
  
  secondary: 'inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 border border-slate-700/80 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0',
  
  danger: 'inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0',
  
  outline: 'inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0',
  
  icon: 'inline-flex items-center justify-center p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer shrink-0'
} as const;

/**
 * Standard semantic operational badge styles
 */
export const STATUS_BADGES = {
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium',
  danger: 'bg-red-500/20 text-red-300 border border-red-500/30 font-semibold',
  critical: 'bg-red-600 text-white font-bold',
  info: 'bg-blue-500/15 text-blue-300 border border-blue-500/30 font-medium',
  neutral: 'bg-slate-800 text-slate-300 border border-slate-700 font-medium'
} as const;
