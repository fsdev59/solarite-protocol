import { useContext } from 'react'

import { useWallet } from 'use-wallet'

import { Context as FarmsContext } from '../contexts/Farms'
import { bnToDec } from '../utils'
import { getEarned } from '../solariteUtils'

import useFarms from './useFarms'
import useSolarite from './useSolarite'

const useUnharvested = () => {
  const { unharvested } = useContext(FarmsContext)
  return unharvested
}

export default useUnharvested