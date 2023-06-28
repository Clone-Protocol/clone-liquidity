import { Handler } from '@netlify/functions'
import axios from 'axios'

export const handler: Handler = async (event, context) => {
  const params = event.queryStringParameters!
  console.log("params:", params)
  const baseUrl = process.env.NEXT_PUBLIC_CLONE_INDEX_ENDPOINT!
  let url = `${baseUrl}/${params!.method}?`
  for (let [k, v] of Object.entries(params)) {
    if (k === 'method')
      continue
    url += `&${k}=${v}`
  }
  const authorization = process.env.NEXT_PUBLIC_CLONE_API_KEY!
  const headers = {
    'Authorization': authorization,
  }
  let response = await axios.get(url, { headers })
  const statusCode = response.data?.statusCode ?? 500
  const body: string = JSON.stringify(response.data?.body)
  console.log("RESPONSE:", body)

  return {
    statusCode,
    body
  }
}
