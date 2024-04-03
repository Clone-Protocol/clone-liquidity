import { Box, Typography, Dialog } from '@mui/material'
import { styled } from '@mui/material/styles'
import StarsIcon from 'public/images/stars.svg'
import { CloseButton } from '../Common/CommonButtons'
import { FadeTransition } from '~/components/Common/Dialog'
import Image from 'next/image'
// import RocketPromoteIcon from 'public/images/points-rocket.svg'
// import Image from 'next/image'

const ReferralTextDialog = ({ referralStatus, open, handleClose }: { referralStatus: number, open: boolean, handleClose: () => void }) => {
  // const [addedOut, setAddedOut] = useState('')
  // const close = () => {
  //   setAddedOut('out')
  //   setTimeout(() => {
  //     onClose && onClose()
  //   }, 1000)
  // }

  return (
    // <AnimWrapper className={addedOut}>
    <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition}>
      <BoxWrapper sx={{ width: { xs: '100%', md: '400px' }, paddingTop: { xs: '30px', md: '20px' } }}>
        <Image src={StarsIcon} alt='star' />
        <Typography variant='p_lg'>
          {referralStatus === 0 ? 'You are successfully referred!' :
            referralStatus === 1 ? 'Only new users can be referred!' :
              referralStatus === 2 ? 'You have already been referred!' :
                referralStatus === 3 ? 'Invalid referral link' : 'You can’t refer yourself'
          }</Typography>
        <Box sx={{ position: 'absolute', right: '10px', top: '10px' }}>
          <CloseButton handleClose={() => handleClose()} />
        </Box>
      </BoxWrapper>
    </Dialog>
    // </AnimWrapper>
  )
}

const BoxWrapper = styled(Box)`
  position: relative;
  height: 101px;
  color: #fff; 
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  text-align: center;
  border-radius: 10px;
  background-color: ${(props) => props.theme.basis.darkNavy};
  padding: 20px;
  z-index: 99999;
`

export default ReferralTextDialog

