import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Router, NavigationStart} from '@angular/router';
import {Observable} from 'rxjs/Rx';

import {Alert} from '../../model/alert';
import {AlertService} from '../../service/alert.service';
import {SearchRequest} from "../../model/search-request";
import {Filter} from "../../model/filter";
import {ConfigureTableService} from "../../service/configure-table.service";
import {WorkflowService} from "../../service/workflow.service";
import {SampleData} from '../../model/sample-data';
import {ClusterMetaDataService} from '../../service/cluster-metadata.service';
import {ColumnMetadata} from '../../model/column-metadata';

const defaultPaginationParams = {start: 0, end: 15, total: 0};

@Component({
  selector: 'app-alerts-list',
  templateUrl: './alerts-list.component.html',
  styleUrls: ['./alerts-list.component.scss']
})
export class AlertsListComponent implements OnInit {

  alertsColumns: ColumnMetadata[] = [];
  alertsColumnsToDisplay: ColumnMetadata[] = [];
  filtersData = SampleData.getFilters();
  selectedAlerts: Alert[] = [];
  alerts: any[] = [];
  colNumberTimerId: number;
  @ViewChild('table') table: ElementRef;

  paginationParams = defaultPaginationParams;
  searchRequest: SearchRequest = { query: { query_string: { query: '*'} }, from: this.paginationParams.start, size: this.paginationParams.end, sort: [{ timestamp: {order : 'desc', ignore_unmapped: true} }], aggs: {}};
  filters: Filter[] = [];

