import React, { useEffect, useState } from 'react'
import { Grid, Box, Stack, Divider, Button } from '@mui/material'
import { styled } from '@mui/system'
import { useSnackbar } from 'notistack'
import PositionInfo from '~/components/Liquidity/comet/PositionInfo'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { PositionInfo as PI, fetchCometDetail, CometInfo } from '~/features/MyLiquidity/CometPosition.query'
import { FilterType } from '~/data/filter'
import { fetchPools, PoolList } from '~/features/MyLiquidity/CometPools.query'
import { toScaledNumber } from 'sdk/src/utils'
import { useCloseMutation } from '~/features/Comet/Comet.mutation'

const ClosePanel = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
	const [filter, setFilter] = useState<FilterType>('all')
	const { getInceptApp } = useIncept()
  const { enqueueSnackbar } = useSnackbar()
	const [ild, setILD] = useState(0)
  const [mintAmount, setMintAmount] = useState(0.0)
	const [collAmount, setCollAmount] = useState(0.0)
  const [assetData, setAssetData] = useState<PI>()
  const [cometData, setCometData] = useState<CometInfo>({
    isTight: false,
    collRatio: 50,
    lowerLimit: 40.0,
    upperLimit: 180.0
  })

  const { mutateAsync } = useCloseMutation(publicKey)

	const cometIndex = parseInt(assetId)

	useEffect(() => {
		const program = getInceptApp()

		async function fetch() {
			if (assetId) {
				const data = (await fetchCometDetail({
					program,
					userPubKey: publicKey,
					index: cometIndex,
				})) as PI
				const comet = await program.getCometPosition(cometIndex)

        setAssetData(data)
        setMintAmount(toScaledNumber(comet.borrowedUsdi))
				setCollAmount(toScaledNumber(comet.collateralAmount))
				setCometData({
          ...cometData,
          lowerLimit: toScaledNumber(comet.lowerPriceRange),
          upperLimit: toScaledNumber(comet.upperPriceRange)
        })

        const cometPools =  (await fetchPools({
          program,
          userPubKey: publicKey,
          filter,
        })) as PoolList[]
				
        if (cometPools.length > 0) {
          const ild = cometPools[cometIndex].ild
				  setILD(ild)
        } else {
          console.log('no user comet pools')
        }
			}
		}
		fetch()
	}, [publicKey, assetId])

	const onClose = async () => {
    await mutateAsync(
      {
        cometIndex
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to close comet')
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to close comet')
        }
      }
    )
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={12} md={5}>
				<PositionInfo 
          assetData={assetData}
          cometData={cometData}
          mintAmount={mintAmount}
					collateralAmount={collAmount} />
			</Grid>
			<Grid item xs={12} md={7}>
				<Box sx={{ padding: '30px' }}>
					<Stack direction="row" justifyContent="space-between">
						<DetailHeader>Collateral</DetailHeader>
						<DetailValue>{collAmount} USDi</DetailValue>
					</Stack>
					<Stack sx={{ marginTop: '10px' }} direction="row" justifyContent="space-between">
						<DetailHeader>ILD</DetailHeader>
						<DetailValue>{ild} USDi</DetailValue>
					</Stack>
					<Stack sx={{ marginTop: '30px' }} direction="row" justifyContent="space-between">
						<DetailHeader>Withdraw amount</DetailHeader>
						<DetailValue>{collAmount - ild} USDi</DetailValue>
					</Stack>
					<StyledDivider />
					<ActionButton onClick={onClose}>Close</ActionButton>
				</Box>
			</Grid>
		</Grid>
	)
}

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 39px;
	margin-top: 39px;
	height: 1px;
`

const DetailHeader = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #989898;
`

const DetailValue = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #fff;
`

const ActionButton = styled(Button)`
	width: 100%;
	background: #7d7d7d;
	color: #fff;
	border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
	margin-bottom: 15px;
`

export default ClosePanel
