import React, { Dispatch, SetStateAction, ReactNode } from 'react'
import { BarChart, ResponsiveContainer, XAxis, Tooltip, Bar} from 'recharts';
import { Card, Box } from '@mui/material'
import { styled } from '@mui/system'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { withCsrOnly } from '~/hocs/CsrOnly'
dayjs.extend(utc)

enum VolumeWindow {
  daily,
  weekly,
  monthly,
}

const CustomBar = ({
  x,
  y,
  width,
  height,
  fill,
}: {
  x: number
  y: number
  width: number
  height: number
  fill: string
}) => {
  return (
    <g>
      <defs>
        <linearGradient id="grad1" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="rgb(185, 185, 185)" stopOpacity={0.23} />
          <stop offset="100%" stopColor="rgb(128, 156, 255)" stopOpacity={0.62} />
        </linearGradient>
      </defs>
      <rect x={x} y={y} fill="url(#grad1)" width={width} height={height} rx="2" />
    </g>
  )
}

export type LineChartProps = {
  data: any[]
  color?: string | undefined
  height?: number | undefined
  minHeight?: number
  setValue?: Dispatch<SetStateAction<number | undefined>> // used for value on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>> // used for label of valye
  value?: number
  label?: string
  activeWindow?: VolumeWindow
  topLeft?: ReactNode | undefined
  topRight?: ReactNode | undefined
  bottomLeft?: ReactNode | undefined
  bottomRight?: ReactNode | undefined
} & React.HTMLAttributes<HTMLDivElement>

const BarChartAlt: React.FC<LineChartProps> = ({
  data,
  color = 'rgba(128, 156, 255, 0.62)',
  setValue,
  setLabel,
  value,
  label,
  activeWindow,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  minHeight = 307,
  ...rest
}) => {
  const parsedValue = value
  const now = dayjs()

  return (
    <Wrapper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {topLeft ?? null}
        {topRight ?? null}
      </Box>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
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
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            color="#c9c9c9"
            fontSize="8px"
            tickFormatter={(time) => dayjs(time).format(activeWindow === VolumeWindow.monthly ? 'MMM' : 'DD')}
            minTickGap={10}
          />
          <Tooltip 
            cursor={{ fill: '#2C2F36' }}
            contentStyle={{ display: 'none' }}
            formatter={(value: number, name: string, props: { payload: { time: string; value: number } }) => {
              if (setValue && parsedValue !== props.payload.value) {
                setValue(props.payload.value)
              }
              const formattedTime = dayjs(props.payload.time).format('MMM D, YYYY')
              if (setLabel && label !== formattedTime) setLabel(formattedTime)
            }}
          />
          <Bar
            dataKey="value"
            fill={color}
            shape={(props) => {
              return <CustomBar height={props.height} width={props.width} x={props.x} y={props.y} fill={color} />
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </Wrapper>
  )
}

const Wrapper = styled(Card)`
  width: 100%;
  max-width: 560px;
  height: 307px;
  padding: 1rem;
  padding-right: 2rem;
  display: flex;
  background-image: linear-gradient(to bottom, #151618 29%, #002888 312%);
  flex-direction: column;
  > * {
    font-size: 1rem;
  }
`

export default withCsrOnly(BarChartAlt)
