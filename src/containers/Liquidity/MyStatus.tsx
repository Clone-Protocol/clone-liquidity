import StatusView from '~/components/Liquidity/StatusView'
import { Box } from '@mui/material'
import { LoadingProgress } from '~/components/Common/Loading'
import { Status } from '~/features/MyLiquidity/Status.query'
import withSuspense from '~/hocs/withSuspense'

const MyStatus = ({ status }: { status: Status }) => {
	return (
		<Box maxWidth='812px'>
			<StatusView status={status} />
		</Box>
	)
}

export default withSuspense(MyStatus, <LoadingProgress />)

