import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ClarityModule } from '@clr/angular';
import { CoreModule } from './core/core.module';
import { HttpModule, JsonpModule } from '@angular/http';

import { DataService } from './services/data.service';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    ClarityModule,
    CoreModule,
    HttpModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
