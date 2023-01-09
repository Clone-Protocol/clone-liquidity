import { MouseEvent } from 'react'
import { useSetRecoilState, useRecoilValue } from 'recoil'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState, declinedAccountCreationState } from '~/features/globalAtom'


export const useOnLinkNeedingAccountClick = () => {
	const setCreateAccountDialogState = useSetRecoilState(createAccountDialogState)
	const declinedAccountCreation = useRecoilValue(declinedAccountCreationState)
	
	return (evt: React.MouseEvent) => {
		if (declinedAccountCreation) {
			evt.preventDefault()
			setCreateAccountDialogState(CreateAccountDialogStates.Reminder)
		}
	}
}