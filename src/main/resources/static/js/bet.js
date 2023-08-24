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
export async function getAllUserBetsDate(startDate, endDate = null) {
  const bets = [];
  const startUrl = baseUrl + "bets?startDate=" + startDate;
  const url = endDate == null ? startUrl : startUrl + "&endDate=" + endDate;
  await apiRequest(url)
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
    });
  return bets;
}
