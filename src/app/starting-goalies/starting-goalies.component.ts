import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient, HttpResponse, HttpHeaders, HttpRequest} from '@angular/common/http'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DatePipe, PercentPipe } from '@angular/common';
import { DataService } from '../data.service';
import { FirebaseService } from '../firebase.service';
import { YesterdayService } from '../yesterday.service';
import { TomorrowService } from '../tomorrow.service';
import { MatSnackBar } from '@angular/material';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';

//DATE FORMAT FOR FULL SCHEDULE API COMPARE DATES FOR BACK TO BACK
let today = null;
let tomorrow = null;
let yesterday = null;

let headers = null;
let dailyTeams = [];
let teamString = '';

@Component({
  selector: 'app-starting-goalies',
  templateUrl: './starting-goalies.component.html',
  styleUrls: ['./starting-goalies.component.css'],
   animations: [
    trigger('flipState', [
      state('active', style({
        transform: 'rotateY(179deg)'
      })),
      state('inactive', style({
        transform: 'rotateY(0)'
      })),
      transition('active => inactive', animate('500ms ease-out')),
      transition('inactive => active', animate('500ms ease-in'))
    ])
  ]
})
export class StartingGoaliesComponent implements OnInit {

  goalies = new FormControl();
  starters: Array < any > ;
  dailySchedule: Array < any > ;
  fullSchedule: Array < any > ;
  starterIdData: Array < any > = [];
  startersData: Array < any > = [];
  dailyStats: Array < any > = [];
  myData: Array < any > ;
  showData: Array < any > ;
  showTomorrow: Array <any> ;
  score: Array < any > ;
  sentData: Array < any > ;
  sentYesterdayData: Array < any > ;
  sentTomorrowData: Array < any > ;
  gameDate: string = '';
  defineToken: string = '';
  statData: Array < any > = [];
  playerInfo: Array < any > ;
  playerInjuries: Array < any > ;
  noGamesToday: boolean;
  gamesToday: boolean;
  twitterHandles: Array < any > ;
  todayStarters: Array < any > ;
  allGoalies: Array < any > ;
  allGoaliesTomorrow: Array < any > ;
  selected: any;
  startingGoaliesToday: Array < any > = [];
  tweetDay: any;
  noGamesMsg: any;
  noScoresMsg: any;
  noScores: any;
  startersDate: any;
  tomorrowDate: any;
  fullFirebaseResponse: any;
  loading: boolean = true;
  apiRoot: string = "https://api.mysportsfeeds.com/v1.2/pull/nhl/2018-playoff";

  stats: boolean = false;
  hitCount: any;


  goalieIdSet: boolean = false;
  standIn: string = '';
  goalieID: string = '';

    newGoalie = {
    [this.standIn]: {
      confirmed: false,
      name: null,
      probable: false,
      image: null,
      atHandle: null,
      twitterHandle: null
    }
  };



  constructor(private http: HttpClient, private dataService: DataService, private fbService: FirebaseService, private yesterdayService: YesterdayService, private tomorrowService: TomorrowService, public snackBar: MatSnackBar, public router: Router, public dialog: MatDialog) {
    this.fbService
      .getStarterData()
      .subscribe(res => {

        if (res[0] != null) {
          console.log(res, 'got response from firebase...');
          this.fullFirebaseResponse = res[0];
          this.startersDate = res[0][0]['todayDate'];
          this.todayStarters = res[0][1];
          this.allGoalies = Array.of(res[0][1]);
          this.allGoaliesTomorrow = Array.of(res[0][3]);
      

          // This is to change a goalie in view without refresh
          if (this.showData != null && this.myData != null) {
            for (let show of this.showData) {
              for (let rep of this.myData) {
                //console.log(show, 'showData items...');
                if (this.startersDate === show.team.today && show.team.matchup != null && this.fullFirebaseResponse[1][show.team.matchup[0].player.ID] != null && this.fullFirebaseResponse[1][rep.player.ID] != null && rep.team.ID === show.team.matchup[0].team.ID && this.fullFirebaseResponse[1][show.team.matchup[0].player.ID].probable === false && this.fullFirebaseResponse[1][rep.player.ID].confirmed === true) {
                  // Find goalies with the same team ID
                  // if the view has a goalie that is probable false swap with goalie from firebase that is confirmed
                  console.log(rep, 'update me into the view right now! I am confirmed to start.');
                  console.log(show.team.matchup[0], 'I have been changed, replace me with confirmed goalie.');
                  show.team.matchup[0] = rep;
                } else if (this.startersDate === show.team.today && show.team.matchup != null && this.fullFirebaseResponse[1][show.team.matchup[0].player.ID] != null && this.fullFirebaseResponse[1][rep.player.ID] != null && rep.team.ID === show.team.matchup[0].team.ID && this.fullFirebaseResponse[1][show.team.matchup[0].player.ID].probable === false && this.fullFirebaseResponse[1][rep.player.ID].confirmed === false && this.fullFirebaseResponse[1][rep.player.ID].probable === true && rep.player.probable === false) {
                  rep.player.probable = true;
                  console.log(rep, 'update me into the view right now! I am probable to start.');
                  console.log(show.team.matchup[0], 'I have been changed, replace me with probable goalie.');
                  show.team.matchup[0] = rep;
                }
                if (this.startersDate === show.team.today && show.team.matchup != null && this.fullFirebaseResponse[1][show.team.matchup[1].player.ID] != null && this.fullFirebaseResponse[1][rep.player.ID] != null && rep.team.ID === show.team.matchup[1].team.ID && this.fullFirebaseResponse[1][show.team.matchup[1].player.ID].probable === false && this.fullFirebaseResponse[1][rep.player.ID].confirmed === true) {
                  // same thing
                  // now check against the 2nd item in the view matchup array
                  console.log(rep, 'update me into the view right now! I am confirmed to start.');
                  console.log(show.team.matchup[1], 'I have been changed, replace me with new goalie...');
                  show.team.matchup[1] = rep;
                } else if (this.startersDate === show.team.today && show.team.matchup != null && this.fullFirebaseResponse[1][show.team.matchup[1].player.ID] != null && this.fullFirebaseResponse[1][rep.player.ID] != null && rep.team.ID === show.team.matchup[1].team.ID && this.fullFirebaseResponse[1][show.team.matchup[1].player.ID].probable === false && this.fullFirebaseResponse[1][rep.player.ID].confirmed === false && this.fullFirebaseResponse[1][rep.player.ID].probable === true && rep.player.probable === false) {
                  rep.player.probable = true;
                  console.log(rep, 'update me into the view right now! I am probable to start.');
                  console.log(show.team.matchup[1], 'I have been changed, replace me with probable goalie.');
                  show.team.matchup[1] = rep;
                }

              }
            }
          }


        } else {

          console.log('removed db fb callback was undefined, go get goalie data again please...')

          this.fbService
            .getStarterData()
            .subscribe(res => {

              if (res[0] != null) {
                console.log(res, 'got response from firebase...');
                this.fullFirebaseResponse = res[0];
                this.startersDate = res[0][0]['todayDate'];
                this.todayStarters = res[0][1];
                this.allGoalies = Array.of(res[0][1]);
                this.allGoaliesTomorrow = Array.of(res[0][3]);
              }

            });
        }

      });
    yesterday = this.dataService.getYesterday();
    tomorrow = this.dataService.getTomorrow();
    today = this.dataService.getToday();
    this.tomorrowDate = tomorrow;
    console.log(yesterday + ' yesterday, ' + today + ' today, ' + tomorrow + ' tomorrow, ');
    this.sentData = this.dataService.getSentStats();
    this.sentYesterdayData = this.yesterdayService.getSentStats();
    this.sentTomorrowData = this.tomorrowService.getSentStats();
    
  }


