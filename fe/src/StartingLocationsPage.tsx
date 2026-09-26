import { Link } from 'react-router-dom'
import { useStartingLocations, type StartingLocationGroup } from './startingLocations'

function GroupTable({ group }: { group: StartingLocationGroup }) {
  return (
    <section className="startingLocations__indexSection" aria-labelledby={`${group.mode}-index-title`}>
      <p className="startingLocations__label">{group.mode}</p>
      <h2 id={`${group.mode}-index-title`}>{group.mode === 'misery' ? group.title : 'Possible starting regions'}</h2>
      <p className="startingLocations__indexDescription">
        {group.starting_locations.length} starting location{group.starting_locations.length === 1 ? '' : 's'}.
      </p>
      <Link className="startingLocations__indexLink" to={`/starting-locations/${group.mode}/${group.region}`}>
        Open {group.title} <span aria-hidden="true">→</span>
      </Link>
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
        <p className="startingLocations__lead">Starting location(s)</p>

        {error && <p role="alert">Starting location data could not be loaded.</p>}
        {!groups && !error && <p role="status">Loading starting locations…</p>}
        {groups && groups.length === 0 && <p>No starting-location PNG pairs have been added yet.</p>}

        {misery.map((group) => <GroupTable key={`${group.mode}/${group.region}`} group={group} />)}
        {interloper.length > 0 && (
          <section className="startingLocations__indexSection" aria-labelledby="interloper-index-title">
            <p className="startingLocations__label">Interloper</p>
            <h2 id="interloper-index-title">Possible starting regions</h2>
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
                  {interloper.map((group) => (
                    <tr key={`${group.mode}/${group.region}`}>
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
        )}
      </div>
    </section>
  )
}
