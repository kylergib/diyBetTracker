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
import {
  setPendingRequest,
  changeFilter,
  setBetFilterText,
  setTotalFilter,
  initializeDateFilter,
  setFilterListeners,
  changeFilterStatus,
  getStartAndEnd,
  startFilter,
  endFilter,
  betFilterStatus,
  previousRequestPending, setMonthFiilter, setWeekFilter, setDayFilter
} from "./filter.js";
let theme;
let yearJson;

let currentUser;
let userSettings;

let dailyMap;
let monthStartDate;
let monthEndDate;
let dailyDone = false;
let yearlyDone = false;

let encodedTags = []
let encodedSportsbooks = []

async function getDailyProfits(startDate, endDate) {
  return await apiRequest(
    baseUrl +
      "bets/stats?startDate=" +
      getDateString(startDate) +
      "&endDate=" +
      getDateString(endDate)
  ).then((result) => {
    if (result.status == 200) {
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
    col.classList.add("diy-calendar-day");
    row.appendChild(col);
    if (day) {
      const spanDay = document.createElement("div");
      spanDay.textContent = day;

      col.appendChild(spanDay);
      col.style.borderColor = theme == "dark" ? "white" : "black";
    }

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
                fontColor: fontColor,
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
  for (let i = 1; i <= monthEndDate.getDate(); ) {
    let profit = dailyMap["day" + i];

    if (monthStartDate.getDay() > columnNum && !startFinished) {
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
  setTheme(theme);
  setStats(theme);
  let date = new Date();
  allDaily(date);
  allYear(date);
  initializeDateFilter(updateTagsProfits);

}

main();

function unhideAll() {
  if (yearlyDone && dailyDone) {
    document.getElementById("veryTopRow").removeAttribute("style");
    document.getElementById("topRow").removeAttribute("style");
    document.getElementById("secondRow").removeAttribute("style");
    document.getElementById("thirdRow").removeAttribute("style");
  }
}

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
      if (result.status == 200) {
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
function getUserTags() {

}
apiRequest(baseUrl + "bets/userTags")
  .then((result) => {
    return result.json();
  })
  .then((json) => {
    tagsList = json;
  })
  .then(() => {
    receivedTags = true;
    getDashboardStats();
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

async function updateTagsProfits(startDate = null, endDate = null) {
  clearTags();
  let url =
      baseUrl +
      "bets/stats/dashboard?" +
      "tags=" +
      encodedTags +
      "&sportsbooks=" +
      encodedSportsbooks +
  "&type=custom";
  if (startDate != null) url += "&startDate=" + startDate;
  if (endDate != null) url += "&endDate=" + endDate;


  apiRequest(url)
      .then((result) => {
        return result.json();
      })
      .then((json) => {
        let emptySportsbook = true;
        sportsbooksList.forEach((sportsbook) => {
          let profit = json[sportsbook];
          if (profit > 0.0 || profit < 0.0) {
            createTagProfitBadge(sportsbook, "sportsbookProfit", json[sportsbook]);
            emptySportsbook = false;
          }
        });
        if (emptySportsbook) {
          //add div that says no negative or positive profits for any sportsbook
          let sportsbookDiv = document.getElementById("sportsbookProfit");
          let emptySportsbookSpan = document.createElement("span");
          emptySportsbookSpan.innerText = "No negative or positive profit in sportsbooks."
          sportsbookDiv.appendChild(emptySportsbookSpan);
        }
        let emptyTag = true;
        tagsList.forEach((tag) => {
          let profit = json[tag];
          if (profit > 0.0 || profit < 0.0) {
            createTagProfitBadge(tag, "tagProfit", json[tag]);
            emptyTag = false;
          }

        });
        if (emptyTag) {
          //add div that says no negative or positive profits for any sportsbook
          let tagDiv = document.getElementById("tagProfit");
          let emptyTagSpan = document.createElement("span");
          emptyTagSpan.innerText = "No negative or positive profit in tags."
          tagDiv.appendChild(emptyTagSpan);
        }

      })
      .catch((error) => {
        console.error(error);
      });

}


async function getDashboardStats() {
  if (sportsbooksList.length == 0 || tagsList.length == 0) {
    console.log("did not receive sportsbooks or tags yet.");
    return;
  }
  // let newTags = [];
  tagsList.forEach((tag) => {
    encodedTags.push(encodeURIComponent(tag));
  });
  // let newSportsbooks = [];
  sportsbooksList.forEach((sportsbook) => {
    encodedSportsbooks.push(encodeURIComponent(sportsbook));
  });

  let url =
    baseUrl +
    "bets/stats/dashboard?" +
    "tags=" +
      encodedTags +
    "&sportsbooks=" +
      encodedSportsbooks;

  apiRequest(url)
    .then((result) => {
      return result.json();
    })
    .then((json) => {
      const pendingAmount = parseFloat(json["pendingStake"]);
      document.getElementById(
        "pendingStake"
      ).textContent = `$${pendingAmount.toFixed(2)}`;

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
  document.getElementById(type + "RecordBadge").textContent =
    wins + "-" + losses + "-" + voids;
}
let trackers = await getTrackersProfit();
trackers.forEach((tracker) => {
  createTagTrackerBadge(tracker["tags"], tracker["profit"]);
});
document.getElementById("tagTracker").style.display = "";
function createTagTrackerBadge(tags, profit) {
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



document.getElementById("dayFilter").addEventListener(
    "click",
    async () => {
      setDayFilter(updateTagsProfits);
    },
    false
);

document.getElementById("weekFilter").addEventListener(
    "click",
    async () => {
      setWeekFilter(updateTagsProfits);
    },
    false
);
document.getElementById("monthFilter").addEventListener(
    "click",
    async () => {
      setMonthFiilter(updateTagsProfits);
    },
    false
);

document.getElementById("totalFilter").addEventListener(
    "click",
    async () => {
      setTotalFilter(updateTagsProfits);
    },
    false
);

document.getElementById("previousFilter").addEventListener(
    "click",
    async () => {
      console.log("previous clicked");
      setPendingRequest(true);
      await changeFilter(-1, updateTagsProfits);
      setPendingRequest(false);
    },
    false
);

document.getElementById("nextFilter").addEventListener(
    "click",
    async () => {
      console.log("next clicked");
      setPendingRequest(true);

      await changeFilter(1, updateTagsProfits);
      setPendingRequest(false);
    },
    false
);

function clearTags() {
  let tagElement = document.getElementById("tagProfit");sportsbookProfit
  let sportsbookElement = document.getElementById("sportsbookProfit");
  while (tagElement.firstChild) {
    tagElement.removeChild(tagElement.firstChild);
  }
  while (sportsbookElement.firstChild) {
    sportsbookElement.removeChild(sportsbookElement.firstChild);
  }
}