import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {AlertService} from '../../service/alert.service';
import {Alert} from '../../model/alert';
import {WorkflowService} from "../../service/workflow.service";

export enum AlertState {
  NEW, OPEN, ESCALATE, DISMISS, RESOLVE
}

@Component({
  selector: 'app-alert-details',
  templateUrl: './alert-details.component.html',
  styleUrls: ['./alert-details.component.scss']
})
export class AlertDetailsComponent implements OnInit {

  alertId: string = '';
  alertIndex: string = '';
  alertType: string = '';
  alertState = AlertState;
  selectedAlertState: AlertState = AlertState.NEW;
  alert: Alert = new Alert(-1, '', '', '', '', '', '', '', '', '', '', '', {});
  alertFields: string[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private alertsService: AlertService, private workflowService: WorkflowService) { }

  goBack() {
    this.router.navigateByUrl('/alerts-list');
    return false;
  }

  getData() {
    this.alertsService.getAlert(this.alertIndex, this.alertType, this.alertId).subscribe(alert => {
      this.alert = alert;
      this.alertFields = Object.keys(alert._source).filter(field => !field.includes(':ts') && field !== 'original_string').sort();
    });
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.alertId = params['id'];
      this.alertIndex = params['index'];
      this.alertType = params['type'];
      this.getData();
    });
  }

  processOpen() {
    console.log('open');
    this.selectedAlertState = AlertState.OPEN;
    this.alertsService.updateAlertState([this.alert], 'OPEN', '').subscribe(results => {
      this.getData()
    });
  }

  processNew() {
    console.log('new');
    this.selectedAlertState = AlertState.NEW;
    this.alertsService.updateAlertState([this.alert], 'NEW', '').subscribe(results => {
      this.getData()
    });
  }

  processEscalate() {
    console.log('escalate');
    this.selectedAlertState = AlertState.ESCALATE;
    this.workflowService.start([this.alert]).subscribe(workflowId => {
      this.alertsService.updateAlertState([this.alert], 'ESCALATE', workflowId).subscribe(results => {
        this.getData()
      });
    });
  }

  processDismiss() {
    console.log('dismiss');
    this.selectedAlertState = AlertState.DISMISS;
    this.alertsService.updateAlertState([this.alert], 'DISMISS', '').subscribe(results => {
      this.getData()
    });
  }

  processResolve() {
    console.log('resolve');
    this.selectedAlertState = AlertState.RESOLVE;
    this.alertsService.updateAlertState([this.alert], 'RESOLVE', '').subscribe(results => {
      this.getData()
    });
  }

}


