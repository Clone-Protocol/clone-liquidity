import { Typography, Box, Stack, IconButton } from '@mui/material'
import { styled } from '@mui/system'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import CloseIcon from 'public/images/close.svg'
import { Info, Warning } from '@mui/icons-material';
import { fetchFromSupabaseNotice } from '~/utils/fetch_netlify';

interface NoticeItem {
  is_general: boolean
  message: string
}
const TempWarningMsg: React.FC = () => {
  const [isShowGeneralMsg, setIsShowGeneralMsg] = useState(false)
  const [isShowWarnMsg, setIsShowWarnMsg] = useState(false)
  const [generalMsg, setGeneralMsg] = useState('')
  const [warnMsg, setWarnMsg] = useState('')

  useEffect(() => {
    const getNoticeMsg = async () => {
      const response = await fetchFromSupabaseNotice()
      const data = response.data

      data?.forEach((item: NoticeItem) => {
        if (item.is_general) {
          setIsShowGeneralMsg(true)
          setGeneralMsg(item.message)
        } else {
          setIsShowWarnMsg(true)
          setWarnMsg(item.message)
        }
      })
    }
    getNoticeMsg()
  }, [])

  const CloseButton = ({ onClick }: { onClick: () => void }) => {
    return (
      <IconButton
        aria-label="close"
        color="inherit"
        size="small"
        onClick={onClick}
      >
        <Image src={CloseIcon} />
      </IconButton>
    )
  }

  return (
    <StackWrapper direction='column'>
      {isShowGeneralMsg &&
        <InfoStack>
          <Box></Box>
          <Stack direction='row' alignItems='center'>
            <Info />
            <Box ml='10px'><Typography variant='p' dangerouslySetInnerHTML={{ __html: generalMsg }} /></Box>
          </Stack>

          <CloseButton onClick={() => {
            setIsShowGeneralMsg(false);
          }} />
        </InfoStack>
      }
      {isShowWarnMsg &&
        <WarningStack>
          <Box></Box>
          <Stack direction='row' alignItems='center'>
            <Warning />
            <Box ml='10px'><Typography variant='p' dangerouslySetInnerHTML={{ __html: warnMsg }} /></Box>
          </Stack>

          <CloseButton onClick={() => {
            setIsShowWarnMsg(false);
          }} />
        </WarningStack>
      }
    </StackWrapper>
  )
}

const StackWrapper = styled(Stack)`
  width: 100%;
`
const InfoStack = styled(Box)`
  width: 100%;
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: 1;
  padding-right: 20px;
  font-size: 14px;
  background-color: #3ddef4;
  color: #000000;
  & .MuiAlert-icon {
    color: #000000;
  }
`
const WarningStack = styled(InfoStack)`
background-color: ${(props) => props.theme.palette.warning.main};
`

export default TempWarningMsg
