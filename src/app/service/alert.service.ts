import {Injectable, Inject} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Alert} from '../model/alert';
import {Http, Headers, RequestOptions, Response, URLSearchParams} from '@angular/http';
import {HttpUtil} from "../utils/httpUtil";
import {IAppConfig} from '../app.config.interface';
import {APP_CONFIG} from '../app.config';
import {QueryBuilder} from "../model/search-request";

@Injectable()
export class AlertService {

  defaultHeaders = {'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest'};
  types = ['bro_doc', 'snort_doc'];

  constructor(private http: Http, @Inject(APP_CONFIG) private config: IAppConfig) {
  }

  public getAll(): Observable<Alert[]> {
    return Observable.create(observer => {
      observer.next(Alert.getData());
      observer.complete();
    });
  }

  public search(request: {}): Observable<{}> {
    let url: string = '/search/*,-*kibana/_search';
    return this.http.post(url, request, new RequestOptions({headers: new Headers(this.defaultHeaders)}))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  public mockSearch(): Observable<Alert[]> {
    return Observable.create(observer => {
      observer.next(Alert.getData());
      observer.complete();
    });
  }

  public getAlert(index: string, type: string, alertId: string): Observable<Alert> {
    return this.http.get('/search/' + index + '/' + type + '/' + alertId, new RequestOptions({headers: new Headers(this.defaultHeaders)}))
      .map(HttpUtil.extractData)
//      .catch(HttpUtil.handleError);
  }

  public updateAlertState(alerts: Alert[], state: string, workflowId: string) {
    let request = '';
    for (let alert of alerts) {
      request += '{ "update" : { "_index" : "' + alert._index + '", "_type" : "' + alert._type + '", "_id" : "' + alert._id + '" } }\n{ "doc": { "alert_status": "' + state + '"';
      if (workflowId) {
        request += ', "workflow_id": "' + workflowId + '"';
      }
      request += ' }}\n';
    }
    return this.http.post('/search/_bulk', request, new RequestOptions({headers: new Headers(this.defaultHeaders)}))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
