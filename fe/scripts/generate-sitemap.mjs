import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { routeManifest } from './route-manifest.mjs'

const BASE_URL = (process.env.SITE_URL ?? 'https://onematchinterloper.github.io/unofficial_long_dark_maps').replace(/\/$/, '')
const maps = JSON.parse(readFileSync(new URL('../public/assets/js/maps.json', import.meta.url), 'utf8'))

const routes = routeManifest(maps)

const escapeHtml = value => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

function documentForRoute(template, route, { notFound = false } = {}) {
  const pageTitle = notFound
    ? 'Map not found — Unofficial Long Dark Maps'
    : route.segments.length === 0
      ? 'Unofficial Long Dark Maps'
      : `${route.title} Map — The Long Dark`
  const description = notFound
    ? 'The requested map page could not be found.'
    : route.segments.length === 0
      ? 'Browse Pilgrim, Interloper, and topographic maps for regions and transitions in The Long Dark.'
      : `View the ${route.title} map for The Long Dark, with Pilgrim and Interloper variants.`
  const canonical = `${BASE_URL}${route.path}`
  const heading = route.parentTitle ? `${route.parentTitle}: ${route.title}` : route.title
  const metadata = [
    `    <meta name="description" content="${escapeHtml(description)}" />`,
    `    <link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `    <meta property="og:title" content="${escapeHtml(pageTitle)}" />`,
    `    <meta property="og:description" content="${escapeHtml(description)}" />`,
    `    <meta property="og:type" content="website" />`,
    `    <meta property="og:url" content="${escapeHtml(canonical)}" />`,
    notFound ? '    <meta name="robots" content="noindex" />' : '',
  ].filter(Boolean).join('\n')

  return template
    .replace('<title>Unofficial Long Dark Maps</title>', `<title>${escapeHtml(pageTitle)}</title>\n${metadata}`)
    .replace('<div id="root"></div>', `<div id="root"><main class="tldStatic"><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(description)}</p></main></div>`)
}

// GitHub Pages does not support SPA history fallbacks. Create a real document
// for every client-side route so direct requests return 200 instead of serving
// 404.html with a 404 status code.
const indexHtml = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')
for (const route of routes) {
  if (route.path === '/') {
    writeFileSync(new URL('../dist/index.html', import.meta.url), documentForRoute(indexHtml, route))
    continue
  }
  const routeDirectory = new URL(`../dist${route.filePath}`, import.meta.url)
  mkdirSync(routeDirectory, { recursive: true })
  writeFileSync(new URL('index.html', routeDirectory), documentForRoute(indexHtml, route))
}

writeFileSync(
  new URL('../dist/404.html', import.meta.url),
  documentForRoute(indexHtml, { path: '/', segments: [], title: 'Map not found' }, { notFound: true }),
)

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url><loc>${BASE_URL}${route.path}</loc></url>`).join('\n')}
</urlset>
`

writeFileSync(new URL('../dist/sitemap.xml', import.meta.url), xml)
console.log(`sitemap.xml: ${routes.length} URLs`)
