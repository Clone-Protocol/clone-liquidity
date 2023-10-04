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

const IldEdit = ({ positionIndex }: { positionIndex: number }) => {
  const { publicKey } = useWallet()

  const { data: positionInfo, refetch } = useLiquidityPositionQuery({
    userPubKey: publicKey,
    index: positionIndex,
    refetchOnMount: "always",
    enabled: publicKey != null,
  })

  const {
    handleSubmit,
    control,
    formState: { isDirty, errors, isSubmitting },
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

  const initData = () => {
    setValue('ildAmount', 0.0)
  }

  const displayILDNotional = () => {
    let reward = 0
    if (positionInfo!.collateralILD > 0)
      reward += positionInfo!.collateralILD
    if (positionInfo!.onassetILD > 0)
      reward += positionInfo!.onassetILD * positionInfo!.price

    return `${Math.max(0, reward).toLocaleString(undefined, { maximumFractionDigits: 6 })} USD`
  }

  // const { mutateAsync } = useEditPositionMutation(publicKey)
  const onEdit = async () => {
    // try {
    //   const data = await mutateAsync(
    //     {
    //       ildAmount
    //     }
    //   )
    //   if (data) {
    //     console.log('data', data)
    //     refetch()
    //     initData()
    //     onRefetchData()
    //   }
    // } catch (err) {
    //   console.error(err)
    // }
  }


  const balance: number = positionInfo ? Math.max(0, positionInfo.onassetVal) : 0
  const remainingILD: number = positionInfo ? Math.max(0, positionInfo.onassetILD - ildAmount) : 0

  return positionInfo ? (
    <>
      <Box>
        <Box><Typography variant='p_lg'>onAsset ILD</Typography></Box>
        <StackWithBorder direction='row' justifyContent='space-between'>
          <Box>
            <Typography variant='p_lg'>{positionInfo.tickerSymbol} ILD</Typography>
            <InfoTooltip title={TooltipTexts.ildDebt} />
          </Box>
          <Box>
            <Typography variant='p_lg'>
              {Math.max(0, positionInfo.onassetILD).toLocaleString(undefined, {
                maximumFractionDigits: 6,
              })} {positionInfo.tickerSymbol}
            </Typography>
            <Typography variant='p_lg' color='#66707e' ml='10px'>
              {`($${displayILDNotional()})`}
            </Typography>
          </Box>
        </StackWithBorder>
        <BoxWithBorder>
          <Controller
            name="ildAmount"
            control={control}
            rules={{
              validate(value) {
                if (!value || value <= 0) {
                  return ''
                }
              }
            }}
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
                  field.onChange(Math.min(value, positionInfo.onassetILD))
                }}
              />
            )}
          />
          <StackWithBorder direction='row' justifyContent='space-between' sx={{ background: 'transparent' }}>
            <Typography variant='p'>Projected Remaining onAsset ILD</Typography>
            <Box>
              <Typography variant='p_lg'>{isNaN(ildAmount) || ildAmount > balance ? 'N/A' : remainingILD.toLocaleString()}</Typography>
              <Typography variant='p_lg' color='#66707e' ml='5px'>{isNaN(ildAmount) || ildAmount > balance ? 'N/A' : remainingILD === 0 ? '(Paid Off)' : remainingILD.toLocaleString()}</Typography>
            </Box>
          </StackWithBorder>
          {ildAmount > balance &&
            <Box mb='10px'>
              <WarningMsg>
                Exceeded Wallet Balance. Please adjust the payment amount.
              </WarningMsg>
            </Box>
          }
          <InfoMsg>
            {balance === 0 ?
              'You wallet balance is zero' :
              'Not enough wallet balance to fully payoff onAsseet ILD Amount. You can acquire more on Clone Markets or borrow on Clone Liquidity.'
            }
          </InfoMsg>
        </BoxWithBorder>
        <Box>
          <Box><Typography variant='p_lg'>devUSD ILD</Typography></Box>
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
                  <HealthscoreView score={positionInfo.healthScore} />
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
        <SubmitButton onClick={handleSubmit(onEdit)} disabled={isNaN(ildAmount) || ildAmount === 0}>
          <Typography variant='p_xlg'>{ildAmount > 0 ? 'Claim Rewards' : 'No ILD Balance'}</Typography>
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
  margin-top: 15px;
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
  margin-bottom: 38px;
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

export default IldEdit