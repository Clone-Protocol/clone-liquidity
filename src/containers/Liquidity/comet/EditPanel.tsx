import React, { useState, useCallback } from 'react'
import { Box, Divider, Button } from '@mui/material'
import { styled } from '@mui/system'
import { useSnackbar } from 'notistack'
import Image from 'next/image'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import PositionInfo from '~/components/Liquidity/comet/PositionInfo'
import PairInput from '~/components/Asset/PairInput'
import ConcentrationRange from '~/components/Liquidity/comet/ConcentrationRange'
import { PositionInfo as PI, CometInfo, CometDetail } from '~/features/MyLiquidity/CometPosition.query'
import ConcentrationRangeBox from '~/components/Liquidity/comet/ConcentrationRangeBox'
import OneIcon from 'public/images/one-icon.png'
import TwoIcon from 'public/images/two-icon.png'
import { useBalanceQuery } from '~/features/Comet/Balance.query'
import { useEditMutation } from '~/features/Comet/Comet.mutation'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'

const EditPanel = ({ assetId, cometDetail }: { assetId: string, cometDetail: CometDetail }) => {
	const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
  const { enqueueSnackbar } = useSnackbar()
	const assetData: PI = {
    tickerIcon: cometDetail.tickerIcon,
    tickerName: cometDetail.tickerName,
    tickerSymbol: cometDetail.tickerSymbol,
    price: cometDetail.price,
    tightRange: cometDetail.tightRange,
    maxRange: cometDetail.maxRange,
    centerPrice: cometDetail.centerPrice
  }
  const [cometData, setCometData] = useState<CometInfo>({
    isTight: false,
    collRatio: 50,
    lowerLimit: cometDetail.lowerLimit,
    upperLimit: cometDetail.upperLimit
  })
  const mintAmount = cometDetail.mintAmount
	const [collAmount, setCollAmount] = useState(cometDetail.collAmount)
  const ild = cometDetail.ild
  const [showEditForm, setShowEditForm] = useState(false)

  const { mutateAsync } = useEditMutation(publicKey)

	const cometIndex = parseInt(assetId)

  const { data: usdiBalance } = useBalanceQuery({ 
    userPubKey: publicKey, 
    refetchOnMount: true,
    enabled: publicKey != null
  });

	const handleChangeFromAmount = useCallback( async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.value) {
			const amount = parseFloat(e.currentTarget.value)

			const program = getInceptApp()
			let [lowerLimit, upperLimit] = (await program.calculateRangeFromUSDiAndCollateral(
				0,
				(
					await program.getCometPosition(cometIndex)
				).poolIndex,
				amount,
				mintAmount
			))!
			if (lowerLimit && upperLimit) {
        setCometData({
          ...cometData,
          lowerLimit,
          upperLimit
        })
        setCollAmount(amount)
			} else {
				setCollAmount(amount)
			}
		} else {
			setCollAmount(0.0)
		}
	}, [cometIndex, mintAmount, cometData])

	const handleChangeConcentRange = useCallback((isTight: boolean, lowerLimit: number, upperLimit: number) => {
		const newData = {
			...cometData,
			isTight,
			lowerLimit,
			upperLimit,
		}
		setCometData(newData)
	}, [cometData])

	const onEdit = async () => {
    await mutateAsync(
      {
        cometIndex, 
        totalCollateralAmount: collAmount
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to comet')
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to comet')
        }
      }
    )
	}

	return assetData ? (
    <Wrapper>
      <PositionInfo
        assetData={assetData}
        cometData={cometData}
        mintAmount={mintAmount}
        collateralAmount={collAmount}
        ild={ild}
        onShowEditForm={() => setShowEditForm(true)}
      />

      { showEditForm ?
        <Box sx={{ padding: '25px 30px' }}>
          <Box>
            <SubTitle>
              <Image src={OneIcon} /> <Box sx={{ marginLeft: '9px' }}>Edit collateral amount</Box>
            </SubTitle>
            <SubTitleComment>Editing collateral amount will change the concentration range</SubTitleComment>
            <PairInput
              tickerIcon={'/images/assets/USDi.png'}
              tickerName="USDi Coin"
              tickerSymbol="USDi"
              value={collAmount}
              headerTitle="Balance"
              headerValue={usdiBalance?.balanceVal}
              onChange={handleChangeFromAmount}
            />
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle>
              <Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}>Edit liquidity concentration range</Box>
            </SubTitle>
            <SubTitleComment>Editing concentration range will effect the collateral amount</SubTitleComment>

            <Box sx={{ marginTop: '110px', marginBottom: '15px' }}>
              <ConcentrationRange
                assetData={assetData}
                cometData={cometData}
                onChange={handleChangeConcentRange}
                max={assetData.maxRange}
                defaultLower={(assetData.price / 2)}
                defaultUpper={((assetData.price * 3) / 2)}
              />
            </Box>

            <ConcentrationRangeBox assetData={assetData} positionInfo={cometData} />
          </Box>
          <StyledDivider />

          <ActionButton onClick={onEdit}>Edit</ActionButton>
        </Box>
      : <></> }
    </Wrapper>
	) : <></>
}

const Wrapper = styled(Box)`
  color: #fff;
  background: rgba(21, 22, 24, 0.75);
  border-radius: 10px;
`

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 30px;
	margin-top: 30px;
	height: 1px;
`

const SubTitle = styled('div')`
	display: flex;
	font-size: 14px;
	font-weight: 500;
	marginbottom: 17px;
	color: #fff;
`

const SubTitleComment = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
	marginbottom: 18px;
	margin-top: 10px;
`

const ActionButton = styled(Button)`
	width: 100%;
	background: #7d7d7d;
	color: #fff;
	border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
	margin-bottom: 15px;
`

export default withSuspense(EditPanel, <LoadingProgress />)
