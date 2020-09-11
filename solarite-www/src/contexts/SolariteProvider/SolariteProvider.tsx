import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Solarite } from '../../solarite'

export interface SolariteContext {
  solarite?: typeof Solarite
}

export const Context = createContext<SolariteContext>({
  solarite: undefined,
})

declare global {
  interface Window {
    solaritesauce: any
  }
}

const SolariteProvider: React.FC = ({ children }) => {
  const { ethereum } = useWallet()
  const [solarite, setSolarite] = useState<any>()

  useEffect(() => {
    if (ethereum) {
      const solariteLib = new Solarite(
        ethereum,
        "1",
        false, {
          defaultAccount: "",
          defaultConfirmations: 1,
          autoGasMultiplier: 1.5,
          testing: false,
          defaultGas: "12000000",
          defaultGasPrice: "1000000000000",
          accounts: [],
          ethereumNodeTimeout: 10000
        }
      )
      setSolarite(solariteLib)
      window.solaritesauce = solariteLib
    }
  }, [ethereum])

  return (
    <Context.Provider value={{ solarite }}>
      {children}
    </Context.Provider>
  )
}

export default SolariteProvider
