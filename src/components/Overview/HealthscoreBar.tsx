import { styled, Box, Typography } from '@mui/material'

interface Props {
  score?: number
  prevScore?: number
  hiddenThumbTitle?: boolean
  hideIndicator?: boolean
  width: number
}

const HealthscoreBar: React.FC<Props> = ({ score, prevScore, hiddenThumbTitle = false, hideIndicator = false, width = 490 }) => {
  const scorePoint = score ? width * score / 100 - 15 : -15
  const prevScorePoint = prevScore ? width * prevScore / 100 - 9 : -9
  return (
    <Box>
      {scorePoint >= 0 ?
        <Box p='6px 20px'>
          <Box sx={{ marginLeft: `${scorePoint}px` }}>
            {!hiddenThumbTitle && <Box sx={{ marginLeft: '-5px' }}><Typography variant='p_sm'>New</Typography></Box>}
            <ScorePointer>
              <Box display='flex' justifyContent='center'><Typography variant='p_lg'>{score && !isNaN(score) ? score.toFixed(0) : 0}</Typography></Box>
            </ScorePointer>
          </Box>
          <Box width='100%' margin='0 auto'>
            <ScoreBar />
            {!hideIndicator && <Box display="flex" justifyContent='space-between'>
              <Box><Typography variant='p_sm'>0 (Poor)</Typography></Box>
              <Box><Typography variant='p_sm'>(Excellent) 100</Typography></Box>
            </Box>}
            {prevScore &&
              <PrevBox sx={{ left: `${prevScorePoint}px` }}>
                <FixValueLabel><Typography variant='p' ml='-2px'>{prevScore?.toFixed(0)}</Typography></FixValueLabel>
                <Box ml='-18px' mt='-4px'><Typography variant='p_sm' color='#989898'>Current</Typography></Box>
              </PrevBox>
            }
          </Box>
        </Box>
        :
        <BoxWithBorder>
          <Box width='100%' display='flex' justifyContent='center' alignItems='center'><Typography variant='p'>N/A</Typography></Box>
        </BoxWithBorder>
      }
    </Box >
  )
}

const BoxWithBorder = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
  padding: 15px 18px;
  margin-top: 16px;
`
const ScorePointer = styled(Box)`
  margin-left: -10px;
  margin-right: -10px;
  width: 34px;
  height: 28px;
  padding: 3px 6px;
  border: solid 1px #fff;
  margin-bottom: 13px;
  &::after {
    content: '▼';
    position: relative;
    left: 3px;
    top: -5px;
  }
`
const ScoreBar = styled(Box)`
  width: 100%;
  height: 4px;
  background-image: ${(props) => props.theme.gradients.healthscore};
`
const PrevBox = styled(Box)`
  position: relative; 
  z-index: 20;
`
const FixValueLabel = styled(Box)`
  width: 34px;
  height: 28px;
  padding: 4px 8px;
  margin-top: 8px;
  margin-left: -16px;
  border: solid 1px ${(props) => props.theme.palette.text.secondary};
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: ${(props) => props.theme.palette.text.secondary};
  &::after {
    content: '▲';
    position: relative;
    left: -15px;
    top: -17px;
  }
`

export default HealthscoreBar
