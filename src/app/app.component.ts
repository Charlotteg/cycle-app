import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';

import 'rxjs/add/operator/take';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  officeData: any;
  routesData: any;
  teamsData: any;
  currentData: any;

  constructor (private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getOffices().take(1).subscribe((offices: Array<any>) => {
      this.officeData = offices;
    });

    this.dataService.getRoutes().take(1).subscribe((routes: Array<any>) => {
      this.routesData = routes;
    });

    this.dataService.getTeams().subscribe((teams: Array<any>) => {
      this.teamsData = teams;
    });

    // this.dataService.getCurrentData().subscribe((data: Array<any>) => {
    //   this.currentData = data;
    // });

    // this.currentData = this.dataService.calcMilequists(this.currentData, this.teamsData);
  }
}
