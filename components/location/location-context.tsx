'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface LocationInfo {
  id: string
  locality_code: string
  name: string
  district_name?: string
  block_name?: string
  state_name?: string
}

interface LocationContextType {
  selectedLocation: LocationInfo | null
  setSelectedLocation: (loc: LocationInfo | null) => void
}

const LocationContext = createContext<LocationContextType>({
  selectedLocation: null,
  setSelectedLocation: () => {},
})

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null)
  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  return useContext(LocationContext)
}