  loadData() {


    this.dataService
      .getEnv().subscribe(res => {
        
        headers = new HttpHeaders().set("Authorization", "Basic " + btoa('ianposton' + ":" + res));
       
        this.dataService
          .sendHeaderOptions(headers);

        this.dataService
          .getDailySchedule().subscribe(res => {

            console.log(res, "schedule...");

            if (res['dailygameschedule'].gameentry == null) {
              this.loading = false;
              this.noGamesToday = true;
              this.noGamesMsg = "There Are No Games Scheduled Today :("
              console.log('There are no games being played today.');
            } else {
              let postponed;
              res['dailygameschedule'].gameentry.forEach((item, index) => {

                if(this.fbService.userDetails === null) {
                 
                  dailyTeams.push(item.homeTeam.Abbreviation, item.awayTeam.Abbreviation); 
                  teamString = dailyTeams.join();
                }
                
                // postponed = index;
                // if (res['dailygameschedule'].gameentry[postponed].id === '41392') {
                //   console.log(res['dailygameschedule'].gameentry[postponed], "hi, iam postponed and causing trouble...");
                //   res['dailygameschedule'].gameentry.splice(postponed, 1);
                // }
              });
              this.dailySchedule = res['dailygameschedule'].gameentry;
              this.gameDate = res['dailygameschedule'].gameentry[0].date;
              let dPipe = new DatePipe("en-US");
              this.tweetDay = dPipe.transform(this.gameDate, 'EEEE');
              this.gamesToday = true;

              Observable.forkJoin(
                  res['dailygameschedule'].gameentry.map(
                    g =>  this.http.get(`${this.apiRoot}/game_startinglineup.json?gameid=` + g.id + `&position=Goalie-starter`, {headers})
                  )
                )
                .subscribe(res => {
                  console.log(res, 'making several calls by GAME ID for starting lineups...');

                  let i;
                  let i2;
                  let res2;
                  res.forEach((item, index) => {
                    i = index;
                    //console.log(res[i]['gamestartinglineup'].teamLineup, 'got starting lineups data!');
                    res2 = res[i]['gamestartinglineup'].teamLineup;
                    
                    res2.forEach((item, index) => {

                      i2 = index;
                      if (res2[i2].actual != null && res2[i2].expected != null) {
                        //console.log(res2[i2].actual.starter[0].player, 'got player ID for goalie actualy starting!');
                        this.starterIdData.push(res2[i2].actual.starter[0].player.ID);

                      } else if (res2[i2].actual == null && res2[i2].expected != null) {
                        //console.log(res2[i2].expected.starter[0].player.ID, 'got player ID for goalie expected to start!');
                        this.starterIdData.push(res2[i2].expected.starter[0].player.ID);
                      } else {
                        //console.log(res2[i2].team.City + " " + res2[i2].team.Name, 'no starters yet!');
                        this.starterIdData.push(res2[i2].team.ID);
                      
                        //console.log(this.starterIdData, 'this array has ALL the team IDs of todays starters');

                      }

                    });
                  });

                  this.sortData();

                });

            }

          })


        this.dataService
          .getGameId().subscribe(res => {
            console.log(res['fullgameschedule'].gameentry, "scheduled games for yesterday today and tomorrow...");

            //this removed a postponed game from api to avoid errors
            // if (res['fullgameschedule'].gameentry > 0) {
            //   let postponed;
            //   res['fullgameschedule'].gameentry.forEach((item, index) => {
            //     postponed = index;
            //     if (res['fullgameschedule'].gameentry[postponed].id === '41392') {
            //       console.log(res['fullgameschedule'].gameentry[postponed], "hi, iam postponed and causing trouble...");
            //       res['fullgameschedule'].gameentry.splice(postponed, 1);
            //     }
            //   });
            // }

            this.fullSchedule = res['fullgameschedule'].gameentry;
          })

      })

  }


