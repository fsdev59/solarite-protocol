import { Solarite } from '../../solarite'

import { bnToDec } from '../../utils'

import {
  getCurrentPrice as gCP,
  getTargetPrice as gTP,
  getCirculatingSupply as gCS,
  getNextRebaseTimestamp as gNRT,
  getTotalSupply as gTS,
  getScalingFactor,
} from '../../solariteUtils'

const getCurrentPrice = async (solarite: typeof Solarite): Promise<number> => {
  // FORBROCK: get current SOLARITE price
  return gCP(solarite)
}

const getTargetPrice = async (solarite: typeof Solarite): Promise<number> => {
  // FORBROCK: get target SOLARITE price
  return gTP(solarite)
}

const getCirculatingSupply = async (solarite: typeof Solarite): Promise<string> => {
  // FORBROCK: get circulating supply
  return gCS(solarite)
}

const getNextRebaseTimestamp = async (solarite: typeof Solarite): Promise<number> => {
  // FORBROCK: get next rebase timestamp
  const nextRebase = await gNRT(solarite) as number
  return nextRebase * 1000
}

const getTotalSupply = async (solarite: typeof Solarite): Promise<string> => {
  // FORBROCK: get total supply
  return gTS(solarite)
}

export const getStats = async (solarite: typeof Solarite) => {
  const curPrice = await getCurrentPrice(solarite)
  const circSupply = '' // await getCirculatingSupply(solarite)
  const nextRebase = await getNextRebaseTimestamp(solarite)
  const rawScalingFactor = await getScalingFactor(solarite)
  const scalingFactor = Number(bnToDec(rawScalingFactor).toFixed(2))
  const targetPrice = await getTargetPrice(solarite)
  const totalSupply = await getTotalSupply(solarite)
  return {
    circSupply,
    curPrice,
    nextRebase,
    scalingFactor,
    targetPrice,
    totalSupply
  }
}
