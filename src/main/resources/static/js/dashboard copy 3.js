import { setStats } from "./navbar.js";
import {
  getStartAndEndOfMonth,
  getDateString,
  baseUrl,
  apiRequest,
} from "./util.js";

setStats();
let dailyMap;
let monthStartDate;
let monthEndDate;

const calendarWidget = document.getElementById("calendarWidget");
let columnNum = 0;
let rowNum = 0;
let row = document.createElement("div");
let startFinished = false;
let endFinished = false;
row.classList.add("row");
row.classList.add("flex-nowrap");
calendarWidget.appendChild(row);

async function getDailyProfits(startDate, endDate) {
  await apiRequest(
    baseUrl +
      "bets/stats?startDate=" +
      getDateString(startDate) +
      "&endDate=" +
      getDateString(endDate)
  )
    .then((result) => {
      console.log(result);
      if (result.status == 200) {
        console.log("successfull?");
        return result.json();
      }
    })
    .then((json) => {
      dailyMap = json;
      console.log(dailyMap);
      //   json.mapType.forEach((value, key) => {
      //     console.log(key, value);
      //   });
    });
}
//sets the daily profit chart and calendar on dashboard, getDailyProfits() needs to finish first
async function setDailyWidgets() {
  let dayLabels = [];
  let dayProfitDataSet = [];
  let monthProfitDataSet = [];
  let dayProfitUnitDataSet = [];
  let monthProfitUnitDataSet = [];
  let monthProfit = 0;
  function createCalendarColumn(row, day = null, profit = null) {
    const col = document.createElement("div");
    col.classList.add("col");
    col.classList.add("col-fixed-width");
    row.appendChild(col);
    if (day) {
      const spanDay = document.createElement("div");
      spanDay.textContent = day;
      spanDay.classList.add("col-fixed-width");
      col.appendChild(spanDay);
    }
    if (profit != null) {
      const spanProfit = document.createElement("div");
      spanProfit.textContent = "$" + profit.toFixed(0);
      spanProfit.classList.add("col-fixed-width");
      col.appendChild(spanProfit);
      if (profit > 0) {
        spanProfit.style.color = "green";
      } else if (profit < 0) {
        spanProfit.style.color = "red";
      }
    }
  }
  function addForChart(day, profit) {
    const units = profit / 50;
    dayLabels.push(day);
    dayProfitDataSet.push(profit);
    dayProfitUnitDataSet.push(units);
    monthProfit += profit;
    let monthUnits = monthProfit / 50;
    monthProfitDataSet.push(monthProfit);
    monthProfitUnitDataSet.push(monthUnits);
  }
  function setChartData() {
    let ctx = document.getElementById("monthlyProfitChart").getContext("2d");
    let myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dayLabels,
        datasets: [
          {
            label: "Daily Profit (USD)",
            data: dayProfitDataSet,
            backgroundColor: "rgba(3, 123, 252,0.6)",
          },
          {
            label: "Monthly Profit (USD)",
            data: monthProfitDataSet,
            backgroundColor: "rgba(3, 244, 252,0.6)",
          },
        ],
      },
    });
    document.getElementById("unitButtonDaily").addEventListener(
      "click",
      () => {
        myChart.data.datasets[0].data = dayProfitUnitDataSet;
        myChart.data.datasets[0].label = "Daily Profit (Unit)";
        myChart.data.datasets[1].data = monthProfitUnitDataSet;
        myChart.data.datasets[1].label = "Monthly Profit (Unit)";
        myChart.update();
        document
          .getElementById("unitButtonDailyItem")
          .classList.add("disabled");
        document
          .getElementById("USDButtonDailyItem")
          .classList.remove("disabled");
      },
      false
    );
    document.getElementById("USDButtonDaily").addEventListener(
      "click",
      () => {
        myChart.data.datasets[0].data = dayProfitDataSet;
        myChart.data.datasets[0].label = "Daily Profit (USD)";
        myChart.data.datasets[1].data = monthProfitDataSet;
        myChart.data.datasets[1].label = "Monthly Profit (USD)";
        myChart.update();
        document.getElementById("USDButtonDailyItem").classList.add("disabled");
        document
          .getElementById("unitButtonDailyItem")
          .classList.remove("disabled");
      },
      false
    );
  }
  for (let i = 1; i < endDate.getDate(); ) {
    let profit = dailyMap["day" + i];
    if (startDate.getDate() + 1 > columnNum && !startFinished) {
      createCalendarColumn(row);
      columnNum++;
    } else if (columnNum < 7) {
      startFinished = true;
      createCalendarColumn(row, i, profit);
      addForChart(i, profit);
      i++;
      columnNum++;
    } else {
      row = document.createElement("div");
      row.classList.add("row");
      row.classList.add("flex-nowrap");
      calendarWidget.appendChild(row);
      createCalendarColumn(row, i, profit);
      addForChart(i, profit);
      i++;
      columnNum = 1;
      rowNum++;
    }
  }
  while (columnNum < 7) {
    const col = document.createElement("div");
    col.classList.add("col");
    row.appendChild(col);
    columnNum++;
  }
  setChartData();
}

async function main() {
  let date = new Date();
  const startAndEnd = getStartAndEndOfMonth(date);
  monthStartDate = startAndEnd.startOfMonth;
  monthEndDate = startAndEnd.endOfMonth;
  await getDailyProfits(monthStartDate, monthEndDate);
  setDailyWidgets();
  getMonthlyProfits(2023);
}
main();

async function getMonthlyProfits(year) {
  await apiRequest(baseUrl + "bets/stats?year=" + year)
    .then((result) => {
      console.log(result);
      if (result.status == 200) {
        console.log("successfull?");
        return result.json();
      }
    })
    .then((json) => {
      //   dailyMap = json;
      console.log(json);
      //   json.mapType.forEach((value, key) => {
      //     console.log(key, value);
      //   });
    });
}
