import { Typography, Box, Stack, IconButton } from '@mui/material'
import { styled } from '@mui/system'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import CloseIcon from 'public/images/close.svg'
import { Info, Warning } from '@mui/icons-material';
import { fetchFromSupabaseNotice, fetchFromSupabasePyth } from '~/utils/fetch_netlify';
import { useAtomValue } from 'jotai';
import { showPythBanner } from '~/features/globalAtom';

interface NoticeItem {
  is_general: boolean
  message: string
}
const TempWarningMsg: React.FC = () => {
  const showPythBannerStatus = useAtomValue(showPythBanner)
  const [isShowGeneralMsg, setIsShowGeneralMsg] = useState(false)
  const [isShowWarnMsg, setIsShowWarnMsg] = useState(true)
  const [generalMsg, setGeneralMsg] = useState('')
  const [warnMsg, setWarnMsg] = useState('Clone is shutting down on September 30th, 2024. Please visit our docs for details.')

  // useEffect(() => {
  //   const getNoticeMsg = async () => {
  //     const response = await fetchFromSupabaseNotice()
  //     const data = response.data

  //     data?.forEach((item: NoticeItem) => {
  //       if (item.is_general) {
  //         setIsShowGeneralMsg(true)
  //         setGeneralMsg(item.message)
  //       } else {
  //         setIsShowWarnMsg(true)
  //         setWarnMsg(item.message)
  //       }
  //     })
  //   }
  //   getNoticeMsg()
  // }, [])

  // useEffect(() => {
  //   const getNoticeMsg = async () => {
  //     const response = await fetchFromSupabasePyth()
  //     const data = response.data
  //     if (data.length > 0) {
  //       setWarnMsg('Oracle error is detected. Number of pools maybe temporarily frozen.')
  //       setIsShowWarnMsg(true)
  //     }
  //   }

  //   if (showPythBannerStatus) {
  //     getNoticeMsg()
  //   }
  // }, [showPythBannerStatus])

  const CloseButton = ({ onClick }: { onClick: () => void }) => {
    return (
      <IconButton
        aria-label="close"
        color="default"
        style={{ color: '#000' }}
        size="small"
        onClick={onClick}
      >
        <Image src={CloseIcon} alt='close' />
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
        <a href='https://cloneprotocol.medium.com/6ff85310b458' target="_blank">
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
        </a>
      }
    </StackWrapper>
  )
}

const StackWrapper = styled(Stack)`
  width: 100%;
`
const InfoStack = styled(Box)`
  width: 100%;
  height: 25px;
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
