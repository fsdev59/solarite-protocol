import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from "web3-eth-contract"

import { getStaked } from '../solariteUtils'
import useSolarite from './useSolarite'

const useStakedBalance = (pool: Contract) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string } = useWallet()
  const solarite = useSolarite()

  const fetchBalance = useCallback(async () => {
    const balance = await getStaked(solarite, pool, account)
    setBalance(new BigNumber(balance))
  }, [account, pool, solarite])

  useEffect(() => {
    if (account && pool && solarite) {
      fetchBalance()
    }
  }, [account, pool, setBalance, solarite])

  return balance
}

export default useStakedBalance