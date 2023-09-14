import React, { useState } from 'react'
import { Box, styled, Dialog, DialogContent, Typography } from '@mui/material'
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