  sortData() {



    if (this.gamesToday === true) {
      this.dataService
        .getDaily().subscribe(res => {
          console.log(res, "Daily stats...");
          this.dailyStats = res['dailyplayerstats'].playerstatsentry;
        })
    } else {
      console.log('No games then no daily stats either. :(');
    }

    this.dataService
      .getStats(teamString).subscribe(res => {
        console.log(res['cumulativeplayerstats'].playerstatsentry, "cumulative stats...");

    
        this.myData = res['cumulativeplayerstats'].playerstatsentry;

      

        if (this.myData && this.dailySchedule) {
          console.log('start sorting data for daily schedule...');
          for (let schedule of this.dailySchedule) {

              //console.log(this.myData, 'filtered myData')

            for (let sdata of this.myData) {

              sdata.player.lastweekWins = 0;
              sdata.player.lastweekLosses = 0;
              sdata.player.lastweekOtl = 0;

              if (schedule.awayTeam.Name === sdata.team.Name) {
                sdata.player.gameTime = schedule.time;

                if (schedule.location === 'Nassau Coliseum') {
                  sdata.team.gameIce = 'Barclays Center';
                } else if (schedule.location === 'Verizon Center') {
                  sdata.team.gameIce = 'Capital One Arena';
                } else if (schedule.location === 'Joe Louis Arena') {
                  sdata.team.gameIce = 'Little Caesars Arena';
                } else if (schedule.location === 'Consol Energy Center') {
                  sdata.team.gameIce = 'PPG Paints Arena';
                } else {
                  sdata.team.gameIce = schedule.location;
                }

                sdata.team.gameId = schedule.id;
                sdata.player.gameLocation = "away";
                sdata.team.day = this.tweetDay;
                sdata.team.opponent = schedule.homeTeam.City + ' ' + schedule.homeTeam.Name;
                sdata.team.opponentId = schedule.homeTeam.ID;
                sdata.team.opponentCity = schedule.homeTeam.City;
                sdata.team.opponentName = schedule.homeTeam.Name;
                sdata.team.opponentAbbreviation = schedule.homeTeam.Abbreviation;
                sdata.team.today = today;
                sdata.team.tomorrow = tomorrow;
                sdata.team.yesterday = yesterday;
                sdata.player.confirmed = false;
                sdata.player.probable = false;
                sdata.player.startstatus = '';
                sdata.flip = 'inactive';

              }
              if (schedule.homeTeam.Name === sdata.team.Name) {
                sdata.player.gameTime = schedule.time;

                if (schedule.location === 'Nassau Coliseum') {
                  sdata.team.gameIce = 'Barclays Center';
                } else if (schedule.location === 'Verizon Center') {
                  sdata.team.gameIce = 'Capital One Arena';
                } else if (schedule.location === 'Joe Louis Arena') {
                  sdata.team.gameIce = 'Little Caesars Arena';
                } else if (schedule.location === 'Consol Energy Center') {
                  sdata.team.gameIce = 'PPG Paints Arena';
                } else {
                  sdata.team.gameIce = schedule.location;
                }

                sdata.team.gameId = schedule.id;
                sdata.player.gameLocation = "home";
                sdata.team.day = this.tweetDay;
                sdata.team.opponent = schedule.awayTeam.City + ' ' + schedule.awayTeam.Name;
                sdata.team.opponentId = schedule.awayTeam.ID;
                sdata.team.opponentCity = schedule.awayTeam.City;
                sdata.team.opponentName = schedule.awayTeam.Name;
                sdata.team.opponentAbbreviation = schedule.awayTeam.Abbreviation;
                sdata.team.today = today;
                sdata.team.tomorrow = tomorrow;
                sdata.team.yesterday = yesterday;
                sdata.player.confirmed = false;
                sdata.player.probable = false;
                sdata.player.startstatus = '';
                sdata.flip = 'inactive';

              }

            }
          }
        }

        if (this.myData && this.dailyStats) {
          console.log('start sorting data for daily stats...');
          for (let daily of this.dailyStats) {
            for (let mdata of this.myData) {

              if (daily.player.ID === mdata.player.ID) {

                mdata.player.saves = daily.stats.Saves['#text'];
                mdata.player.shotsFaced = daily.stats.ShotsAgainst['#text'];
                mdata.player.wins = daily.stats.Wins['#text'];
                mdata.player.losses = daily.stats.Losses['#text'];
                mdata.player.OvertimeLosses = daily.stats.OvertimeLosses['#text'];
                mdata.player.Shutouts = daily.stats.Shutouts['#text'];
                mdata.player.ga = daily.stats.GoalsAgainst['#text'];

                if (daily.stats.Saves['#text'] > 0 || daily.stats.Wins['#text'] == '1') {
                  // this.starterIdData.push(daily.player.ID);
                  this.startingGoaliesToday.push(daily.player.ID);
                }

                if (daily.stats.GoalsAgainst['#text'] == '1') {
                  mdata.player.GoalsAgainst = daily.stats.GoalsAgainst['#text'] + ' goal';
                } else {
                  mdata.player.GoalsAgainst = daily.stats.GoalsAgainst['#text'] + ' goals';
                }

                if (parseInt(daily.stats.Saves['#text']) > 20 && daily.stats.GoalsAgainst['#text'] == '0') {
                  mdata.player.twentySavesPlus = true;
                  mdata.player.twentySavesPlusResult = mdata.player.FirstName + ' ' + mdata.player.LastName + ' has ' + daily.stats.Saves['#text'] + ' saves and has not given up a goal to the ' + mdata.team.opponentCity + ' ' + mdata.team.opponentName + '!';
                } else if (parseInt(daily.stats.Saves['#text']) > 20 && daily.stats.GoalsAgainst['#text'] > '0') {
                  mdata.player.twentySavesPlus = true;
                  mdata.player.twentySavesPlusShutout = false;
                  mdata.player.twentySavesPlusResult = mdata.player.FirstName + ' ' + mdata.player.LastName + ' has ' + daily.stats.Saves['#text'] + ' saves against ' + daily.stats.ShotsAgainst['#text'] + ' shots fired by ' + mdata.team.opponentCity + ' ' + mdata.team.opponentName + ' offense and let ' + mdata.player.GoalsAgainst + ' light the lamp!';
                }


              }

            }
          }
        }

        if (this.myData && this.fullSchedule) {
          console.log('start sorting data for full schedule...');
          for (let full of this.fullSchedule) {

            for (let btb of this.myData) {

              if (full.awayTeam.ID === btb.team.ID) {

                if (btb.team.yesterday === full.date) {

                  btb.team.hadGameYesterday = true;

                }
                if (btb.team.today === full.date) {
                  btb.team.haveGameToday = true;
                }


                if (btb.team.tomorrow === full.date) {

                  btb.team.haveGameTomorrow = true;
                }

              }
              if (full.homeTeam.ID === btb.team.ID) {


                if (btb.team.yesterday === full.date) {

                  btb.team.hadGameYesterday = true;


                }
                if (btb.team.today === full.date) {
                  btb.team.haveGameToday = true;
                }


                if (btb.team.tomorrow === full.date) {

                  btb.team.haveGameTomorrow = true;
                }

              }
            }
          }
        }



        for (let data of this.myData) {
          console.log('start sorting data for goalie images and back to back...');

          data.player.savePercent = data.stats.stats.SavePercentage['#text'].slice(1);

          if (this.todayStarters != null) {

            if (this.todayStarters[data.player.ID] != null) {
              data.player.image = this.todayStarters[data.player.ID].image;
              data.player.atHandle = this.todayStarters[data.player.ID].atHandle;
              data.player.twitterHandle = this.todayStarters[data.player.ID].twitterHandle;
            }

            if (this.startersDate === data.team.today && this.todayStarters[data.player.ID] != null && data.player.saves == null && data.player.shotsFaced == null && this.todayStarters[data.player.ID].probable === true || this.startersDate === data.team.today && this.todayStarters[data.player.ID] != null && data.player.saves == '0' && data.player.shotsFaced == '0' && this.todayStarters[data.player.ID].probable === true) {
              data.player.confirmed = this.todayStarters[data.player.ID].confirmed;
              data.player.probable = this.todayStarters[data.player.ID].probable;
              data.player.startingToday = true;
              data.player.startingTodayNow = false;

              //console.log(data.player, 'confirmed or probable');

              this.startersData.push(data);
            }
          } else {
            console.log('firebase res not returned yet....');
          }


          if (data.team.hadGameYesterday === true) {
            //console.log(data, 'game yesterday');
            if (data.team.haveGameToday === true) {
              data.team.secondBacktoBack = " 2nd game of a Back-to-Back ";
            } else {
              data.team.secondBacktoBack = "";
            }
          } else {
            data.team.secondBacktoBack = "";
          }

          if (data.team.haveGameToday === true) {
            //console.log(data, 'game today');
            if (data.team.haveGameTomorrow === true) {
              data.team.firstBacktoBack = " 1st game of a Back-to-Back ";
            } else {
              data.team.firstBacktoBack = "";
            }
          }



        }


        if (this.sentYesterdayData != null) {
          console.log('start sorting data from yesterday...');
          for (let yesterday of this.sentYesterdayData) {

            for (let tomdata of this.myData) {

              if (yesterday.player.saves > 1 && yesterday.player.ID === tomdata.player.ID) {

                console.log(yesterday.player, "played yesterday...");

                tomdata.player.finishedYesterday = false;
                tomdata.player.playedYesterday = true;
                tomdata.player.savesYesterday = yesterday.player.saves;
                tomdata.player.winsYesterday = yesterday.player.wins;
                tomdata.player.lossesYesterday = yesterday.player.losses;
                tomdata.player.saYesterday = yesterday.player.ShotsAgainst;
                tomdata.player.olYesterday = yesterday.player.OvertimeLosses;
                tomdata.player.shYesterday = yesterday.player.Shutouts;
                tomdata.player.yday = yesterday.team.day;

                if (yesterday.player.wins == '1') {
                  tomdata.player.resultYesterday = yesterday.player.FirstName + ' ' + yesterday.player.LastName + ' got the Win ' + yesterday.team.day + ' with ' + yesterday.player.saves + ' saves against ' + yesterday.player.ShotsAgainst + ' shots.'
                } else if (yesterday.player.losses == '1' || yesterday.player.OvertimeLosses == '1') {
                  tomdata.player.resultYesterday = yesterday.player.FirstName + ' ' + yesterday.player.LastName + ' got the Loss ' + yesterday.team.day + ' with ' + yesterday.player.saves + ' saves against ' + yesterday.player.ShotsAgainst + ' shots.'
                }

              }

            }
          }
        }

       

        if (this.myData && this.gamesToday === true) {
          if (this.startingGoaliesToday.length > 0) {
            console.log('start sorting data for starters of games in progress...');
            for (let startinprogress of this.startingGoaliesToday) {

              for (let progressdata of this.myData) {

                if (startinprogress === progressdata.player.ID) {
                  console.log('starters of games that have started');
                  progressdata.player.startingToday = true;
                  progressdata.player.startingTodayNow = true;
                  this.startersData.push(progressdata);
                  //progressdata.player.startingGoalieTruth = startinprogress;

                }


              }
            }
          }


          if (this.starterIdData.length > 0) {
            console.log('start sorting data for starters matchups...');
            for (let startid of this.starterIdData) {

              for (let startdata of this.myData) {

                if (startid === startdata.team.ID && startdata.stats.GamesPlayed['#text'] > 1) {
                  if (this.startersDate != startdata.team.today) {

                    startdata.player.startingToday = false;
                    startdata.player.likelyStartingToday = true;
                    //console.log(startdata.player.FirstName + " " + startdata.player.LastName, "this goalie is not starting yet. but he might start.");
                    this.startersData.push(startdata);


                  }
                } else if (this.startersDate != startdata.team.today && startid === startdata.player.ID) {
                  if (startdata.player.saves == null || startdata.player.saves == '0') {
                    console.log(startdata.player, 'expected goalies from api');
                    startdata.player.startingToday = true;
                    startdata.player.startingTodayNow = false;
                    
                    this.startersData.push(startdata);
                  }

                }

              }
            }
          }


          //MAKE MATCHUPS BY GAME ID OF STARTERS AND NON STARTERS

          if (this.startersData.length > 0) {
            this.statData = this.startersData.reduce(function(r, a) {
              // I need to store game ID for home player on team
              // Store game ID for away team somewhere else if away push but dont make a

              r[a.team.gameId] = r[a.team.gameId] || [];
   
              r[a.team.gameId].push(a);
              
         
return r
            }, Object.create(null));

            //console.log(this.statData, 'made matchups of starting goalies by game ID...');

            this.showMatchups();
          }

        }

      })

  }

