import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"
import { BN } from '@project-serum/anchor'

export const callBorrow = async ({ program, userPubKey, collateralIndex, iassetIndex, iassetAmount, collateralAmount }: GetProps) => {
  if (!userPubKey) return null

  await program.loadManager();

  console.log("Num Collaterals")
  console.log(Number((await program.getTokenData()).numCollaterals))

  let iassetMint = (await program.getAssetInfo(iassetIndex)).iassetMint

  const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
  const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(iassetMint)

  program.initializeMintPosition(new BN(iassetAmount * 10 ** 12), new BN(collateralAmount * 10 ** 12), collateralAssociatedTokenAccount.address, iassetAssociatedTokenAccount.address, iassetIndex, collateralIndex, [])

	return
}

interface GetProps {
  program: Incept,
  userPubKey: PublicKey | null,
  collateralIndex: number,
  iassetIndex: number,
  collateralAmount: number,
  iassetAmount: number,
}

