import {
  parseTotalStats,
  parseTodayStats,
  parseMonthStats,
} from "./setStats.js";
import { getAllUserStats } from "./util.js";

let theme = document
  .querySelector('meta[name="theme"]')
  .getAttribute("content");

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
  let totalColor = theme == "dark" ? "#dbdbdb" : "grey";

  if (totalProfit > 0) {
    totalColor = theme == "dark" ? "#00ff00" : "green";
  } else if (totalProfit < 0) {
    totalColor = theme == "dark" ? "#ff4343" : "red";
  }
  const totalNav = document.getElementById("totalProfit");
  totalNav.style.color = totalColor;
  totalNav.textContent = `Total Profit: $${totalProfit}`;
  let monthProfit = month.profit.toFixed(2);
  let monthColor = theme == "dark" ? "#dbdbdb" : "grey";

  if (monthProfit > 0) {
    monthColor = theme == "dark" ? "#00ff00" : "green";
  } else if (monthProfit < 0) {
    monthColor = theme == "dark" ? "#ff4343" : "red";
  }
  const monthNav = document.getElementById("monthProfit");
  monthNav.style.color = monthColor;
  monthNav.textContent = `Month's Profit: $${monthProfit}`;

  let todayProfit = today.profit.toFixed(2);
  let todayColor = theme == "dark" ? "#dbdbdb" : "grey";

  if (todayProfit > 0) {
    todayColor = theme == "dark" ? "#00ff00" : "green";
  } else if (todayProfit < 0) {
    todayColor = theme == "dark" ? "#ff4343" : "red";
  }

  const todayNav = document.getElementById("todayProfit");
  todayNav.textContent = `Today's Profit: $${todayProfit}`;
  todayNav.style.color = todayColor;
  document.getElementById("diy-stats-div").removeAttribute("style");
}