  showMatchups() {

 console.log(this.statData, 'show this');
    //THIS FOR LOOP GETS HOME STARTING HOCKEY GOALIES AND THERE STARTING OPPONENT 
    this.startersData.forEach((data) => {
      if (data.player.gameLocation === 'home') {
        data.team.matchup = this.statData[data.team.gameId];
       
        this.statData[data.team.gameId][0].player.twoPossibleStarters = false;
        this.statData[data.team.gameId][1].player.twoPossibleStarters = false;

        if (this.statData[data.team.gameId].length > 2) {
          //console.log(this.statData[data.team.gameId][0].team.Name + ' ' + this.statData[data.team.gameId][1].team.Name + ' ' + this.statData[data.team.gameId][2].team.Name, 'possible starters...');
          if (this.statData[data.team.gameId][0].team.ID === this.statData[data.team.gameId][1].team.ID) {
            this.statData[data.team.gameId][1].player.twoPossibleStarters = true;
            this.statData[data.team.gameId][1].twoPossibleStarters = true;
            if (this.statData[data.team.gameId][0].player.saves == null && this.statData[data.team.gameId][1].player.saves > '0') {
              console.log(this.statData[data.team.gameId][0].player, 'this is not a starter. api got it wrong');
              this.statData[data.team.gameId][0].player.wrongStarter = true;
            } else if ((this.statData[data.team.gameId][0].player.saves == '0' || this.statData[data.team.gameId][0].player.saves == '1') && this.statData[data.team.gameId][1].player.saves > '0') {
              console.log(this.statData[data.team.gameId][0].player, 'this is not a starter. api got it wrong');
              this.statData[data.team.gameId][0].player.wrongStarter = true;
            }
          } else {
            this.statData[data.team.gameId][1].twoPossibleStarters = false;
          }
          if (this.statData[data.team.gameId][0].team.ID === this.statData[data.team.gameId][2].team.ID) {
            this.statData[data.team.gameId][0].player.twoPossibleStarters = true;
            this.statData[data.team.gameId][0].twoPossibleStarters = true;
            if (this.statData[data.team.gameId][2].player.saves == null && this.statData[data.team.gameId][0].player.saves > '0') {
              console.log(this.statData[data.team.gameId][2].player, 'this is not a starter. api got it wrong');
              this.statData[data.team.gameId][2].player.wrongStarter = true;
            } else if (this.statData[data.team.gameId][2].player.saves == '0' && this.statData[data.team.gameId][0].player.saves > '0') {
              console.log(this.statData[data.team.gameId][2].player, 'this is not a starter. api got it wrong');
              this.statData[data.team.gameId][2].player.wrongStarter = true;
            }
          } else {
            this.statData[data.team.gameId][0].twoPossibleStarters = false;
          }
          if (this.statData[data.team.gameId][1].team.ID === this.statData[data.team.gameId][2].team.ID) {
            this.statData[data.team.gameId][1].twoPossibleStarters = true;
            this.statData[data.team.gameId][2].player.twoPossibleStarters = true;
            if (this.statData[data.team.gameId][2].player.saves == null && this.statData[data.team.gameId][1].player.saves > '0') {
              console.log(this.statData[data.team.gameId][2].player, 'this is not a starter. api got it wrong');
              this.statData[data.team.gameId][2].player.wrongStarter = true;
            } else if ((this.statData[data.team.gameId][2].player.saves == '0' || this.statData[data.team.gameId][2].player.saves == '1') && this.statData[data.team.gameId][1].player.saves > '0') {
              console.log(this.statData[data.team.gameId][1].player, 'this is not a starter. api got it wrong');
              this.statData[data.team.gameId][2].player.wrongStarter = true;
            }
            if (this.statData[data.team.gameId][2].player.resultYesterday != null) {
              this.statData[data.team.gameId][2].player.finishedYesterday = true;
            }
            if (this.statData[data.team.gameId][1].player.resultYesterday != null) {
              this.statData[data.team.gameId][1].player.finishedYesterday = true;
            }
          } else {
            // this.statData[data.team.gameId][1].twoPossibleStarters = false;
            this.statData[data.team.gameId][2].player.twoPossibleStarters = false;
          }
          if (this.statData[data.team.gameId][3] != null) {
            if (this.statData[data.team.gameId][2].team.ID === this.statData[data.team.gameId][3].team.ID) {
              this.statData[data.team.gameId][2].twoPossibleStarters = true;
              this.statData[data.team.gameId][3].twoPossibleStarters = true;
            } else {
              this.statData[data.team.gameId][2].twoPossibleStarters = false;
              this.statData[data.team.gameId][3].twoPossibleStarters = false;
            }
          }

        }


        this.loading = false;
        this.showData = this.startersData;
        
      }

    })

     if (this.hitCount != null && this.fbService.userDetails === null) {
        this.fbService.updateCounter(this.hitCount);
     }

     this.dataService
      .sendStats(this.showData, this.myData);
     }


