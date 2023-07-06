import { createClient } from '@supabase/supabase-js'
import { Typography, Box, Alert, Stack, IconButton } from '@mui/material'
import { styled } from '@mui/system'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import CloseIcon from 'public/images/close.svg'

const TempWarningMsg: React.FC = () => {
  const [isShowGeneralMsg, setIsShowGeneralMsg] = useState(false)
  const [isShowWarnMsg, setIsShowWarnMsg] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const getNoticeMsg = async () => {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

      try {
        const { data, error } = await supabase
          .from('notices')
          .select()
          .eq('channel', 'liquidity')
          .eq('show', true)

        console.log('data', data)

        data?.forEach((item) => {
          if (item.is_general) {
            setIsShowGeneralMsg(true)
          } else {
            setIsShowWarnMsg(true)
          }
          setMessage(item.message)
        })
      } catch (e) {
        console.error(e)
      }
    }
    getNoticeMsg()
  }, [])

  return (
    <StackWrapper direction='column'>
      {isShowGeneralMsg &&
        <InfoStack severity="info" action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              setIsShowGeneralMsg(false);
            }}
          >
            <Image src={CloseIcon} />
          </IconButton>
        }>
          <Box ml='10px'><Typography variant='p'>{message}</Typography></Box>
        </InfoStack>
      }
      {isShowWarnMsg &&
        <WarningStack severity='warning' action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              setIsShowWarnMsg(false);
            }}
          >
            <Image src={CloseIcon} />
          </IconButton>
        }>
          <Box ml='10px'><Typography variant='p'>{message}</Typography></Box>
        </WarningStack>
      }
    </StackWrapper>
  )
}

const StackWrapper = styled(Stack)`
  position: fixed;
  top: 10px;
  left: calc(50% - 200px);
  z-index: 9999999;
`
const InfoStack = styled(Alert)`
  width: 360px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  line-height: 1.15;
  padding: 4px 10px;
  padding-right: 20px;
  background-color: ${(props) => props.theme.boxes.darkBlack};
  color: ${(props) => props.theme.palette.text.secondary};
  border: 1px solid ${(props) => props.theme.palette.info.main};
`
const WarningStack = styled(InfoStack)`
  border: 1px solid ${(props) => props.theme.palette.warning.main};
`

export default TempWarningMsg
