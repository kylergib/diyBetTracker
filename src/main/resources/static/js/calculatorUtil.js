export function calculateProfit(odds, stake, freeBetStake) {
  // console.log(odds, Math.abs(odds), stake, freeBetStake);
  // console.log((100.0 / Math.abs(odds)) * stake);
  let profit;
  if (odds > 0) {
    profit = (odds / 100.0) * stake + (odds / 100.0) * freeBetStake;
  } else {
    profit =
      (100.0 / Math.abs(odds)) * stake +
      (100.0 / Math.abs(odds)) * freeBetStake;
  }
  return profit;
}

export function americanToPercent(americanOdds) {

  if (americanOdds > 0) {
    return 100.00 / (americanOdds + 100.00);
  } else if (americanOdds < 0) {
    return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100.00);
  }
  return 1.0;
}

export function americanToDecimal(americanOdds)
{
  if (americanOdds > 0)
  {
    return 1.00 + (americanOdds / 100.00);
  }
  return 1.00 - (100.00 / americanOdds);
}

export function getKellySize(decimalOdds, percentOdds) {
  return (((decimalOdds - 1.0) * percentOdds) - (1.0 - percentOdds)) / (decimalOdds - 1.0) * 100.0;

}

export function getEV(percent, profit) {

    return (percent * profit) - ((1.0 - percent) * 100.0);
}
export function getProfit(americanOdds)
{
  if (americanOdds < -10000) return 0.00;
  if (americanOdds > 0)
  {
    return americanOdds / 100.0 * 100.0;
  }
  return 100.0 / Math.abs(americanOdds) * 100.0;
}

export function percentToAmericanOdds(percent)
{
  if (percent > 50)
  {
    return (-(percent / (1.00 - (percent / 100.00))));
  }
  else if (percent < 50)
  {
    return ((100.00 / (percent / 100.00)) - 100.00);
  }
  return 100.00;
}