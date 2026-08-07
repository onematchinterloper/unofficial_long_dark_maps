import { mkdirSync, readFileSync, writeFileSync } from 'fs'

const BASE_URL = (process.env.SITE_URL ?? 'https://onematchinterloper.github.io/unofficial_long_dark_maps').replace(/\/$/, '')
const maps = JSON.parse(readFileSync(new URL('../public/assets/js/maps.json', import.meta.url), 'utf8'))

const paths = ['/']

for (const [regionId, region] of Object.entries(maps.regions)) {
  paths.push(`/region/${regionId}`)
  for (const locationId of Object.keys(region.locations ?? {})) {
    paths.push(`/region/${regionId}/${locationId}`)
  }
}

// GitHub Pages does not support SPA history fallbacks. Create a real document
// for every client-side route so direct requests return 200 instead of serving
// 404.html with a 404 status code.
const indexHtml = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')
for (const path of paths.filter(path => path !== '/')) {
  const routeDirectory = new URL(`../dist${path}/`, import.meta.url)
  mkdirSync(routeDirectory, { recursive: true })
  writeFileSync(new URL('index.html', routeDirectory), indexHtml)
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(path => `  <url><loc>${BASE_URL}${path === '/' ? '/' : `${path}/`}</loc></url>`).join('\n')}
</urlset>
`

writeFileSync(new URL('../dist/sitemap.xml', import.meta.url), xml)
console.log(`sitemap.xml: ${paths.length} URLs`)
