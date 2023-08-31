import { createUser } from "./myUser.js";
import { getAllUserBetsDate } from "./bet.js";
import { calculateProfit } from "./calculatorUtil.js";
import {
  formatDateOnly,
  getCurrentDateTimeString,
  getStartAndEndOfWeek,
  getStartAndEndOfMonth,
  getDateString,
  apiRequest,
  baseUrl,
  getCurrentUser,
} from "./util.js";
import { setStats } from "./navbar.js";
import { createAlert } from "./diyAlerts.js";
import { setTheme } from "./theme.js";

// export const baseUrl = "http://" + window.location.host + "/api/";

const bets = [];
let betTags = [];
let todaysDate = new Date();
let betFilterStatus = "day";
let startFilter = new Date();
let endFilter = new Date();
let previousRequestPending = false;
let filterShown = false;
let appliedTagFilters = [];
let appliedSportsbookFilters = [];
let appliedStatusFilters = [];
let appliedMaxOdds;
let appliedMinOdds;
let appliedMaxStake;
let appliedMinStake;

let styleMode;
let currentUser;
let userSettings;
let temp = await getCurrentUser();
userSettings = temp["userSettings"];
currentUser = createUser(temp["currentUser"]);
styleMode = userSettings["theme"];
setTheme(styleMode);
setStats(styleMode);
document.getElementById("eventDateInput").value = getDateString(todaysDate);

function setPendingRequest(value) {
  previousRequestPending = value;

  const itemList = [
    document.getElementById("dayListItem"),
    document.getElementById("weekListItem"),
    document.getElementById("monthListItem"),
  ];
  if (betFilterStatus !== "custom") {
    itemList.push(document.getElementById("previousListItem"));
    itemList.push(document.getElementById("nextListItem"));
  }

  if (value == true) {
    itemList.forEach((item) => {
      item.classList.add("disabled");
    });
  } else {
    itemList.forEach((item) => {
      item.classList.remove("disabled");
    });
  }
}
setBetFilterText(formatDateOnly(startFilter));

function setBetFilterText(text) {
  document.getElementById("currentDateFilter").textContent = text;
}

$(function () {
  $('a[id="currentDateFilter"]').daterangepicker(
    {
      opens: "left",
    },
    async function (start, end, label) {
      setPendingRequest(true);
      let text;
      let filterStatus;

      startFilter = new Date(start);
      endFilter = new Date(end);
      let endDate = null;
      if (start.format("YYYY-MM-DD") == end.format("YYYY-MM-DD")) {
        text = `${formatDateOnly(startFilter)}`;
        filterStatus = "day";
        // set filter to day
      } else {
        text = `${formatDateOnly(startFilter)} - ${formatDateOnly(endFilter)}`;
        endDate = getDateString(endFilter);
        filterStatus = "custom";
      }

      changeFilterStatus(filterStatus);
      setBetFilterText(text);
      clearTable();
      sortBetsAndAdd(
        await getAllUserBetsDate(getDateString(startFilter), endDate)
      );
      setPendingRequest(false);
    }
  );
});

document.getElementById("previousFilter").addEventListener(
  "click",
  async () => {
    console.log("previous clicked");
    setPendingRequest(true);
    await changeFilteredBet(-1);
    setPendingRequest(false);
  },
  false
);

document.getElementById("nextFilter").addEventListener(
  "click",
  async () => {
    console.log("next clicked");
    setPendingRequest(true);

    await changeFilteredBet(1);
    setPendingRequest(false);
  },
  false
);

document.getElementById("dayFilter").addEventListener(
  "click",
  async () => {
    console.log("day clicked");
    if (betFilterStatus !== "day" && previousRequestPending == false) {
      setPendingRequest(true);
      changeFilterStatus("day");
      endFilter = new Date(startFilter);
      setBetFilterText(formatDateOnly(startFilter));
      clearTable();
      sortBetsAndAdd(await getAllUserBetsDate(getDateString(startFilter)));
      setPendingRequest(false);
    }
  },
  false
);

