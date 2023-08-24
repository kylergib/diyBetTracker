import {
  parseTotalStats,
  parseTodayStats,
  parseMonthStats,
} from "./setStats.js";
import { getAllUserStats } from "./util.js";

export async function setStats() {
  let total;
  let today;
  let month;

  const stats = await getAllUserStats();
  stats.forEach((index) => {
    switch (index.statName) {
      case "Total":
        total = parseTotalStats(index);
        break;
      case "Today":
        today = parseTodayStats(index);
        break;
      case "Month":
        month = parseMonthStats(index);
        break;
    }
  });

  // setStats(totalStats, todayStats, monthStats);

  // function setStats(total, today, month) {
  document.getElementById(
    "totalProfit"
  ).textContent = `Profit: $${total.profit.toFixed(2)}`;
  document.getElementById(
    "totalStake"
  ).textContent = `Stake: $${total.stake.toFixed(2)}`;
  document.getElementById(
    "totalFreebetStake"
  ).textContent = `F.B: $${total.fbStake.toFixed(2)}`;
  document.getElementById("totalROI").textContent = `ROI: $${total.ROI.toFixed(
    2
  )}`;
  document.getElementById(
    "totalRecord"
  ).textContent = `Record: ${total.wins}-${total.loses}-${total.voids}`;

  document.getElementById(
    "todayProfit"
  ).textContent = `Profit: $${today.profit.toFixed(2)}`;
  document.getElementById(
    "todayStake"
  ).textContent = `Stake: $${today.stake.toFixed(2)}`;
  document.getElementById(
    "todayFreebetStake"
  ).textContent = `F.B: $${today.fbStake.toFixed(2)}`;
  document.getElementById("todayROI").textContent = `ROI: $${today.ROI.toFixed(
    2
  )}`;
  document.getElementById(
    "todayRecord"
  ).textContent = `Record: ${today.wins}-${today.loses}-${today.voids}`;

  document.getElementById(
    "monthProfit"
  ).textContent = `Profit: $${month.profit.toFixed(2)}`;
  document.getElementById(
    "monthStake"
  ).textContent = `Stake: $${month.stake.toFixed(2)}`;
  document.getElementById(
    "monthFreebetStake"
  ).textContent = `F.B: $${month.fbStake.toFixed(2)}`;
  document.getElementById("monthROI").textContent = `ROI: $${month.ROI.toFixed(
    2
  )}`;
  document.getElementById(
    "monthRecord"
  ).textContent = `Record: ${month.wins}-${month.loses}-${month.voids}`;
}
