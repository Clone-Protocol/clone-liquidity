import React, { Dispatch, SetStateAction } from 'react';
import { styled } from '@mui/system'
import { Card } from '@mui/material'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { withCsrOnly } from '~/hocs/CsrOnly'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { darken } from 'polished'
dayjs.extend(utc)

export type LineChartProps = {
  data: any[]
  color?: string | undefined
  height?: number | undefined
  minHeight?: number
  setValue?: Dispatch<SetStateAction<number | undefined>> // used for value on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>> // used for label of valye
  value?: number
  label?: string
} & React.HTMLAttributes<HTMLDivElement>


const MiniLineChartAlt: React.FC<LineChartProps> = ({
  data,
  color = '#59c23a',
  value,
  label,
  setValue,
  setLabel,
  minHeight = 109,
  ...rest
}) => {
  const parsedValue = value

  return data ? (
    <Wrapper>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={246}
          height={109}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          onMouseLeave={() => {
            setLabel && setLabel(undefined)
            setValue && setValue(undefined)
          }}
        >
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={darken(0.36, color)} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area dataKey="value" type="monotone" stroke={color} fill="url(#gradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </Wrapper>
  ) : <></>
}

const Wrapper = styled(Card)`
  background: rgba(21, 22, 24, 0.25);
  width: 246px;
  max-width: 560px;
  height: 109px;
  display: flex;
  flex-direction: column;
  > * {
    font-size: 1rem;
  }
`

export default withCsrOnly(MiniLineChartAlt)
