import React, { useState, useCallback } from 'react'
import { Box, Divider, styled, Button, Dialog, DialogContent } from '@mui/material'
import { useSnackbar } from 'notistack'
import Image from 'next/image'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import PairInput from '~/components/Asset/PairInput'
import ConcentrationRange from '~/components/Liquidity/comet/ConcentrationRange'
import ConcentrationRangeBox from '~/components/Liquidity/comet/ConcentrationRangeBox'
import { PositionInfo as PI, CometInfo, CometDetail } from '~/features/MyLiquidity/CometPosition.query'
import OneIcon from 'public/images/one-icon.png'
import TwoIcon from 'public/images/two-icon.png'
import { useBalanceQuery } from '~/features/Comet/Balance.query'
import { useEditMutation } from '~/features/Comet/Comet.mutation'

const EditDetailDialog = ({ cometId, assetData, cometDetail, open, handleClose }: any) => {
  const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
  const { enqueueSnackbar } = useSnackbar()
  const { mutateAsync } = useEditMutation(publicKey)
  const { data: usdiBalance } = useBalanceQuery({ 
    userPubKey: publicKey, 
    refetchOnMount: true,
    enabled: publicKey != null
  });

  const [cometData, setCometData] = useState<CometInfo>({
    isTight: false,
    collRatio: 50,
    lowerLimit: cometDetail.lowerLimit,
    upperLimit: cometDetail.upperLimit
  })
  const mintAmount = cometDetail.mintAmount
	const [collAmount, setCollAmount] = useState(cometDetail.collAmount)

	const cometIndex = parseInt(cometId)

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

  return (
    <Dialog open={open} onClose={handleClose}>
			<DialogContent sx={{ backgroundColor: '#171717', border: 'solid 1px #535353' }}>
				<Box sx={{ padding: '30px', color: '#fff' }}>
          <WarningBox>
            Fill in two of the three parts and the third part will automatically generate.{' '}
            <br /> Learn more here.
          </WarningBox>

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
        </Box>
      </DialogContent>
		</Dialog>
  )
}

const WarningBox = styled(Box)`
	max-width: 500px;
	padding-right: 10px;
	font-size: 11px;
	font-weight: 500;
	color: #989898;
  border-radius: 10px;
  border: solid 1px #809cff;
  background-color: rgba(128, 156, 255, 0.09);
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

export default EditDetailDialog