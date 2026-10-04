import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { routeManifest } from './route-manifest.mjs'

const maps = JSON.parse(readFileSync(new URL('../public/assets/js/maps.json', import.meta.url), 'utf8'))
const routes = routeManifest(maps)
const sitemap = readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8')
assert.equal(
  readFileSync(new URL('../dist/sitemap2.xml', import.meta.url), 'utf8'),
  sitemap,
  'the previously published sitemap must remain available with the same URLs',
)
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])
const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

assert.equal(routes.length, 141, 'expected app routes, starting-location routes, legacy aliases, and map routes')
assert.equal(new Set(routes.map(route => route.path)).size, routes.length, 'route paths must be unique')
for (const path of ['/maps/', '/maps/region/ash-canyon/', '/starting-locations/', '/starting-locations/misery/pleasant-valley/', '/starting-locations/interloper/ash-canyon/']) {
  assert.ok(routes.some(route => route.path === path), `route manifest is missing ${path}`)
}
const canonicalRoutes = routes.filter(route => route.path === route.canonicalPath)
assert.equal(sitemapUrls.length, 54, 'sitemap must contain only preferred pages, not aliases')
assert.equal(sitemapUrls.length, canonicalRoutes.length)
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'sitemap URLs must be unique')

for (const route of routes) {
  const preferredRoute = routes.find(candidate => candidate.path === route.canonicalPath)
  assert.ok(preferredRoute, `${route.path} needs an existing preferred page`)
  const documentUrl = route.path === '/'
    ? new URL('../dist/index.html', import.meta.url)
    : new URL(`../dist${route.filePath}index.html`, import.meta.url)
  assert.ok(existsSync(documentUrl), `missing generated document for ${route.path}`)
  const html = readFileSync(documentUrl, 'utf8')
  const expectedTitle = escapeHtml(
    preferredRoute.pageType === 'home'
      ? 'Unofficial Long Dark Maps'
      : preferredRoute.pageType === 'about'
        ? 'About & Credits — Unofficial Long Dark Maps'
        : preferredRoute.pageType === 'starting-locations'
          ? 'Starting Locations — The Long Dark'
        : preferredRoute.pageType === 'starting-region'
          ? `${preferredRoute.title} ${preferredRoute.modeId === 'misery' ? 'Misery' : 'Interloper'} Starting Locations | The Long Dark`
        : `${preferredRoute.title} Map — The Long Dark`,
  )
  assert.ok(html.includes(`<title>${expectedTitle}</title>`), `${route.path} needs a unique route title`)
  assert.match(html, /<meta name="description"/, `${route.path} needs a description`)
  const expectedCanonical = `https://onematchinterloper.github.io/unofficial_long_dark_maps${route.canonicalPath}`
  assert.ok(html.includes(`<link rel="canonical" href="${expectedCanonical}"`), `${route.path} needs the preferred canonical URL`)
  assert.ok(html.includes(`<meta property="og:url" content="${expectedCanonical}"`), `${route.path} needs the preferred social URL`)
  assert.match(html, /<h1>/, `${route.path} needs crawlable route content`)
  assert.match(html, /<nav aria-label="Main navigation">/, `${route.path} needs navigation before JavaScript loads`)
  assert.ok(
    sitemapUrls.includes(expectedCanonical),
    `sitemap is missing preferred page for ${route.path}`,
  )
  if (route.path !== route.canonicalPath) assert.ok(!sitemapUrls.includes(`https://onematchinterloper.github.io/unofficial_long_dark_maps${route.path}`), `sitemap must not include alias ${route.path}`)
}

const startingPage = readFileSync(new URL('../dist/starting-locations/interloper/ash-canyon/index.html', import.meta.url), 'utf8')
assert.match(startingPage, /Angler's Den/, 'starting-location directions must be present without JavaScript')
assert.match(startingPage, /start-location-interloper-ash-canyon-screenshot-1.webp/)
assert.match(startingPage, /start-location-interloper-ash-canyon-map-1.webp/)
const mapPage = readFileSync(new URL('../dist/maps/region/ash-canyon/index.html', import.meta.url), 'utf8')
assert.match(mapPage, /<img[^>]+alt="Ash Canyon: pilgrim map"/)
assert.match(mapPage, /<img[^>]+alt="Ash Canyon: interloper map"/)

const notFound = readFileSync(new URL('../dist/404.html', import.meta.url), 'utf8')
assert.match(notFound, /<meta name="robots" content="noindex"/)
assert.match(notFound, /<title>Map not found — Unofficial Long Dark Maps<\/title>/)
const robots = readFileSync(new URL('../dist/robots.txt', import.meta.url), 'utf8')
assert.match(robots, /Sitemap: https:\/\/onematchinterloper\.github\.io\/unofficial_long_dark_maps\/sitemap\.xml/)

console.log(`build integrity: ${routes.length} documents, ${sitemapUrls.length} canonical URLs, static content, and 404 passed`)
