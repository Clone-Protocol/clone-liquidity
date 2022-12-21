import { useSetRecoilState, useRecoilValue } from 'recoil'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState, declinedAccountCreationState } from '~/features/globalAtom'

export const handleLinkNeedingAccountClick = (evt) => {
	const setCreateAccountDialogState = useSetRecoilState(createAccountDialogState)
	const declinedAccountCreation = useRecoilValue(declinedAccountCreationState)

	if (!declinedAccountCreation) {
		return
	}

	setCreateAccountDialogState(CreateAccountDialogStates.Reminder)
	evt.preventDefault()
} 