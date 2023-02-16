import { styled, Box, Stack, Typography } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useEffect, useState } from 'react';

interface Props {
  score?: number
}

const enum HealthScoreType {
  Fair = 'Fair',
  Excellent = 'Excellent',
  Poor = 'Poor'
}

const enum HealthScoreTypeColor {
  Fair = '#ff8e4f',
  Excellent = '#4fe5ff',
  Poor = '#ed2525'
}

const HealthscoreView: React.FC<Props> = ({ score }) => {
  const scorePercent = score ? 100 - score : 0

  const [scoreType, setScoreType] = useState(HealthScoreType.Fair)
  const [scoreTypeColor, setScoreTypeColor] = useState(HealthScoreTypeColor.Fair)

  useEffect(() => {
    if (score) {
      if (score < 30) {
        setScoreType(HealthScoreType.Poor)
        setScoreTypeColor(HealthScoreTypeColor.Poor)
      } else if (score >= 30 && score < 70) {
        setScoreType(HealthScoreType.Fair)
        setScoreTypeColor(HealthScoreTypeColor.Fair)
      } else {
        setScoreType(HealthScoreType.Excellent)
        setScoreTypeColor(HealthScoreTypeColor.Excellent)
      }
    }
  }, [score])

  return (
    <Box>
      <Stack direction="row" height='86px'>
        <ScoreBox sx={{ color: '#ff8e4f' }}>
          {score &&
            <Box sx={{ color: scoreTypeColor }}>
              <Box marginTop="15px">
                <Typography variant='p_xxxlg'>{score.toFixed(0)}</Typography>
              </Box>
              <Box>
                <Typography variant='p_sm'>{scoreType}</Typography>
              </Box>
            </Box>
          }
        </ScoreBox>
        <Box display='flex' height='100%'>
          <PlayArrowIcon sx={{ width: '12px', height: '12px', position: 'relative', top: `calc(${scorePercent}% - 10px)` }} />
          <ScoreBar />
          <Box height='100%'>
            <Box sx={{ position: 'relative', top: '-10px', left: '5px' }}><Typography variant='p_sm'>100 (Excellent)</Typography></Box>
            <Box sx={{ position: 'relative', top: '40px', left: '5px' }}><Typography variant='p_sm'>0 (Poor)</Typography></Box>
          </Box>
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
