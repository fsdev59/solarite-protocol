import { useCallback } from 'react'

import { useWallet } from 'use-wallet'
import { Solarite } from '../solarite'
import { rebase } from '../solariteUtils'

import useSolarite from '../hooks/useSolarite'

const useRebase = () => {
  const { account } = useWallet()
  const solarite = useSolarite()

  const handleRebase = useCallback(async () => {
    const txHash = await rebase(solarite, account)
    console.log(txHash)
  }, [account, solarite])

  return { onRebase: handleRebase }
}

export default useRebase