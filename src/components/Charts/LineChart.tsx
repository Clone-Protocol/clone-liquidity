import { createChart } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';
import { withCsrOnly } from '~/hocs/CsrOnly'
import { Box } from '@mui/material'

interface Props {
}

const LineChart: React.FC<Props> = ({
}) => {
  const chartContainerRef = useRef();

  useEffect(
		() => {
      const initialData = [
        { time: '2021-12-22', value: 32.51 },
        { time: '2021-12-23', value: 31.11 },
        { time: '2021-12-24', value: 27.02 },
        { time: '2021-12-25', value: 27.32 },
        { time: '2021-12-26', value: 25.17 },
        { time: '2021-12-27', value: 28.89 },
        { time: '2021-12-28', value: 25.46 },
        { time: '2021-12-29', value: 23.92 },
        { time: '2021-12-30', value: 22.68 },
        { time: '2021-12-31', value: 22.67 },
      ];

			const chart = createChart(chartContainerRef.current, {
				width: 578,
				height: 300,
        layout: {
          textColor: '#c9c9c9',
          backgroundColor: 'linear-gradient(to bottom, #151618 29%, #002888 312%)',
        },
        crosshair: {
          vertLine: {
            width: 5,
            color: 'rgba(224, 227, 235, 0.1)',
            style: 0,
          },
          horzLine: {
            visible: false,
            labelVisible: false,
          },
        },
        grid: {
          vertLines: {
            color: 'rgba(42, 46, 57, 0)',
          },
          horzLines: {
            color: 'rgba(42, 46, 57, 0)',
          },
        },
			});
			chart.timeScale().fitContent();

			const newSeries = chart.addAreaSeries({
        topColor: '#151618',
        bottomColor: '#002888',
        lineColor: '#fff',
        lineWidth: 2,
        crossHairMarkerVisible: false,
      });
			newSeries.setData(initialData);
		},
		[]
	);

  return (
    <div ref={chartContainerRef} />
  )
}

export default withCsrOnly(LineChart)
