import React, { useState } from 'react'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { Box, Dialog, DialogContent} from '@mui/material'
import { SliderTransition } from '~/components/Common/Dialog'

const AddPositionDialog = ({ open, handleClose }:  { open: any, handleClose: any }) => {
  const [loading, setLoading] = useState(false)
  
  return (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '20px 15px' }}>
          <Box sx={{ padding: '8px 28px', color: '#fff' }}>
            AddPosition
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddPositionDialog

