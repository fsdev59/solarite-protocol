import React, { useCallback, useEffect, useState } from 'react'

import useSolarite from '../../hooks/useSolarite'
import { getProposals } from '../../solariteUtils'

import Context from './context'
import { Proposal } from './types'


const Proposals: React.FC = ({ children }) => {

  const [proposals, setProposals] = useState<Proposal[]>([])
  const solarite = useSolarite()
  
  const fetchProposals = useCallback(async () => {
    const propsArr: Proposal[] = await getProposals(solarite)

    setProposals(propsArr)
  }, [solarite, setProposals])

  useEffect(() => {
    if (solarite) {
      fetchProposals()
    }
  }, [solarite, fetchProposals])

  return (
    <Context.Provider value={{ proposals }}>
      {children}
    </Context.Provider>
  )
}

export default Proposals
