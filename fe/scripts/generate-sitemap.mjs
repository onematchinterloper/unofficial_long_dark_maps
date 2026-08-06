import { readFileSync, writeFileSync } from 'fs'

const BASE_URL = (process.env.SITE_URL ?? 'https://onematchinterloper.github.io/unofficial_long_dark_maps').replace(/\/$/, '')
const maps = JSON.parse(readFileSync(new URL('../public/assets/js/maps.json', import.meta.url), 'utf8'))

const paths = ['/']

for (const [regionId, region] of Object.entries(maps.regions)) {
  paths.push(`/region/${regionId}`)
  for (const locationId of Object.keys(region.locations ?? {})) {
    paths.push(`/region/${regionId}/${locationId}`)
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(p => `  <url><loc>${BASE_URL}${p}</loc></url>`).join('\n')}
</urlset>
`

writeFileSync(new URL('../dist/sitemap.xml', import.meta.url), xml)
console.log(`sitemap.xml: ${paths.length} URLs`)
