import { Box, Stack, Typography, styled } from "@mui/material"
import { SubmitButton } from "~/components/Common/CommonButtons"
import { useForm, Controller } from 'react-hook-form'
import PairInput from '~/components/Liquidity/comet/PairInput'
import Image from 'next/image'
import HealthscoreView from '~/components/Liquidity/comet/HealthscoreView'
import IconHealthScoreGraph from 'public/images/healthscore-graph.svg'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import { useWallet } from "@solana/wallet-adapter-react"
import WarningMsg, { InfoMsg } from "~/components/Common/WarningMsg"
import { useLiquidityPositionQuery } from "~/features/MyLiquidity/comet/LiquidityPosition.query"
import { useEffect, useState } from "react"
import { fromScale } from 'clone-protocol-sdk/sdk/src/clone'
import { usePayILDMutation } from "~/features/MyLiquidity/comet/LiquidityPosition.mutation"
import { LoadingProgress } from "~/components/Common/Loading"
import withSuspense from "~/hocs/withSuspense"

const IldEdit = ({ positionIndex }: { positionIndex: number }) => {
  const { publicKey } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [healthScore, setHealthScore] = useState(0)

  const { data: positionInfo, refetch } = useLiquidityPositionQuery({
    userPubKey: publicKey,
    index: positionIndex,
    refetchOnMount: "always",
    enabled: publicKey != null,
  })

  const {
    handleSubmit,
    control,
    formState: { isDirty, errors },
    watch,
    setValue,
    trigger,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      ildAmount: 0.0,
    }
  })
  const [ildAmount] = watch([
    'ildAmount',
  ])

  useEffect(() => {
    if (positionInfo && ildAmount > 0) {
      const position = positionInfo.comet.positions[positionIndex]
      const poolIndex = Number(position.poolIndex)
      const pool = positionInfo.pools.pools[poolIndex]
      const ildDebtNotionalValue = Math.max(positionInfo.collateralILD, 0) + Math.max((positionInfo.onassetILD - ildAmount) * positionInfo.oraclePrice, 0)
      const healthScoreIncrease = (
        fromScale(pool.assetInfo.ilHealthScoreCoefficient, 2) * ildDebtNotionalValue +
        positionInfo.committedCollateralLiquidity * fromScale(pool.assetInfo.positionHealthScoreCoefficient, 2)
      ) / positionInfo.totalCollateralAmount
      // console.log('m', (positionInfo.onassetILD - ildAmount))
      // console.log('s', fromScale(pool.assetInfo.ilHealthScoreCoefficient, 2) * ildDebtNotionalValue)
      // console.log('h', healthScoreIncrease)
      setHealthScore(positionInfo.prevHealthScore + healthScoreIncrease)
    }
  }, [ildAmount])

  const initData = () => {
    setValue('ildAmount', 0.0)
  }

  const { mutateAsync } = usePayILDMutation(publicKey)
  const onEdit = async () => {
    try {
      setIsSubmitting(true)

      const data = await mutateAsync({
        ildAmount,
        positionIndex,
        collateralBalance: positionInfo?.onusdVal!,
        collateralILD: positionInfo?.collateralILD!,
        onassetBalance: positionInfo?.onassetVal!,
        onassetILD: positionInfo?.onassetILD!,
        onassetMint: positionInfo?.onassetMint!,
        committedCollateralLiquidity: positionInfo?.committedCollateralLiquidity!,
      })

      if (data) {
        console.log("data", data)
        refetch()
        initData()
        // onRefetchData()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }


  const balance: number = positionInfo ? Math.max(0, positionInfo.onassetVal) : 0
  const remainingILD: number = positionInfo ? Math.max(0, positionInfo.onassetILD - ildAmount) : 0
  const isValid = positionInfo ? (positionInfo.onassetILD <= 0 && Math.max(0, positionInfo.collateralILD) <= 0) || (remainingILD > 0 && ildAmount === 0) || isSubmitting : false

  let warningMsg = ''
  if (balance === 0) {
    warningMsg = 'You wallet balance is zero'
  } else if (positionInfo && Math.max(0, positionInfo.onassetILD) - ildAmount > 0) {
    warningMsg = 'Not enough wallet balance to fully payoff onAsseet ILD Amount. You can acquire more on Clone Markets or borrow on Clone Liquidity.'
  }

  return positionInfo ? (
    <>
      <Box>
        <Box>
          <Typography variant='p_lg'>onAsset ILD</Typography>
          <InfoTooltip title={TooltipTexts.ildDebt} color='#66707e' />
        </Box>
        <StackWithBorder direction='row' justifyContent='space-between'>
          <Box>
            <Typography variant='p_lg'>{positionInfo.tickerSymbol} ILD</Typography>
            <InfoTooltip title={TooltipTexts.ildDebt} color='#66707e' />
          </Box>
          <Box>
            <Typography variant='p_lg'>
              {Math.max(0, positionInfo.onassetILD).toLocaleString(undefined, {
                maximumFractionDigits: 8,
              })} {positionInfo.tickerSymbol}
            </Typography>
            <Typography variant='p_lg' color='#66707e' ml='10px'>
              {`($${(Math.max(0, positionInfo.onassetILD) * positionInfo.oraclePrice).toLocaleString(undefined, {
                maximumFractionDigits: 8
              })})`}
            </Typography>
          </Box>
        </StackWithBorder>

        {Math.max(0, positionInfo.onassetILD) > 0 &&
          <BoxWithBorder>
            <Controller
              name="ildAmount"
              control={control}
              // rules={{
              //   validate(value) {
              //     if (!value || value <= 0) {
              //       return ''
              //     }
              //   }
              // }}
              render={({ field }) => (
                <PairInput
                  tickerIcon={positionInfo.tickerIcon}
                  tickerSymbol={positionInfo.tickerSymbol}
                  rightHeaderTitle={'Wallet Balance'}
                  value={field.value}
                  valueDollarPrice={field.value}
                  inputTitle={`${positionInfo.tickerSymbol} ILD Payment`}
                  inputTitleColor="#fff"
                  balance={balance}
                  onChange={(event: React.FormEvent<HTMLInputElement>) => {
                    const ildAmt = parseFloat(event.currentTarget.value)
                    field.onChange(ildAmt)
                  }}
                  onMax={(value: number) => {
                    const onassetILD = Math.max(0, positionInfo.onassetILD)
                    field.onChange(Math.min(value, onassetILD))
                  }}
                />
              )}
            />
            <StackWithBorder direction='row' justifyContent='space-between' sx={{ background: 'transparent' }}>
              <Box>
                <Typography variant='p'>Projected Remaining onAsset ILD</Typography>
                <InfoTooltip title={TooltipTexts.projectedRemainingILD} color='#66707e' />
              </Box>
              <Box>
                <Typography variant='p_lg'>{isNaN(ildAmount) || ildAmount > balance ? 'N/A' : remainingILD.toLocaleString(undefined, { maximumFractionDigits: 8 })}</Typography>
                <Typography variant='p_lg' color='#66707e' ml='5px'>{isNaN(ildAmount) || ildAmount > balance ? 'N/A' : remainingILD === 0 ? '(Paid Off)' : `($${remainingILD.toLocaleString(undefined, { maximumFractionDigits: 8 })})`}</Typography>
              </Box>
            </StackWithBorder>
            {ildAmount > balance &&
              <Box mb='10px'>
                <WarningMsg>
                  Exceeded Wallet Balance. Please adjust the payment amount.
                </WarningMsg>
              </Box>
            }
            {warningMsg !== '' && <InfoMsg>{warningMsg}</InfoMsg>}
          </BoxWithBorder>
        }
        <Box>
          <Box>
            <Typography variant='p_lg'>devUSD ILD</Typography>
            <InfoTooltip title={TooltipTexts.devUSDILD} color='#66707e' />
          </Box>
          <StackWithBorder direction='row' justifyContent='space-between'>
            <Typography variant='p_lg'>devUSD ILD</Typography>
            <Typography variant='p_lg'>
              {Math.max(0, positionInfo.collateralILD).toLocaleString(undefined, {
                maximumFractionDigits: 8,
              })} devUSD
            </Typography>
          </StackWithBorder>
          {
            (ildAmount > 0) ?
              <HealthBox padding='15px 20px'>
                <Box display='flex' justifyContent='center'>
                  <Typography variant='p'>Projected Comet Health Score <InfoTooltip title={TooltipTexts.projectedHealthScore} color='#66707e' /></Typography>
                </Box>
                <Box mt='10px' display='flex' justifyContent='center'>
                  <HealthscoreView score={healthScore ? healthScore : positionInfo.healthScore} />
                </Box>
              </HealthBox>
              :
              <HealthBox padding='36px 20px' display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                <Image src={IconHealthScoreGraph} alt='healthscore' />
                <Box mt='7px'>
                  <Typography variant='p' color='#414e66'>Projected health score unavailable</Typography>
                </Box>
              </HealthBox>
          }
        </Box>
        <SubmitButton onClick={handleSubmit(onEdit)} disabled={isValid}>
          <Typography variant='p_xlg'>{positionInfo.onassetILD <= 0 && positionInfo.collateralILD <= 0 ? 'No ILD Balance' : 'Pay ILD'}</Typography>
        </SubmitButton>
      </Box>
    </>
  ) : (
    <></>
  )
}

const StackWithBorder = styled(Stack)`
  width: 100%;
  height: 52px;
  margin-top: 10px;
  margin-bottom: 15px;
  align-items: center;
  border-radius: 5px;
  gap: 10px;
  padding: 18px 21px;
  background: ${(props) => props.theme.basis.darkNavy};
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
`
const BoxWithBorder = styled(Box)`
  width: 100%;
  margin-top: 15px;
  margin-bottom: 33px;
  border-radius: 5px;
  align-items: center;
  gap: 10px;
  padding: 18px 21px;
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
`
const HealthBox = styled(Box)`
  background-color: ${(props) => props.theme.basis.darkNavy};
  margin-top: 38px;
  margin-bottom: 30px;
`

export default withSuspense(IldEdit, <LoadingProgress />)