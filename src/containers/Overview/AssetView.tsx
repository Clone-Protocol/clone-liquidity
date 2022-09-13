import { Box, Button, Paper } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { styled } from '@mui/system'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { useBalanceQuery } from '~/features/Borrow/Balance.query'
import CometIconOn from 'public/images/comet-icon-on.svg'
import UlIconOn from 'public/images/ul-icon-on.svg'
import CometIconOff from 'public/images/comet-icon-off.svg'
import UlIconOff from 'public/images/ul-icon-off.svg'
import { useInitCometDetailQuery } from '~/features/MyLiquidity/CometPosition.query'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import CometPanel from './CometPanel'
import UnconcentPanel from './UnconcentPanel'
import InfoTooltip from '~/components/Common/InfoTooltip'

const AssetView = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
  const router = useRouter()
  const { ltab } = router.query
	const [tab, setTab] = useState(0)
  const assetIndex = parseInt(assetId)

  // sub routing for tab
  useEffect(() => {
    if (ltab && parseInt(ltab.toString()) <= 1) {
      setTab(parseInt(ltab.toString()))
    }
  }, [ltab])

  const { data: balances, refetch } = useBalanceQuery({
    userPubKey: publicKey,
    index: assetIndex,
	  refetchOnMount: "always",
    enabled: publicKey != null
	})

  const { data: assetData } = useInitCometDetailQuery({
    userPubKey: publicKey,
    index: assetIndex,
	  refetchOnMount: true,
    enabled: publicKey != null
	})

	const changeTab = (newVal: number) => {
		setTab(newVal)
	}

	return assetData ? (
		<StyledBox>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Box sx={{ display: 'flex', maxWidth: '488px', height: '47px', alignItems: 'center', paddingLeft: '9px', borderRadius: '10px', background: 'rgba(21, 22, 24, 0.75)' }}>
					<CometTabBtn active={tab===0} onClick={() => changeTab(0)}>
						{tab===0 ? <Image src={CometIconOn} /> : <Image src={CometIconOff} /> } 
            <span style={{ marginLeft: '8px' }}>Comet Liquidity <InfoTooltip title="Comet Liquidity" /></span>
					</CometTabBtn>
					<UnconcentTabBtn active={tab===1} onClick={() => changeTab(1)}>
						{tab===1 ? <Image src={UlIconOn} /> : <Image src={UlIconOff} /> }
						<span style={{ marginLeft: '8px' }}>Unconcentrated Liquidity <InfoTooltip title="Unconcentrated Liquidity" /></span>
					</UnconcentTabBtn>
				</Box>
			</Box>
			<Box sx={{ paddingY: '20px' }}>
				{tab === 0 ? (
					<CometPanel balances={balances} assetData={assetData} assetIndex={assetIndex} onRefetchData={() => refetch()} />
				) : (
					<UnconcentPanel balances={balances} assetData={assetData} assetIndex={assetIndex} onRefetchData={() => refetch()} />
				)}
			</Box>
		</StyledBox>
	) : <></>
}

const StyledBox = styled(Paper)`
	maxwidth: 768px;
	font-size: 14px;
	font-weight: 500;
	text-align: center;
	color: #fff;
	border-radius: 8px;
	text-align: left;
	background: #000;
	padding-left: 30px;
	padding-top: 36px;
	padding-bottom: 42px;
	padding-right: 33px;
`

const CometTabBtn = styled((props: any) => (
  <CometTab {...props} />
))(({ active }: { active: boolean}) => ({
  border: active? '1px solid transparent' : 'none',
  color: active? '#fff' : '#989898'
}))

const CometTab = styled(Button)`
	width: 199px;
	height: 35px;
  padding: 0;
	border-radius: 10px;
  border: 1px solid transparent;
  background-image: linear-gradient(#000000, #000000), linear-gradient(to bottom, #809cff 0%, #0038ff 100%);
  background-clip: content-box, border-box;
  background-origin: border-box;
	font-size: 12px;
	font-weight: 600;
	color: #fff;
  &:hover {
    opacity: 0.8;
  }
  &:active {
    background: #171717;
  }
`

const UnconcentTabBtn = styled((props: any) => (
  <UnconcentTab {...props} />
))(({ active }: { active: boolean}) => ({
  border: active? '1px solid #444' : '',
  background: active? '#000': 'rgba(21, 22, 24, 0.75)',
  color: active? '#fff' : '#989898'
}))

const UnconcentTab = styled(Button)`
	width: 290px;
	height: 35px;
  margin-left: 8px;
	border-radius: 10px;
	background-color: rgba(21, 22, 24, 0.75);
	font-size: 12px;
	font-weight: 600;
	color: #fff;
  &:active {
    background: #3d3d3d;
  }
`

export default withSuspense(AssetView, <LoadingProgress />)
