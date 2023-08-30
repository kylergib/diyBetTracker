import { setStats } from "./navbar.js";
import {
  getStartAndEndOfMonth,
  getDateString,
  baseUrl,
  apiRequest,
  getCurrentUser,
} from "./util.js";
import { createUser } from "./myUser.js";
import { setTheme } from "./theme.js";
import { getTrackersProfit } from "./tracker.js";
//sets navbar stats
let theme;
let yearJson;

let currentUser;
let userSettings;

// setStats();

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
    // const insideDiv = document.createElement("div");
    // insideDiv.appendChild(insideDiv);

    const col = document.createElement("div");
    col.classList.add("col");
    col.classList.add("col-fixed-width");
    col.classList.add("diy-calendar-day");
    row.appendChild(col);
    // const insideDiv = document.createElement("div");
    // col.appendChild(insideDiv);
    if (day) {
      const spanDay = document.createElement("div");
      spanDay.textContent = day;
      // spanDay.classList.add("col-fixed-width");
      col.appendChild(spanDay);
      col.style.borderColor = theme == "dark" ? "white" : "black";
    }
    // profit = 99999;
    let profitExtension = "";
    let fixedNumbers = 0;
    if (profit > 99999) {
      profit = profit / 1000000;
      fixedNumbers = 1;
      profitExtension = "M";
    } else if (profit > 9999) {
      profit = profit / 1000;
      fixedNumbers = 0;
      profitExtension = "K";
    } else if (profit > 999) {
      profit = profit / 1000;
      fixedNumbers = 1;
      profitExtension = "K";
    }

    if (profit != null) {
      const spanProfit = document.createElement("div");
      spanProfit.textContent =
        "$" + profit.toFixed(fixedNumbers) + profitExtension;
      spanProfit.style.display = "flex";
      spanProfit.style.justifyContent = "center";
      // spanProfit.classList.add("col-fixed-width");
      col.appendChild(spanProfit);
      if (profit > 0) {
        spanProfit.style.color = theme == "dark" ? "#00ff00" : "green";
        col.style.borderColor = theme == "dark" ? "#00ff00" : "green";
      } else if (profit < 0) {
        spanProfit.style.color = theme == "dark" ? "#ff4343" : "red";
        col.style.borderColor = theme == "dark" ? "#ff4343" : "red";
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
    console.log(theme, "THEME");
    let fontColor = theme == "dark" ? "white" : "black";
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
        legend: {
          labels: {
            fontColor: fontColor,
          },
        },
        scales: {
          xAxes: [
            {
              ticks: {
                fontColor: fontColor,
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
          yAxes: [
            {
              ticks: {
                fontColor: fontColor, // Change this color as needed for y-axis values
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
    // const col = document.createElement("div");
    // col.classList.add("col");
    // row.appendChild(col);
    createCalendarColumn(row);
    columnNum++;
  }
  setDailyChartData();
}

async function main() {
  let temp = await getCurrentUser();
  userSettings = temp["userSettings"];
  currentUser = createUser(temp["currentUser"]);
  theme = userSettings["theme"];
  // console.log("theme1", theme, userSettings["theme"], temp);
  setTheme(theme);
  setStats(theme);
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
    document.getElementById("thirdRow").removeAttribute("style");
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
  let fontColor = theme == "dark" ? "white" : "black";

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
    options: {
      legend: {
        labels: {
          fontColor: fontColor,
        },
      },
      scales: {
        xAxes: [
          {
            ticks: {
              fontColor: fontColor,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              fontColor: fontColor,
            },
          },
        ],
      },
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
let sportsbooksList = [];
let tagsList = [];
let receivedSportbooks = false;
let receivedTags = false;
apiRequest(baseUrl + "bets/userTags")
  .then((result) => {
    return result.json();
  })
  .then((json) => {
    tagsList = json;
    console.log(tagsList);
  })
  .then(() => {
    receivedTags = true;
    getDashboardStats();
    // tagsList.forEach((tag) => {
    //   createTagProfitBadge(tag, "tagProfit");
    // });
  })
  .catch((error) => {
    console.error(error);
  });
apiRequest(baseUrl + "bets/userSportsbooks")
  .then((result) => {
    return result.json();
  })
  .then((json) => {
    sportsbooksList = json;
    receivedSportbooks = true;
  })
  .then(() => {
    getDashboardStats();
    // sportsbooksList.forEach((sportsbook) => {
    //   createTagProfitBadge(sportsbook, "sportsbookProfit");
    // });
  })
  .catch((error) => {
    console.error(error);
  });

function createTagProfitBadge(tag, elementId, profit = 0.0) {
  const div = document.createElement("div");
  div.style.display = "flex";

  const header = document.createElement("div");
  header.className = "diy-badge-header";
  const headerSpan = document.createElement("span");
  headerSpan.className = "diy-badge-header";
  headerSpan.textContent = tag;
  header.appendChild(headerSpan);
  div.appendChild(header);

  const badgeDiv = document.createElement("div");
  badgeDiv.className = "diy-card-badge";

  const badgeSpan = document.createElement("span");
  badgeSpan.className = "badge";
  if (profit > 0) {
    badgeSpan.style.backgroundColor = theme == "dark" ? "green" : "green";
  } else if (profit < 0) {
    badgeSpan.style.backgroundColor = theme == "dark" ? "red" : "red";
  } else {
    badgeSpan.classList.add("bg-secondary");
  }
  badgeSpan.textContent = `$${parseFloat(profit).toFixed(2)}`;
  badgeDiv.appendChild(badgeSpan);
  div.appendChild(badgeDiv);
  document.getElementById(elementId).appendChild(div);
}
async function getDashboardStats() {
  if (sportsbooksList.length == 0 || tagsList.length == 0) {
    console.log("did not receive sportsbooks or tags yet.");
    return;
  }
  console.log("got both");
  let newTags = [];
  tagsList.forEach((tag) => {
    newTags.push(encodeURIComponent(tag));
  });
  let newSportsbooks = [];
  sportsbooksList.forEach((sportsbook) => {
    newSportsbooks.push(encodeURIComponent(sportsbook));
  });
  let url =
    baseUrl +
    "bets/stats/dashboard?" +
    "tags=" +
    newTags +
    "&sportsbooks=" +
    newSportsbooks;

  apiRequest(url)
    .then((result) => {
      return result.json();
    })
    .then((json) => {
      console.log(json);
      sportsbooksList.forEach((sportsbook) => {
        createTagProfitBadge(sportsbook, "sportsbookProfit", json[sportsbook]);
      });
      tagsList.forEach((tag) => {
        createTagProfitBadge(tag, "tagProfit", json[tag]);
      });
      // const pendingBadge = document.getElementById("pendingBadge");
      const pendingAmount = parseFloat(json["pendingStake"]);
      // if (pendingAmount > 0) {
      //   pendingBadge.style.backgroundColor = "green";
      // } else if (pendingAmount < 0) {
      //   pendingBadge.style.backgroundColor = "red";
      // }
      document.getElementById(
        "pendingStake"
      ).textContent = `$${pendingAmount.toFixed(2)}`;
      //setting badges for top row

      let todayStats = json["todayStats"];
      let yesterdayStats = json["yesterdayStats"];
      let weekStats = json["weekStats"];
      let monthStats = json["monthStats"];
      let yearStats = json["yearStats"];
      let totalStats = json["totalStats"];
      document.getElementById("todayOpen").textContent = todayStats["openBets"];
      document.getElementById("totalOpen").textContent = totalStats["openBets"];
      document.getElementById("monthOpen").textContent = monthStats["openBets"];
      document.getElementById("weekOpen").textContent = weekStats["openBets"];
      setBadge("today", todayStats);
      setBadge("yesterday", yesterdayStats);
      setBadge("week", weekStats);
      setBadge("month", monthStats);
      setBadge("year", yearStats);
      setBadge("total", totalStats);
    })
    .catch((error) => {
      console.error(error);
    });
}

function setBadge(type, json) {
  const profit = parseFloat(json["profit"]);
  const profitBadge = document.getElementById(type + "ProfitBadge");
  profitBadge.textContent = `$${profit.toFixed(2)}`;
  if (profit > 0) {
    profitBadge.style.backgroundColor = "green";
    profitBadge.classList.remove("bg-secondary");
  } else if (profit < 0) {
    profitBadge.style.backgroundColor = "red";
    profitBadge.classList.remove("bg-secondary");
  }

  const stake = parseFloat(json["stake"]);
  const stakeBadge = document.getElementById(type + "StakeBadge");
  stakeBadge.textContent = `$${stake.toFixed(2)}`;

  let freeBetStake = parseFloat(json["freeBetStake"]);
  const freeBetStakeBadge = document.getElementById(type + "FreeBetStakeBadge");
  freeBetStakeBadge.textContent = `$${freeBetStake.toFixed(2)}`;

  let ROI = 0;
  if (profit != 0 && stake != 0) {
    ROI = (profit / stake) * 100;
  }

  const ROIBadge = document.getElementById(type + "ROIBadge");
  ROIBadge.textContent = `${ROI.toFixed(2)}%`;
  if (ROI > 0) {
    ROIBadge.style.backgroundColor = "green";
    ROIBadge.classList.remove("bg-secondary");
  } else if (ROI < 0) {
    ROIBadge.style.backgroundColor = "red";
    ROIBadge.classList.remove("bg-secondary");
  }
  let wins = json["wonBets"];
  let losses = json["lostBets"];
  let voids = json["voidBets"];
  console.log(wins + "-" + losses + "-" + voids);
  document.getElementById(type + "RecordBadge").textContent =
    wins + "-" + losses + "-" + voids;
}
let trackers = await getTrackersProfit();
trackers.forEach((tracker) => {
  createTagTrackerBadge(tracker["tags"], tracker["profit"]);
});
document.getElementById("tagTracker").style.display = "";
function createTagTrackerBadge(tags, profit) {
  console.log(tags);
  function addBadge(text, type = "tag") {
    const header = document.createElement("div");

    const headerSpan = document.createElement("span");
    headerSpan.className = "badge mx-1";
    headerSpan.textContent = text;
    let bgColor = "white";
    if (type === "tag") {
      bgColor = "#FF6600";
    } else if (type === "sportsbook") {
      bgColor = "#0d6efd";
    } else if (type === "won") {
      bgColor = "green";
    } else if (type === "lost") {
      bgColor = "red";
    } else if (type === "void") {
      bgColor = "#ffe783";
      headerSpan.style.color = "black";
    } else {
      headerSpan.style.color = "black";
    }
    headerSpan.style.backgroundColor = bgColor;
    header.appendChild(headerSpan);
    trackerDiv.appendChild(header);
  }
  const tagTracker = document.getElementById("tagTracker");

  const div = document.createElement("div");
  div.className = "diy-tracker-card card mx-1";
  const trackerDiv = document.createElement("div");
  trackerDiv.classList.add("diy-tracker");
  let characterCount = 0;
  tags.forEach((tag) => {
    addBadge(tag);
    characterCount += tag.length;
  });
  console.log(characterCount, tags); //every 20 the card should be 80
  let charCountMultiplier = Math.ceil(characterCount / 20);
  let numItemsMultiplier = Math.ceil(tags.length / 2);
  let finalMulti =
    numItemsMultiplier > charCountMultiplier
      ? numItemsMultiplier
      : charCountMultiplier;
  div.style.width = finalMulti * 80 + "px";
  const badgeDiv = document.createElement("div");
  badgeDiv.className = "diy-tracker-badge";

  const badgeSpan = document.createElement("span");
  badgeSpan.className = "badge";
  if (profit > 0) {
    badgeSpan.style.backgroundColor = theme == "dark" ? "green" : "green";
  } else if (profit < 0) {
    badgeSpan.style.backgroundColor = theme == "dark" ? "red" : "red";
  } else {
    badgeSpan.classList.add("bg-secondary");
  }
  badgeSpan.textContent = `$${parseFloat(profit).toFixed(2)}`;
  badgeDiv.appendChild(badgeSpan);
  div.appendChild(trackerDiv);
  div.appendChild(badgeDiv);

  tagTracker.appendChild(div);
}
