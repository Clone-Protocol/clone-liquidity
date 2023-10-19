//@DEPRECATED
import React from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { createAccountDialogState, isAlreadyInitializedAccountState } from '~/features/globalAtom'
import {
  Box,
  styled,
  Typography
} from '@mui/material'
import { CreateAccountDialogStates } from '~/utils/constants'


const ReminderNewWalletPopup = () => {
  const setCreateAccountDialogStatus = useSetAtom(createAccountDialogState)
  const isAlreadyInitializedAccount = useAtomValue(isAlreadyInitializedAccountState)
  const shouldPopupOpen = !isAlreadyInitializedAccount

  return shouldPopupOpen ? (
    <PopupBox onClick={() => setCreateAccountDialogStatus(CreateAccountDialogStates.Initial)}>
      <Typography variant='p'>This wallet is new! Please click here to complete account setup process</Typography>
    </PopupBox>
  ) : <></>
}


const PopupBox = styled(Box)`
  position: absolute;
  top: 60px;
  right: 0px;
  width: 268px;
  height: 76px;
  color: #fff;
  cursor: pointer;
  padding: 14px 25px;
  line-height: 1.33;
  border: solid 1px ${(props) => props.theme.palette.info.main};
  background-color: ${(props) => props.theme.boxes.darkBlack};
  &:hover {
    background-color: #000;
  }
`
export default ReminderNewWalletPopup
