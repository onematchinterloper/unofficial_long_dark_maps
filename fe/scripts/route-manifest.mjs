export function routeManifest(maps) {
  const routes = [
    { path: '/', segments: [], title: 'Unofficial Long Dark Maps', pageType: 'home' },
    { path: '/maps/', filePath: '/maps/', segments: [], title: 'Unofficial Long Dark Maps', pageType: 'home' },
    {
      path: '/starting-locations/',
      filePath: '/starting-locations/',
      segments: [],
      title: 'Starting Locations',
      pageType: 'starting-locations',
    },
    { path: '/about/', filePath: '/about/', segments: [], title: 'About & Credits', pageType: 'about' },
  ]

  for (const prefix of ['/maps/region', '/starting-locations/region', '/region']) {
    for (const group of [maps.regions, maps.transitions]) {
      for (const [mapId, map] of Object.entries(group)) {
        routes.push({
          path: `${prefix}/${encodeURIComponent(mapId)}/`,
          filePath: `${prefix}/${mapId}/`,
          segments: [mapId],
          title: map.title ?? mapId,
        })
        for (const [locationId, location] of Object.entries(map.locations ?? {})) {
          routes.push({
            path: `${prefix}/${encodeURIComponent(mapId)}/${encodeURIComponent(locationId)}/`,
            filePath: `${prefix}/${mapId}/${locationId}/`,
            segments: [mapId, locationId],
            title: location.title ?? locationId,
            parentTitle: map.title ?? mapId,
          })
        }
      }
    }
  }

  const startingRegions = {
    misery: ['pleasant-valley'],
    interloper: [
      'ash-canyon',
      'blackrock',
      'desolation-point',
      'forlorn-muskeg',
      'hushed-river-valley',
      'pleasant-valley',
      'timberwolf-mountain',
    ],
  }
  for (const [modeId, regionIds] of Object.entries(startingRegions)) {
    for (const mapId of regionIds) {
      const map = maps.regions[mapId]
      if (!map) continue
      routes.push({
        path: `/starting-locations/${modeId}/${encodeURIComponent(mapId)}/`,
        filePath: `/starting-locations/${modeId}/${mapId}/`,
        segments: [modeId, mapId],
        title: map.title ?? mapId,
      })
    }
  }

  return routes
}
