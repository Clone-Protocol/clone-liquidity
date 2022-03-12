import StatusView from '~/components/Liquidity/StatusView'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { fetchStatus, Status } from '~/web3/MyLiquidity/status'
import { Box } from '@mui/material'

const MyStatus = () => {
  const { publicKey } = useWallet()
  const { getInceptApp } = useIncept()
  const [status, setStatus] = useState<Status>()

  useEffect(() => {
    const program = getInceptApp()

    async function fetch() {
      const data = await fetchStatus({
        program,
        userPubKey: publicKey,
      })
      if (data) {
        setStatus(data)
      }
    }
    fetch()
  }, [publicKey])

  return (
    <Box sx={{ maxWidth: '675px' }}>
      <StatusView status={status} />
    </Box>
  )
}

export default MyStatus