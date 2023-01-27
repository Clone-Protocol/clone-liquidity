import { styled, Box, Stack, Typography } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface Props {
  score: number
}

const HealthscoreView: React.FC<Props> = ({ score }) => {
  const scoreType = 'Fair'

  return (
    <Box>
      <Stack direction="row" height='86px'>
        <ScoreBox sx={{ color: '#ff8e4f' }}>
          <Box marginTop="15px">
            <Typography variant='p_xxxlg'>{score.toFixed(0)}</Typography>
          </Box>
          <Box>
            <Typography variant='p_sm'>{scoreType}</Typography>
          </Box>
        </ScoreBox>
        <Box display='flex' height='100%'>
          <PlayArrowIcon sx={{ width: '12px', height: '12px', position: 'relative', top: '0px' }} />
          <ScoreBar />
        </Box>
      </Stack >
    </Box >
  )
}

const ScoreBox = styled(Box)`
  width: 104px;
  height: 100%;
  text-align: center;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`
const ScoreBar = styled(Box)`
  width: 4px;
  height: 100%;
  background-image: linear-gradient(to top, #ed2525 0%, #ff8e4f 26%, #4fe5ff 100%);
`

export default HealthscoreView
