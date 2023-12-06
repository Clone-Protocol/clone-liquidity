import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'


export const handler: Handler = async (event, context) => {
  const params = event.queryStringParameters!
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const rpcCall = params.userAddress ? supabase.from(
    "user_points_view"
  ).select().eq('user_address', params.userAddress) : supabase.from(
    "user_points_view"
  ).select();

  let { data, error } = await rpcCall;

  if (error !== null) {
    console.log(error)
    return { statusCode: 500, body: JSON.stringify(error)}
  }

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  }
}