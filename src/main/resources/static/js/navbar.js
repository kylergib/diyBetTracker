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
  let totalProfit = total.profit.toFixed(2);
  let totalColor = "grey";

  if (totalProfit > 0) {
    totalColor = "green";
  } else if (totalProfit < 0) {
    totalColor = "red";
  }
  const totalNav = document.getElementById("totalProfit");
  totalNav.style.color = totalColor;
  totalNav.textContent = `Total Profit: $${totalProfit}`;
  let monthProfit = month.profit.toFixed(2);
  let monthColor = "grey";

  if (monthProfit > 0) {
    monthColor = "green";
  } else if (monthProfit < 0) {
    monthColor = "red";
  }
  const monthNav = document.getElementById("monthProfit");
  monthNav.style.color = monthColor;
  monthNav.textContent = `Month's Profit: $${monthProfit}`;

  let todayProfit = today.profit.toFixed(2);
  let todayColor = "grey";

  if (todayProfit > 0) {
    todayColor = "green";
  } else if (todayProfit < 0) {
    todayColor = "red";
  }

  const todayNav = document.getElementById("todayProfit");
  todayNav.textContent = `Today's Profit: $${todayProfit}`;
  todayNav.style.color = todayColor;
  document.getElementById("diy-stats-div").removeAttribute("style");
}
