import StatusView from '~/components/Liquidity/StatusView'
import { useWallet } from '@solana/wallet-adapter-react'
import { Box } from '@mui/material'
import { useStatusQuery } from '~/features/MyLiquidity/Status.query'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'

const MyStatus = () => {
	const { publicKey } = useWallet()

  const { data: status } = useStatusQuery({
    userPubKey: publicKey,
	  refetchOnMount: true,
    enabled: publicKey != null
	})

	return (
		<Box sx={{ maxWidth: '812px' }}>
			<StatusView status={status} />
		</Box>
	)
}

export default withSuspense(MyStatus, <LoadingProgress />)

