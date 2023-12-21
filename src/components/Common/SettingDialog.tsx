import React, { useState } from 'react'
import { Box, styled, Dialog, DialogContent, Typography, Button, MenuItem, Stack, Input } from '@mui/material'
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FadeTransition } from '~/components/Common/Dialog'
import { CloseButton } from '~/components/Common/CommonButtons'
import { IndicatorGreen, IndicatorRed, IndicatorStatus, IndicatorYellow } from './StatusIndicator';
import { useSnackbar } from 'notistack';
import IconShare from 'public/images/icon-share.svg'
import Image from 'next/image';
import { CUSTOM_RPC_INDEX, DEVNET_PUBLIC, DEV_RPCs, IS_DEV, MAINNET_PUBLIC, MAIN_RPCs } from '~/data/networks';
import { useAtom, useSetAtom } from 'jotai';
import { rpcEndpoint, rpcEndpointIndex } from '~/features/globalAtom';


const SettingDialog = ({ open, handleClose }: { open: boolean, handleClose: () => void }) => {
  const { enqueueSnackbar } = useSnackbar()
  const [atomRpcEndpointIndex, setAtomRpcEndpointIndex] = useAtom(rpcEndpointIndex)
  const setAtomRpcEndpoint = useSetAtom(rpcEndpoint)

  const [showCustom, setShowCustom] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [errorCustomMsg, setErrorCustomMsg] = useState(false)
  const RPCs = IS_DEV ? DEV_RPCs : MAIN_RPCs

  const handleChangeRpcEndpoint = (event: SelectChangeEvent) => {
    const rpcIndex = Number(event.target.value)
    setShowCustom(rpcIndex == CUSTOM_RPC_INDEX)

    setAtomRpcEndpointIndex(rpcIndex);

    if (rpcIndex != CUSTOM_RPC_INDEX) {
      setAtomRpcEndpoint(RPCs[rpcIndex].rpc_url)

      //TODO: showing after rpc is connected
      enqueueSnackbar(`Connected to ${RPCs[rpcIndex].rpc_name}`)
    }
  };

  const goNetwork = () => {
    if (IS_DEV) {
      window.open(MAINNET_PUBLIC, '_blank')
    } else {
      window.open(DEVNET_PUBLIC, '_blank')
    }
  };

  const handleChangeCustomRPCUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUrl(event.target.value)
  }

  const saveCustomURL = () => {
    const urlRegex = /^(http:\/\/|https:\/\/).+/;
    if (customUrl && urlRegex.test(customUrl)) {
      setAtomRpcEndpointIndex(CUSTOM_RPC_INDEX);
      setAtomRpcEndpoint(customUrl.trim())
      setErrorCustomMsg(false)
      enqueueSnackbar('Connected to Custom RPC')
    } else {
      setErrorCustomMsg(true)
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
            {!IS_DEV &&
              <Box my='20px'>
                <Box><Typography variant="p_lg">RPC Endpoint</Typography></Box>
                <Box lineHeight={1.1} mb='7px'><Typography variant="p" color="#8988a3">At anytime, choose the fastest RPC for most optimal experience!</Typography></Box>
                <SelectBox
                  labelId="rpc-select-label"
                  id="rpc-select"
                  value={atomRpcEndpointIndex}
                  onChange={handleChangeRpcEndpoint}
                  sx={{
                    padding: '0px',
                    '& .MuiSelect-icon': {
                      color: '#fff'
                    },
                    "&.MuiOutlinedInput-root": {
                      "& fieldset": {
                        border: '1px solid #343441',
                      },
                      "&:hover fieldset": {
                        borderColor: "#4fe5ff"
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4fe5ff"
                      }
                    }
                  }}
                  MenuProps={{
                    disablePortal: true,
                    PaperProps: {
                      sx: {
                        zIndex: 999999,
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
                  {RPCs.map((rpc, index) => (
                    <SelectMenuItem key={index} value={index}>
                      <Stack direction='row' alignItems='center' gap={1}>
                        <Typography variant='p'>{rpc.rpc_name}</Typography>
                        {/* <StatusIndicator status={IndicatorStatus.Green} speed={134.1} /> */}
                      </Stack>
                    </SelectMenuItem>
                  ))}
                  <SelectMenuItem value={CUSTOM_RPC_INDEX}><Typography variant='p'>Custom</Typography></SelectMenuItem>
                </SelectBox>
                {showCustom &&
                  <Box>
                    <StyledInput placeholder="Enter custom RPC URL" disableUnderline onChange={handleChangeCustomRPCUrl} />
                    {errorCustomMsg && <Box><Typography variant='p' color='#ed2525'>Custom RPC Connection Failed. Try different URL.</Typography></Box>}
                    <SaveBtn onClick={saveCustomURL}>Save</SaveBtn>
                  </Box>
                }
              </Box>
            }
            <Box my='20px'>
              <Box><Typography variant="p_lg">Network Switching</Typography></Box>
              <Box lineHeight={1.1} mb='10px'><Typography variant="p" color="#8988a3">Choose between Solana mainnet and devnet. Learn more about it <a href="#" target="_blank" style={{ textDecoration: 'underline', color: '#fff' }}>here</a>.</Typography></Box>
              <ChangeNetworkButton onClick={goNetwork}><Typography variant='p'>Go to Solana {IS_DEV ? 'Mainnet' : 'Devnet'}</Typography> <Image src={IconShare} alt='icon-share' /></ChangeNetworkButton>
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
`
const SelectMenuItem = styled(MenuItem)`
  display: flex;
  padding: 10px;
  background: #000;
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
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
const ChangeNetworkButton = styled(Box)`
  width: 209px;
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 5px;
  cursor: pointer;
  padding: 6px 11px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
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

