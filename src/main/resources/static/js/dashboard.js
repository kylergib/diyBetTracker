import { setStats } from "./navbar.js";
import {
  getStartAndEndOfMonth,
  getDateString,
  baseUrl,
  apiRequest,
} from "./util.js";
//sets navbar stats

let yearJson;

let dailyMap;
let monthStartDate;
let monthEndDate;
let dailyDone = false;
let yearlyDone = false;

async function getDailyProfits(startDate, endDate) {
  return await apiRequest(
    baseUrl +
      "bets/stats?startDate=" +
      getDateString(startDate) +
      "&endDate=" +
      getDateString(endDate)
  ).then((result) => {
    console.log(result);
    if (result.status == 200) {
      console.log("successfull?");
      return result.json();
    }
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
  function addForDailyChart(day, profit) {
    const units = profit / 50;
    dayLabels.push(day);
    dayProfitDataSet.push(profit);
    dayProfitUnitDataSet.push(units);
    monthProfit += profit;
    let monthUnits = monthProfit / 50;
    monthProfitDataSet.push(monthProfit);
    monthProfitUnitDataSet.push(monthUnits);
  }
  function setDailyChartData() {
    let ctx = document.getElementById("monthProfitChart").getContext("2d");
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
      options: {
        scales: {
          xAxes: [
            {
              ticks: {
                callback: function (value, index, values) {
                  // Display only every other label
                  if (window.innerWidth < 1200) {
                    return index % 2 === 0 ? value : null;
                  } else {
                    return value;
                  }
                },
              },
            },
          ],
        },
      },
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth < 1200) {
        myChart.options.scales.xAxes[0].ticks.callback = function (
          value,
          index,
          values
        ) {
          return index % 2 === 0 ? value : null;
        };
      } else {
        myChart.options.scales.xAxes[0].ticks.callback = function (
          value,
          index,
          values
        ) {
          return value;
        };
      }
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
  const calendarWidget = document.getElementById("calendarWidget");
  let columnNum = 0;
  let rowNum = 0;
  let row = document.createElement("div");
  let startFinished = false;
  let endFinished = false;
  row.classList.add("row");
  row.classList.add("flex-nowrap");
  calendarWidget.appendChild(row);
  for (let i = 1; i < monthEndDate.getDate(); ) {
    let profit = dailyMap["day" + i];
    if (monthStartDate.getDate() + 1 > columnNum && !startFinished) {
      createCalendarColumn(row);
      columnNum++;
    } else if (columnNum < 7) {
      startFinished = true;
      createCalendarColumn(row, i, profit);
      addForDailyChart(i, profit);
      i++;
      columnNum++;
    } else {
      row = document.createElement("div");
      row.classList.add("row");
      row.classList.add("flex-nowrap");
      calendarWidget.appendChild(row);
      createCalendarColumn(row, i, profit);
      addForDailyChart(i, profit);
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
  setDailyChartData();
}

async function main() {
  setStats();
  let date = new Date();
  allDaily(date);
  allYear(date);
}

main();

function unhideAll() {
  if (yearlyDone && dailyDone) {
    console.log("all done will unhide.");
    document.getElementById("topRow").removeAttribute("style");
    document.getElementById("secondRow").removeAttribute("style");
  }
}
// function adjustCharts() {
//   if (window.innerWidth < 1200) {
//   } else {
//   }
// }

// window.addEventListener("resize", function () {
//   adjustCharts();
// });

async function allDaily(date) {
  const startAndEnd = getStartAndEndOfMonth(date);
  monthStartDate = startAndEnd.startOfMonth;
  monthEndDate = startAndEnd.endOfMonth;
  dailyMap = await getDailyProfits(monthStartDate, monthEndDate);
  setDailyWidgets();
  getMonthlyProfits(date.getFullYear());
  dailyDone = true;
  unhideAll();
}
async function allYear(date) {
  yearJson = await getMonthlyProfits(date.getFullYear());
  setYearChart(yearJson);
  yearlyDone = true;
  unhideAll();
}

async function getMonthlyProfits(year) {
  return await apiRequest(baseUrl + "bets/stats?year=" + year).then(
    (result) => {
      console.log(result);
      if (result.status == 200) {
        console.log("successfull?");
        return result.json();
      }
    }
  );
}

function setYearChart(yearJson) {
  let monthLabels = [];
  let yearProfitDataSet = [];
  let monthProfitDataSet = [];
  let yearProfitUnitDataSet = [];
  let monthProfitUnitDataSet = [];
  let yearProfit = 0;
  for (let i = 1; i <= 12; i++) {
    const profit = yearJson["month" + i];
    const units = profit / 50;
    monthLabels.push(i);
    monthProfitDataSet.push(profit);
    monthProfitUnitDataSet.push(units);
    yearProfit += profit;
    let yearUnits = yearProfit / 50;
    yearProfitDataSet.push(yearProfit);
    yearProfitUnitDataSet.push(yearUnits);
  }

  let ctx = document.getElementById("yearProfitChart").getContext("2d");
  let myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: "Monthly Profit (USD)",
          data: monthProfitDataSet,
          backgroundColor: "rgba(3, 123, 252,0.6)",
        },
        {
          label: "Year Profit (USD)",
          data: yearProfitDataSet,
          backgroundColor: "rgba(3, 244, 252,0.6)",
        },
      ],
    },
  });
  document.getElementById("unitButtonMonthly").addEventListener(
    "click",
    () => {
      myChart.data.datasets[0].data = monthProfitUnitDataSet;
      myChart.data.datasets[0].label = "Monthly Profit (Unit)";
      myChart.data.datasets[1].data = yearProfitUnitDataSet;
      myChart.data.datasets[1].label = "Year Profit (Unit)";
      myChart.update();
      document
        .getElementById("unitButtonMonthlyItem")
        .classList.add("disabled");
      document
        .getElementById("USDButtonMonthlyItem")
        .classList.remove("disabled");
    },
    false
  );
  document.getElementById("USDButtonMonthly").addEventListener(
    "click",
    () => {
      myChart.data.datasets[0].data = monthProfitDataSet;
      myChart.data.datasets[0].label = "Monthly Profit (USD)";
      myChart.data.datasets[1].data = yearProfitDataSet;
      myChart.data.datasets[1].label = "Year Profit (USD)";
      myChart.update();
      document.getElementById("USDButtonMonthlyItem").classList.add("disabled");
      document
        .getElementById("unitButtonMonthlyItem")
        .classList.remove("disabled");
    },
    false
  );
}
