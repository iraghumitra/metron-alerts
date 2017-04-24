import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '',  redirectTo: 'alerts-list', pathMatch: 'full'},
  { path: 'alerts-list', loadChildren: 'app/alerts/alerts-list/alerts-list.module#AlertsListModule'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class MetronAlertsRoutingModule { }
