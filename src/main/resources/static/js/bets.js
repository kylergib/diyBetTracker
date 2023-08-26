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
  ];
  if (betFilterStatus !== "custom") {
    itemList.push(document.getElementById("previousListItem"));
    itemList.push(document.getElementById("nextListItem"));
  }
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

{
  /* <script>
        
      </script> */
}

// document.getElementById("currentDateFilter").addEventListener(
//   "click",
//   () => {
//     $('a[id="currentDateFilter"]').daterangepicker(
//       {
//         opens: "left",
//       },
//       function (start, end, label) {
//         console.log(
//           "A new date selection was made: " +
//             start.format("YYYY-MM-DD") +
//             " to " +
//             end.format("YYYY-MM-DD")
//         );
//       }
//     );
//   },
//   false
// );

// let text;
// let startDate;
// let endDate;
// if (betFilterStatus === "day") {
//   startFilter.setDate(startFilter.getDate() + changeAmount);
//   endFilter.setDate(endFilter.getDate() + changeAmount);
//   text = formatDateOnly(startFilter);

//   endDate = null;
// } else if (betFilterStatus === "week") {
//   changeAmount *= 7;
//   startFilter.setDate(startFilter.getDate() + changeAmount);
//   endFilter.setDate(endFilter.getDate() + changeAmount);
//   text = `${formatDateOnly(startFilter)} - ${formatDateOnly(endFilter)}`;
//   endDate = getDateString(endFilter);
// } else if (betFilterStatus === "month") {
//   startFilter.setMonth(startFilter.getMonth() + changeAmount);
//   endFilter = new Date(
//     startFilter.getFullYear(),
//     startFilter.getMonth() + 1,
//     0
//   );

//   text = `${formatDateOnly(startFilter)} - ${formatDateOnly(endFilter)}`;
//   endDate = getDateString(endFilter);
// }
// startDate = getDateString(startFilter);
// setBetFilterText(text);
// clearTable();
// sortBetsAndAdd(await getAllUserBetsDate(startDate, endDate));

