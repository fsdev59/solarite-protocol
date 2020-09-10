import { useCallback } from 'react'

import { useWallet } from 'use-wallet'

import { delegate } from '../solariteUtils'
import useSolarite from './useSolarite'

const useDelegate = (address?: string) => {
  const { account } = useWallet()
  const solarite = useSolarite()

  const handleDelegate = useCallback(async () => {
    const txHash = await delegate(solarite ,address || account, account)
    console.log(txHash)
  }, [account, address])

  return { onDelegate: handleDelegate }
}

export default useDelegate