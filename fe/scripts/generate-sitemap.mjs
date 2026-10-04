import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { routeManifest } from './route-manifest.mjs'
import { escapeHtml, staticContent } from './static-content.mjs'
import { pageMetadata } from '../src/page-metadata.mjs'

const BASE_URL = (process.env.SITE_URL ?? 'https://onematchinterloper.github.io/unofficial_long_dark_maps').replace(/\/$/, '')
const BASE_PATH = (process.env.SITE_BASE ?? (process.env.CI === 'true' ? '/unofficial_long_dark_maps/' : '/')).replace(/\/$/, '')
const maps = JSON.parse(readFileSync(new URL('../public/assets/js/maps.json', import.meta.url), 'utf8'))
const startingGroups = JSON.parse(readFileSync(new URL('../public/assets/js/starting-locations.json', import.meta.url), 'utf8'))

const routes = routeManifest(maps)

function documentForRoute(template, route, { notFound = false } = {}) {
  const [regionId, locationId] = route.segments
  const region = maps.regions[regionId] ?? maps.transitions[regionId]
  const node = locationId ? region?.locations?.[locationId] : region
  const { title: pageTitle, description } = pageMetadata({ ...route, pageType: notFound ? 'not-found' : route.pageType, images: node?.map })
  const canonical = `${BASE_URL}${route.canonicalPath ?? route.path}`
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
    .replace('<div id="root"></div>', `<div id="root"><main class="tldStatic"><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(description)}</p>${notFound ? '' : staticContent(route, { maps, startingGroups, baseUrl: BASE_PATH })}</main></div>`)
}

// GitHub Pages does not support SPA history fallbacks. Create a real document
// for every client-side route so direct requests return 200 instead of serving
// 404.html with a 404 status code.
const indexHtml = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')
for (const route of routes) {
  // Aliases remain real pages for bookmarks, but describe the preferred page.
  const preferredRoute = routes.find(candidate => candidate.path === route.canonicalPath)
  if (!preferredRoute) throw new Error(`Missing preferred route for ${route.path}`)
  if (route.path === '/') {
    writeFileSync(new URL('../dist/index.html', import.meta.url), documentForRoute(indexHtml, preferredRoute))
    continue
  }
  const routeDirectory = new URL(`../dist${route.filePath}`, import.meta.url)
  mkdirSync(routeDirectory, { recursive: true })
  writeFileSync(new URL('index.html', routeDirectory), documentForRoute(indexHtml, preferredRoute))
}

writeFileSync(
  new URL('../dist/404.html', import.meta.url),
  documentForRoute(indexHtml, { path: '/', segments: [], title: 'Map not found' }, { notFound: true }),
)

const canonicalRoutes = routes.filter(route => route.path === route.canonicalPath)
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${canonicalRoutes.map(route => `  <url><loc>${escapeHtml(BASE_URL + route.path)}</loc></url>`).join('\n')}
</urlset>
`

writeFileSync(new URL('../dist/sitemap.xml', import.meta.url), xml)
// Keep the previously published URL available for existing submissions and links.
writeFileSync(new URL('../dist/sitemap2.xml', import.meta.url), xml)
console.log(`sitemap.xml (and sitemap2.xml compatibility copy): ${canonicalRoutes.length} canonical URLs; ${routes.length} documents`)
