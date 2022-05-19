import React, { useState, useEffect } from 'react'
import { CircularProgress, styled, Box } from '@mui/material'

export const REFETCH_CYCLE = 30000

const DataLoadingIndicator = ({ clear }: Props) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    }, 3000);

    return () => {
      clearInterval(timer);
    };
  }, []);

	return (
    <Wrapper>
      <div style={{ marginRight: '8px'}}>Data update in</div>
      <CircularProgress variant="determinate" sx={{ color: '#809cff' }} size={23}
        thickness={8} value={progress} />
    </Wrapper>
	)
}

export default DataLoadingIndicator

interface Props {
  clear?: boolean
}

const Wrapper = styled(Box)`
  width: 129px;
  height: 35px;
  padding: 4px 11px 1px 8px;
  border-radius: 10px;
  background-color: #16171a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 500;
  color: #989898;
`