document.getElementById("weekFilter").addEventListener(
  "click",
  async () => {
    console.log("week clicked");
    if (betFilterStatus !== "week" && previousRequestPending == false) {
      setPendingRequest(true);
      changeFilterStatus("week");
      const startAndEnd = getStartAndEndOfWeek(startFilter);
      startFilter = new Date(startAndEnd.startOfWeek);
      endFilter = new Date(startAndEnd.endOfWeek);
      setBetFilterText(
        `${formatDateOnly(startFilter)} - ${formatDateOnly(endFilter)}`
      );
      clearTable();
      sortBetsAndAdd(
        await getAllUserBetsDate(
          getDateString(startFilter),
          getDateString(endFilter)
        )
      );
      setPendingRequest(false);
    }
  },
  false
);
document.getElementById("monthFilter").addEventListener(
  "click",
  async () => {
    console.log("month clicked");

    if (betFilterStatus !== "month") {
      setPendingRequest(true);
      changeFilterStatus("month");
      const startAndEnd = getStartAndEndOfMonth(startFilter);
      startFilter = new Date(startAndEnd.startOfMonth);
      endFilter = new Date(startAndEnd.endOfMonth);
      setBetFilterText(
        `${formatDateOnly(startFilter)} - ${formatDateOnly(endFilter)}`
      );
      clearTable();
      sortBetsAndAdd(
        await getAllUserBetsDate(
          getDateString(startFilter),
          getDateString(endFilter)
        )
      );
      setPendingRequest(false);
    }
  },
  false
);

function changeFilterStatus(filter) {
  const dayItem = document.getElementById("dayListItem");
  const weekItem = document.getElementById("weekListItem");
  const monthItem = document.getElementById("monthListItem");
  const previousItem = document.getElementById("previousListItem");
  const nextItem = document.getElementById("nextListItem");
  if (filter === "day") {
    dayItem.classList.add("active");
    weekItem.classList.remove("active");
    monthItem.classList.remove("active");
    previousItem.classList.remove("disabled");
    nextItem.classList.remove("disabled");
    betFilterStatus = "day";
  } else if (filter === "week") {
    dayItem.classList.remove("active");
    weekItem.classList.add("active");
    monthItem.classList.remove("active");
    previousItem.classList.remove("disabled");
    nextItem.classList.remove("disabled");
    betFilterStatus = "week";
  } else if (filter === "month") {
    dayItem.classList.remove("active");
    weekItem.classList.remove("active");
    monthItem.classList.add("active");
    previousItem.classList.remove("disabled");
    nextItem.classList.remove("disabled");
    betFilterStatus = "month";
  } else if (filter === "custom") {
    dayItem.classList.remove("active");
    weekItem.classList.remove("active");
    monthItem.classList.remove("active");
    previousItem.classList.add("disabled");
    nextItem.classList.add("disabled");
    betFilterStatus = "custom";
  }
}
async function changeFilteredBet(changeAmount) {
  let text;
  let startDate;
  let endDate;
  if (betFilterStatus === "day") {
    startFilter.setDate(startFilter.getDate() + changeAmount);
    endFilter.setDate(endFilter.getDate() + changeAmount);
    text = formatDateOnly(startFilter);

    endDate = null;
  } else if (betFilterStatus === "week") {
    changeAmount *= 7;
    startFilter.setDate(startFilter.getDate() + changeAmount);
    endFilter.setDate(endFilter.getDate() + changeAmount);
    text = `${formatDateOnly(startFilter)} - ${formatDateOnly(endFilter)}`;
    endDate = getDateString(endFilter);
  } else if (betFilterStatus === "month") {
    startFilter.setMonth(startFilter.getMonth() + changeAmount);
    endFilter = new Date(
      startFilter.getFullYear(),
      startFilter.getMonth() + 1,
      0
    );

    text = `${formatDateOnly(startFilter)} - ${formatDateOnly(endFilter)}`;
    endDate = getDateString(endFilter);
  }
  startDate = getDateString(startFilter);
  setBetFilterText(text);
  clearTable();
  sortBetsAndAdd(await getAllUserBetsDate(startDate, endDate));
}

