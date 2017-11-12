import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

let testDate = new Date();
let thisDate = new Date(testDate.getTime() + (24 * 60 * 60 * 1000));
let tomorrowDate = new Date(thisDate.getTime() + (24 * 60 * 60 * 1000));
let yesterdayDate = new Date(thisDate.getTime() - (24 * 60 * 60 * 1000));

let utcDate = new Date(thisDate.toUTCString());
let tomorrowUtcDate = new Date(tomorrowDate.toUTCString());
let yesterdayUtcDate = new Date(yesterdayDate.toUTCString());

utcDate.setHours(utcDate.getHours() - 8);
tomorrowUtcDate.setHours(tomorrowUtcDate.getHours() - 8);
yesterdayUtcDate.setHours(tomorrowUtcDate.getHours() - 0);


let myDate = new Date(utcDate);
let tomorrowMyDate = new Date(tomorrowUtcDate);
let yesterdayMyDate = new Date(yesterdayUtcDate);

//DATE FORMAT FOR DAILY SCHEDULE API
let dailyDate = myDate.toISOString().slice(0, 10).replace(/-/g, "");
let tomorrowDailyDate = tomorrowMyDate.toISOString().slice(0, 10).replace(/-/g, "");
let yesterdayDailyDate = yesterdayMyDate.toISOString().slice(0, 10).replace(/-/g, "");

//DATE FORMAT FOR FULL SCHEDULE API COMPARE DATES FOR BACK TO BACK
let today = myDate.toISOString().slice(0, 10);
let tomorrow = tomorrowMyDate.toISOString().slice(0, 10);
let yesterday = yesterdayMyDate.toISOString().slice(0, 10);

let headers = null;
let options = null;
let sendingTomorrow;
let sentTomorrow;

@Injectable()
export class TomorrowService {

   info: Observable < any > = null;
  stats: Observable < any > = null;
  env: Observable < any > = null;
  gameid: Observable < any > = null;
  daily: Observable < any > = null;
  schedule: Observable < any > = null;
  score: Observable < any > = null;
  play: Observable <any> = null;
  injured: Observable <any> = null;

  constructor(private http: Http) {}

  sendHeaderOptions(h, o) {
    console.log('got headers & options in data service...')
    headers = h;
    options = o;
  }


  getDailySchedule() {
    
    if (!this.schedule) {
      console.log('getting schedule data from API...');

      let url5 = 'https://api.mysportsfeeds.com/v1.1/pull/nhl/2017-2018-regular/daily_game_schedule.json?fordate='+dailyDate;
      this.schedule = this.http.get(url5, options)
        .map(response => response.json())
    }
    return this.schedule;

  }


  getEnv() {
    console.log("trying to get heroku env...");
    this.env = this.http.get('/heroku-env').map(response => response)
    return this.env;
  }

  getYesterday() {
    console.log("send yesterday..."); 
    return yesterday; 
  }

  getToday() {
    console.log("send today..."); 
    return today; 
  }

  getTomorrow() {
    console.log("send tomrrow..."); 
    return tomorrow; 
  }

  sendStats(statsArray) {
    console.log("sending stats to service...");
    sendingTomorrow = statsArray;
  }

  getSentStats() {
    console.log("stats sent to component...");
    sentTomorrow = sendingTomorrow;
    return sentTomorrow;
  }


  getInfo() {

    if (!this.info) {

      let url2 = 'https://api.mysportsfeeds.com/v1.1/pull/nhl/2017-2018-regular/active_players.json?position=G';
      console.log('getting active player data from API...');
      this.info = this.http.get(url2, options)
        .map(response => response.json())
    }
    return this.info;
  }

  getStats() {
    if (!this.stats) {
      console.log('getting cumulative player stats from API...');

      let url = 'https://api.mysportsfeeds.com/v1.1/pull/nhl/2017-2018-regular/cumulative_player_stats.json?position=G';
      this.stats = this.http.get(url, options)
        .map(response => response.json())
    }
    return this.stats;
  }

  getGameId() {

    if (!this.gameid) {
      console.log('getting yesterday, today, tomorrow from API...');

      let url3 = 'https://api.mysportsfeeds.com/v1.1/pull/nhl/2017-2018-regular/full_game_schedule.json?date=from-'+yesterdayDailyDate+'-to-'+tomorrowDailyDate;
      this.gameid = this.http.get(url3, options)
        .map(response => response.json())
    }
    return this.gameid;
  }

  getInjured() {

    if (!this.injured) {
      console.log('getting yesterday, today, tomorrow from API...');

      let url9 = 'https://api.mysportsfeeds.com/v1.1/pull/nhl/2017-2018-regular/player_injuries.json?position=G';
      this.injured = this.http.get(url9, options)
        .map(response => response.json())
    }
    return this.injured;
  }



  clearCache() {
    //this.info = null;
  }

}
