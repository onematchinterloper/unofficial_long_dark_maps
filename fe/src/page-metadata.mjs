const variantLabels = { pilgrim: 'Pilgrim', interloper: 'Interloper', topographic: 'topographic' }

function list(items) {
  if (items.length < 2) return items[0] ?? ''
  if (items.length === 2) return items.join(' and ')
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`
}

export function pageMetadata({ pageType = 'map', title = '', parentTitle, modeId, images = {} } = {}) {
  if (pageType === 'not-found') return {
    title: 'Map Not Found | Unofficial Long Dark Maps',
    description: 'The requested map page could not be found. Browse the map catalog to choose a region or transition.',
  }
  if (pageType === 'home') return {
    title: 'The Long Dark Maps: Regions & Starting Locations',
    description: 'Explore community-made maps for The Long Dark. Browse regions, transitions, and sub-maps, or identify Misery and Interloper starting locations.',
  }
  if (pageType === 'about') return {
    title: 'About & Map Credits | Unofficial Long Dark Maps',
    description: 'Meet the community map creators behind Unofficial Long Dark Maps. Find original sources, project credits, privacy information, and ways to contribute.',
  }
  if (pageType === 'starting-locations') return {
    title: 'Misery & Interloper Starting Locations | The Long Dark',
    description: 'Identify your starting region in The Long Dark on Misery or Interloper. Compare opening screenshots with maps and follow player directions to matches.',
  }
  if (pageType === 'starting-region') {
    const mode = modeId === 'misery' ? 'Misery' : 'Interloper'
    return {
      title: `${title} ${mode} Starting Locations | The Long Dark`,
      description: `Find your ${mode} starting location in ${title}, The Long Dark. Compare opening screenshots and maps, with player directions to matches.`,
    }
  }
  const name = parentTitle && !title.includes(parentTitle) ? `${title} (${parentTitle})` : title
  const variants = Object.keys(variantLabels).filter(id => typeof images[id] === 'string' && images[id].trim()).map(id => variantLabels[id])
  return {
    title: `${name} Map | The Long Dark`,
    description: variants.length
      ? `Explore ${name} in The Long Dark with ${list(variants)} maps. Pan and zoom in the viewer, or open the original community-made map images.`
      : `Explore ${name} in The Long Dark. Browse the map catalog and original community map sources.`,
  }
}
