import { MyUser, createUser } from "./myUser.js";
import { Bet, createBet, getAllUserBetsDate } from "./bet.js";
import { calculateProfit } from "./calculatorUtil.js";
import {
  formatDateOnly,
  formatDateAndTime,
  getCurrentDateString,
  getCurrentDateTimeString,
  getStartAndEndOfWeek,
  getStartAndEndOfMonth,
  getDateString,
  apiRequest,
  baseUrl,
  getAllUserStats,
} from "./util.js";
import { setStats } from "./navbar.js";
import { createAlert } from "./diyAlerts.js";

// export const baseUrl = "http://" + window.location.host + "/api/";

let currentUser;
const bets = [];
let betTags = [];
let todaysDate = new Date();
let betFilterStatus = "day";
let startFilter = new Date();
let endFilter = new Date();
let previousRequestPending = false;

document.getElementById("eventDateInput").value = getDateString(todaysDate);

function setPendingRequest(value) {
  previousRequestPending = value;

  const itemList = [
    document.getElementById("dayListItem"),
    document.getElementById("weekListItem"),
    document.getElementById("monthListItem"),
    document.getElementById("previousListItem"),
    document.getElementById("nextListItem"),
  ];
  // const dayItem =
  // const weekItem =
  // const monthItem =

  // const previousItem = document.getElementById("previousListItem");
  // const nextItem = document.getElementById("nextListItem");

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
  if (filter === "day") {
    dayItem.classList.add("active");
    weekItem.classList.remove("active");
    monthItem.classList.remove("active");
    betFilterStatus = "day";
  } else if (filter === "week") {
    dayItem.classList.remove("active");
    weekItem.classList.add("active");
    monthItem.classList.remove("active");
    betFilterStatus = "week";
  } else if (filter === "month") {
    dayItem.classList.remove("active");
    weekItem.classList.remove("active");
    monthItem.classList.add("active");
    betFilterStatus = "month";
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

// export async function apiRequest(
//   url,
//   method = "GET",
//   body = null,
//   contentType = "application/json"
// ) {
//   console.log("calling request");
//   let params = {
//     method: method,
//     headers: {
//       "Content-Type": contentType,
//     },
//   };
//   if (body !== null) {
//     params.body = JSON.stringify(body);
//   }
//   try {
//     return await fetch(url, params); // Return the parsed JSON data
//   } catch (error) {
//     // Handle error here
//     console.error("Error:", error);
//     return;
//   }
// }

async function getCurrentUser() {
  await apiRequest(baseUrl + "current_user")
    .then((result) => {
      console.log(result);
      if (result.status == 200) {
        console.log("successfull?");
        return result.json();
      }
    })
    .then((json) => {
      console.log(json);
      currentUser = createUser(json);
    })
    .catch((error) => {
      console.error("Error getting current user:", error);
    });
}

function createBetRow(bet) {
  function createColumn(row, values) {
    const cell = row.insertCell(-1);
    cell.setAttribute("style", "text-align: center;");

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
  let backgroundColor = "white";
  if (bet.status === "won") {
    backgroundColor = "#c2ffc2";
  } else if (bet.status === "void") {
    backgroundColor = "#ffe9a9";
  } else if (bet.status === "lost") {
    backgroundColor = "#ff8590";
  }
  row.style.backgroundColor = backgroundColor;

  // createColumn(row, item.id);
  createColumn(row, [bet.sportsbook]);
  const legList = [];
  let currentText = "";
  bet.legs.forEach((leg) => {
    console.log(leg, currentText.length, leg.length);
    if (currentText === "") {
      console.log("blank");
      currentText += leg;
    } else if (currentText.length + leg.length > 40) {
      console.log("over 200");
      legList.push(currentText);
      currentText = leg;
    } else {
      console.log("just add");
      currentText += ", " + leg;
    }
  });
  if (currentText !== "") {
    legList.push(currentText);
  }

  createColumn(row, legList);
  createColumn(row, [bet.eventDate]);
  createColumn(row, [bet.odds]);
  const stakeList = [];
  if (bet.stake > 0) {
    stakeList.push("Stake: $" + bet.stake.toFixed(2));
  } else {
    stakeList.push("F.B. Stake: $" + bet.freeBetStake.toFixed(2));
  }
  createColumn(row, [stakeList]); //todo: add free bet
  // const cell = row.insertCell(-1);
  // cell.setAttribute("style", "text-align: center;");

  // const text = document.createElement("div");
  // text.textContent = bet.freeBetStake;
  // text.setAttribute("class", "itemText");

  // cell.appendChild(text);
  if (bet.profit == 0) {
    createColumn(row, [""]);
  } else {
    createColumn(row, ["$" + bet.profit.toFixed(2)]);
  }
  createColumn(row, [bet.tags]);
  const selectElement = document.createElement("select");
  selectElement.setAttribute("class", "form-select");
  selectElement.setAttribute("aria-label", "Default select example");

  const statusList = ["Open", "Lost", "Won", "Void"];

  statusList.forEach((status) => {
    const option = document.createElement("option");
    option.setAttribute("value", status);
    option.textContent = status;
    if (status.toLowerCase() === bet.status.toLowerCase()) {
      console.log(status, "is selected");
      option.selected = true;
    }

    selectElement.appendChild(option);
  });
  selectElement.addEventListener("change", (event) => {
    console.log("selected changed?", event.target.value);
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
  });
  const statusCell = row.insertCell(-1);
  statusCell.style.textAlign = "center";
  statusCell.style.minWidth = "125px";
  statusCell.appendChild(selectElement);

  const dropdowncell = row.insertCell(-1);
  dropdowncell.setAttribute("style", "text-align: center;");
  const dropdown = document.createElement("div");
  dropdown.className = "dropdown";
  const dropdownButton = document.createElement("button");
  dropdownButton.className = "btn btn-secondary dropdown-toggle";
  dropdownButton.type = "button";
  dropdownButton.textContent = "Select Action";
  dropdownButton.setAttribute("data-bs-toggle", "dropdown");
  dropdownButton.setAttribute("aria-expanded", "false");

  dropdown.appendChild(dropdownButton);

  const dropdownList = document.createElement("ul");
  dropdownList.className = "dropdown-menu";

  const actionList = ["Edit", "Cancel", "Save", "Delete"];

  actionList.forEach((action) => {
    const actionItem = document.createElement("li");
    const actionA = document.createElement("a");
    actionA.className = "dropdown-item";
    if (action === "Save" || action === "Cancel") {
      actionA.classList.add("disabled");
    }
    actionA.setAttribute("href", "#");
    actionA.textContent = action;
    actionA.addEventListener(
      "click",
      async () => {
        console.log("clicked?!", action);
        switch (action) {
          case "Edit":
            document.getElementById("betTypeInput").value = "updateBet";
            document.getElementById("betIdInput").value = bet.id;
            document.getElementById("sportsbookInput").value = bet.sportsbook;
            document.getElementById("statusSelect").value = bet.status;
            document.getElementById("oddsInput").value = bet.odds;
            document.getElementById("stakeInput").value = bet.stake;
            document.getElementById("freeBetStakeInput").value =
              bet.freeBetStake;
            document.getElementById("profitInput").value = bet.profit;
            document.getElementById("eventDateInput").value = bet.eventDate;
            // document.getElementById("betTags").textContent =
            //   "Tags: " + bet.tags;
            betTags = bet.tags;
            setTags();
            document.getElementById("evPercentInput").value = bet.evPercent;
            document.getElementById("expectedProfitInput").value =
              bet.expectedProfit;
            document.getElementById("freeBetRecieved").value =
              bet.freeBetAmountRecieved;
            document.getElementById("freeBeReceivedCheckbox").check =
              bet.freeBetWasRecieved;
            console.log(bet.legs);

            const legRow = document.getElementById("legRow");
            const legInputs = legRow.querySelectorAll("input");

            for (let i = 0; i < bet.legs.length; i++) {
              if (i > 12) {
                break;
              }
              legInputs[i].value = bet.legs[i];
            }

            openNewBet();

            break;
          case "Save":
            // console.log("save", item.id);
            // toggleEditRow(row);
            // toggleDisabledActionDropdown(dropdown, action);
            break;
          case "Cancel":
            // console.log("cancel", item.id);
            // toggleEditRow(row);
            // toggleDisabledActionDropdown(dropdown, action);
            break;
          case "Delete":
            // console.log("delete", item.id);
            await apiRequest(baseUrl + "bets/" + bet.id, "DELETE")
              .then((result) => {
                if (result.status != 200) {
                  createAlert(
                    "Could not delete bet. Please reload and try again.",
                    "danger"
                  );
                }
              })
              .catch((error) => {
                console.error(error);
              });
            // window.location.reload();
            break;
        }
      },
      false
    );
    actionItem.appendChild(actionA);
    dropdownList.appendChild(actionItem);
  });

  dropdown.appendChild(dropdownList);
  dropdowncell.appendChild(dropdown);

  const divTest = document.createElement("div");

  const checkbox = document.createElement("input");
  checkbox.setAttribute("type", "checkbox");
  checkbox.setAttribute("class", "btn-check");
  checkbox.setAttribute("autocomplete", "off");
  checkbox.id = "select-" + bet.id;

  const label = document.createElement("label");
  label.setAttribute("class", "btn btn-outline-primary");
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
}

async function getUserBets() {
  await apiRequest(baseUrl + "bets")
    .then((result) => {
      console.log(result);
      if (result.status == 200) {
        console.log("successfull?");
        return result.json();
      }
    })
    .then((json) => {
      console.log(json);
      json.forEach((bet) => {
        bets.push(createBet(bet));
      });
    })
    .then(() => {
      console.log("Sort bets");
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
    });
}

async function main() {
  setStats();
  await getCurrentUser();
  if (previousRequestPending == false) {
    setPendingRequest(true);
    sortBetsAndAdd(await getAllUserBetsDate(getDateString(todaysDate)));
    setPendingRequest(false);
  }
  const stats = await getAllUserStats();
  console.log(stats);
}
function sortBetsAndAdd(bets) {
  if (bets.length == 0) {
    let table = document.getElementById("betBody");
    const row = table.insertRow(-1);
    row.style.verticalAlign = "middle";
    const cell = row.insertCell(-1);
    cell.setAttribute("style", "text-align: center;");
    cell.setAttribute("colspan", "9");

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
}
function clearTable() {
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
    console.log("checkProfit - odds blank");
    return;
  }
  let stake = document.getElementById("stakeInput").value;
  let freeBetStake = document.getElementById("freeBetStakeInput").value;
  if (freeBetStake < 0.01 && stake < 0.01) {
    console.log("freeBetStake and stake both cannot be less than 0.01");
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
    console.log("Save bet clicked");

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
      console.log("a field isnt valid");
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
        if (result.status != 200) {
          createAlert("Could not save bet. Please try again.", "danger");
        } else {
          betSaved = true;
        }
      }
    );
    if (!betSaved) {
      return;
    }
    console.log(saveBetRequest);
    const betJson = await saveBetRequest.json();
    console.log(betJson);

    console.log("end of save");
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
    window.location.reload();
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
    console.log("add tag");
    addTag(document.getElementById("tagInput").value);
    document.getElementById("tagInput").value = "";
  },
  false
);
document.getElementById("removeTagDropdown").addEventListener(
  "click",
  () => {
    console.log("removetag");
    removeTag(document.getElementById("tagInput").value);
    document.getElementById("tagInput").value = "";
  },
  false
);
document.getElementById("clearTagsDropdown").addEventListener(
  "click",
  () => {
    console.log("clear tags");
    clearTags();
    document.getElementById("tagInput").value = "";
  },
  false
);

function openNewBet() {
  document.getElementById("addBetDiv").style.display = "flex";
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
    //todo need to clear inputs
    clearInputs();
  },
  false
);

function updateBet(bet) {
  bet.myUser = { id: currentUser.id };
  apiRequest(baseUrl + "bets/" + bet.id, "PATCH", bet).then((result) => {
    if (result.status != 200) {
      createAlert("Could not update bet, please try again.", "danger");
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
