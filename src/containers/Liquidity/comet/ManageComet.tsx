import React, { useEffect, useState } from 'react'
import { Grid, Box, Button } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { TabPanelForEdit, StyledTabs, StyledTab } from '~/components/Common/StyledTab'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import MiniLineChartAlt from '~/components/Charts/MiniLineChartAlt'
import EditPanel from '~/containers/Liquidity/comet/EditPanel'
import ClosePanel from '~/containers/Liquidity/comet/ClosePanel'
import { useCometDetailQuery } from '~/features/MyLiquidity/CometPosition.query'
// import { fetchPools, PoolList } from '~/features/MyLiquidity/CometPools.query'

const ManageComet = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
  const [tab, setTab] = useState(0)
	const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
		setTab(newValue)
	}

	// const [assetData, setAssetData] = useState<PI>() // set default
  // const [cometData, setCometData] = useState<CometInfo>({
  //   isTight: false,
  //   collRatio: 50,
  //   lowerLimit: 40.0,
  //   upperLimit: 180.0
  // })
  // const [mintAmount, setMintAmount] = useState(0.0)
	// const [collAmount, setCollAmount] = useState(0.0)
  // const [ild, setILD] = useState(0)

	const cometIndex = parseInt(assetId)

  const { data: cometDetail } = useCometDetailQuery({
    userPubKey: publicKey,
    index: cometIndex,
	  refetchOnMount: true,
    enabled: publicKey != null
	})

	// useEffect(() => {
	// 	const program = getInceptApp()

	// 	async function fetch() {
	// 		if (assetId) {
	// 			const data = (await fetchCometDetail({
	// 				program,
	// 				userPubKey: publicKey,
	// 				index: cometIndex,
	// 			})) as PI
	// 			if (data) {
	// 				const comet = await program.getCometPosition(cometIndex)
  //         console.log('comet', data)
					
  //         setAssetData(data)
  //         setMintAmount(toScaledNumber(comet.borrowedUsdi))
	// 				setCollAmount(toScaledNumber(comet.collateralAmount))
  //         setCometData({
  //           ...cometData,
  //           lowerLimit: toScaledNumber(comet.lowerPriceRange),
  //           upperLimit: toScaledNumber(comet.upperPriceRange)
  //         })
  //         // const cometPools =  (await fetchPools({
  //         //   program,
  //         //   userPubKey: publicKey,
  //         //   filter,
  //         // })) as PoolList[]
          
  //         // if (cometPools.length > 0) {
  //         //   const ild = cometPools[cometIndex].ild
  //         //   setILD(ild)
  //         // } else {
  //         //   console.log('no user comet pools')
  //         // }
	// 			}
	// 		}
	// 	}
	// 	fetch()
	// }, [publicKey, assetId])
  
  const chartData = [
    {
      time: '2022-03-01',
      value: 15
    },
    {
      time: '2022-03-02',
      value: 35
    },
    {
      time: '2022-03-03',
      value: 80
    },
    {
      time: '2022-03-04',
      value: 65
    },
    {
      time: '2022-03-05',
      value: 115
    },
  ]

	return cometDetail ? (
		<Grid container spacing={2}>
			<Grid item xs={12} md={4}>
        <StyledBox>
          <Box display="flex">
            <Image src={cometDetail.tickerIcon} width="30px" height="30px" />
            <Box sx={{ marginLeft: '10px', fontSize: '14px', fontWeight: '600', color: '#fff', marginTop: '3px' }}>
              {cometDetail.tickerName} ({cometDetail.tickerSymbol})
            </Box>
          </Box>
          <Box sx={{ marginTop: '20px', marginBottom: '27px', fontSize: '24px', fontWeight: '500', color: '#fff' }}>
            ${cometDetail.price.toFixed(2)}
          </Box>
          <MiniLineChartAlt 
            data={chartData}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', fontSize: '10px', color: '#6c6c6c', marginTop: '10px' }}>
            Indicator Price
          </Box>
        </StyledBox>
			</Grid>
			<Grid item xs={12} md={8}>
        <Box sx={{ maxWidth: '466px' }}>
          <StyledTabs value={tab} onChange={handleChangeTab}>
            <StyledTab value={0} label="Edit Comet"></StyledTab>
            <StyledTab value={1} label="Close Comet"></StyledTab>
          </StyledTabs>
          <TabPanelForEdit value={tab} index={0}>
            <EditPanel assetId={assetId} cometDetail={cometDetail} />
          </TabPanelForEdit>
          <TabPanelForEdit value={tab} index={1}>
            <ClosePanel assetId={assetId} cometDetail={cometDetail} />
          </TabPanelForEdit>
        </Box>
			</Grid>
		</Grid>
	) : <></>
}

const StyledBox = styled(Box)`
  width: 315px;
  height: 290px;
  padding: 17px 34px 18px 35px;
  border-radius: 10px;
  background: #171717;
  margin-top: 22px;
`

export default withSuspense(ManageComet, <LoadingProgress />)