function createBetRow(bet) {
  function createColumn(
    row,
    values,
    betClass = "diy-bet-open",
    cellClass = "diy-cell"
  ) {
    const cell = row.insertCell(-1);
    cell.setAttribute("style", "text-align: center;");
    cell.classList.add(cellClass);
    cell.classList.add(betClass);

    values.forEach((value) => {
      const text = document.createElement("div");
      text.textContent = value;
      text.setAttribute("class", "itemText");

      cell.appendChild(text);
    });
  }

  let table = document.getElementById("betBody");
  const row = table.insertRow(-1);
  row.style.verticalAlign = "middle";
  row.classList.add("diy-bet-row");

  // let backgroundColor = "#d9d9d9";
  let textColor = styleMode == "dark" ? "#dbdbdb" : "grey";
  let bootStrapColor = "open";
  let betClass = "diy-bet-open";
  if (bet.status === "won") {
    textColor = styleMode == "dark" ? "#00ff00" : "green";
    bootStrapColor = "won";
    betClass = "diy-bet-won";
  } else if (bet.status === "void") {
    textColor = styleMode == "dark" ? "#ffe783" : "#bf9f1a";
    bootStrapColor = "void";
    betClass = "diy-bet-void";
  } else if (bet.status === "lost") {
    textColor = styleMode == "dark" ? "#ff4343" : "#b10000";
    bootStrapColor = "lost";
    betClass = "diy-bet-lost";
  }
  row.classList.add(betClass);
  createColumn(row, [bet.sportsbook], betClass, "diy-cell-first");
  const legList = [];
  let currentText = "";
  bet.legs.forEach((leg) => {
    if (currentText === "") {
      currentText += leg;
    } else if (currentText.length + leg.length > 40) {
      legList.push(currentText);
      currentText = leg;
    } else {
      currentText += ", " + leg;
    }
  });
  if (currentText !== "") {
    legList.push(currentText);
  }

  createColumn(row, legList, betClass);
  createColumn(row, [bet.eventDate], betClass);
  createColumn(row, [bet.odds], betClass);
  const stakeList = [];
  if (bet.stake > 0) {
    stakeList.push("Stake: $" + bet.stake.toFixed(2));
  } else {
    stakeList.push("F.B. Stake: $" + bet.freeBetStake.toFixed(2));
  }
  createColumn(row, [stakeList], betClass);
  if (bet.profit == 0) {
    createColumn(row, [""], betClass);
  } else {
    createColumn(row, ["$" + bet.profit.toFixed(2)], betClass);
  }
  createColumn(row, [bet.tags], betClass);
  const selectElement = document.createElement("select");
  selectElement.setAttribute("class", "form-select");
  selectElement.setAttribute("aria-label", "Default select example");
  selectElement.style.backgroundColor = styleMode == "dark" ? "#1e2124" : "";
  let imageUrl = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='${encodeURIComponent(
    textColor
  )}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`;

  selectElement.style.backgroundImage = imageUrl;
  selectElement.classList.add(betClass);

  const statusList = ["Open", "Lost", "Won", "Void"];

  statusList.forEach((status) => {
    const option = document.createElement("option");
    option.setAttribute("value", status);
    option.textContent = status;
    if (status.toLowerCase() === bet.status.toLowerCase()) {
      option.selected = true;
    }

    selectElement.appendChild(option);
  });
  selectElement.addEventListener("change", (event) => {
    bet.status = event.target.value.toLowerCase();
    switch (event.target.value) {
      case "Won":
        bet.profit = calculateProfit(bet.odds, bet.stake, bet.freeBetStake);
        updateBet(bet); //todo: update bet function
        break;
      case "Lost":
        bet.profit = bet.stake * -1;
        updateBet(bet); //todo: update bet function
        break;
      case "Void":
      case "Open":
        bet.profit = 0;
        updateBet(bet); //todo: update bet function
        break;
    }
    setStats(styleMode);
  });
  const statusCell = row.insertCell(-1);
  statusCell.style.textAlign = "center";
  statusCell.style.minWidth = "125px";
  statusCell.appendChild(selectElement);
  statusCell.classList.add("diy-cell");
  statusCell.classList.add(betClass);

  const actionCell = row.insertCell(-1);
  actionCell.setAttribute("style", "text-align: center;");
  actionCell.classList.add("diy-cell");
  actionCell.classList.add(betClass);

  const actionDiv = document.createElement("div");
  const editButton = document.createElement("button");
  editButton.className = "btn btn-outline-" + bootStrapColor;
  editButton.type = "button";
  const editIcon = document.createElement("i");
  editIcon.className = "fas fa-edit";

  editButton.appendChild(editIcon);
  editButton.classList.add("diy-action-button");
  editButton.addEventListener(
    "click",
    () => {
      document.getElementById("betTypeInput").value = "updateBet";
      document.getElementById("betIdInput").value = bet.id;
      document.getElementById("sportsbookInput").value = bet.sportsbook;
      document.getElementById("statusSelect").value = bet.status;
      document.getElementById("oddsInput").value = bet.odds;
      document.getElementById("stakeInput").value = bet.stake;
      document.getElementById("freeBetStakeInput").value = bet.freeBetStake;
      document.getElementById("profitInput").value = bet.profit;
      document.getElementById("eventDateInput").value = bet.eventDate;
      betTags = bet.tags;
      setTags();
      document.getElementById("evPercentInput").value = bet.evPercent;
      document.getElementById("expectedProfitInput").value = bet.expectedProfit;
      document.getElementById("freeBetRecieved").value =
        bet.freeBetAmountRecieved;
      document.getElementById("freeBeReceivedCheckbox").check =
        bet.freeBetWasRecieved;

      const legRow = document.getElementById("legRow");
      const legInputs = legRow.querySelectorAll("input");

      for (let i = 0; i < bet.legs.length; i++) {
        if (i > 12) {
          break;
        }
        legInputs[i].value = bet.legs[i];
      }

      openNewBet();
    },
    false
  );

  actionDiv.appendChild(editButton);

  const deleteButton = document.createElement("button");
  deleteButton.className = "btn btn-outline-" + bootStrapColor;
  deleteButton.type = "button";
  const deleteIcon = document.createElement("i");
  deleteIcon.className = "fas fa-trash";

  deleteButton.appendChild(deleteIcon);
  deleteButton.classList.add("diy-action-button");
  deleteButton.addEventListener(
    "click",
    async () => {
      apiRequest(baseUrl + "bets/" + bet.id, "DELETE")
        .then((result) => {
          if (result.status != 200 && result.status != 201) {
            createAlert(
              "Could not delete bet. Please reload and try again.",
              "danger"
            );
          } else {
            createAlert("Bet deleted.", "success");
            row.remove();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    false
  );
  actionDiv.appendChild(deleteButton);
  actionCell.appendChild(actionDiv);

  const divTest = document.createElement("div");

  const checkbox = document.createElement("input");
  checkbox.setAttribute("type", "checkbox");
  checkbox.setAttribute("class", "btn-check");
  checkbox.setAttribute("autocomplete", "off");
  checkbox.id = "select-" + bet.id;

  const label = document.createElement("label");
  label.setAttribute("class", "btn diy-bet-btn btn-outline-" + bootStrapColor);
  label.setAttribute("for", "select-" + bet.id);
  label.textContent = "";

  divTest.appendChild(checkbox);
  divTest.appendChild(label);

  const hiddenLabel = document.createElement("input");

  hiddenLabel.setAttribute("id", "betID");
  hiddenLabel.type = "hidden";
  hiddenLabel.value = bet.id;

  const checkboxCell = row.insertCell(-1);
  checkboxCell.setAttribute("style", "text-align: center;");
  checkboxCell.appendChild(divTest);

  checkboxCell.appendChild(hiddenLabel);
  checkboxCell.classList.add("diy-cell-last");
  checkboxCell.classList.add(betClass);
}

async function main() {
  if (previousRequestPending == false) {
    setPendingRequest(true);
    sortBetsAndAdd(await getAllUserBetsDate(getDateString(todaysDate)));
    setPendingRequest(false);
  }
}
function sortBetsAndAdd(bets) {
  if (bets.length == 0) {
    let table = document.getElementById("betBody");
    const row = table.insertRow(-1);
    row.style.verticalAlign = "middle";
    const cell = row.insertCell(-1);
    cell.setAttribute("style", "text-align: center;");
    cell.setAttribute("colspan", "10");

    const text = document.createElement("div");
    text.textContent = "No bets found for this date.";
    text.setAttribute("class", "itemText");

    cell.appendChild(text);
  }
  bets.sort((a, b) => {
    const dateComparison = new Date(b.eventDate) - new Date(a.eventDate);
    if (dateComparison !== 0) {
      return dateComparison;
    }
    if (b.status === "open" && a.status !== "open") {
      return 1;
    }
    return -1;
  });
  bets.forEach((bet) => {
    createBetRow(bet);
  });
  document.getElementById("filterNav").style.display = "";
  document.getElementById("betTable").style.display = "";
}
function clearTable() {
  console.log("clearing table?");
  document.getElementById("betTable").style.display = "none";
  let table = document.getElementById("betBody");
  table.querySelectorAll("tr").forEach((row) => {
    row.remove();
  });
}

function validateBetFields(
  sportsbook,
  odds,
  stake,
  freeBetStake,
  eventDate,
  legs
) {
  let valid = true;
  if (sportsbook === "") {
    console.log("sportsbook cannot be blank");
    createAlert("Sportsbook cannot be blank", "danger");
    valid = false;
  }

  if (odds === "") {
    console.log("odds cannot be blank");
    createAlert("Odds cannot be blank", "danger");
    valid = false;
  }

  if (stake < 0) {
    console.log("stake cannot be less than 0");
    createAlert("Stake cannot be less than 0", "danger");
    valid = false;
  }

  if (freeBetStake < 0) {
    console.log("freeBetStake cannot be less than 0");
    createAlert("Freebet stake cannot be less than 0", "danger");
    valid = false;
  } else if (freeBetStake == 0 && stake == 0) {
    console.log("freeBetStake and stake cannot be 0");
    createAlert("Freebet stake and stake cannot be 0", "danger");
    valid = false;
  }

  if (eventDate === "") {
    console.log("event date cannot be blank");
    createAlert("Event date cannot be blank", "danger");
    valid = false;
  }

  if (legs.length === 0) {
    console.log("At least 1 leg is needed");
    createAlert("At least 1 leg is needed", "danger");
    valid = false;
  }

  return valid;
}

function checkProfit() {
  const profitInput = document.getElementById("profitInput");

  const status = document.getElementById("statusSelect").value;
  if (status === "open" || status === "void") {
    profitInput.value = 0;
    return;
  }

  const odds = document.getElementById("oddsInput").value;
  if (odds === "") {
    return;
  }
  let stake = document.getElementById("stakeInput").value;
  let freeBetStake = document.getElementById("freeBetStakeInput").value;
  if (freeBetStake < 0.01 && stake < 0.01) {
    return;
  }
  if (freeBetStake === "") {
    freeBetStake = 0;
  }
  if (stake === "") {
    stake = 0;
  }
  if (status === "lost") {
    profitInput.value = stake * -1;
  } else if (status === "won") {
    profitInput.value = calculateProfit(odds, stake, freeBetStake);
  }
}

const profitCheckList = [
  "stakeInput",
  "freeBetStakeInput",
  "statusSelect",
  "oddsInput",
];
profitCheckList.forEach((element) => {
  document.getElementById(element).addEventListener(
    "input",
    () => {
      checkProfit();
    },
    false
  );
});

document.getElementById("saveBetButton").addEventListener(
  "click",
  async () => {
    const sportsbook = document.getElementById("sportsbookInput").value;
    const odds = document.getElementById("oddsInput").value;
    const stake = document.getElementById("stakeInput").value;
    const freeBetStake = document.getElementById("freeBetStakeInput").value;
    const eventDate = document.getElementById("eventDateInput").value;
    const evPercent = document.getElementById("evPercentInput").value;
    const expectedProfit = document.getElementById("expectedProfitInput").value;
    const freeBetAmountRecieved =
      document.getElementById("freeBetRecieved").value;
    const freeBetWasRecieved = document.getElementById(
      "freeBeReceivedCheckbox"
    ).checked;
    const legs = [];

    const legRow = document.getElementById("legRow");
    legRow.querySelectorAll("input").forEach((input) => {
      if (input.value !== "") {
        legs.push(input.value);
      }
    });
    const status = document.getElementById("statusSelect").value;
    if (
      !validateBetFields(sportsbook, odds, stake, freeBetStake, eventDate, legs)
    ) {
      return;
    }
    const profit = document.getElementById("profitInput").value;

    const bet = {
      sportsbook: sportsbook,
      eventDate: eventDate,
      dateAdded: getCurrentDateTimeString(),
      legs: legs,
      odds: parseInt(odds),
      status: status,
      stake: parseFloat(stake),
      profit: parseFloat(profit),
      tags: betTags,
      freeBetStake: parseFloat(freeBetStake),
      evPercent: parseFloat(evPercent),
      expectedProfit: parseFloat(expectedProfit),
      freeBetAmountRecieved: parseFloat(freeBetAmountRecieved),
      freeBetWasRecieved: freeBetWasRecieved === "true",
    };
    let method;
    let betUrl;
    if (document.getElementById("betTypeInput").value === "addBet") {
      method = "POST";
      bet.myUser = { id: currentUser.id };
      betUrl = baseUrl + "bets/addBet";
    } else if (document.getElementById("betTypeInput").value === "updateBet") {
      method = "PATCH";
      betUrl = baseUrl + "bets/" + document.getElementById("betIdInput").value;
    } else {
      console.log("add or update bet has not been set");
      return;
    }
    let betSaved = false;
    const saveBetRequest = await apiRequest(betUrl, method, bet).then(
      (result) => {
        if (result.status != 200 && result.status != 201) {
          createAlert("Could not save bet. Please try again.", "danger");
        } else {
          betSaved = true;
          createAlert("Bet saved successfully", "success");
        }
      }
    );
    if (!betSaved) {
      return;
    }

    const keepSportsbook = document.getElementById(
      "keepSportsbookCheckbox"
    ).checked;
    const keepDate = document.getElementById("keepDateCheckbox").checked;
    const keepStatus = document.getElementById("keepStatusCheckbox").checked;
    const keepTags = document.getElementById("keepTagsCheckbox").checked;
    const keepList = [];
    let keepBool = false;
    if (keepSportsbook) {
      keepList.push("sportsbook");
      keepBool = true;
    }
    if (keepDate) {
      keepList.push("date");
      keepBool = true;
    }
    if (keepStatus) {
      keepList.push("status");
      keepBool = true;
    }
    if (keepTags) {
      keepList.push("tags");
      keepBool = true;
    }
    if (keepBool) {
      clearInputs(keepList);
      return;
    }
    if (bet.profit != 0) {
      setStats(styleMode);
    }
    let endDate = null;
    if (betFilterStatus !== "day") {
      endDate = getDateString(endFilter);
    }
    let startDate = getDateString(startFilter);

    clearTable();
    sortBetsAndAdd(await getAllUserBetsDate(startDate, endDate));
    console.log("Should be reloading bets?");
    // window.location.reload();
  },
  false
);
function addTag(tagName) {
  if (!betTags.includes(tagName)) {
    betTags.push(tagName);
  }
  setTags();
}
function removeTag(tagName) {
  if (betTags.includes(tagName)) {
    betTags.splice(betTags.indexOf(tagName), 1);
  }
  setTags();
}
function clearTags() {
  betTags.length = 0;
  setTags();
}
function setTags() {
  let tagContent = "";
  betTags.forEach((tag) => {
    if (tagContent === "") {
      tagContent = tag;
    } else {
      tagContent += ", " + tag;
    }
  });
  document.getElementById("betTags").textContent = "Tags: " + tagContent;
}

document.getElementById("addTagDropdown").addEventListener(
  "click",
  () => {
    addTag(document.getElementById("tagInput").value);
    document.getElementById("tagInput").value = "";
  },
  false
);
document.getElementById("removeTagDropdown").addEventListener(
  "click",
  () => {
    removeTag(document.getElementById("tagInput").value);
    document.getElementById("tagInput").value = "";
  },
  false
);
document.getElementById("clearTagsDropdown").addEventListener(
  "click",
  () => {
    clearTags();
    document.getElementById("tagInput").value = "";
  },
  false
);

function openNewBet() {
  document.getElementById("addBetDiv").style.display = "flex";
  document.getElementById("overlay").style.display = "block";
  document.getElementById("sportsbookInput").focus();
}

document.getElementById("addBetButton").addEventListener(
  "click",
  () => {
    openNewBet();
    document.getElementById("betTypeInput").value = "addBet";
  },
  false
);
document.getElementById("closeBetButton").addEventListener(
  "click",
  () => {
    document.getElementById("addBetDiv").style.display = "none";
    document.getElementById("overlay").style.display = "none";
    clearInputs();
  },
  false
);

function updateBet(bet) {
  bet.myUser = { id: currentUser.id };
  apiRequest(baseUrl + "bets/" + bet.id, "PATCH", bet).then((result) => {
    if (result.status != 200) {
      createAlert("Could not update bet, please try again.", "danger");
    } else {
      createAlert("Bet updated successfully", "success");
    }
  });
}
function clearInputs(keepList = []) {
  document.getElementById("betTypeInput").value = "addBet";
  document.getElementById("betIdInput").value = "";

  if (!keepList.includes("sportsbook")) {
    document.getElementById("sportsbookInput").value = "";
  }
  if (!keepList.includes("status")) {
    document.getElementById("statusSelect").value = "open";
  }

  document.getElementById("oddsInput").value = "";
  document.getElementById("stakeInput").value = "";
  document.getElementById("freeBetStakeInput").value = "";
  document.getElementById("profitInput").value = "";
  if (!keepList.includes("date")) {
    document.getElementById("eventDateInput").value = getDateString(todaysDate);
  }

  if (!keepList.includes("tags")) {
    betTags = [];
    setTags();
  }

  document.getElementById("evPercentInput").value = "";
  document.getElementById("expectedProfitInput").value = "";
  document.getElementById("freeBetRecieved").value = "";
  document.getElementById("freeBeReceivedCheckbox").check = false;

  const legRow = document.getElementById("legRow");
  const legInputs = legRow.querySelectorAll("input");

  legInputs.forEach((input) => {
    input.value = "";
  });
}
main();
let sportsbooksList = [];
let tagsList = [];
apiRequest(baseUrl + "bets/userTags")
  .then((result) => {
    return result.json();
  })
  .then((json) => {
    tagsList = json;
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
    setFilterTags();
    setFilterSportsbooks();
  })
  .catch((error) => {
    console.error(error);
  });
const sportsbookInput = document.getElementById("sportsbookInput");
const sportsbookSuggestionDiv = document.getElementById(
  "sportsbookSuggestionContainer"
);

sportsbookInput.addEventListener("input", () => {
  let filter = sportsbookInput.value.toUpperCase();
  sportsbookSuggestionDiv.innerHTML = "";
  let inputWidth = sportsbookInput.offsetWidth;
  sportsbookSuggestionDiv.style.width = inputWidth + "px";

  if (!filter) return;

  for (let i = 0; i < sportsbooksList.length; i++) {
    if (sportsbooksList[i].toUpperCase().indexOf(filter) > -1) {
      let div = document.createElement("div");
      div.innerHTML = sportsbooksList[i];

      div.addEventListener("click", function () {
        sportsbookInput.value = this.innerText;
        sportsbookSuggestionDiv.innerHTML = "";
      });

      sportsbookSuggestionDiv.appendChild(div);
    }
  }
});

const filterButton = document.getElementById("filterButton");
const filterContainer = document.getElementById("filterContainer");
const tagFilters = document.getElementById("tagFilters");
const sportsbookFilters = document.getElementById("sportsbookFilters");
document.addEventListener("click", (event) => {
  let inFilterContainer = filterContainer.contains(event.target);
  let inFilterButton = filterButton.contains(event.target);
  let inTagFilters = tagFilters.contains(event.target);

  if (!inFilterButton && !inFilterContainer && !inTagFilters && filterShown) {
    filterContainer.style.display = "none";
    filterShown = false;
  }
});
function setFilterTags() {
  for (let i = 0; i < tagsList.length; i++) {
    const thisTag = tagsList[i];
    const groupDiv = document.createElement("div");
    groupDiv.className = "input-group mb-3";
    const inputGroupText = document.createElement("div");
    inputGroupText.className = "input-group-text";
    const inputCheckbox = document.createElement("input");
    inputCheckbox.setAttribute("type", "checkbox");
    inputCheckbox.className = "form-check-input mt-0";

    inputGroupText.appendChild(inputCheckbox);

    const spanText = document.createElement("span");
    spanText.className = "input-group-text";
    spanText.style.flexGrow = "1";
    spanText.textContent = thisTag;

    groupDiv.appendChild(inputGroupText);
    groupDiv.appendChild(spanText);
    tagFilters.appendChild(groupDiv);
  }
}
function setFilterSportsbooks() {
  for (let i = 0; i < sportsbooksList.length; i++) {
    const thisTag = sportsbooksList[i];
    const groupDiv = document.createElement("div");
    groupDiv.className = "input-group mb-3";
    const inputGroupText = document.createElement("div");
    inputGroupText.className = "input-group-text";
    const inputCheckbox = document.createElement("input");
    inputCheckbox.setAttribute("type", "checkbox");
    inputCheckbox.className = "form-check-input mt-0";

    inputGroupText.appendChild(inputCheckbox);

    const spanText = document.createElement("span");
    spanText.className = "input-group-text";
    spanText.style.flexGrow = "1";
    spanText.textContent = thisTag;

    groupDiv.appendChild(inputGroupText);
    groupDiv.appendChild(spanText);
    sportsbookFilters.appendChild(groupDiv);
  }
}

filterButton.addEventListener(
  "click",
  () => {
    filterContainer.style.display = "block";
    filterShown = true;
  },
  false
);
function getAppliedTagFilters() {
  appliedTagFilters = [];
  tagFilters.querySelectorAll(".input-group.mb-3").forEach((group) => {
    const inputChecked = group.querySelector("input").checked;
    const spanText = group.querySelector("span").textContent;

    if (inputChecked) {
      appliedTagFilters.push(spanText);
    }
  });
}
function getAppliedSportsbookFilters() {
  appliedSportsbookFilters = [];
  sportsbookFilters.querySelectorAll(".input-group.mb-3").forEach((group) => {
    const inputChecked = group.querySelector("input").checked;
    const spanText = group.querySelector("span").textContent;

    if (inputChecked) {
      appliedSportsbookFilters.push(spanText);
    }
  });
}
function getAppliedStatusFilters() {
  appliedStatusFilters = [];
  document
    .getElementById("statusFilters")
    .querySelectorAll(".input-group.mb-3")
    .forEach((group) => {
      const inputChecked = group.querySelector("input").checked;
      const spanText = group.querySelector("span").textContent;

      if (inputChecked) {
        appliedStatusFilters.push(spanText);
      }
    });
}
function clearTagFilters() {
  appliedTagFilters = [];
  tagFilters.querySelectorAll(".input-group.mb-3").forEach((group) => {
    group.querySelector("input").checked = false;
  });
}
function clearSportsbookFilters() {
  appliedSportsbookFilters = [];
  sportsbookFilters.querySelectorAll(".input-group.mb-3").forEach((group) => {
    group.querySelector("input").checked = false;
  });
}
function clearStatusFilters() {
  appliedStatusFilters = [];
  document
    .getElementById("statusFilters")
    .querySelectorAll(".input-group.mb-3")
    .forEach((group) => {
      group.querySelector("input").checked = false;
    });
}

document.getElementById("applyFilterButton").addEventListener(
  "click",
  async () => {
    getAppliedTagFilters();
    getAppliedSportsbookFilters();
    getAppliedStatusFilters();
    appliedMaxOdds = document.getElementById("maxOddsFilter").value;
    appliedMinOdds = document.getElementById("minOddsFilter").value;
    appliedMaxStake = document.getElementById("maxStakeFilter").value;
    appliedMinStake = document.getElementById("minStakeFilter").value;

    setPendingRequest(true);
    clearTable();
    sortBetsAndAdd(
      await getAllUserBetsDate(
        getDateString(startFilter),
        getDateString(endFilter),
        appliedTagFilters,
        appliedSportsbookFilters,
        appliedStatusFilters,
        appliedMaxOdds,
        appliedMinOdds,
        appliedMaxStake,
        appliedMinStake
      )
    );
    setPendingRequest(false);
  },
  false
);

document.getElementById("clearFilterButton").addEventListener(
  "click",
  () => {
    clearTagFilters();
    clearSportsbookFilters();
    clearStatusFilters();
    document.getElementById("maxOddsFilter").value = "";
    document.getElementById("minOddsFilter").value = "";
    document.getElementById("maxStakeFilter").value = "";
    document.getElementById("minStakeFilter").value = "";
    appliedMaxOdds = "";
    appliedMinOdds = "";
    appliedMaxStake = "";
    appliedMinStake = "";
  },
  false
);

const tagInput = document.getElementById("tagInput");
const tagSuggestionDiv = document.getElementById("tagSuggestionContainer");

tagInput.addEventListener("input", () => {
  let filter = tagInput.value.toUpperCase();
  tagSuggestionDiv.innerHTML = "";
  let inputWidth = tagInput.offsetWidth;
  tagSuggestionDiv.style.width = inputWidth + "px";

  if (!filter) return;

  for (let i = 0; i < tagsList.length; i++) {
    if (tagsList[i].toUpperCase().indexOf(filter) > -1) {
      let div = document.createElement("div");
      div.innerHTML = tagsList[i];

      div.addEventListener("click", function () {
        tagInput.value = this.innerText;
        tagSuggestionDiv.innerHTML = "";
      });

      tagSuggestionDiv.appendChild(div);
    }
  }
});
