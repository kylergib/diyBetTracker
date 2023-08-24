export function calculateProfit(odds, stake, freeBetStake) {
  console.log(odds, Math.abs(odds), stake, freeBetStake);
  console.log((100.0 / Math.abs(odds)) * stake);
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
