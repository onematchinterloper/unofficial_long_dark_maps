import { useEffect, useState } from 'react'
import { useStartingLocations, type StartingLocation } from './startingLocations'

type StartingLocationPlaceholderPageProps = {
  modeId?: string
  regionId?: string
  title: string
}

function renderInlineMarkdown(value: string) {
  const tokenPattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\((https?:\/\/|\/)[^)]+\))/g
  const parts = []
  let cursor = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = tokenPattern.exec(value))) {
    if (match.index > cursor) parts.push(value.slice(cursor, match.index))
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('*')) {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>)
    } else {
      const link = token.match(/^\[([^\]]+)\]\(((https?:\/\/|\/)[^)]+)\)$/)
      if (link) parts.push(<a key={key++} href={link[2]}>{link[1]}</a>)
    }
    cursor = match.index + token.length
  }

  if (cursor < value.length) parts.push(value.slice(cursor))
  return parts
}

function MarkdownDescription({ value }: { value: string }) {
  return (
    <div className="startingLocationPlaceholder__descriptionText">
      {value.split(/\n\s*\n/).map((paragraph, index) => {
        const lines = paragraph.split('\n')
        const isBulletList = lines.length > 0 && lines.every((line) => /^\s*[-*]\s+/.test(line))
        if (isBulletList) {
          return (
            <ul key={index}>
              {lines.map((line, lineIndex) => <li key={lineIndex}>{renderInlineMarkdown(line.replace(/^\s*[-*]\s+/, ''))}</li>)}
            </ul>
          )
        }
        return (
          <p key={index}>
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>{lineIndex > 0 && <br />}{renderInlineMarkdown(line)}</span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

function ImageCell({ path, label, onOpen }: { path?: string; label: string; onOpen: (path: string, label: string) => void }) {
  if (!path) {
    return <div className="startingLocationPlaceholder__image" role="img" aria-label={`${label} WebP placeholder`}>{label}.webp</div>
  }
  return (
    <button className="startingLocationPlaceholder__imageButton" type="button" onClick={() => onOpen(path, label)}>
      <img className="startingLocationPlaceholder__image startingLocationPlaceholder__image--actual" src={`${import.meta.env.BASE_URL}${path}`} alt={`Open ${label}`} />
      <span>Click to enlarge</span>
    </button>
  )
}

function LocationRow({ location, prefix, onOpen }: { location: StartingLocation; prefix: string; onOpen: (path: string, label: string) => void }) {
  return (
    <tr>
      <td><ImageCell path={location.screenshot} label={`${prefix}-screenshot-${location.id}`} onOpen={onOpen} /></td>
      <td><ImageCell path={location.map} label={`${prefix}-map-${location.id}`} onOpen={onOpen} /></td>
      <td className="startingLocationPlaceholder__description">
        <MarkdownDescription value={location.description ?? 'Match the opening screenshot to the corresponding map.'} />
      </td>
    </tr>
  )
}

export default function StartingLocationPlaceholderPage({
  modeId,
  regionId,
  title,
}: StartingLocationPlaceholderPageProps) {
  const { groups, error } = useStartingLocations()
  const [preview, setPreview] = useState<{ path: string; label: string } | null>(null)
  const group = groups?.find((item) => item.mode === modeId && item.region === regionId)
  const prefix = `start-location-${modeId ?? 'interloper'}-${regionId ?? 'region'}`

  useEffect(() => {
    if (!preview) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreview(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [preview])

  return (
    <section className="startingLocationPlaceholder" aria-labelledby="starting-location-placeholder-title">
      <div className="startingLocationPlaceholder__content">
        <p className="startingLocations__eyebrow">{modeId ?? 'Starting location'}</p>
        <h1 id="starting-location-placeholder-title">{title}</h1>
        <p>Starting location(s). Select an image to view it larger.</p>

        {error && <p role="alert">Starting location data could not be loaded.</p>}
        {!groups && !error && <p role="status">Loading starting locations…</p>}
        {groups && !group && <p>No starting-location data has been added yet.</p>}
        {group && (
          <div className="startingLocationPlaceholder__tableWrap">
            <table className="startingLocationPlaceholder__table">
              <thead>
                <tr>
                  <th scope="col">Screenshot</th>
                  <th scope="col">Map</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {group.starting_locations.map((location) => (
                  <LocationRow key={location.id} location={location} prefix={prefix} onOpen={(path, label) => setPreview({ path, label })} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {preview && (
        <div className="startingLocationPreview" role="presentation" onClick={() => setPreview(null)}>
          <div className="startingLocationPreview__dialog" role="dialog" aria-modal="true" aria-label={`${preview.label} preview`} onClick={(event) => event.stopPropagation()}>
            <div className="startingLocationPreview__toolbar">
              <span>{preview.label}.webp</span>
              <button type="button" onClick={() => setPreview(null)} aria-label="Close image preview">Close</button>
            </div>
            <img src={`${import.meta.env.BASE_URL}${preview.path}`} alt={preview.label} />
          </div>
        </div>
      )}
    </section>
  )
}
