import React, { useState } from 'react'
import { Box, styled, Dialog, DialogContent, Typography, Button, MenuItem, Stack, Input } from '@mui/material'
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FadeTransition } from '~/components/Common/Dialog'
import { CloseButton } from '~/components/Common/CommonButtons'
import { IndicatorGreen, IndicatorRed, IndicatorStatus, IndicatorYellow } from './StatusIndicator';
import { useSnackbar } from 'notistack';

const RPCs = [
  'Helius RPC',
  'Quicknode RPC',
  'HelloMoon RPC',
  'Custom'
]
const SettingDialog = ({ open, handleClose }: { open: boolean, handleClose: () => void }) => {
  const { enqueueSnackbar } = useSnackbar()
  const [rpcEndpointIndex, setRpcEndpointIndex] = useState('0')
  const [networkIndex, setNetworkIndex] = useState('devnet')
  const [showCustom, setShowCustom] = useState(false)
  const [errorCustomMsg, setErrorCustomMsg] = useState(false)

  const handleChangeRpcEndpoint = (event: SelectChangeEvent) => {
    setRpcEndpointIndex(event.target.value as string);
    setShowCustom(event.target.value == '3')

    //TODO: showing after rpc is connected
    if (event.target.value != '3') {
      enqueueSnackbar(`Connected to ${RPCs[parseInt(event.target.value)]}`)
    }
  };

  const handleChangeNetwork = (event: SelectChangeEvent) => {
    setNetworkIndex(event.target.value as string);
  };

  const handleChangeCustomRPCUrl = (event: React.ChangeEvent<HTMLInputElement>) => {

  }

  const saveCustomURL = () => {
    try {
      enqueueSnackbar('Connected to Custom RPC')
    } catch (e) {
      enqueueSnackbar('Custom RPC connection failed, please try a different custom RPC URL.')
    }
  }

  const StatusIndicator = ({ status, speed }: { status: IndicatorStatus, speed: number }) => {

    return (
      <Stack direction='row' alignItems='center' gap={1}>
        <Box><Typography variant='p_sm' color='#c5c7d9'>{speed.toFixed(1)}ms</Typography></Box>
        {status === IndicatorStatus.Green ?
          <IndicatorGreen />
          : status === IndicatorStatus.Yellow ?
            <IndicatorYellow />
            :
            <IndicatorRed />
        }
      </Stack>
    )
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={375}>
        <DialogContent sx={{ backgroundColor: '#000', width: '375px' }}>
          <BoxWrapper>
            <Typography variant='h3' fontWeight={500}>App Settings</Typography>
            <Box my='20px'>
              <Box><Typography variant="p_lg">RPC Endpoint</Typography></Box>
              <Box lineHeight={1.1} mb='7px'><Typography variant="p" color="#8988a3">At anytime, choose the fastest RPC for most optimal experience!</Typography></Box>
              <SelectBox
                labelId="rpc-select-label"
                id="rpc-select"
                value={rpcEndpointIndex}
                onChange={handleChangeRpcEndpoint}
                sx={{
                  padding: '0px',
                  '& .MuiSelect-icon': {
                    color: '#fff'
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenu-list': {
                        padding: 0,
                        '&:hover': {
                          backgroundColor: '#000',
                        }
                      },
                      '& .Mui-selected': {
                        backgroundColor: '#000 !important',
                      }
                    }
                  }
                }}
              >
                <SelectMenuItem value={0}><Stack direction='row' alignItems='center' gap={1}><Typography variant='p'>{RPCs[0]}</Typography> <StatusIndicator status={IndicatorStatus.Green} speed={134.1} /></Stack></SelectMenuItem>
                <SelectMenuItem value={1}><Stack direction='row' alignItems='center' gap={1}><Typography variant='p'>{RPCs[1]}</Typography> <StatusIndicator status={IndicatorStatus.Yellow} speed={84.1} /></Stack></SelectMenuItem>
                <SelectMenuItem value={2}><Stack direction='row' alignItems='center' gap={1}><Typography variant='p'>{RPCs[2]}</Typography> <StatusIndicator status={IndicatorStatus.Red} speed={34.1} /></Stack></SelectMenuItem>
                <SelectMenuItem value={3}><Typography variant='p'>{RPCs[3]}</Typography></SelectMenuItem>
              </SelectBox>
              {showCustom &&
                <Box>
                  <StyledInput placeholder="Enter custom RPC URL" disableUnderline onChange={handleChangeCustomRPCUrl} />
                  {errorCustomMsg && <Box><Typography variant='p' color='#ed2525'>Custom RPC Connection Failed. Try different URL.</Typography></Box>}
                  <SaveBtn onClick={saveCustomURL}>Save</SaveBtn>
                </Box>
              }
            </Box>
            <Box my='20px'>
              <Box><Typography variant="p_lg">Network Setting</Typography></Box>
              <Box lineHeight={1.1} mb='7px'><Typography variant="p" color="#8988a3">Choose between Solana mainnet and devnet. Learn more about it <a href="#" target="_blank" style={{ textDecoration: 'underline', color: '#fff' }}>here</a>.</Typography></Box>
              <SelectBox
                labelId="network-select-label"
                id="network-select"
                value={networkIndex}
                onChange={handleChangeNetwork}
                sx={{
                  padding: '0px',
                  '& .MuiSelect-icon': {
                    color: '#fff'
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenu-list': {
                        padding: 0,
                        '&:hover': {
                          backgroundColor: '#000',
                        }
                      },
                      '& .Mui-selected': {
                        backgroundColor: '#000 !important',
                      },
                    }
                  }
                }}
              >
                <SelectMenuItem value={'mainnet'}><Typography variant='p'>Solana Mainnet</Typography></SelectMenuItem>
                <SelectMenuItem value={'devnet'}><Typography variant='p'>Solana Devnet</Typography></SelectMenuItem>
              </SelectBox>
            </Box>
            <Box sx={{ position: 'absolute', right: '20px', top: '20px' }}>
              <CloseButton handleClose={handleClose} />
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
  max-width: 322px;
`
const SelectBox = styled(Select)`
  width: 229px;
  height: 36px;
  padding: 10px;
  border-radius: 5px;
  background: #000;
  border: 1px solid ${(props) => props.theme.basis.shadowGloom};
`
const SelectMenuItem = styled(MenuItem)`
  display: flex;
  padding: 10px;
  background: #000;
`
const StyledInput = styled(Input)`
  border: solid 1px ${(props) => props.theme.basis.shadowGloom};
  width: 322px;
  height: 36px;
  margin-top: 7px;
  border-radius: 5px;
  & input {
    padding-left: 13px;  
    font-size: 12px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: left;
    color: #fff;

    &::placeholder {
      color: #fff;
    }
  }
  
  &:hover {
    border: solid 1px ${(props) => props.theme.basis.liquidityBlue};
  }
`
const SaveBtn = styled(Button)`
  width: 107px;
  height: 30px;
  border-radius: 5px;
  margin-top: 7px;
  box-shadow: 0 0 10px 0 #005874;
  background-color: ${(props) => props.theme.basis.liquidityBlue};
`

export default SettingDialog

