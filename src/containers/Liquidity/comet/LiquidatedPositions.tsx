import { Box, Button, Grid, Divider, styled } from "@mui/material"
import LiquidatedPositionRow from "~/components/Liquidity/LiquidatedPositionRow"
import Image from 'next/image'
import ArrowUpIcon from 'public/images/arrow-up.svg'
import ArrowDownIcon from 'public/images/arrow-down.svg'
import { useState } from "react"

const LiquidityPositions = () => {

  const [showArea, setShowArea] = useState(true)

  const positionInfo = {
    tickerIcon: '/images/assets/USDi.png',
    tickerName: 'USD Coin',
    tickerSymbol: 'USDC',
    claimableAmount: 110
  }

  return (
    <Box sx={{ padding: '16px 36px', borderRadius: '10px', backgroundColor: 'rgba(21, 22, 24, 0.75)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#fff', marginTop: '5px' }}>Remainder of liquidated positions</div>
        <Box display='flex'>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#989898', margin: '6px 10px', cursor: 'pointer' }} onClick={() => setShowArea(!showArea)}>
            {showArea ? (<><Image src={ArrowUpIcon} /> Minimize</>) : (<><Image src={ArrowDownIcon} /> Expand</>) }
          </div>
          <ClaimAllButton>Claim All</ClaimAllButton>
        </Box>
      </Box>
      {showArea && (
        <>
          <StyledDivider />
          <Grid container spacing={2}>
            <Grid item xs={6} sx={{ padding: '15px' }}>
              <LiquidatedPositionRow positionInfo={positionInfo} hasHeader={true} />
            </Grid>
            <Grid item xs={6} sx={{ padding: '15px' }}>
              <LiquidatedPositionRow positionInfo={positionInfo} hasHeader={true} />
            </Grid>
          </Grid>
        </>
        )
      }
    </Box>
  )
}

const ClaimAllButton = styled(Button)`
  width: 83px;
  height: 26px;
  flex-grow: 0;
  padding: 4px 0;
  border-radius: 10px;
  border: solid 1px #809cff;
  background-color: #000;
  font-size: 10px;
  font-weight: 500;
  color: #fff;
  &:disabled {
    background-color: #444;
    color: #adadad;
  } 
`

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-top: 5px;
	height: 1px;
`

export default LiquidityPositions