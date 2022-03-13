import React, { useEffect, useState } from 'react'
import { Grid, Box, Stack, Divider, Button } from '@mui/material'
import { styled } from '@mui/system'
import PositionInfo from '~/components/Liquidity/comet/PositionInfo'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { PositionInfo as PI, fetchCometDetail } from '~/web3/MyLiquidity/CometPosition'

const ClosePanel = () => {
  const { publicKey } = useWallet()
  const { getInceptApp } = useIncept()
  const [positionInfo, setPositionInfo] = useState<PI>()

  useEffect(() => {
    const program = getInceptApp()

    async function fetch() {
      const data = await fetchCometDetail({
        program,
        userPubKey: publicKey,
      })
      if (data) {
        setPositionInfo(data)
      }
    }
    fetch()
  }, [publicKey])

  const onClose = () => {
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <PositionInfo positionInfo={positionInfo} />
      </Grid>
      <Grid item xs={12} md={8}>
        <Box sx={{ padding: '30px' }}>
          <Stack direction="row" justifyContent="space-between">
            <DetailHeader>Collateral</DetailHeader>
            <DetailValue>80,450.86 USDC</DetailValue>
          </Stack>
          <Stack sx={{ marginTop: '10px' }} direction="row" justifyContent="space-between">
            <DetailHeader>ILD</DetailHeader>
            <DetailValue>450.87 USDC</DetailValue>
          </Stack>
          <Stack sx={{ marginTop: '30px' }} direction="row" justifyContent="space-between">
            <DetailHeader>Withdraw amount</DetailHeader>
            <DetailValue>79,999.98 USDC</DetailValue>
          </Stack>
          <StyledDivider />
          <ActionButton onClick={onClose}>Close</ActionButton>
        </Box>
      </Grid>
    </Grid>
  )
}

const StyledDivider = styled(Divider)`
  background-color: #535353;
  margin-bottom: 39px;
  margin-top: 39px;
  height: 1px;
`

const DetailHeader = styled('div')`
  font-size: 14px;
  font-weight: 500;
  color: #989898;
`

const DetailValue = styled('div')`
  font-size: 14px;
  font-weight: 500;
  color: #fff;
`

const ActionButton = styled(Button)`
  width: 100%;
  background: #7d7d7d;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
`

export default ClosePanel