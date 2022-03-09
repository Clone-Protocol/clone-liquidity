import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Provider } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { InceptContext } from '~/hooks/useIncept';
import { useConnection } from '@solana/wallet-adapter-react';
import { Incept, Network } from 'sdk/src/index'

export interface InceptProviderProps {
    children: ReactNode;
}

export const InceptProvider: FC<InceptProviderProps> = ({ children, ...props }) => {
  const [AnchorProvider, setProvider] = useState<Provider>()
  const [Program, setProgram] = useState<Incept>()
  const wallet = useAnchorWallet()
  const { connection } = useConnection()

  useEffect(() => {
    const opts = {
      preflightCommitment: "processed"
    }

    // @ts-ignore
    const provider = new Provider(connection, wallet, opts.preflightCommitment)
    setProvider(provider)
  }, [connection])

  const getInceptApp = (inceptProgramID: string) : Incept | null => {
    if (AnchorProvider) {
      console.log('ffffff')
      const pubProgram = new PublicKey(inceptProgramID)
      const incept = new Incept(connection, Network.LOCAL, pubProgram, AnchorProvider)
      setProgram(incept)
      return incept
    }
    return null
  }

  return (
    <InceptContext.Provider
        value={{
          Program,
          getInceptApp
        }}
    >
      {children}
    </InceptContext.Provider>
  );
};