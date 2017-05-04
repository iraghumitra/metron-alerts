import { Router } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {MetronAlertsRoutingModule} from './app-routing.module';
import {AlertsListModule} from './alerts/alerts-list/alerts-list.module';
import {AlertDetailsModule} from './alerts/alert-details/alerts-details.module';
import {APP_CONFIG, METRON_REST_CONFIG} from "./app.config";
import {ConfigureTableModule} from "./alerts/configure-table/configure-table.module";
import {ConfigureTableService} from "./service/configure-table.service";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MetronAlertsRoutingModule,
    AlertsListModule,
    AlertDetailsModule,
    ConfigureTableModule
  ],
  providers: [{ provide: APP_CONFIG, useValue: METRON_REST_CONFIG }, ConfigureTableService],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(router: Router) {
  }
}
