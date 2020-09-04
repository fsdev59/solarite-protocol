import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'

import { bnToDec, decToBn } from '../utils'
import { getScalingFactor } from '../solariteUtils'

import useSolarite from './useSolarite'

const useScalingFactor = () => {
  const [scalingFactor, setScalingFactor] = useState(decToBn(1))
  const solarite = useSolarite()

  useEffect(() => {
    async function fetchScalingFactor () {
      const sf = await getScalingFactor(solarite)
      setScalingFactor(sf)
    }
    if (solarite) {
      fetchScalingFactor()
    }
  }, [solarite])

  return bnToDec(scalingFactor)
}

export default useScalingFactor