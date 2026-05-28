import Decimal from 'break_infinity.js'

// Layered notation cake (§10) — scientific → engineering → -illions → letters.
// Phase 1 ships with one sensible default; player-selectable comes later.

const ILLION_NAMES = [
  '',
  'K',
  'M',
  'B',
  'T',
  'Qa',
  'Qi',
  'Sx',
  'Sp',
  'Oc',
  'No',
  'Dc',
  'UDc',
  'DDc',
  'TDc',
  'QaDc',
  'QiDc',
  'SxDc',
  'SpDc',
  'ODc',
  'NDc',
  'Vg',
] as const

export function fmtNumber(value: number | Decimal): string {
  const d = value instanceof Decimal ? value : new Decimal(value)
  if (d.lt(0)) return '-' + fmtNumber(d.abs())
  if (d.lt(1)) {
    const n = d.toNumber()
    if (n === 0) return '0'
    return n.toFixed(2) // sub-dollar / sub-unit shows as 0.00–0.99
  }
  if (d.lt(1000)) return d.toNumber().toFixed(d.lt(10) ? 2 : 1)

  // Engineering exponent (multiple of 3)
  const exp = Math.floor(d.log10())
  const eng = Math.floor(exp / 3) * 3
  if (eng / 3 < ILLION_NAMES.length) {
    const suffix = ILLION_NAMES[eng / 3]
    const mantissa = d.div(new Decimal(10).pow(eng)).toNumber()
    return `${mantissa.toFixed(mantissa < 10 ? 2 : mantissa < 100 ? 1 : 0)}${suffix}`
  }
  return d.toExponential(2)
}

export function fmtMoney(value: number | Decimal): string {
  return `$${fmtNumber(value)}`
}

export function fmtRate(value: number | Decimal): string {
  return `${fmtNumber(value)}/sec`
}

export function fmtPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`
}

export function fmtSeconds(s: number): string {
  if (s < 1) return `${(s * 1000).toFixed(0)}ms`
  if (s < 60) return `${s.toFixed(s < 10 ? 1 : 0)}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
}
