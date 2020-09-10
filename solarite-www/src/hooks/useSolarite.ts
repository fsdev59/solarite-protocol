import { useContext } from 'react'
import { Context } from '../contexts/SolariteProvider'

const useSolarite = () => {
  const { solarite } = useContext(Context)
  return solarite
}

export default useSolarite