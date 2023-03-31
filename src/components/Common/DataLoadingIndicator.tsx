import React, { useState, useEffect } from 'react'
import { CircularProgress, styled, Box } from '@mui/material'
import { useDataLoading } from '~/hooks/useDataLoading'

export const REFETCH_CYCLE = 30000

const DataLoadingIndicator = () => {
  const { startTimer } = useDataLoading()
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: any = null
    if (startTimer) {
      console.log('start Timer')
      timer = setInterval(() => {
        setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
      }, 3000);
    } else {
      setProgress(0)
      clearInterval(timer)
    }

    return () => {
      clearInterval(timer)
    };
  }, [startTimer]);

  return (
    <Wrapper>
      <div style={{ marginRight: '8px', marginTop: '-5px' }}>Rate refreshes in</div>
      <Box sx={{ position: 'relative' }}>
        <CircularProgress
          variant="determinate"
          sx={{
            color: '#525252'
          }}
          size={23}
          thickness={8}
          value={100}
        />
        <CircularProgress variant="determinate" sx={{ color: '#fff', position: 'absolute', left: 0 }} size={23}
          thickness={8} value={progress} />
      </Box>
    </Wrapper>
  )
}

export default DataLoadingIndicator

const Wrapper = styled(Box)`
  width: 135px;
  height: 35px;
  padding: 4px 11px 1px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 500;
  color: #868686;
`