

const isLocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1";
export const baseUrl = (isLocalhost ? "http://" : "https://") + window.location.host + "/api/";

const csrfToken = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute("content");

export async function apiRequest(
  url,
  method = "GET",
  body = null,
  contentType = "application/json"
) {
  let params = {
    method: method,
    headers: {
      "Content-Type": contentType,
      "X-CSRF-Token": csrfToken,
    },
  };
  if (body !== null) {
    params.body = JSON.stringify(body);
  }
  try {
    return await fetch(url, params);
  } catch (error) {
    console.error("Error:", error);
    return;
  }
}
export function getCurrentDateString() {
  const date = new Date();

  const year = date.getFullYear();
  const month = (1 + date.getMonth()).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}
export function getDateString(date) {
  const year = date.getFullYear();
  const month = (1 + date.getMonth()).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}
export function getCurrentDateTimeString() {
  let now = new Date();
  return now.toISOString().slice(0, 19);
}
export async function getCurrentUser() {
  return await apiRequest(baseUrl + "current_user")
    .then((result) => {
      if (result.status == 200) {
        return result.json();
      }
    })
    .then((json) => {
      return {
        currentUser: json["currentUser"],
        userSettings: json["settings"],
      };
    })
    .catch((error) => {
      console.error("Error getting current user:", error);
    });
}
export async function getPresets() {
  return await apiRequest(baseUrl + "presets")
      .then((result) => {
        if (result.status == 200) {
          return result.json();
        }
      })
      .catch((error) => {
        console.error("Error getting current user:", error);
      });
}
export async function getAllUserStats() {
  return await apiRequest(baseUrl + "bets/stats").then((result) => {
    if (result.status == 200) {
      return result.json();
    }
  });
}
export function getStartAndEndOfWeek(date) {
  const givenDate = new Date(date);

  const monday = new Date(givenDate);
  monday.setDate(
    monday.getDate() - (monday.getDay() === 0 ? 6 : monday.getDay() - 1)
  );

  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  return {
    startOfWeek: monday,
    endOfWeek: sunday,
  };
}
export function getStartAndEndOfMonth(date) {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    startOfMonth: startOfMonth,
    endOfMonth: endOfMonth,
  };
}

export function formatDateAndTime(dateString) {
  let date = new Date(dateString);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hours = date.getHours();
  let minutes = date.getMinutes();

  return `${monthIntToString(month)} ${day}, ${year} - ${hours}:${
    minutes < 10 ? "0" + minutes : minutes
  }`;
}
export function formatDateOnly(dateString) {
  let date = new Date(dateString);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  return `${monthIntToString(month)} ${day}, ${year}`;
}

export function monthIntToString(monthInt) {
  let monthString;

  switch (monthInt) {
    case 1:
      monthString = "Jan";
      break;
    case 2:
      monthString = "Feb";
      break;
    case 3:
      monthString = "Mar";
      break;
    case 4:
      monthString = "Apr";
      break;
    case 5:
      monthString = "May";
      break;
    case 6:
      monthString = "Jun";
      break;
    case 7:
      monthString = "Jul";
      break;
    case 8:
      monthString = "Aug";
      break;
    case 9:
      monthString = "Sep";
      break;
    case 10:
      monthString = "Oct";
      break;
    case 11:
      monthString = "Nov";
      break;
    case 12:
      monthString = "Dec";
      break;
    default:
      monthString = "Invalid month number";
  }

  return monthString;
}
export async function checkSession() {
  apiRequest(baseUrl + "session").then((result) => {

    if (result.status != 200 || result.redirected == true) {
      window.location.reload();
    }
  });
}

export async function checkThirtySeconds() {
  setInterval(async function() {
    await checkSession();
  }, 30000);

}