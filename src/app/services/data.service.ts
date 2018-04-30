import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers } from '@angular/http';
import { environment } from '../../environments/environment';

import 'rxjs/add/operator/map';

@Injectable()
export class DataService {
  private officesUrl = 'assets/offices.json';
  private routesUrl = 'assets/routes.json';
  private planeUrl = 'assets/plane.json';
  private teamsUrl = 'assets/teams.json';
  private commuteJoy = '/api/teams/1';
  // private commuteJoy = 'assets/currentData.json';

  constructor(private http: Http) { }

  createAuthorizationHeader(headers: Headers) {
    const token = environment.commuteJoy.apiKey;
    headers.append('Authorization', token);
    headers.append('cache-control', 'no-cache');
    headers.append('content-type', 'application/json');
  }

  getOffices(): Observable<any> {
    return this.http
                .get(this.officesUrl)
                .map( res => {
                  console.log('realgeojson', res.json());
                  return res.json().data;
                });
  }

  getRoutes(): Observable<any> {
    return this.http
                .get(this.routesUrl)
                .map( res => {
                  return res.json().data;
                });
  }

  getPlane(): Observable<any> {
    return this.http
                .get(this.planeUrl)
                .map( res => {
                  return res.json().data;
                });
  }

  getTeams(): Observable<any> {
    return this.http
                .get(this.teamsUrl)
                .map( res => {
                  return res.json().teams;
                });
  }


  getCurrentData(): Observable<any> {
    const headers = new Headers();
    this.createAuthorizationHeader(headers,);
    return this.http
                .get(this.commuteJoy, {headers: headers})
                .map ( res => {
                    console.log('routes', res.json());
                    return res.json();
                });
  }


  calcMilequists(arupData, teamsData, routesData) {
    arupData.groups.map((d) => {

        // get team data for staff number multiplier
        const thisTeam = teamsData.filter((j) => {
          return j.team_name === d.name;
        })[0];

        // get completed routes to subtract
        if (thisTeam) {

          // find completed routes distance for subtraction
          // const completedRoutes = thisTeam.routes.filter((k) => {
          //     if (k.completed) {
          //       return k
          //     }
          // });

          // now you can reduce to distance and sum

          // get distance in metres and convert to miles
          d.miles = d.distance * 0.00062137;

          // const availMilage = d.miles + d.activities_count - usedMileage;

          d.milequist = (d.miles + d.activities_count) / (thisTeam.total_staff / 100);

          d.routes = thisTeam.routes;
        }
    });
    return arupData.groups;
  }

  calcCompletedDistance() {

  }
}
