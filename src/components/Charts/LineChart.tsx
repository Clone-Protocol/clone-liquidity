import React, { Dispatch, SetStateAction } from 'react';
import { styled } from '@mui/system'
import { Card } from '@mui/material'
import { ResponsiveContainer, LineChart as ReLineChart, Line } from 'recharts'
import { withCsrOnly } from '~/hocs/CsrOnly'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { ChartElem } from '~/features/Chart/Liquidity.query';
dayjs.extend(utc)

export type LineChartProps = {
  data: ChartElem[]
  color?: string | undefined
  height?: number | undefined
  minHeight?: number
  setValue?: Dispatch<SetStateAction<number | undefined>> // used for value on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>> // used for label of valye
  value?: number
  label?: string
} & React.HTMLAttributes<HTMLDivElement>


const LineChart: React.FC<LineChartProps> = ({
  data,
  color = '#4fe5ff',
  value,
  label,
  setValue,
  setLabel,
  minHeight = 109,
  ...rest
}) => {
  return data ? (
    <Wrapper>
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart
          width={462}
          height={288}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <Line dataKey="value" type="monotone" dot={false} stroke={color} strokeWidth={1} />
        </ReLineChart>
      </ResponsiveContainer>
    </Wrapper>
  ) : <></>
}

const Wrapper = styled(Card)`
  background: rgba(21, 22, 24, 0.25);
  width: 462px;
  max-width: 462px;
  height: 288px;
  display: flex;
  flex-direction: column;
  > * {
    font-size: 1rem;
  }
`

export default withCsrOnly(LineChart)
