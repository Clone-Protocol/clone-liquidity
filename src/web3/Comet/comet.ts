import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { BN } from '@project-serum/anchor'

export const callComet = async ({
	program,
	userPubKey,
	iassetIndex,
	collateralIndex,
	usdiAmount,
	collateralAmount,
}: GetProps) => {
	if (!userPubKey) return null

	await program.loadManager()

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()

	program.initializeComet(
		collateralAssociatedTokenAccount.address,
		new BN(collateralAmount * 10 ** 12),
		new BN(usdiAmount * 10 ** 12),
		iassetIndex,
		collateralIndex,
		[]
	)

	return
}

interface GetProps {
	program: Incept
	userPubKey: PublicKey | null
	collateralIndex: number
	iassetIndex: number
	collateralAmount: number
	usdiAmount: number
}
