import { apiRequest, baseUrl } from "./util.js";

export async function saveTracker(tracker) {
  await apiRequest(baseUrl + "currentUser/tracker/add", "POST", tracker).then(
    (result) => {
      if (result.status != 200 && result.status != 201) {
        console.log("Could not save tracker. Please try again.", "danger");
      }
    }
  );
}
export async function getTrackers() {
  return await apiRequest(baseUrl + "currentUser/trackers").then((result) => {
    if (result.status != 200 && result.status != 201) {
      console.log("Could not save tracker. Please try again.", "danger");
      return null;
    }
    return result.json();
  });
}

export async function deleteTracker(trackerId) {
  return await apiRequest(
    baseUrl + "currentUser/tracker/" + trackerId,
    "DELETE"
  ).then((result) => {
    if (result.status != 200 && result.status != 201) {
      console.log("Could not save tracker. Please try again.", "danger");
      return false;
    }
    console.log("Successfully deleted:", trackerId);
    return true;
  });
}
export async function getTrackersProfit() {
  return await apiRequest(baseUrl + "currentUser/trackers/profit").then(
    (result) => {
      if (result.status != 200 && result.status != 201) {
        console.log("Could not save tracker. Please try again.", "danger");
        return null;
      }
      return result.json();
    }
  );
}
