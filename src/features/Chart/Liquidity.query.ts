import { Query, useQuery } from 'react-query'
import { FilterTime } from '~/components/Charts/TimeTabs'

export interface ChartElem {
  time: string
  value: number
}

export const fetchTotalLiquidity = async ({ timeframe } : { timeframe: FilterTime}) => {
	const chartData = [
    {
      time: '2022-03-01',
      value: 15
    },
    {
      time: '2022-03-02',
      value: 35
    },
    {
      time: '2022-03-03',
      value: 80
    },
    {
      time: '2022-03-04',
      value: 65
    },
    {
      time: '2022-03-05',
      value: 115
    },
  ]

  return {
    chartData,
  }
}

export const fetchTotalUsers = async ({ timeframe } : { timeframe: FilterTime}) => {
	const chartData = [
    {
      time: '2022-03-01',
      value: 35
    },
    {
      time: '2022-03-02',
      value: 55
    },
    {
      time: '2022-03-03',
      value: 90
    },
    {
      time: '2022-03-04',
      value: 185
    },
    {
      time: '2022-03-05',
      value: 235
    },
  ]

  return {
    chartData,
  }
}

export const fetchTotalVolume = async ({ timeframe } : { timeframe: FilterTime}) => {
	const chartData = [
    {
      time: '2022-03-01',
      value: 15
    },
    {
      time: '2022-03-02',
      value: 35
    },
    {
      time: '2022-03-03',
      value: 80
    },
    {
      time: '2022-03-04',
      value: 65
    },
    {
      time: '2022-03-05',
      value: 115
    },
  ]

  return {
    chartData,
  }
}

export const fetchTotalLiquidation = async ({ timeframe } : { timeframe: FilterTime}) => {
	const chartData = [
    {
      time: '2022-03-01',
      value: 65
    },
    {
      time: '2022-03-02',
      value: 45
    },
    {
      time: '2022-03-03',
      value: 180
    },
    {
      time: '2022-03-04',
      value: 65
    },
    {
      time: '2022-03-05',
      value: 95
    },
  ]

  return {
    chartData,
  }
}

interface GetProps {
  timeframe: FilterTime
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export function useTotalLiquidityQuery({ timeframe, refetchOnMount, enabled = true }: GetProps) {
  return useQuery(['totalLiquidity', timeframe], () => fetchTotalLiquidity({ timeframe }), {
    refetchOnMount,
    enabled
  })
}

export function useTotalUsersQuery({ timeframe, refetchOnMount, enabled = true }: GetProps) {
  return useQuery(['totalUsers', timeframe], () => fetchTotalUsers({ timeframe }), {
    refetchOnMount,
    enabled
  })
}

export function useTotalVolumeQuery({ timeframe, refetchOnMount, enabled = true }: GetProps) {
  return useQuery(['totalVolume', timeframe], () => fetchTotalVolume({ timeframe }), {
    refetchOnMount,
    enabled
  })
}

export function useTotalLiquidationQuery({ timeframe, refetchOnMount, enabled = true }: GetProps) {
  return useQuery(['totalLiquidation', timeframe], () => fetchTotalLiquidation({ timeframe }), {
    refetchOnMount,
    enabled
  })
}