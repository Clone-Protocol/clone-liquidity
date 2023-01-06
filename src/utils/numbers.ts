import numbro from 'numbro'

export const formatDollarAmount = (num: number | undefined, digits = 2, round = true) => {
  if (num === 0) return '$0.00'
  if (!num) return '-'
  if (num < 0.001 && digits <= 3) {
    return '<$0.001'
  }

  return numbro(num).formatCurrency({
    average: round,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      million: 'M',
      billion: 'B',
    },
  })
}

export const formatHealthScore = (score: string | undefined): string => {
  let num: number = (!score) ? 0 : Number(score) 
  if (num < 0) {
    num = 0
  } else if (num > 100) {
    num = 100
  }

  return num.toFixed(2)

}