  constructor(private router: Router, private alertsService: AlertService, private configureTableService: ConfigureTableService,
              private workflowService: WorkflowService, private clusterMetaDataService: ClusterMetaDataService) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart && event.url === '/alerts-list') {
        this.selectedAlerts = [];
      }
    });
  }

  addAlertColChangedListner() {
    this.configureTableService.tableChanged$.subscribe(colChanged => {
      if (colChanged) {
        this.getAlertColumnNames();
      }
    });
  }

  getAlertColumnNames() {
    Observable.forkJoin(
      this.configureTableService.getConfiguredTableColumns(),
      this.clusterMetaDataService.getDefaultColumns()
    ).subscribe((response: any) => {
      this.prepareData(response[0], response[1]);
    });
  }

  getDisplayValue(alert: any, column: any) {
    let returnValue = '';
    try {
      switch(column.name) {
        case '_id':
          returnValue = alert[column.name];
          break;
        case 'alert_status':
          returnValue = 'NEW';
          break;
        default:
          returnValue = alert['_source'][column.name];
          break;
      }

      if (column.name.endsWith(':ts') || column.name.endsWith('timestamp')) {
        returnValue = new Date(parseInt(alert['_source'][column.name])).toISOString().replace('T', ' ').slice(0,19);
      }

    } catch(e) {}

    return returnValue;
  }

  getSearchValue(alert: any, column: ColumnMetadata) {
    let returnValue = '';
    try {
      switch(column.name) {
        case '_id':
          returnValue = alert[column.name];
          break;
        case 'alert_status':
          returnValue = 'NEW';
          break;
        default:
          returnValue = alert['_source'][column.name];
          break;
      }
    } catch(e) {}

    return returnValue;
  }

  ngOnInit() {
    this.search();
    this.getAlertColumnNames();
    this.addAlertColChangedListner();
  }

  onSearch(resetPaginationParams: boolean = true) {
    this.updateFilters();
    this.search(resetPaginationParams);
  }

  onAddFilter(field: string, value: string) {
    this.addFilter(field, value);
    this.generateQuery();
    this.search(true);
  }

  onResize($event) {
    let tableWidth = this.table.nativeElement.offsetWidth;
    clearTimeout(this.colNumberTimerId);
    this.colNumberTimerId = setTimeout(() => { this.setColumnsToDisplay(); },500)
  }

  prepareData(configuredColumns: ColumnMetadata[], defaultColumns: ColumnMetadata[]) {
    this.alertsColumns = (configuredColumns && configuredColumns.length > 0) ?  configuredColumns:  defaultColumns;
    this.setColumnsToDisplay();
  }

  selectAllRows($event) {
    this.selectedAlerts = [];
    if ($event.target.checked) {
      this.selectedAlerts = this.alerts;
    }
  }

  setColumnsToDisplay() {
    let availableWidth = document.documentElement.clientWidth - (200 + (15*3));
    availableWidth = availableWidth - (55 + 25 + 25);
    let tWidth = 0;
    this.alertsColumnsToDisplay =  this.alertsColumns.filter(colMetaData => {
      if (colMetaData.type.toUpperCase() === 'DATE') {
        tWidth += 140;
      } else if (colMetaData.type.toUpperCase() === 'IP') {
        tWidth += 120;
      } else if (colMetaData.type.toUpperCase() === 'BOOLEAN') {
        tWidth += 50;
      } else {
        tWidth += 130;
      }

      return tWidth < availableWidth;
    });
  }

  mockSearch() {
    this.selectedAlerts = [];
    this.alertsService.mockSearch().subscribe(results => {
      this.alerts = results;
    });
  }

  search(resetPaginationParams: boolean = true) {
    this.selectedAlerts = [];

    if (resetPaginationParams) {
      this.paginationParams = {start: 0, end: 15, total: 0};
    }

    this.alertsService.search(this.searchRequest).subscribe(results => {
      this.alerts = results['hits'].hits;
      this.paginationParams.total = results['hits'].total;
    });
  }

  selectRow($event, alert: Alert) {
    if ($event.target.checked) {
      this.selectedAlerts.push(alert);
    } else {
      this.selectedAlerts.splice(this.selectedAlerts.indexOf(alert), 1);
    }
  }

  showDetails($event, alert: any) {
    if ($event.target.type !== 'checkbox' && $event.target.parentElement.firstChild.type !== 'checkbox' && $event.target.nodeName !== 'A') {
      this.selectedAlerts = [];
      this.selectedAlerts = [alert];
      this.router.navigateByUrl('/alerts-list(dialog:details/' + alert._index + '/' + alert._type + '/' + alert._id + ')');
    }
  }

  processEscalate() {
    this.workflowService.start(this.selectedAlerts).subscribe(workflowId => {
      this.alertsService.updateAlertState(this.selectedAlerts, 'ESCALATE', workflowId).subscribe(results => {
        this.updateSelectedAlertStatus('ESCALATE');
      });
    });
  }

  processDismiss() {
    this.alertsService.updateAlertState(this.selectedAlerts, 'DISMISS', '').subscribe(results => {
      this.updateSelectedAlertStatus('DISMISS');
    });
  }

  processOpen() {
    this.alertsService.updateAlertState(this.selectedAlerts, 'OPEN', '').subscribe(results => {
      this.updateSelectedAlertStatus('OPEN');
    });
  }

  processResolve() {
    this.alertsService.updateAlertState(this.selectedAlerts, 'RESOLVE', '').subscribe(results => {
      this.updateSelectedAlertStatus('RESOLVE');
    });
  }

  updateSelectedAlertStatus(status: string) {
    for (let alert of this.selectedAlerts) {
      alert.status = status;
    }
  }

  addFilter(field: string, value: string) {
    let filter = this.filters.find(filter => filter.field === field);
    if (filter) {
      filter.value = value;
    } else {
      this.filters.push(new Filter(field, value));
    }
  }

  removeFilter(field: string) {
    let filter = this.filters.find(filter => filter.field === field);
    this.filters.splice(this.filters.indexOf(filter), 1);
    this.generateQuery();
    this.search();
  }

  generateQuery() {
    this.searchRequest.query['query_string'].query = this.filters.map(filter => filter.field.replace(/:/g, '\\:') + ':' + filter.value).join(' AND ');
    if (this.searchRequest.query['query_string'].query.length === 0) {
      this.searchRequest.query['query_string'].query = '*';
    }
  }

  updateFilters() {
    let query = this.searchRequest.query['query_string'].query;
    this.searchRequest.from = this.paginationParams.start;
    this.filters = [];

    if (query && query !== '' && query !== '*') {
      let terms = query.split(' AND ');
      for (let term of terms) {
        let separatorPos = term.lastIndexOf(':');
        let field = term.substring(0, separatorPos).replace('\\', '');
        let value = term.substring(separatorPos + 1, term.length);
        this.addFilter(field, value);
      }
    }
  }
  
  configureTable() {
    this.router.navigateByUrl('/alerts-list(dialog:configure-table)');
  }

  getCollapseComponentData(data: any) {
    return {
      getName: () => {
        return Object.keys(data.aggregations)[0];
      },
      getData: () => {
        return data.aggregations[Object.keys(data.aggregations)[0]].buckets;
      },
    }
  }
}
