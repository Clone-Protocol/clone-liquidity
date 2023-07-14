import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

export const handler: Handler = async (event, context) => {
  const params = event.queryStringParameters!
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  let {data, error} = await (async () => {
    if (Boolean(params.dailyClose)) {
        return await supabase.from(
            "pyth-historical-hourly"
            ).select()
            .eq('symbol', params.symbol)
            .eq("dailyClose", true)
            .gt('timestamp', params.from)
            .order('timestamp', { ascending: true })
    } else {
        return await supabase.from(
            "pyth-historical-hourly"
            ).select()
            .eq('symbol', params.symbol)
            .gt('timestamp', params.from)
            .order('timestamp', { ascending: true })
    }
  })()
  let result: {timestamp: string, price: number}[] = []
  let statusCode = 500

  if (error === null && data !== null) {
    statusCode = 200
    for (const item of data) {
      result.push({
          timestamp: (new Date(item.timestamp * 1000)).toISOString(),
          price: Number(item.price)
      })
    }
  } else {
    console.log(error)
  }

  return {
    statusCode,
    body: JSON.stringify(result),
  }
}
