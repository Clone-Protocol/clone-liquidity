import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

export const handler: Handler = async (event, context) => {
  const params = event.queryStringParameters!
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const { data, error } = await supabase.rpc('get_total_liquidity', { t_interval: params.interval, t_filter: params.filter });

  if (error !== null) {
    console.log(error)
    return { statusCode: 500, body: JSON.stringify(error)}
  }

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  }
}
