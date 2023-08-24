import { setStats } from "./navbar.js";
import {
  getStartAndEndOfMonth,
  getDateString,
  baseUrl,
  apiRequest,
} from "./util.js";

setStats();
let dailyMap;
let startDate;
let endDate;

let date = new Date();
const startAndEnd = getStartAndEndOfMonth(date);
startDate = startAndEnd.startOfMonth;
endDate = startAndEnd.endOfMonth;

const calendarWidget = document.getElementById("calendarWidget");
let columnNum = 0;
let rowNum = 0;
let row = document.createElement("div");
let startFinished = false;
let endFinished = false;
row.classList.add("row");
row.classList.add("flex-nowrap");
calendarWidget.appendChild(row);

async function getDailyProfits() {
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

for (let i = 1; i < endDate.getDate(); ) {
  if (startDate.getDate() + 1 > columnNum && !startFinished) {
    const col = document.createElement("div");
    col.classList.add("col");
    col.classList.add("col-fixed-width");
    row.appendChild(col);
    columnNum++;
  } else if (columnNum < 7) {
    startFinished = true;
    const col = document.createElement("div");
    col.classList.add("col");
    col.classList.add("col-fixed-width");

    const spanDay = document.createElement("div");
    spanDay.textContent = i;
    const spanProfit = document.createElement("div");
    spanProfit.textContent = "$" + dailyMap["day" + i].toFixed(0);
    spanDay.classList.add("col-fixed-width");
    spanProfit.classList.add("col-fixed-width");
    if (dailyMap["day" + i] > 0) {
      spanProfit.style.color = "green";
    } else if (dailyMap["day" + i] < 0) {
      spanProfit.style.color = "red";
    }
    col.appendChild(spanDay);
    col.appendChild(spanProfit);

    row.appendChild(col);
    i++;
    columnNum++;
  } else {
    row = document.createElement("div");
    row.classList.add("row");
    row.classList.add("flex-nowrap");
    calendarWidget.appendChild(row);
    const col = document.createElement("div");
    col.classList.add("col");
    col.classList.add("col-fixed-width");
    const spanDay = document.createElement("div");
    spanDay.textContent = i;
    const spanProfit = document.createElement("div");
    spanProfit.textContent = "$" + dailyMap["day" + i].toFixed(0);
    spanDay.classList.add("col-fixed-width");
    spanProfit.classList.add("col-fixed-width");
    if (dailyMap["day" + i] > 0) {
      spanProfit.style.color = "green";
    } else if (dailyMap["day" + i] < 0) {
      spanProfit.style.color = "red";
    }
    col.appendChild(spanDay);
    col.appendChild(spanProfit);

    row.appendChild(col);
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

//sets the daily profit chart on dashboard, dailyMap needs to be fetched from api first
async function setDailyChart() {
  let dayLabels = [];
  let dayProfitDataSet = [];
  let monthProfitDataSet = [];
  let dayProfitUnitDataSet = [];
  let monthProfitUnitDataSet = [];
  let monthProfit = 0;
  for (let i = 1; i <= Object.keys(dailyMap).length; i++) {
    const profit = dailyMap["day" + i];
    const units = profit / 50;
    dayLabels.push(i);
    dayProfitDataSet.push(profit);
    dayProfitUnitDataSet.push(units);
    monthProfit += profit;
    let monthUnits = monthProfit / 50;
    monthProfitDataSet.push(monthProfit);
    monthProfitUnitDataSet.push(monthUnits);
  }
  let ctx = document.getElementById("myChart").getContext("2d");
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
      document.getElementById("unitButtonDailyItem").classList.add("disabled");
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

async function main() {
  await getDailyProfits();
}
