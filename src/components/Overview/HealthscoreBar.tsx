import { styled, Box, Typography } from '@mui/material'

interface Props {
  score?: number
  prevScore?: number
  hideIndicator?: boolean
  width: number
}

const HealthscoreBar: React.FC<Props> = ({ score, prevScore, hideIndicator = false, width = 490 }) => {
  const scorePoint = score ? width * score / 100 - 15 : -15
  const prevScorePoint = prevScore ? width * prevScore / 100 - 15 : -15
  return (
    <Box>
      <Box>
        <ScorePointer sx={{ marginLeft: `${scorePoint}px` }}><Box display='flex' justifyContent='center'><Typography variant='p_lg'>{score && !isNaN(score) ? score.toFixed(0) : 0}</Typography></Box></ScorePointer>
        <Box width='100%' margin='0 auto'>
          <ScoreBar />
          {!hideIndicator && <Box display="flex" justifyContent='space-between'>
            <Box><Typography variant='p_sm'>0 (Poor)</Typography></Box>
            <Box><Typography variant='p_sm'>(Excellent) 100</Typography></Box>
          </Box>}
          {prevScore &&
            <PrevBox sx={{ left: `${prevScorePoint}px` }}>
              <FixValueLabel>{prevScore?.toFixed(0)}</FixValueLabel>
            </PrevBox>
          }
        </Box>
      </Box>
    </Box >
  )
}

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
  padding: 2px 8px;
  margin-top: 8px;
  margin-left: -16px;
  border: solid 1px ${(props) => props.theme.palette.text.secondary};
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: ${(props) => props.theme.palette.text.secondary};
`

export default HealthscoreBar
