// import { getAllUserStats } from "./util.js";

export class Stats {
  constructor(profit, stake, fbStake, ROI, wins, loses, voids) {
    (this.profit = profit),
      (this.stake = stake),
      (this.fbStake = fbStake),
      (this.ROI = ROI),
      (this.wins = wins),
      (this.loses = loses),
      (this.voids = voids);
  }
}

export function parseTotalStats(total) {
  return new Stats(
    total.profit,
    total.stake,
    total.freeBetStake,
    total.returnOnInvestment,
    total.wonBets,
    total.lostBets,
    total.voidBets
  );
}

export function parseTodayStats(today) {
  return new Stats(
    today.profit,
    today.stake,
    today.freeBetStake,
    today.returnOnInvestment,
    today.wonBets,
    today.lostBets,
    today.voidBets
  );
}
export function parseMonthStats(month) {
  return new Stats(
    month.profit,
    month.stake,
    month.freeBetStake,
    month.returnOnInvestment,
    month.wonBets,
    month.lostBets,
    month.voidBets
  );
}