$(function () {
  $('a[id="currentDateFilter"]').daterangepicker(
    {
      opens: "left",
    },
    async function (start, end, label) {
      console.log(
        "A new date selection was made: " +
          start.format("YYYY-MM-DD") +
          " to " +
          end.format("YYYY-MM-DD")
      );
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
      console.log("startfilter", startFilter);
      console.log("start format", start.format("YYYY-MM-DD"));
      console.log("enddate", endDate);
      console.log();
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
    // cell.style.borderColor = borderColor;

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
  row.classList.add("diy-row");

  // let backgroundColor = "#d9d9d9";
  let textColor = "gray";
  let bootStrapColor = "dark";
  let betClass = "diy-bet-open";
  if (bet.status === "won") {
    // backgroundColor = "#c2ffc2";
    textColor = "green";
    bootStrapColor = "success";
    betClass = "diy-bet-won";
  } else if (bet.status === "void") {
    // backgroundColor = "#ffffa7";
    textColor = "#bf9f1a";
    bootStrapColor = "void";
    betClass = "diy-bet-void";
  } else if (bet.status === "lost") {
    // backgroundColor = "#ff8590";
    textColor = "#b10000";
    bootStrapColor = "lost";
    betClass = "diy-bet-lost";
  }
  // row.style.color = borderColor; //TODO: change this to test
  // row.style.borderColor = borderColor;
  row.classList.add(betClass);

  // createColumn(row, item.id);
  createColumn(row, [bet.sportsbook], betClass, "diy-cell-first");
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

  createColumn(row, legList, betClass);
  createColumn(row, [bet.eventDate], betClass);
  createColumn(row, [bet.odds], betClass);
  const stakeList = [];
  if (bet.stake > 0) {
    stakeList.push("Stake: $" + bet.stake.toFixed(2));
  } else {
    stakeList.push("F.B. Stake: $" + bet.freeBetStake.toFixed(2));
  }
  createColumn(row, [stakeList], betClass); //todo: add free bet
  // const cell = row.insertCell(-1);
  // cell.setAttribute("style", "text-align: center;");

  // const text = document.createElement("div");
  // text.textContent = bet.freeBetStake;
  // text.setAttribute("class", "itemText");

  // cell.appendChild(text);
  if (bet.profit == 0) {
    createColumn(row, [""], betClass);
  } else {
    createColumn(row, ["$" + bet.profit.toFixed(2)], betClass);
  }
  createColumn(row, [bet.tags], betClass);
  const selectElement = document.createElement("select");
  selectElement.setAttribute("class", "form-select");
  selectElement.setAttribute("aria-label", "Default select example");
  let imageUrl = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='${encodeURIComponent(
    textColor
  )}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`;

  selectElement.style.backgroundImage = imageUrl;
  selectElement.style.color = textColor;
  selectElement.style.borderColor = textColor;

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
  statusCell.classList.add("diy-cell");
  statusCell.classList.add(betClass);
  // statusCell.style.borderColor = borderColor;

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
      // document.getElementById("betTags").textContent =
      //   "Tags: " + bet.tags;
      betTags = bet.tags;
      setTags();
      document.getElementById("evPercentInput").value = bet.evPercent;
      document.getElementById("expectedProfitInput").value = bet.expectedProfit;
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
      await apiRequest(baseUrl + "bets/" + bet.id, "DELETE")
        .then((result) => {
          if (result.status != 200) {
            createAlert(
              "Could not delete bet. Please reload and try again.",
              "danger"
            );
          } else {
            window.location.reload();
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

  // const dropdownList = document.createElement("ul");
  // dropdownList.className = "dropdown-menu";

  // const actionList = ["Edit", "Cancel", "Save", "Delete"];

  // actionList.forEach((action) => {
  //   const actionItem = document.createElement("li");
  //   const actionA = document.createElement("a");
  //   actionA.className = "dropdown-item";
  //   if (action === "Save" || action === "Cancel") {
  //     actionA.classList.add("disabled");
  //   }
  //   actionA.setAttribute("href", "#");
  //   actionA.textContent = action;
  //   actionA.addEventListener(
  //     "click",
  //     async () => {
  //       console.log("clicked?!", action);
  //       switch (action) {
  //         case "Edit":
  //           document.getElementById("betTypeInput").value = "updateBet";
  //           document.getElementById("betIdInput").value = bet.id;
  //           document.getElementById("sportsbookInput").value = bet.sportsbook;
  //           document.getElementById("statusSelect").value = bet.status;
  //           document.getElementById("oddsInput").value = bet.odds;
  //           document.getElementById("stakeInput").value = bet.stake;
  //           document.getElementById("freeBetStakeInput").value =
  //             bet.freeBetStake;
  //           document.getElementById("profitInput").value = bet.profit;
  //           document.getElementById("eventDateInput").value = bet.eventDate;
  //           // document.getElementById("betTags").textContent =
  //           //   "Tags: " + bet.tags;
  //           betTags = bet.tags;
  //           setTags();
  //           document.getElementById("evPercentInput").value = bet.evPercent;
  //           document.getElementById("expectedProfitInput").value =
  //             bet.expectedProfit;
  //           document.getElementById("freeBetRecieved").value =
  //             bet.freeBetAmountRecieved;
  //           document.getElementById("freeBeReceivedCheckbox").check =
  //             bet.freeBetWasRecieved;
  //           console.log(bet.legs);

  //           const legRow = document.getElementById("legRow");
  //           const legInputs = legRow.querySelectorAll("input");

  //           for (let i = 0; i < bet.legs.length; i++) {
  //             if (i > 12) {
  //               break;
  //             }
  //             legInputs[i].value = bet.legs[i];
  //           }

  //           openNewBet();

  //           break;
  //         case "Save":
  //           // console.log("save", item.id);
  //           // toggleEditRow(row);
  //           // toggleDisabledActionDropdown(dropdown, action);
  //           break;
  //         case "Cancel":
  //           // console.log("cancel", item.id);
  //           // toggleEditRow(row);
  //           // toggleDisabledActionDropdown(dropdown, action);
  //           break;
  //         case "Delete":
  //           // console.log("delete", item.id);
  //           await apiRequest(baseUrl + "bets/" + bet.id, "DELETE")
  //             .then((result) => {
  //               if (result.status != 200) {
  //                 createAlert(
  //                   "Could not delete bet. Please reload and try again.",
  //                   "danger"
  //                 );
  //               }
  //             })
  //             .catch((error) => {
  //               console.error(error);
  //             });
  //           window.location.reload();
  //           break;
  //       }
  //     },
  //     false
  //   );
  //   actionItem.appendChild(actionA);
  //   dropdownList.appendChild(actionItem);
  // });

  // dropdown.appendChild(dropdownList);
  // dropdowncell.appendChild(dropdown);

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
  // checkboxCell.style.borderColor = borderColor;
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
  // const stats = await getAllUserStats();
  // console.log(stats);
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
  document.getElementById("betTable").style.display = "";
}
function clearTable() {
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
        if (result.status != 200 || result.status != 201) {
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
    //removed because it is not used and patch does not return json
    // const betJson = await saveBetRequest.json();
    // console.log(betJson);

    // console.log("end of save");
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
  document.getElementById("overlay").style.display = "block";
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
  // let suggestionContainer = document.getElementById(
  //   "customerSuggestionContainer"
  // );
  sportsbookSuggestionDiv.innerHTML = "";
  let inputWidth = sportsbookInput.offsetWidth;
  sportsbookSuggestionDiv.style.width = inputWidth + "px";

  if (!filter) return;
  // const productNames = products.map((product) => product.productName);

  for (let i = 0; i < sportsbooksList.length; i++) {
    if (sportsbooksList[i].toUpperCase().indexOf(filter) > -1) {
      let div = document.createElement("div");
      div.innerHTML = sportsbooksList[i];

      div.addEventListener("click", function () {
        sportsbookInput.value = this.innerText;
        console.log("other child prolly", this.innerText);
        sportsbookSuggestionDiv.innerHTML = "";
        // const findProduct = findProductByName(products, inputBox.value);
        // if (findProduct === -1) {
        //   return;
        // }
        // console.log(findProduct);
        // setColor(row, findProduct.colors);
      });

      sportsbookSuggestionDiv.appendChild(div);
    }
  }
});

const tagInput = document.getElementById("tagInput");
const tagSuggestionDiv = document.getElementById("tagSuggestionContainer");

tagInput.addEventListener("input", () => {
  let filter = tagInput.value.toUpperCase();
  // let suggestionContainer = document.getElementById(
  //   "customerSuggestionContainer"
  // );
  tagSuggestionDiv.innerHTML = "";
  let inputWidth = tagInput.offsetWidth;
  tagSuggestionDiv.style.width = inputWidth + "px";

  if (!filter) return;
  // const productNames = products.map((product) => product.productName);

  for (let i = 0; i < tagsList.length; i++) {
    if (tagsList[i].toUpperCase().indexOf(filter) > -1) {
      let div = document.createElement("div");
      div.innerHTML = tagsList[i];

      div.addEventListener("click", function () {
        tagInput.value = this.innerText;
        console.log("other child prolly", this.innerText);
        tagSuggestionDiv.innerHTML = "";
        // const findProduct = findProductByName(products, inputBox.value);
        // if (findProduct === -1) {
        //   return;
        // }
        // console.log(findProduct);
        // setColor(row, findProduct.colors);
      });

      tagSuggestionDiv.appendChild(div);
    }
  }
});
