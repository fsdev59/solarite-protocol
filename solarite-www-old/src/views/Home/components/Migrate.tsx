import React, { useCallback, useEffect, useMemo, useState } from 'react'

import numeral from 'numeral'
import Countdown, { CountdownRenderProps} from 'react-countdown'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Separator from '../../../components/Separator'
import Spacer from '../../../components/Spacer'
import Value from '../../../components/Value'

import { solarite as solariteAddress } from '../../../constants/tokenAddresses'

import useAllowance from '../../../hooks/useAllowance'
import useApprove from '../../../hooks/useApprove'
import useScalingFactor from '../../../hooks/useScalingFactor'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useSolarite from '../../../hooks/useSolarite'

import { bnToDec } from '../../../utils'
import { getContract } from '../../../utils/erc20'
import { getMigrationEndTime, migrate } from '../../../solariteUtils'

const Migrate: React.FC = () => {

  const [migrationEndDate, setMigrationEndDate] = useState<Date>()
  const [migrateButtonDisabled, setMigrateButtonDisabled] = useState(false)
  const [approvalDisabled, setApprovalDisabled] = useState(false)

  const { account, ethereum } = useWallet()
  const scalingFactor = useScalingFactor()
  const solarite = useSolarite()

  const solariteV1Balance = bnToDec(useTokenBalance(solariteAddress))
  const solariteV2ReceiveAmount = solariteV1Balance / scalingFactor

  const solariteV1Token = useMemo(() => {
    return getContract(ethereum as provider, solariteAddress)
  }, [ethereum])

  const migrationContract = solarite ? (solarite as any).contracts.solariteV2migration : undefined
  const allowance = useAllowance(solariteV1Token, migrationContract)
  const { onApprove } = useApprove(solariteV1Token, migrationContract)
  
  const countdownRenderer = useCallback((countdownProps: CountdownRenderProps) => {
    const { days, hours, minutes, seconds } = countdownProps
    const paddedDays = days < 10 ? `0${days}` : days
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <StyledCountdown>{paddedDays}:{paddedHours}:{paddedMinutes}:{paddedSeconds}</StyledCountdown>
    )
  }, [])

  const handleMigrate = useCallback(async () => {
    try {
      setMigrateButtonDisabled(true)
      await migrate(solarite, account)
      setMigrateButtonDisabled(false)
    } catch (e) {
      setMigrateButtonDisabled(false)
    }
  }, [account, solarite, setMigrateButtonDisabled])

  useEffect(() => {
    async function fetchMigrationEndDate () {
      try {
        const endTimestamp: number = await getMigrationEndTime(solarite)
        setMigrationEndDate(new Date(endTimestamp * 1000))
      } catch (e) { console.log(e) }
    }
    if (solarite) {
      fetchMigrationEndDate()
    }
  }, [solarite, setMigrationEndDate])

  useEffect(() => {
    if (!account || !solariteV1Balance) {
      setMigrateButtonDisabled(true)
    }
    if (account && solariteV1Balance) {
      setMigrateButtonDisabled(false)
    }
  }, [account, setMigrateButtonDisabled, solariteV1Balance])

  const handleApprove = useCallback(async () => {
    setApprovalDisabled(true)
    try {
      await onApprove()
      setApprovalDisabled(false)
    } catch (e) {
      setApprovalDisabled(false)
    }
  }, [setApprovalDisabled, onApprove])

  return (
    <StyledMigrateWrapper>
      <Card>
        <CardContent>
          <div style={{ margin: '0 auto' }}>
            <StyledCountdownWrapper>
              {migrationEndDate ? (
                <Countdown
                  date={migrationEndDate}
                  renderer={countdownRenderer}
                />
              ) : <Value value="--" />}
              <Label text="Migration Deadline" />
            </StyledCountdownWrapper>
          </div>
          <Spacer size="lg" />
          <StyledBalances>
            <StyledBalance>
              <Value value={solariteV1Balance ? numeral(solariteV1Balance).format('0.00a') : '--'} />
              <Label text="Burn SOLARITEV1" />
            </StyledBalance>
            <div style={{ alignSelf: 'stretch' }}>
            <Separator orientation="vertical" />
            </div>
            <StyledBalance>
              <Value value={solariteV2ReceiveAmount ? numeral(solariteV2ReceiveAmount).format('0.00a') : '--'} />
              <Label text="Mint SOLARITEV2" />
            </StyledBalance>
          </StyledBalances>
          <Spacer size="lg" />
          {account && !allowance.toNumber() ? (
            <Button
              disabled={approvalDisabled}
              onClick={handleApprove}
              text="Approve V2 Migration"
            />
          ) : (
            <Button
              disabled={migrateButtonDisabled}
              onClick={handleMigrate}
              text="Migrate to V2"
            />
          )}
          <Spacer />
          <StyledWarning>WARNING: Burning your SOLARITEV1 tokens for SOLARITEV2 tokens is a permanent action.</StyledWarning>
        </CardContent>
      </Card>
    </StyledMigrateWrapper>
  )
}

const StyledBalances = styled.div`
  display: flex;
`

const StyledBalance = styled.div`
  flex: 1;
  text-align: center;
`

const StyledCountdownWrapper = styled.div`
  text-align: center;
`
const StyledCountdown = styled.div`
  color: ${props => props.theme.color.primary.main};
  font-size: 36px;
  font-weight: 700;
`

const StyledMigrateWrapper = styled.div`
  align-items: center;
  display: flex;
`

const StyledWarning = styled.div`
  color: ${props => props.theme.color.primary.main};
  font-size: 12px;
  text-align: center;
`

export default Migrate