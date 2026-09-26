import { Link, useNavigate } from 'react-router-dom'
import { useStartingLocations, type StartingLocationGroup } from './startingLocations'

function ModeTable({ mode, groups }: { mode: string; groups: StartingLocationGroup[] }) {
  const navigate = useNavigate()

  return (
    <section className="startingLocations__indexSection" aria-labelledby={`${mode}-index-title`}>
      <p className="startingLocations__label">{mode}</p>
      <h2 id={`${mode}-index-title`}>{mode === 'Misery' ? '1 starting location' : 'Possible starting regions'}</h2>
      <p className="startingLocations__indexDescription">
        Choose a region to see its screenshot and map pairs.
      </p>
      <div className="startingLocations__indexTableWrap">
        <table className="startingLocations__indexTable">
          <thead>
            <tr>
              <th scope="col">Region</th>
              <th scope="col">Starting locations</th>
              <th scope="col"><span className="tld-sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr
                key={`${group.mode}/${group.region}`}
                className="startingLocations__indexRow"
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/starting-locations/${group.mode}/${group.region}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    navigate(`/starting-locations/${group.mode}/${group.region}`)
                  }
                }}
              >
                <th scope="row">{group.title}</th>
                <td>{group.starting_locations.length}</td>
                <td>
                  <Link className="startingLocations__indexLink" to={`/starting-locations/${group.mode}/${group.region}`}>
                    Open <span aria-hidden="true">→</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function StartingLocationsPage() {
  const { groups, error } = useStartingLocations()
  const misery = groups?.filter((group) => group.mode === 'misery') ?? []
  const interloper = groups?.filter((group) => group.mode === 'interloper') ?? []

  return (
    <section className="startingLocations" aria-labelledby="starting-locations-title">
      <div className="startingLocations__content">
        <p className="startingLocations__eyebrow">The Long Dark</p>
        <h1 id="starting-locations-title">Starting locations</h1>
        <p className="startingLocations__lead">
          For advanced Misery and Interloper players: you begin with no matches, so your first challenge is getting oriented quickly. Use the opening scene to identify your starting location, match it to the map, and find the nearest guaranteed source of matches.
        </p>

        {error && <p role="alert">Starting location data could not be loaded.</p>}
        {!groups && !error && <p role="status">Loading starting locations…</p>}
        {groups && groups.length === 0 && <p>No starting-location PNG pairs have been added yet.</p>}

        {misery.length > 0 && <ModeTable mode="Misery" groups={misery} />}
        {interloper.length > 0 && <ModeTable mode="Interloper" groups={interloper} />}
      </div>
    </section>
  )
}
