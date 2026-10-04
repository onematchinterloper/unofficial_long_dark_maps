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
assert.equal(sitemapUrls.length, routes.length, 'sitemap must contain every route exactly once')
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'sitemap URLs must be unique')

for (const route of routes) {
  const documentUrl = route.path === '/'
    ? new URL('../dist/index.html', import.meta.url)
    : new URL(`../dist${route.filePath}index.html`, import.meta.url)
  assert.ok(existsSync(documentUrl), `missing generated document for ${route.path}`)
  const html = readFileSync(documentUrl, 'utf8')
  const expectedTitle = escapeHtml(
    route.pageType === 'home'
      ? 'Unofficial Long Dark Maps'
      : route.pageType === 'about'
        ? 'About & Credits — Unofficial Long Dark Maps'
        : route.pageType === 'starting-locations'
          ? 'Starting Locations — The Long Dark'
        : `${route.title} Map — The Long Dark`,
  )
  assert.ok(html.includes(`<title>${expectedTitle}</title>`), `${route.path} needs a unique route title`)
  assert.match(html, /<meta name="description"/, `${route.path} needs a description`)
  assert.match(html, /<link rel="canonical"/, `${route.path} needs a canonical URL`)
  assert.match(html, /<h1>/, `${route.path} needs crawlable route content`)
  assert.ok(
    sitemapUrls.includes(`https://onematchinterloper.github.io/unofficial_long_dark_maps${route.path}`),
    `sitemap is missing ${route.path}`,
  )
}

const notFound = readFileSync(new URL('../dist/404.html', import.meta.url), 'utf8')
assert.match(notFound, /<meta name="robots" content="noindex"/)
assert.match(notFound, /<title>Map not found — Unofficial Long Dark Maps<\/title>/)
const robots = readFileSync(new URL('../dist/robots.txt', import.meta.url), 'utf8')
assert.match(robots, /Sitemap: https:\/\/onematchinterloper\.github\.io\/unofficial_long_dark_maps\/sitemap\.xml/)

console.log(`build integrity: ${routes.length} routes, metadata, sitemap, and 404 passed`)
