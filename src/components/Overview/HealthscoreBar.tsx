import { styled, Box, Stack, Typography } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface Props {
  score?: number
}

const HealthscoreBar: React.FC<Props> = ({ score }) => {
  return (
    <Box>
      <Box>
        <ScorePointer><Box display='flex' justifyContent='center'><Typography variant='p_lg'>{score?.toFixed(0)}</Typography></Box></ScorePointer>
        <Box width='500px' margin='0 auto'>
          <ScoreBar />
          <Box display="flex" justifyContent='space-between'>
            <Box><Typography variant='p_sm'>0 (Poor)</Typography></Box>
            <Box><Typography variant='p_sm'>(Excellent) 100</Typography></Box>
          </Box>
        </Box>
      </Box>
    </Box >
  )
}

const ScorePointer = styled(Box)`
  margin-left: 8px;
  margin-right: 8px;
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
  width: 500px;
  height: 4px;
  background-image: ${(props) => props.theme.gradients.healthscore};
`

export default HealthscoreBar
