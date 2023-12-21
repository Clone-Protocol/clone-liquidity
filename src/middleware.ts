import { Context } from "@netlify/edge-functions";
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest, context: Context) {
  const { nextUrl: url, geo } = req

  const BLOCKED_COUNTRY_CODE_ARRAY = [
    'AF', 'AS', 'AO', 'AM', 'AZ', 'BY', 'BA', 'BW', 'BI', 'KH', 'CM', 'CA', 'CF', 'TD', 'CN', 'KP', 'CD', 'ER', 'ET', 'GH', 'GU', 'GN', 'GW', 'HT', 'IR', 'IQ', 'JP', 'LA', 'LB', 'LR', 'LY', 'MG', 'ML', 'MZ', 'MM', 'NI', 'MP', 'PK', 'PR', 'CG', 'RU', 'SO', 'SD', 'UA', 'LK', 'SY', 'TJ', 'TT', 'TM', 'UG', 'US', 'UZ', 'VU', 'VE', 'VI', 'YE', 'ZW'
  ]

  const countryCode = context.geo?.country?.code;
  const countryName = context.geo?.country?.name;
  // console.log('geo.country', geo?.country)
  console.log('countryCode', countryCode)
  console.log('countryName', countryName)
  // url.searchParams.set('country', geo?.country)

  // if (BLOCKED_COUNTRY_CODE_ARRAY.includes(countryCode)) {
  //   return NextResponse.json({
  //     result: false
  //   })
  // } else {
  return NextResponse.json({
    result: true
  })
  // }
}

export const config = {
  matcher: '/api/:path*',
}