  ngOnInit() {

    if (this.sentData === undefined) {
      this.loadData();
      this.fbService.getHits()
        .subscribe(res => {
            console.log(res[0]['hits'], 'ngOnInit hit count...');
            this.hitCount = res[0]['hits'];
        });

      // get our data every subsequent 10 minutes
      const MILLISECONDS_IN_TEN_MINUTES = 600000;
      IntervalObservable.create(MILLISECONDS_IN_TEN_MINUTES)
        .subscribe(() => {
          if (this.gamesToday === true) {
            this.dataService
              .getDaily().subscribe(res => {
                console.log(res, "Daily stats updated!");
                this.dailyStats = res['dailyplayerstats'].playerstatsentry;

                if (this.myData && this.dailyStats) {
                  console.log('start sorting data for daily stats...');
                  for (let daily of this.dailyStats) {
                    for (let mdata of this.myData) {

                      if (daily.player.ID === mdata.player.ID) {

                        mdata.player.saves = daily.stats.Saves['#text'];
                        mdata.player.shotsFaced = daily.stats.ShotsAgainst['#text'];
                        mdata.player.wins = daily.stats.Wins['#text'];
                        mdata.player.losses = daily.stats.Losses['#text'];
                        mdata.player.OvertimeLosses = daily.stats.OvertimeLosses['#text'];
                        mdata.player.Shutouts = daily.stats.Shutouts['#text'];
                        mdata.player.ga = daily.stats.GoalsAgainst['#text'];

                        if (daily.stats.Saves['#text'] > 0 || daily.stats.Wins['#text'] == '1') {
                          // this.starterIdData.push(daily.player.ID);
                          this.startingGoaliesToday.push(daily.player.ID);
                        }

                        if (daily.stats.GoalsAgainst['#text'] == '1') {
                          mdata.player.GoalsAgainst = daily.stats.GoalsAgainst['#text'] + ' goal';
                        } else {
                          mdata.player.GoalsAgainst = daily.stats.GoalsAgainst['#text'] + ' goals';
                        }

                        if (parseInt(daily.stats.Saves['#text']) > 20 && daily.stats.GoalsAgainst['#text'] == '0') {
                          mdata.player.twentySavesPlus = true;
                          mdata.player.twentySavesPlusResult = mdata.player.FirstName + ' ' + mdata.player.LastName + ' has ' + daily.stats.Saves['#text'] + ' saves and has not given up a goal to the ' + mdata.team.opponentCity + ' ' + mdata.team.opponentName + '!';
                        } else if (parseInt(daily.stats.Saves['#text']) > 20 && daily.stats.GoalsAgainst['#text'] > '0') {
                          mdata.player.twentySavesPlus = true;
                          mdata.player.twentySavesPlusShutout = false;
                          mdata.player.twentySavesPlusResult = mdata.player.FirstName + ' ' + mdata.player.LastName + ' has ' + daily.stats.Saves['#text'] + ' saves against ' + daily.stats.ShotsAgainst['#text'] + ' shots fired by ' + mdata.team.opponentCity + ' ' + mdata.team.opponentName + ' offense and let ' + mdata.player.GoalsAgainst + ' light the lamp!';
                        }


                      }

                    }
                  }
                }
              })

          } else {
            console.log('No games then no daily stats either. :(');
          }
        });

    } else {

    
        this.loading = false;
        this.showTomorrow = this.sentTomorrowData;
        this.showData = this.sentData;
        console.log(this.showTomorrow, "show tomorrow");
        this.gameDate = this.showData["0"].team.today;
    

    }

  }


