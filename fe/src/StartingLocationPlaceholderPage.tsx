import { useEffect, useState } from 'react'
import { useStartingLocations, type StartingLocation } from './startingLocations'

type StartingLocationPlaceholderPageProps = {
  modeId?: string
  regionId?: string
  title: string
}

function ImageCell({ path, label, onOpen }: { path?: string; label: string; onOpen: (path: string, label: string) => void }) {
  if (!path) {
    return <div className="startingLocationPlaceholder__image" role="img" aria-label={`${label} PNG placeholder`}>{label}.png</div>
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
              <span>{preview.label}.png</span>
              <button type="button" onClick={() => setPreview(null)} aria-label="Close image preview">Close</button>
            </div>
            <img src={`${import.meta.env.BASE_URL}${preview.path}`} alt={preview.label} />
          </div>
        </div>
      )}
    </section>
  )
}
