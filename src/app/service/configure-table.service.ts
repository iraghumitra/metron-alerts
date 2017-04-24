import {Injectable, Inject} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Alert} from '../model/alert';
import {Http, Headers, RequestOptions} from '@angular/http';
import {HttpUtil} from "../utils/httpUtil";
import {IAppConfig} from '../app.config.interface';
import {APP_CONFIG} from '../app.config';
import {Subject} from "rxjs/Subject";

@Injectable()
export class ConfigureTableService {

  defaultHeaders = {'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest'};
  alertsColumnNames = [
    { 'key': 'score',           'display': 'Score',             'type': 'number'},
    { 'key': '_id',             'display': 'Alert ID',          'type': 'string'},
    { 'key': 'timestamp',       'display': 'Age',               'type': 'number'},
    { 'key': 'source:type',     'display': 'Alert Source',      'type': 'string'},
    { 'key': 'ip_src_addr',     'display': 'Source IP',         'type': 'string'},
    { 'key': 'sourceLocation',  'display': 'Source Location',   'type': 'string'},
    { 'key': 'ip_dst_addr',     'display': 'Destination IP',    'type': 'string'},
    { 'key': 'designatedHost',  'display': 'Designated Host',   'type': 'string'},
    { 'key': 'alert_status',    'display': 'Status',            'type': 'string'}
  ];

  constructor(private http: Http, @Inject(APP_CONFIG) private config: IAppConfig) {
  }

  private tableChangedSource = new Subject<string>();

  tableChanged$ = this.tableChangedSource.asObservable();

  onTableChanged() {
    this.tableChangedSource.next('table changed');
  }

  getTableColumns(): Observable<any[]> {
    return Observable.create(observer => {
      observer.next(this.alertsColumnNames);
      observer.complete();
    });
  }

}
