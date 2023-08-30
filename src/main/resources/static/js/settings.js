import { setStats } from "./navbar.js";
import { setTheme } from "./theme.js";
import { getCurrentUser } from "./util.js";
import { clearAllFilters, getAppliedFilters } from "./base-filter.js";
import { TagTracker } from "./tagTracker.js";
import { saveTracker, getTrackers, deleteTracker } from "./tracker.js";

let theme;

let currentUser;
let userSettings;
let addedTrackers = [];
let selectedTrackers = [];
let trackersToDelete = [];

async function main() {
  let temp = await getCurrentUser();
  userSettings = temp["userSettings"];
  // currentUser = createUser(temp["currentUser"]);
  theme = userSettings["theme"];

  setTheme(theme);
  setStats(theme);
  document.getElementById("stakeRange").remove();
  document.getElementById("oddsRange").remove();
  document.getElementById("applyFilterButton").remove();
  document.getElementById("clearFilterButton").remove();
  document.getElementById("sportsbookFilters").remove();
  document.getElementById("statusFilters").remove();
  document.getElementById("filterDiv").style.visibility = "";
}
main();

let numCombos = 1;
let numSelected = 0;
let trackerIndex = -1;

document.getElementById("emptyFilterButton").addEventListener("click", () => {
  clearAllFilters();
});

document.getElementById("addFilterButton").addEventListener("click", () => {
  const appliedFilters = getAppliedFilters();
  let tagTracker = new TagTracker(
    trackerIndex,
    appliedFilters["appliedTagFilters"],
    appliedFilters["appliedSportsbookFilters"],
    appliedFilters["appliedStatusFilters"]
  );
  trackerIndex--;
  addToTracker(tagTracker);
  addedTrackers.push(tagTracker);
});

function addToTracker(tagObj, from = "add") {
  const tagTracker = document.getElementById("tagTracker");

  const div = document.createElement("div");
  let divClicked = false;

  const hiddenIndex = document.createElement("input");
  hiddenIndex.type = "hidden";
  hiddenIndex.value = tagObj.id;
  div.appendChild(hiddenIndex);
  div.addEventListener("click", function () {
    divClicked = !divClicked;
    if (divClicked) {
      div.classList.add("diy-tracker-clicked");
      selectedTrackers.push(tagObj);
      numSelected++;
    } else {
      div.classList.remove("diy-tracker-clicked");
      //   const indexToRemove = selectedTrackers.findIndex(
      //     (obj) => obj.id === tagObj.id
      //   );
      const indexToRemove = selectedTrackers.indexOf(tagObj);
      console.log("index to remove", indexToRemove);
      if (indexToRemove !== -1) {
        selectedTrackers.splice(indexToRemove, 1);
      }
      numSelected--;
    }
    checkRemoveButton();
  });

  function addBadge(text, type) {
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
    div.appendChild(header);
  }

  //   div.style.display = "flex";
  if (numCombos % 2 == 0) {
    div.className = "diy-tracker diy-tracker-even mb-1";
  } else {
    div.className = "diy-tracker diy-tracker-odd mb-1";
  }
  tagObj.tags.forEach((tag) => {
    addBadge(tag, "tag");
  });
  tagObj.sportsbooks.forEach((sportsbook) => {
    addBadge(sportsbook, "sportsbook");
  });
  tagObj.statuses.forEach((status) => {
    addBadge(status, status.toLowerCase());
  });
  tagTracker.appendChild(div);
  numCombos++;
}

function checkRemoveButton() {
  if (selectedTrackers.length > 0) {
    document.getElementById("removeFilterButton").classList.remove("disabled");
  } else {
    document.getElementById("removeFilterButton").classList.add("disabled");
  }
}

document.getElementById("removeFilterButton").addEventListener(
  "click",
  () => {
    const allTrackers = document
      .getElementById("tagTracker")
      .querySelectorAll(".diy-tracker-clicked");
    const reversedTrackers = Array.from(allTrackers).reverse();

    reversedTrackers.forEach(async (div) => {
      const trackerId = div.querySelector("input").value;
      let delSuccessful = false;
      if (trackerId < 0) {
        const indexToRemove = addedTrackers.findIndex(
          (obj) => obj.id == trackerId
        );
        if (indexToRemove !== -1) {
          addedTrackers.splice(indexToRemove, 1);
          delSuccessful = true;
        }
      } else {
        delSuccessful = await deleteTracker(trackerId);
      }
      if (delSuccessful) {
        div.remove();
      }
    });
    selectedTrackers = [];
    checkRemoveButton();
  },
  false
);

document.getElementById("saveSettings").addEventListener(
  "click",
  () => {
    addedTrackers.forEach((tracker) => {
      const newTracker = {
        tags: tracker.tags,
        sportsbooks: tracker.sportsbooks,
        statuses: tracker.statuses,
      };
      saveTracker(newTracker);
    });
  },
  false
);

let savedTrackers = await getTrackers();
savedTrackers.forEach((tracker) => {
  const savedTracker = new TagTracker(
    tracker["id"],
    tracker["tags"],
    tracker["sportsbooks"],
    tracker["statuses"]
  );
  addToTracker(savedTracker, "saved");
});
