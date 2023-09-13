import React, { useState } from 'react'
import { Box, styled, Stack, Dialog, DialogContent, Typography } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import { FadeTransition } from '~/components/Common/Dialog'
import { useLiquidityDetailQuery } from '~/features/MyLiquidity/comet/LiquidityPosition.query'
import SelectedPoolBox from '~/components/Liquidity/comet/SelectedPoolBox'
import { StyledTab, StyledTabs, TabPanelForEdit } from '~/components/Common/StyledTab'
import Liquidity from './manage-liquidity/Liquidity'
import IldEdit from './manage-liquidity/IldEdit'
import Rewards from './manage-liquidity/Rewards'
import ClosePosition from './manage-liquidity/ClosePosition'

const EditLiquidityDialog = ({ open, positionIndex, poolIndex, onShowCloseLiquidity, onRefetchData, handleClose }: { open: boolean, positionIndex: number, poolIndex: number, onShowCloseLiquidity: () => void, onRefetchData: () => void, handleClose: () => void }) => {
  const { publicKey } = useWallet()
  const [tab, setTab] = useState(0) // 0 : liquidity , 1: ild , 2: rewards , 3: close position
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }
  const { data: positionInfo, refetch } = useLiquidityDetailQuery({
    userPubKey: publicKey,
    index: poolIndex,
    refetchOnMount: true,
    enabled: open && publicKey != null,
  })

  return positionInfo ? (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={600}>
        <DialogContent sx={{ backgroundColor: '#000916' }}>
          <BoxWrapper>
            <Box mb='5px'>
              <Typography variant='h3'>Manage Liquidity</Typography>
            </Box>

            <Box>
              <SelectedPoolBox positionInfo={positionInfo} />

              <Box my='38px' sx={{ backgroundColor: '#1a1c28' }}>
                <StyledTabs value={tab} onChange={handleChangeTab}>
                  <StyledTab value={0} label="Liquidity" />
                  <StyledTab value={1} label="ILD" />
                  <StyledTab value={2} label="Rewards" />
                  <StyledTab value={3} label="Close Position" />
                </StyledTabs>
              </Box>

              <TabPanelForEdit value={tab} index={0}>
                <Liquidity
                  positionInfo={positionInfo}
                  positionIndex={positionIndex}
                  poolIndex={poolIndex}
                  onShowCloseLiquidity={onShowCloseLiquidity}
                  onRefetchData={() => {
                    refetch()
                    onRefetchData()
                  }}
                  handleClose={handleClose} />
              </TabPanelForEdit>
              <TabPanelForEdit value={tab} index={1}>
                <IldEdit />
              </TabPanelForEdit>
              <TabPanelForEdit value={tab} index={2}>
                <Rewards />
              </TabPanelForEdit>
              <TabPanelForEdit value={tab} index={3}>
                <ClosePosition />
              </TabPanelForEdit>

              {/* <Typography variant='p_lg'>Liquidity Amount</Typography>
              <Box mt='25px'>
                <EditLiquidityRatioSlider min={0} max={100} ratio={mintRatio} currentRatio={defaultMintRatio} positionInfo={positionInfo} totalLiquidity={totalLiquidity} mintAmount={mintAmount} currentMintAmount={defaultMintAmount} maxMintable={maxMintable} onChangeRatio={handleChangeMintRatio} onChangeAmount={handleChangeMintAmount} />
              </Box>

              {mintRatio > 0 ?
                <BoxWithBorder>
                  <Stack direction='row' justifyContent='space-between' alignItems="center" padding='15px'>
                    <Typography variant='p'>New Liquidity Value</Typography>
                    <Box>
                      <Typography variant='p_lg'>${totalLiquidity.toLocaleString()}</Typography>
                      <Typography variant='p_lg' ml='9px' sx={differentLiquidityVal >= 0 ? { color: '#4fe5ff' } : { color: '#ff0084' }}>
                        {differentLiquidityVal >= 0 ? '+' : '-'}${differentLiquidityVal.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </BoxWithBorder>
                :
                <Box>
                  <BoxWithBorder padding='15px 18px' maxWidth='420px' lineHeight={1}>
                    <Typography variant='p'>Liquidity shouldn’t be at 0%. If you would like to close this position, please click on the button below.</Typography>
                  </BoxWithBorder>
                  <SubmitButton onClick={onShowCloseLiquidity}>Open Close Liquidity Position Workflow</SubmitButton>
                </Box>
              }
            </Box>

            <Box mt='38px'>
              {mintRatio > 0 ?
                <CometHealthBox padding='15px 20px'>
                  <Box display='flex' justifyContent='center'>
                    <Typography variant='p'>Projected Comet Health Score <InfoTooltip title={TooltipTexts.projectedHealthScore} color='#66707e' /></Typography>
                  </Box>
                  <Box mt='10px' display='flex' justifyContent='center'>
                    <HealthscoreView score={healthScore ? healthScore : positionInfo.totalHealthScore} />
                  </Box>
                </CometHealthBox>
                :
                <CometHealthBox padding='36px 20px' display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                  <Image src={IconHealthScoreGraph} alt='healthscore' />
                  <Box mt='7px'>
                    <Typography variant='p' color='#414e66'>Projected health score unavailable</Typography>
                  </Box>
                </CometHealthBox>
              }

              <SubmitButton onClick={handleSubmit(onEditLiquidity)} disabled={!(isValid && validMintAmount) || isSubmitting || mintRatio === 0}>
                <Typography variant='p_xlg'>Adjust Liquidity</Typography>
              </SubmitButton> */}
            </Box>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  ) : <></>
}

const BoxWrapper = styled(Box)`
  width: 600px;
  padding: 8px 18px; 
  color: #fff;
  overflow-x: hidden;
`

export default EditLiquidityDialog

