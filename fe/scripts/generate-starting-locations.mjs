import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const feRoot = fileURLToPath(new URL('..', import.meta.url))
const imageDir = join(feRoot, 'public/assets/img/starting-locations')
const outputFile = join(feRoot, 'public/assets/js/starting-locations.json')

const regionTitles = {
  'ash-canyon': 'Ash Canyon',
  blackrock: 'Blackrock',
  'desolation-point': 'Desolation Point',
  'forlorn-muskeg': 'Forlorn Muskeg',
  'hushed-river-valley': 'Hushed River Valley',
  'pleasant-valley': 'Pleasant Valley',
  'timberwolf-mountain': 'Timberwolf Mountain',
}

function defaultDescription(mode, region, id) {
  const title = regionTitles[region] ?? region
  if (mode === 'misery') {
    return 'Fixed Misery starting location outside Draft Dodger’s Cabin near Skeeter’s Ridge.'
  }
  return `Interloper starting location ${id} in ${title}. Match the opening screenshot to the corresponding map.`
}

mkdirSync(imageDir, { recursive: true })

const existingDescriptions = new Map()
if (existsSync(outputFile)) {
  try {
    const existing = JSON.parse(readFileSync(outputFile, 'utf8'))
    for (const group of existing) {
      for (const location of group.starting_locations ?? []) {
        if (location.description) existingDescriptions.set(`${group.mode}/${group.region}/${location.id}`, location.description)
      }
    }
  } catch {
    // Regenerate from image files if the previous JSON is unavailable or invalid.
  }
}

const groups = new Map()
for (const filename of readdirSync(imageDir)) {
  const match = filename.match(/^start-location-(misery|interloper)-(.+)-(screenshot|map)-(\d+)\.webp$/i)
  if (!match) continue

  const [, mode, region, kind, id] = match
  const key = `${mode}/${region}`
  const group = groups.get(key) ?? {
    mode,
    region,
    title: regionTitles[region] ?? region,
    starting_locations: new Map(),
  }
  const location = group.starting_locations.get(id) ?? {
    id: Number(id),
    description: existingDescriptions.get(`${mode}/${region}/${id}`) ?? defaultDescription(mode, region, Number(id)),
  }
  location[kind] = `assets/img/starting-locations/${filename}`
  group.starting_locations.set(id, location)
  groups.set(key, group)
}

const output = [...groups.values()]
  .sort((a, b) => `${a.mode}/${a.region}`.localeCompare(`${b.mode}/${b.region}`))
  .map((group) => ({
    ...group,
    starting_locations: [...group.starting_locations.values()].sort((a, b) => a.id - b.id),
  }))

writeFileSync(outputFile, `${JSON.stringify(output, null, 2)}\n`)
console.log(`starting locations: ${output.length} region groups generated`)
