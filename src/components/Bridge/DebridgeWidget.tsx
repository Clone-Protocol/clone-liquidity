import Script from 'next/script'
import { useEffect, useState } from 'react'
import { LoadingProgress } from '../Common/Loading'
import { Box } from '@mui/material'
import { WidgetType } from '~/utils/debridge_widgets'


const DebridgeWidget = ({ widgetType }: { widgetType: WidgetType }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showLoading, setShowLoading] = useState(true)

  const setWidget = () => {
    window.deBridge.widget(widgetType)
  }

  useEffect(() => {
    if (window.deBridge && !isLoaded) {
      if (document.querySelector('.debridge-widget-iframe') === null) {
        setWidget()
        setTimeout(() => {
          setShowLoading(false)
        }, 2000)
      }
    }
  }, [])

  useEffect(() => {
    if (window.deBridge && isLoaded) {
      if (document.querySelector('.debridge-widget-iframe') === null) {
        setWidget()
        setTimeout(() => {
          setShowLoading(false)
        }, 2000)
      }
    }
  }, [isLoaded])

  const onLoad = () => {
    console.log('load')
    setIsLoaded(true)
  }

  return (
    <>
      <Script src="https://app.debridge.finance/assets/scripts/widget.js" onLoad={onLoad} />
      {showLoading && <Box position='absolute' top='55px' ml='15px' width='315px'><LoadingProgress /></Box>}
      <div id="debridgeWidget" style={{ marginTop: '0px' }}></div>
    </>
  )
}

export default DebridgeWidget