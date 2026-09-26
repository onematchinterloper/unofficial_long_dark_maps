import { useEffect, useState } from 'react'

export type StartingLocation = {
  id: number
  screenshot?: string
  map?: string
  description?: string
}

export type StartingLocationGroup = {
  mode: 'misery' | 'interloper'
  region: string
  title: string
  starting_locations: StartingLocation[]
}

export function useStartingLocations() {
  const [groups, setGroups] = useState<StartingLocationGroup[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}assets/js/starting-locations.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`starting-locations.json HTTP ${response.status}`)
        return response.json() as Promise<StartingLocationGroup[]>
      })
      .then((value) => {
        if (!cancelled) setGroups(value)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { groups, error }
}