  public saveStarts() {
    if (this.stats === false) {
      console.log('This a good state to save!!');
      console.log(this.fullFirebaseResponse, 'the full firebase response to send back to fb for update...');
      this.fbService
        .addData(this.fullFirebaseResponse);
    } else {
      console.log('you need to refresh the goalies before saving... Important');
    }
  }

  public setGoalieId() {
     this.newGoalie = {
      [this.goalieID]: {
        confirmed: false,
        name: null,
        probable: false,
        image: null,
        atHandle: null,
        twitterHandle: null
      }
    };

    console.log(this.newGoalie, 'save this goalie');
    this.goalieIdSet = true;
  }

  public addGoalie() {
    this.fullFirebaseResponse[1][this.goalieID] = this.newGoalie[this.goalieID];
    this.fullFirebaseResponse[3][this.goalieID] = this.newGoalie[this.goalieID];
    console.log(this.newGoalie, 'goalie updated');
    //console.log(this.fullFirebaseResponse, 'added new goalie ready to save to fb....');   
  }

  public updateTodayStarters() {
    this.fullFirebaseResponse[0]['todayDate'] = this.fullFirebaseResponse[2]['tomorrowDate'];
    this.fullFirebaseResponse[1] = this.fullFirebaseResponse[3];
    console.log(this.fullFirebaseResponse, 'moved tomorrow starts to today...');
  }

  public showTodayStarters() {
    this.stats = true;
    for (let info of this.myData) {
      if (this.fullFirebaseResponse[1][info.player.ID] != null) {
        if (this.fullFirebaseResponse[1][info.player.ID].confirmed === false && this.fullFirebaseResponse[1][info.player.ID].probable === false) {

          this.fullFirebaseResponse[1][info.player.ID].filterOutStarters = true;
          //console.log(this.fullFirebaseResponse[1][info.player.ID], "not starting today...");
        }
      }

      if (this.fullFirebaseResponse[3][info.player.ID] != null) {
        if (this.fullFirebaseResponse[3][info.player.ID].confirmed === false && this.fullFirebaseResponse[3][info.player.ID].probable === false) {

          this.fullFirebaseResponse[3][info.player.ID].filterOutStarters = true;
          //console.log(this.fullFirebaseResponse[3][info.player.ID], "not starting tomorrow...");
        }
      }
    }
  }

  public selectAll() {
    for (let info of this.myData) {
      if (this.fullFirebaseResponse[3][info.player.ID] != null) {
        this.fullFirebaseResponse[3][info.player.ID].confirmed = false;
        this.fullFirebaseResponse[3][info.player.ID].probable = false;
        //console.log(this.fullFirebaseResponse, "make all starters false");
      }
    }
  }


  public toggleFlip(data) {
    
    data.flip = (data.flip == 'inactive') ? 'active' : 'inactive';

    this.dataService
          .getScore().subscribe(res => {
            console.log(res['scoreboard'].gameScore, "Score...");
            this.score = res['scoreboard'].gameScore;

            if (res['scoreboard'].gameScore == null) {
              
              this.noScores = true;
              this.noScoresMsg = "The game is not live yet."
              console.log('There are no games in progress at the moment.');
            } else {

            console.log('start sorting data for scoreboard stats...');
            for (let sc of this.score) {
              for (let pdata of this.showData) {

                if (sc.game.homeTeam.ID === pdata.team.ID) {

                  pdata.team.homeGoalie = pdata.player.FirstName + ' ' + pdata.player.LastName;
                  pdata.team.opponentAbbreviation = sc.game.awayTeam.Abbreviation;
                  pdata.team.opponentScore = sc.awayScore;
                  pdata.team.teamScore = sc.homeScore;

                }

              }
            }
          }

          })

          
          

  }


  public isVisibleOnDesktop() {
    // console.log('width over 600px');
  }

  public isVisibleOnMobile() {
    // console.log('width under 600px');
  }

  public open(event, data) {
    this.selected = data;
    console.log(data, 'ok you clicked on player img...');
    this.dialog.open(TodayDialog, {
      data: data,
      width: '600px',
    });
  }

  public openLastweek(event, data) {
    
    this.dialog.open(LastweekDialog, {
      data: data,
      width: '1025px',
    });
  }

  public openLogin(event) {
    if (event.keyCode === 65 && event.ctrlKey) {
      this.dialog.open(LoginDialog, {
        width: '1025px'
      });
    } else {
      //console.log('wrong key...');
    }

  }

  openSnackBar() {
    this.snackBar.openFromComponent(Info, {
      // duration: 500,
    });
  }

  public goYesterday() {
    this.router.navigateByUrl('starting-goalies/yesterday');
  }

  public goTomorrow() {
    this.router.navigateByUrl('starting-goalies/tomorrow');
  }

}


@Component({
  selector: 'login-dialog',
  template: `<i (click)="dialogRef.close()" style="float:right; cursor:pointer;" class="material-icons">close</i>
  <span *ngIf="fbService.userDetails == null">Login to Edit</span>  <span *ngIf="fbService.userDetails != null">Logout after edit is saved</span>
  <mat-dialog-content>
  <div  *ngIf="fbService.userDetails == null">
    <div class="login-container">
      <mat-form-field>
        <input matInput type="email" class="form-control" [(ngModel)]="user.email" placeholder="Email" required>
      </mat-form-field>

      <mat-form-field>
        <input matInput type="password" class="form-control" [(ngModel)]="user.password" placeholder="Password" required>
      </mat-form-field>

      <button mat-raised-button class="mat-raised-button" (click)="signInWithEmail()">Login</button>
    </div>  
  </div>
 
<div *ngIf="fbService.userDetails != null">
 <button mat-raised-button class="mat-raised-button" color="warn"  (click)="fbService.logout()">Logout</button>
</div>
  </mat-dialog-content>`,
})

export class LoginDialog implements OnInit {

  user = {
    email: '',
    password: ''
  };

  signedIn: any;

  constructor(public dialogRef: MatDialogRef < LastweekDialog > , private fbService: FirebaseService) {}


