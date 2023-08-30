import { apiRequest, baseUrl } from "./util.js";

export class Bet {
  constructor(
    id,
    sportsbook,
    eventDate,
    dateAdded,
    legs,
    odds,
    status,
    stake,
    profit,
    tags,
    freeBetStake,
    evPercent,
    expectedProfit,
    freeBetRecieved,
    freeBetWon
  ) {
    this.id = id;
    this.sportsbook = sportsbook;
    this.eventDate = eventDate;
    this.dateAdded = dateAdded;
    this.legs = legs;
    this.odds = odds;
    this.status = status;
    this.stake = stake;
    this.profit = profit;
    this.tags = tags;
    this.freeBetStake = freeBetStake;
    this.evPercent = evPercent;
    this.expectedProfit = expectedProfit;
    this.freeBetRecieved = freeBetRecieved;
    this.freeBetWon = freeBetWon;
  }
}
export function createBet(betJson) {
  return new Bet(
    betJson.id,
    betJson.sportsbook,
    betJson.eventDate,
    betJson.dateAdded,
    betJson.legs,
    betJson.odds,
    betJson.status,
    betJson.stake,
    betJson.profit,
    betJson.tags,
    betJson.freeBetStake,
    betJson.evPercent,
    betJson.expectedProfit,
    betJson.freeBetRecieved,
    betJson.freeBetWon
  );
}
export async function getAllUserBetsDate(
  startDate,
  endDate = null,
  tags = [],
  sportsbooks = [],
  statusList = [],
  maxOdds = "",
  minOdds = "",
  maxStake = "",
  minStake = "",
  freeBetMaxStake = "",
  freeBetMinStake = ""
) {
  const bets = [];
  let url = baseUrl + "bets?startDate=" + startDate;
  url =
    endDate == null || endDate == startDate ? url : url + "&endDate=" + endDate;
  url = tags.length == 0 || tags == null ? url : url + "&tags=" + tags;
  url =
    sportsbooks.length == 0 || sportsbooks == null
      ? url
      : url + "&sportsbooks=" + sportsbooks;
  url =
    statusList.length == 0 || statusList == null
      ? url
      : url + "&statusList=" + statusList;
  url = maxOdds == "" ? url : url + "&maxOdds=" + maxOdds;
  url = minOdds == "" ? url : url + "&minOdds=" + minOdds;
  url = maxStake == "" ? url : url + "&maxStake=" + maxStake;
  url = minStake == "" ? url : url + "&minStake=" + minStake;
  url =
    freeBetMaxStake == "" ? url : url + "&freeBetMaxStake=" + freeBetMaxStake;
  url =
    freeBetMinStake == "" ? url : url + "&freeBetMinStake=" + freeBetMinStake;

  await apiRequest(url)
    .then((result) => {
      if (result.status == 200) {
        return result.json();
      }
    })
    .then((json) => {
      json.forEach((bet) => {
        bets.push(createBet(bet));
      });
    });
  return bets;
}
