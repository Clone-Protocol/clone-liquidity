import { useSetAtom, useAtomValue } from 'jotai'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState, declinedAccountCreationState } from '~/features/globalAtom'


export const useOnLinkNeedingAccountClick = () => {
	const setCreateAccountDialogState = useSetAtom(createAccountDialogState)
	const declinedAccountCreation = useAtomValue(declinedAccountCreationState)

	return (evt: React.MouseEvent | undefined) => {
		if (declinedAccountCreation) {
			evt?.preventDefault()
			setCreateAccountDialogState(CreateAccountDialogStates.Reminder)
		}
	}
}