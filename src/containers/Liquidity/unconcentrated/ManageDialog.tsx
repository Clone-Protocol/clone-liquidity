import React, { useState } from 'react'
import { Box, styled, Dialog, DialogContent, Typography } from '@mui/material'
import Image from 'next/image'
import { PoolList } from '~/features/MyLiquidity/UnconcentratedPools.query'
import { FadeTransition } from '~/components/Common/Dialog'
import { StyledDivider } from '~/components/Common/StyledDivider'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import { TabPanelForEdit, StyledTabs, StyledTab } from '~/components/Common/StyledTab'
import DepositMoreOnIcon from 'public/images/add-liquidity-icon-on.svg'
import DepositMoreOffIcon from 'public/images/add-liquidity-icon-off.svg'
import WithdrawOnIcon from 'public/images/withdraw-liquidity-icon-on.svg'
import WithdrawOffIcon from 'public/images/withdraw-liquidity-icon-off.svg'
import DepositPanel from './DepositPanel'
import WithdrawPanel from './WithdrawPanel'

const ManageDialog = ({ assetId, pool, open, handleClose }: { assetId: string, pool: PoolList, open: boolean, handleClose: () => void }) => {
  const [tab, setTab] = useState(0)
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={500}>
        <DialogContent sx={{ backgroundColor: '#1b1b1b' }}>
          <BoxWrapper>
            <Box mb='5px'>
              <Typography variant='p_xlg'>Manage Unconcentrated Liquidity Position</Typography>
            </Box>

            <StyledTabs value={tab} onChange={handleChangeTab}>
              <StyledTab value={0} label="Deposit more" icon={tab === 0 ? <Image src={DepositMoreOnIcon} /> : <Image src={DepositMoreOffIcon} />}></StyledTab>
              <StyledTab value={1} label="Withdraw" icon={tab === 1 ? <Image src={WithdrawOnIcon} /> : <Image src={WithdrawOffIcon} />}></StyledTab>
            </StyledTabs>
            <StyledDivider />

            <Box>
              <TabPanelForEdit value={tab} index={0}>
                <DepositPanel
                  assetId={assetId}
                  pool={pool}
                  handleClose={handleClose}
                />
              </TabPanelForEdit>
              <TabPanelForEdit value={tab} index={1}>
                <WithdrawPanel
                  assetId={assetId}
                  handleClose={handleClose}
                />
              </TabPanelForEdit>
            </Box>

            <Box display='flex' justifyContent='center'>
              <DataLoadingIndicator />
            </Box>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}

const BoxWrapper = styled(Box)`
  color: #fff;
  overflow-x: hidden;
`

export default ManageDialog