   public signInWithEmail() {
    this.fbService.signInRegular(this.user.email, this.user.password)
      .then((res) => {
        //console.log(res);
        this.signedIn = res;
      })
      .catch((err) => console.log('error: ' + err));
  }



  ngOnInit() {


  }

}

@Component({
  selector: 'lastweek-dialog',
  template: `<i (click)="dialogRef.close()" style="float:right; cursor:pointer;" class="material-icons">close</i>
  <span style="color:#f44336; font-size: 18px;">NHL Starting Goalies | The Hot List! | {{sentLastweek | date:'shortDate'}} - {{sentYesterday | date:'shortDate'}}</span>
  <mat-dialog-content>
  <div class="spinner-msg" *ngIf="loading" style="background: #fff;">
  Fetching goalie stats...
  <mat-spinner></mat-spinner>
  </div>
  <ul *ngFor="let data of showData"><li *ngIf="data.wins &gt; 1 && data.hot === true"><span class="player"><img src="{{ data.image}}" alt="" /></span><span style="font-weight: bold;" class="last-week"> {{ data.name }} <img src="../assets/nhl-logos/{{ data.team }}.jpg" alt="" /></span><span style="font-weight: bold;"> ({{ data.wins + '-' + data.losses + '-' + data.otl }})</span> <span *ngIf="data.opponents[0] != null"> - <span style="color:#6740B4">{{data.opponents[0].date}}</span> {{data.opponents[0].desc}}</span><span *ngIf="data.opponents[1] != null">, <span style="color:#6740B4">{{data.opponents[1].date}}</span> {{data.opponents[1].desc}}</span><span *ngIf="data.opponents[2] != null">, <span style="color:#6740B4">{{data.opponents[2].date}}</span> {{data.opponents[2].desc}}</span> <span *ngIf="data.opponents[3] != null">, <span style="color:#6740B4">{{data.opponents[3].date}}</span> {{data.opponents[3].desc}}</span> - <span style="font-weight: bold;">Total Saves: {{data.sv}} Total Shots: {{data.sa}}</span></li></ul>
  </mat-dialog-content>`,
})

export class LastweekDialog implements OnInit {

  starterStatData: Array < any > = [];
  showData: Array < any > ;
  sentHotData: Array < any > ;
  sentAllData: Array < any > ;
  sentYesterday: any;
  sentLastweek: any;
  loading: boolean = true;

  constructor(public dialogRef: MatDialogRef < LastweekDialog > , @Inject(MAT_DIALOG_DATA) public data: any, private http: HttpClient, private dataService: DataService) {
    this.sentHotData = this.dataService.getSentHotStats();
    this.sentAllData = this.dataService.getSentAllStats();
    this.sentYesterday = this.dataService.getYesterday();
    this.sentLastweek = this.dataService.getLastweek();

  }

  loadLastweek() {

    this.dataService
      .getLastweekGameId().subscribe(res => {
        console.log(res['fullgameschedule'].gameentry, "scheduled games for lastweek...");
        //this.lastweekSchedule = res['fullgameschedule'].gameentry;


        Observable.forkJoin(
            res['fullgameschedule'].gameentry.map(
              g =>
              this.http.get('https://api.mysportsfeeds.com/v1.2/pull/nhl/2017-2018-regular/game_boxscore.json?gameid=' + g.id + '&playerstats=Sv,GA,GAA,GS,SO,MIN,W,L,SA,OTL,OTW', {headers})
              //.map(response => response.json())
            )
          )
          .subscribe(res => {
            console.log(res, 'making several calls by GAME ID for starting lineups...');

            let i;
            let i2;
            let i3;
            let res2;
            let res3;
            let myDate;

            res.forEach((item, index) => {
              i = index;
              //console.log(res[i]['gameboxscore'].awayTeam.awayPlayers['playerEntry'], 'got box score data for away team!');
              console.log(res[i]['gameboxscore'].game.date, 'looking for date...');

              res2 = res[i]['gameboxscore'].awayTeam.awayPlayers['playerEntry'];
              res3 = res[i]['gameboxscore'].homeTeam.homePlayers['playerEntry'];

              //this.gameTime =  res[i]['gamestartinglineup'].game.date;
              res2.forEach((item, index) => {

                i2 = index;
                res2[i2].player.city = res[i]['gameboxscore'].game.awayTeam.City;
                res2[i2].player.team = res[i]['gameboxscore'].game.awayTeam.Name;
                res2[i2].player.teamId = res[i]['gameboxscore'].game.awayTeam.ID;
                //console.log(res[i]['gameboxscore'], 'game score data');
                let dPipe = new DatePipe("en-US");
                myDate = dPipe.transform(res[i]['gameboxscore'].game.date, 'MMM d');

                if (res2[i2].stats != null && res2[i2].stats.Wins['#text'] == '1') {
         
                  res2[i2].player.opponent = {date: myDate, desc: '(W) @ ' + res[i]['gameboxscore'].game.homeTeam.City + ' GA: ' + res2[i2].stats.GoalsAgainst['#text']}
                  
                }
                if (res2[i2].stats != null && res2[i2].stats.Losses['#text'] == '1') {
                  
                  res2[i2].player.opponent = {date: myDate, desc: '(L) @ ' + res[i]['gameboxscore'].game.homeTeam.City + ' GA: ' + res2[i2].stats.GoalsAgainst['#text']}
               
                }
                if (res2[i2].stats != null && res2[i2].stats.OvertimeLosses['#text'] == '1') {
                  
                  res2[i2].player.opponent = {date: myDate, desc: '(L) @ ' + res[i]['gameboxscore'].game.homeTeam.City + ' GA: ' + res2[i2].stats.GoalsAgainst['#text']}
                 
                }

                if (res2[i2].stats != null && res2[i2].stats.Wins['#text'] > '0' && res2[i2].player.ID != '9072' || res2[i2].stats != null && res2[i2].stats.Losses['#text'] > '0' && res2[i2].player.ID != '9072' || res2[i2].stats != null && res2[i2].stats.OvertimeLosses['#text'] > '0' && res2[i2].player.ID != '9072') {
                  this.starterStatData.push(res2[i2]);
                  //console.log(res2[i2], 'got player stats for away goalie stats!'); 

                }


              });

              res3.forEach((item, index) => {

                i3 = index;
                res3[i3].player.city = res[i]['gameboxscore'].game.homeTeam.City;
                res3[i3].player.team = res[i]['gameboxscore'].game.homeTeam.Name;
                res3[i3].player.teamId = res[i]['gameboxscore'].game.homeTeam.ID;
                if (res3[i3].stats != null && res3[i3].stats.Wins['#text'] == '1') {
                  
                  res3[i3].player.opponent = {date: myDate, desc: '(W) ' + res[i]['gameboxscore'].game.awayTeam.City + ' GA: ' + res3[i3].stats.GoalsAgainst['#text']}
                  
                }
                if (res3[i3].stats != null && res3[i3].stats.Losses['#text'] == '1') {
                  
                  res3[i3].player.opponent = {date: myDate, desc: '(L) ' + res[i]['gameboxscore'].game.awayTeam.City + ' GA: ' + res3[i3].stats.GoalsAgainst['#text']}
                 
                }
                if (res3[i3].stats != null && res3[i3].stats.OvertimeLosses['#text'] == '1') {
                  
                  res3[i3].player.opponent = {date: myDate, desc: '(L) ' + res[i]['gameboxscore'].game.awayTeam.City + ' GA: ' + res3[i3].stats.GoalsAgainst['#text']}
                  
                }

                //res3[i3].player.opponent = res[i]['gameboxscore'].game.awayTeam.Abbreviation;
                if (res3[i3].stats != null && res3[i3].stats.Wins['#text'] > '0' && res3[i3].player.ID != '9072' || res3[i3].stats != null && res3[i3].stats.Losses['#text'] > '0' && res3[i3].player.ID != '9072' || res3[i3].stats != null && res3[i3].stats.OvertimeLosses['#text'] > '0' && res3[i3].player.ID != '9072') {
                  this.starterStatData.push(res3[i3]);
                  //console.log(res3[i3], 'got player stats for home goalie!');
                }

              });
            });

            this.sortData();

          });
      })

  }

