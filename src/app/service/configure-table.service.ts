import {Injectable, Inject} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Http} from '@angular/http';
import {Subject} from "rxjs/Subject";

import {IAppConfig} from '../app.config.interface';
import {APP_CONFIG} from '../app.config';
import {ALERTS_TABLE_COLS} from '../utils/constants';
import {ColumnMetadata} from '../model/column-metadata';

@Injectable()
export class ConfigureTableService {

  private tableChangedSource = new Subject<string>();
  tableChanged$ = this.tableChangedSource.asObservable();
  defaultHeaders = {'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest'};

  constructor(private http: Http, @Inject(APP_CONFIG) private config: IAppConfig) {
  }

  getConfiguredTableColumns(): Observable<any[]> {
    return Observable.create(observer => {
      let alertsColumnNames: ColumnMetadata[] = [];
      try {
        alertsColumnNames = JSON.parse(localStorage.getItem(ALERTS_TABLE_COLS));
      } catch (e) {}

      observer.next(alertsColumnNames);
      observer.complete();

    });
  }

  fireTableChanged() {
    this.tableChangedSource.next('table changed');
  }

}
