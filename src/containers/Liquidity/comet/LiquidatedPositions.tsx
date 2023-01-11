import { Box, Button, Grid, Divider, styled } from "@mui/material"
import LiquidatedPositionRow from "~/components/Liquidity/LiquidatedPositionRow"
import Image from 'next/image'
import ArrowUpIcon from 'public/images/arrow-up.svg'
import ArrowDownIcon from 'public/images/arrow-down.svg'
import { useState } from "react"

const LiquidatedPositions = ({ ltype }: { ltype: number }) => {
  const [showArea, setShowArea] = useState(true)
  const positionInfo = {
    tickerIcon: '/images/assets/USDi.png',
    tickerName: 'USD Coin',
    tickerSymbol: 'USDC',
    claimableAmount: 110
  }

  return (
    <Wrapper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#fff', marginTop: '5px' }}>
          {ltype === 0 ? 'Remainder of liquidated positions' : 'Liquidated positions'}
        </div>
        <Box display='flex'>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#989898', margin: '6px 10px', cursor: 'pointer' }} onClick={() => setShowArea(!showArea)}>
            {showArea ? (<><Image src={ArrowUpIcon} /> Minimize</>) : (<><Image src={ArrowDownIcon} /> Expand</>)}
          </div>
          <ClaimAllButton>Claim All</ClaimAllButton>
        </Box>
      </Box>
      {showArea && (
        <>
          <StyledDivider />
          <Grid container spacing={2}>
            <Grid item xs={6} sx={{ padding: '15px' }}>
              <LiquidatedPositionRow positionInfo={positionInfo} hasHeader={true} ltype={ltype} />
            </Grid>
            <Grid item xs={6} sx={{ padding: '15px' }}>
              <LiquidatedPositionRow positionInfo={positionInfo} hasHeader={true} ltype={ltype} />
            </Grid>
          </Grid>
        </>
      )
      }
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  padding: 16px 36px; 
  border-radius: 10px; 
  background-color: rgba(21, 22, 24, 0.75);
`
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

export default LiquidatedPositions