  sortData() {

    for (let info of this.sentAllData) {

      for (let data of this.starterStatData) {
        //console.log(info, 'looking for image');

        if (info.player.ID === data.player.ID) {
          //console.log(info, 'looking for image IDS Match!!')
          data.player.image = info.player.image;


        }

      }
    }
    let opponents = [];
    this.showData = this.starterStatData.reduce(function(hash) {
      //console.log(hash, 'hash');
      return function(r, a) {
        //console.log(a, 'this is a');
        let key = a.player.ID;
        if (!hash[key]) {
          hash[key] = { wins: 0, losses: 0, otl: 0, name: a.player.FirstName + ' ' + a.player.LastName, id: a.player.ID, opponents: [], team: a.player.teamId, ga: 0, sa: 0, sv: 0, svpercent: 0, hot: false, image: a.player.image };
          r.push(hash[key]);
        }
        hash[key].wins += parseInt(a.stats.Wins['#text']);
        hash[key].losses += parseInt(a.stats.Losses['#text']);
        hash[key].otl += parseInt(a.stats.OvertimeLosses['#text']);
        hash[key].ga += parseInt(a.stats.GoalsAgainst['#text']);
        hash[key].sa += parseInt(a.stats.ShotsAgainst['#text']);
        hash[key].sv += parseInt(a.stats.Saves['#text']);
        hash[key].svpercent = Math.round((hash[key].sv * 100) / hash[key].sa);

        if (hash[key].svpercent < 95) {
          hash[key].hot = false;
        } else {
          hash[key].hot = true;
        }

        hash[key].opponents.push(a.player.opponent);

        return r;
      };

    }(Object.create(null)), []);
    this.loading = false;
    console.log(this.showData, 'show reduce array!');
    this.dataService
      .sendHotStats(this.showData);
  }



  ngOnInit() {
    if (this.sentHotData === undefined) {

      this.loadLastweek();

    } else {
      console.log('using saved hot list data :)')
      setInterval(() => {
        this.loading = false;
        this.showData = this.sentHotData;

      }, 300)

    }

  }

}

@Component({
  selector: 'today-dialog',
  template: `<i (click)="dialogRef.close()" style="float:right; cursor:pointer;" class="material-icons">close</i>
  <span style="color:#00aced;">Twitter Updates!</span> 
  <mat-dialog-content>
  <span style="font-size: 26px; font-weight: light; color: #555; text-align: center;">{{ noPosts }}</span>
  <ul *ngFor="let item of tweetsData" style="font-size:14px">
    <li>{{item.text}} <span style="color:#6740B4; font-weight: bold;">{{item.created_at | date:'fullDate'}}</span></li>
</ul>
</mat-dialog-content>`,
})

export class TodayDialog implements OnInit {
  noPosts: any;
  tweetsData: any;
  constructor(public dialogRef: MatDialogRef < TodayDialog > , @Inject(MAT_DIALOG_DATA) public data: any, private http: HttpClient) {

  }

  loadStuff() {
    let headers = new HttpHeaders().set('Content-Type', 'application/X-www-form-urlencoded');

    this.http.post('/authorize', {headers}).subscribe((res) => {
      this.searchCall();
    })


  }


  searchCall() {
    console.log(this.data, 'data passed in');

    let headers = new HttpHeaders().set('Content-Type', 'application/X-www-form-urlencoded');
    //let searchterm = 'query=#startingGoalies #nhl ' + this.data.player.FirstName + ' ' + this.data.player.LastName;
    let searchterm = 'query=' + this.data.player.LastName + ' ' + this.data.player.twitterHandle;


    this.http.post('/search', searchterm, {headers}).subscribe((res) => {
       console.log(res['data'].statuses, 'twitter stuff');
      this.tweetsData = res['data'].statuses;
      if (this.tweetsData.length === 0) {
        this.noPosts = "No Tweets.";
      }
    });
  }

  ngOnInit() {
    this.loadStuff();
  }
}

@Component({
  selector: 'info',
  template: `<i (click)="close()" class="material-icons close">close</i><br />
<span style="color: #e74c3c;">back</span><span style="color: #ccc;"> to back</span><span> = The first game of a back to back scheduled game.</span><br />
<span style="color: #ccc;">back to </span><span style="color: #e74c3c;">back</span><span> = The second game of a back to back scheduled game.</span> <br />
<span class="green-dot"></span> = This game is in progress. <br />
<span>Click on player image for twitter updates!</span>`,
  styles: [`.close { float:right; cursor:pointer; font-size: 20px; } .green-dot { height: 10px; width: 10px; background:#2ecc71; border-radius: 50%; display: inline-block; }`]
})

export class Info {
  constructor(public snackBar: MatSnackBar) {}
  close() {
    this.snackBar.dismiss();
  }
}
