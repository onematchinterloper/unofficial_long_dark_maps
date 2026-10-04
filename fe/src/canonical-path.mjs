export const startingRegions = {
  misery: ['pleasant-valley'],
  interloper: ['ash-canyon', 'blackrock', 'desolation-point', 'forlorn-muskeg', 'hushed-river-valley', 'pleasant-valley', 'timberwolf-mountain'],
}

export function canonicalPath(path) {
  const parts = path.split('/').filter(Boolean)
  if (parts.length === 0) return '/maps/'
  const normalized = `/${parts.join('/')}/`
  if (normalized.startsWith('/region/')) return `/maps${normalized}`
  if (normalized.startsWith('/starting-locations/region/')) {
    const segments = normalized.split('/').filter(Boolean).slice(2)
    const region = decodeURIComponent(segments[0])
    const mode = region === 'pleasant-valley' ? 'misery' : 'interloper'
    if (segments.length === 1 && startingRegions[mode].includes(region)) {
      return `/starting-locations/${mode}/${segments[0]}/`
    }
    return `/maps/region/${segments.join('/')}/`
  }
  return normalized
}
