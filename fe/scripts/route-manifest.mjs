export function routeManifest(maps) {
  const routes = [
    { path: '/', segments: [], title: 'Unofficial Long Dark Maps', pageType: 'home' },
    { path: '/about/', filePath: '/about/', segments: [], title: 'About & Credits', pageType: 'about' },
  ]

  for (const group of [maps.regions, maps.transitions]) {
    for (const [mapId, map] of Object.entries(group)) {
      routes.push({
        path: `/region/${encodeURIComponent(mapId)}/`,
        filePath: `/region/${mapId}/`,
        segments: [mapId],
        title: map.title ?? mapId,
      })
      for (const [locationId, location] of Object.entries(map.locations ?? {})) {
        routes.push({
          path: `/region/${encodeURIComponent(mapId)}/${encodeURIComponent(locationId)}/`,
          filePath: `/region/${mapId}/${locationId}/`,
          segments: [mapId, locationId],
          title: location.title ?? locationId,
          parentTitle: map.title ?? mapId,
        })
      }
    }
  }

  return routes
}
