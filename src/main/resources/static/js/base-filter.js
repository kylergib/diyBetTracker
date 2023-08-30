import { getCurrentUser, apiRequest, baseUrl } from "./util.js";

let sportsbooksList = [];
let tagsList = [];
let tagsFinished = false;
let sportsbooksFinished = false;
apiRequest(baseUrl + "bets/userTags")
  .then((result) => {
    return result.json();
  })
  .then((json) => {
    tagsList = json;
    setFilterTags();
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

    setFilterSportsbooks();
  })
  .catch((error) => {
    console.error(error);
  });

const tagFilters = document.getElementById("tagFilters");
const sportsbookFilters = document.getElementById("sportsbookFilters");

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
    inputCheckbox.addEventListener("click", () => {
      console.log(thisTag);
    });
    inputGroupText.appendChild(inputCheckbox);

    const spanText = document.createElement("span");
    spanText.className = "input-group-text";
    spanText.style.flexGrow = "1";
    spanText.textContent = thisTag;

    groupDiv.appendChild(inputGroupText);
    groupDiv.appendChild(spanText);

    // div.innerHTML = tagsList[i];
    tagFilters.appendChild(groupDiv);
    tagsFinished = true;
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
    inputCheckbox.addEventListener("click", () => {
      console.log(thisTag);
    });
    inputGroupText.appendChild(inputCheckbox);

    const spanText = document.createElement("span");
    spanText.className = "input-group-text";
    spanText.style.flexGrow = "1";
    spanText.textContent = thisTag;

    groupDiv.appendChild(inputGroupText);
    groupDiv.appendChild(spanText);

    // div.innerHTML = tagsList[i];
    sportsbookFilters.appendChild(groupDiv);
    sportsbooksFinished = true;
  }
}

export function getAppliedFilters() {
  return {
    appliedTagFilters: getAppliedTagFilters(),
    appliedSportsbookFilters: getAppliedSportsbookFilters(),
    appliedStatusFilters: getAppliedStatusFilters(),
  };
}

function getAppliedTagFilters() {
  const appliedTagFilters = [];
  tagFilters.querySelectorAll(".input-group.mb-3").forEach((group) => {
    const inputChecked = group.querySelector("input").checked;
    const spanText = group.querySelector("span").textContent;
    console.log(inputChecked, spanText);
    if (inputChecked) {
      appliedTagFilters.push(spanText);
    }
  });
  return appliedTagFilters;
}
function getAppliedSportsbookFilters() {
  const appliedSportsbookFilters = [];
  sportsbookFilters.querySelectorAll(".input-group.mb-3").forEach((group) => {
    const inputChecked = group.querySelector("input").checked;
    const spanText = group.querySelector("span").textContent;
    console.log(inputChecked, spanText);
    if (inputChecked) {
      appliedSportsbookFilters.push(spanText);
    }
  });
  return appliedSportsbookFilters;
}
function getAppliedStatusFilters() {
  const appliedStatusFilters = [];
  document
    .getElementById("statusFilters")
    .querySelectorAll(".input-group.mb-3")
    .forEach((group) => {
      const inputChecked = group.querySelector("input").checked;
      const spanText = group.querySelector("span").textContent;
      console.log(inputChecked, spanText);
      if (inputChecked) {
        appliedStatusFilters.push(spanText);
      }
    });
  return appliedStatusFilters;
}

export function clearAllFilters() {
  clearTagFilters();
  clearSportsbookFilters();
  clearStatusFilters();
}
function clearTagFilters() {
  tagFilters.querySelectorAll(".input-group.mb-3").forEach((group) => {
    group.querySelector("input").checked = false;
  });
}
function clearSportsbookFilters() {
  sportsbookFilters.querySelectorAll(".input-group.mb-3").forEach((group) => {
    group.querySelector("input").checked = false;
  });
}
function clearStatusFilters() {
  document
    .getElementById("statusFilters")
    .querySelectorAll(".input-group.mb-3")
    .forEach((group) => {
      group.querySelector("input").checked = false;
    });
}
