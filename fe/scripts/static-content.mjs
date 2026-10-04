export const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

export function staticContent(route, { maps, startingGroups, baseUrl }) {
  const link = (path, label) => `<a href="${escapeHtml(baseUrl + path)}">${escapeHtml(label)}</a>`
  const image = (url, label) => `<a href="${escapeHtml(url)}"><img src="${escapeHtml(url)}" alt="${escapeHtml(label)}" loading="lazy" /></a>`
  const navigation = `<nav aria-label="Main navigation">${link('/maps/', 'Maps')} · ${link('/starting-locations/', 'Starting locations')} · ${link('/about/', 'About & credits')}</nav>`
  const catalog = group => `<ul>${Object.entries(group).map(([id, node]) => `<li>${link(`/maps/region/${encodeURIComponent(id)}/`, node.title ?? id)}</li>`).join('')}</ul>`
  let content = ''
  if (route.pageType === 'home') {
    content = `<h2>Regions</h2>${catalog(maps.regions)}<h2>Transitions</h2>${catalog(maps.transitions)}${image(`${baseUrl}/assets/img/homemap.webp`, 'Great Bear region overview map')}`
  } else if (route.pageType === 'starting-locations') {
    content = '<p>Identify your opening scene, match it to the map, and find guaranteed matches in Misery and Interloper.</p><ul>'
      + startingGroups.map(group => `<li>${link(`/starting-locations/${group.mode}/${group.region}/`, `${group.title}: ${group.mode} (${group.starting_locations.length} starting locations)`)}</li>`).join('') + '</ul>'
  } else if (route.pageType === 'starting-region') {
    const group = startingGroups.find(group => group.mode === route.modeId && group.region === route.regionId)
    content = (group?.starting_locations ?? []).map(location => {
      const label = `${route.title} ${route.modeId} starting location ${location.id}`
      const description = (location.description ?? 'Match the opening screenshot to the corresponding map.')
        .replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1')
      return `<section><h2>Starting location ${location.id}</h2><p>${escapeHtml(description).replaceAll('\n', '<br />')}</p>`
        + (location.screenshot ? image(`${baseUrl}/${location.screenshot}`, `${label}: opening screenshot`) : '')
        + (location.map ? image(`${baseUrl}/${location.map}`, `${label}: map`) : '') + '</section>'
    }).join('')
  } else if (route.pageType === 'about') {
    content = '<h2>Credits and map sources</h2><p>This viewer brings community-made maps together. Map images belong to their respective creators and are loaded from their original sources.</p>'
      + '<p><a href="https://steamcommunity.com/sharedfiles/filedetails/?id=1142193220">Topographic maps by delta</a> · <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3255435617">Updated region maps by HokuOwl</a></p>'
      + '<h2>Disclaimer</h2><p>This unofficial fan project is not affiliated with Hinterland Studio. Map information may become outdated as the game changes.</p>'
      + '<h2>Feedback and contributions</h2><p><a href="https://github.com/onematchinterloper/unofficial_long_dark_maps">Project repository</a></p>'
  } else {
    const [regionId, locationId] = route.segments
    const region = maps.regions[regionId] ?? maps.transitions[regionId]
    const node = locationId ? region?.locations?.[locationId] : region
    content = Object.entries(node?.map ?? {}).filter(([, url]) => typeof url === 'string').map(([variant, url]) =>
      `<section><h2>${escapeHtml(variant)} map</h2>${image(url, `${route.title}: ${variant} map`)}</section>`,
    ).join('')
    if (locationId) content += `<p>${link(`/maps/region/${encodeURIComponent(regionId)}/`, `Back to ${region.title}`)}</p>`
    else if (region?.locations) content += `<h2>Sub-maps</h2><ul>${Object.entries(region.locations).map(([id, node]) => `<li>${link(`/maps/region/${encodeURIComponent(regionId)}/${encodeURIComponent(id)}/`, node.title ?? id)}</li>`).join('')}</ul>`
  }
  return `${navigation}${content}`
}
