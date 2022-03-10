import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"

export const callBorrow = async ({ program, userPubKey, collateralIndex, iassetIndex, collateralAmount, iassetAmount }: GetProps) => {
  if (!userPubKey) return null

  let iassetMint = (await program.getAssetInfo(iassetIndex)).iassetMint

  const collateralAssociatedTokenAccount = program.getUserUsdiAssociatedTokenAccount()
  const iassetAssociatedTokenAccount = program.getUserAssociatedTokenAccount(iassetMint)

  program.initializeMintPosition(iassetAmount, collateralAmount, collateralAssociatedTokenAccount, iassetAssociatedTokenAccount, iassetIndex, collateralIndex)

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
